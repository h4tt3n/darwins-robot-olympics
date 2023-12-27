"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboCrab extends RoboBase {
    constructor(brain, body, eyes) {
		    super(brain, body, eyes);
    }
    update() {
        // Update eyes
		
        //const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        const angleVector = this.body.linearSprings[1].angleVector;
        this.eyes.directionVector = angleVector.perp();
        //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
        this.eyes.origin = this.body.particles[0].position;

        this.eyes.update();

        // Update brain
        let inputs = [];

        let intersections = this.eyes.getOutput();
        //console.log(intersections)
		
		for (let i = 0; i < intersections.length; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
		}

		this.brain.setInput(inputs);
		this.brain.run();
		let output = this.brain.getOutput();

        let jointAngle = Math.PI * 2 * 0.15;
        let legAngle = Math.PI * 2 * 0.15;

        // Update body
        let angle = ToolBox.map(output[0], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.leftLeg1AngularSprings.length; i++) {
            this.body.leftLeg1AngularSprings[i].setRestAngleVector(angle);
        }

        angle = ToolBox.map(output[1], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.leftLeg2AngularSprings.length; i++) {
            this.body.leftLeg2AngularSprings[i].setRestAngleVector(angle);
        }

        angle = ToolBox.map(output[2], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.rightLeg1AngularSprings.length; i++) {
            this.body.rightLeg1AngularSprings[i].setRestAngleVector(angle);
        }

        angle = ToolBox.map(output[3], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.rightLeg2AngularSprings.length; i++) {
            this.body.rightLeg2AngularSprings[i].setRestAngleVector(angle);
        }

        // this.body.leftLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[4], -1, 1, 0, jointAngle));
        // this.body.leftLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[5], -1, 1, 0, jointAngle));
        // this.body.rightLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[6], -1, 1, 0, jointAngle));
        // this.body.rightLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[7], -1, 1, 0, jointAngle));
        this.body.leftLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[4], -1, 1, -jointAngle, jointAngle));
        this.body.leftLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[5], -1, 1, -jointAngle, jointAngle));
        this.body.rightLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[6], -1, 1, -jointAngle, jointAngle));
        this.body.rightLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[7], -1, 1, -jointAngle, jointAngle));
    }
}

export { RoboCrab };