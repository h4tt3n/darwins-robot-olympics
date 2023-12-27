"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboWorm extends RoboBase {
    constructor(brain, body, eyes) {
		super(brain, body, eyes);
    }
    update() {
        // Update eyes
		
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

        // console.log(inputs);

		this.brain.setInput(inputs);
        //this.brain.recur(7);

        //console.log(this.brain.getInputs());
        
		this.brain.run();
		let output = this.brain.getOutput();

        //console.log(output);

        // Update body
        for (let i = 0; i < this.body.angularSprings.length; i++) {
        //for (let i = 0; i < 8; i++) {
            this.body.angularSprings[i].setRestAngleVector(output[i] * Math.PI * 2 * 0.125);
            //this.body.angularSprings[i].setRestAngleVector(Math.PI * 2 * 0.125);
        }

    }
}

export { RoboWorm };