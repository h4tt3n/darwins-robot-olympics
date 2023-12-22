"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
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
        let minAngleLeft = Math.PI * 2 * (0.375 - 0.125);
        let maxAngleLeft = Math.PI * 2 * (0.375 + 0.125);
        let minAngleRight = Math.PI * 2 * (0.125 - 0.125);
        let maxAngleRight = Math.PI * 2 * (0.125 + 0.125);

        // Apply output to wheels
        this.body.wheels[0].addAngularImpulse(output[0] * 0.5);
        this.body.wheels[1].addAngularImpulse(output[1] * 0.5);
        this.body.angularSprings[4].setRestAngleVector( ToolBox.map(output[2], -1, 1, minAngleLeft, maxAngleLeft));
        this.body.angularSprings[5].setRestAngleVector( ToolBox.map(output[3], -1, 1, minAngleRight, maxAngleRight));

        // Brake both weels
        if(output[4] > 0.0){
            this.body.wheels[0].angularVelocity = 0.0;
            this.body.wheels[0].angularImpulse = 0.0;
            this.body.wheels[1].angularVelocity = 0.0;
            this.body.wheels[1].angularImpulse = 0.0;
        }
    }
}

export { RoboCar };