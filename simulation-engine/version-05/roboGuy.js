"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboGuy extends RoboBase {
    constructor(brain, body, eyes) {
		super(brain, body, eyes);
    }
    update() {

        // Update eyes
		
        // // //const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        const angleVector = this.body.linearSprings[1].angleVector;
        this.eyes.directionVector = angleVector.perp();
        // // //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
        this.eyes.origin = this.body.particles[0].position;

        this.eyes.update();

        // Update brain
        let inputs = [];

        let intersections = this.eyes.getOutput();
        // // //console.log(intersections)
		
		for (let i = 0; i < intersections.length; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
		}

		this.brain.setInput(inputs);
		this.brain.run();
		let output = this.brain.getOutput();

        let shoulderAngle = Math.PI * 2 * 0.75;
        let elbowAngle = -Math.PI * 2 * 0.3;
        let hipAngle = Math.PI * 2 * 0.5;
        let kneeAngle = -Math.PI * 2 * 0.6;
        let jointAngle = Math.PI * 2 * 0.15;
        let legAngle = Math.PI * 2 * 0.05;

        // Update body
        this.body.leftUpperArmAngular.setRestAngleVector( ToolBox.map(output[0], -1, 1, 0, shoulderAngle));
        this.body.leftLowerArmAngular.setRestAngleVector( ToolBox.map(output[1], -1, 1, 0, elbowAngle));
        this.body.rightUpperArmAngular.setRestAngleVector( ToolBox.map(output[2], -1, 1, 0, shoulderAngle));
        this.body.rightLowerArmAngular.setRestAngleVector( ToolBox.map(output[3], -1, 1, 0, elbowAngle));
        this.body.leftUpperLegAngular.setRestAngleVector( ToolBox.map(output[4], -1, 1, 0, hipAngle));
        this.body.leftLowerLegAngular.setRestAngleVector( ToolBox.map(output[5], -1, 1, 0, kneeAngle));
        this.body.rightUpperLegAngular.setRestAngleVector( ToolBox.map(output[6], -1, 1, 0, hipAngle));
        this.body.rightLowerLegAngular.setRestAngleVector( ToolBox.map(output[7], -1, 1, 0, kneeAngle));
        
    }
}

export { RoboGuy };