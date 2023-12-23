"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboCar extends RoboBase {
    constructor(brain, body, eyes) {
        super(brain, body, eyes);
    }
    update() {
        
        // Update camera position and angle
        const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        this.eyes.directionVector = angleVector.perp();
        this.eyes.origin = this.body.wheels[0].position;

        // Update camera
        this.eyes.update();
        let intersections = this.eyes.getOutput();

        // Input camera data to neural network
        let inputs = [];
		
		for (let i = 0; i < intersections.length; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
		}

        this.brain.setInput(inputs);

        // Run neural network
		this.brain.run();

        // Get output from neural network
		let output = this.brain.getOutput();

        // Acceleration
        this.body.wheels[0].addAngularImpulse(output[0] * 0.2);

        // Brake
        // TODO: Model as constraint, and make gradual, not binary
        if(output[1] > 0.0){
            this.body.wheels[0].angularImpulse = 0.0;
            this.body.wheels[0].angularVelocity = 0.0;
        }

        // Gearing
        let gearing = 1.0;

        if      (output[2] >= -1.00 && output[2] < -0.33) { gearing = 0.25; } 
        else if (output[2] >= -0.33 && output[2] <  0.33) { gearing = 1.0; } 
        else if (output[2] >=  0.33 && output[2] <= 1.00) { gearing = 4.0; }

        this.body.gearConstraints[0].setGearRatio(gearing);
        this.body.gearConstraints[1].setGearRatio(gearing);

        // Set steering constraint min/max angles
        let minAngleLeft = Math.PI * 2 * (0.375 - 0.125);
        let maxAngleLeft = Math.PI * 2 * (0.375 + 0.125);
        let minAngleRight = Math.PI * 2 * (0.125 - 0.125);
        let maxAngleRight = Math.PI * 2 * (0.125 + 0.125);

        // Set rest angles of steering constraints
        this.body.angularSprings[0].setRestAngleVector( ToolBox.map(output[3], -1, 1, minAngleLeft, maxAngleLeft));
        this.body.angularSprings[1].setRestAngleVector( ToolBox.map(output[3], -1, 1, maxAngleRight, minAngleRight));
    }
}

export { RoboCar };