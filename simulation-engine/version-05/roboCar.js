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
        this.eyes.directionVector = angleVector.perp();
        //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
        this.eyes.origin = this.body.wheels[0].position;

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

        // Acceleration
        this.body.wheels[0].addAngularImpulse(output[0] * 0.5);

        // Gearing
        let gearing = 1.0;

        if( output[1] >= -1 && output[1] < -0.33){
            gearing = 0.5;
        } else if( output[1] >= -0.33 && output[1] < 0.33){
            gearing = 1.0;
        } else if( output[1] >= 0.33 && output[1] <= 1){
            gearing = 2.0;
        } else {
            gearing = 1.0;
        }

        this.body.gearConstraints[0].setGearRatio(gearing);
        this.body.gearConstraints[1].setGearRatio(gearing);

        // Set rest angle of steering constraints
        this.body.angularSprings[0].setRestAngleVector( ToolBox.map(output[2], -1, 1, minAngleLeft, maxAngleLeft));
        this.body.angularSprings[1].setRestAngleVector( ToolBox.map(output[2], -1, 1, maxAngleRight, minAngleRight));

        // Brake
        if(output[3] > 0.0){
            this.body.wheels[0].angularVelocity = 0.0;
            this.body.wheels[0].angularImpulse = 0.0;
        }
    }
}

export { RoboCar };