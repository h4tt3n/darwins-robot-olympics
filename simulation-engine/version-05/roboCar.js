"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboCar extends RoboBase {
    constructor(brain, body, eyes) {
        super(brain, body, eyes);
    }
    update() {
        const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        this.eyes.directionVector = angleVector;
        //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
        this.eyes.origin = this.body.particles[0].position;

        this.eyes.update();

        // Update brain
        let inputs = [];

        let intersections = this.eyes.getOutput();
        //console.log(intersections)
		
		for (let i = 0; i < intersections.length; i++) {
        //for (let i = 0; i < 9; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
		}

        this.brain.setInput(inputs);
        //this.brain.recur(7);

        //console.log(this.brain.getInputs());
        
		this.brain.run();
		let output = this.brain.getOutput();

        //console.log(output);
        
        // Apply output to wheels
        this.body.wheels[0].addAngularImpulse(output[0] * 0.1);
        this.body.wheels[1].addAngularImpulse(output[1] * 0.1);
    }
}

export { RoboCar };