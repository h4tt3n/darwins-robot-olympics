"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboStarfish extends RoboBase {
    constructor(brain, body, eyes) {
		    super(brain, body, eyes);
    }
    update() {

        // Update eyes
		
        // //const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        const angleVector = this.body.linearSprings[1].angleVector;
        this.eyes.directionVector = angleVector.perp();
        // //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
        this.eyes.origin = this.body.particles[0].position;

        this.eyes.update();

        // Update brain
        let inputs = [];

        let intersections = this.eyes.getOutput();
        // //console.log(intersections)
		
		for (let i = 0; i < intersections.length; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
		}

		this.brain.setInput(inputs);
		this.brain.run();
		let output = this.brain.getOutput();

        // let jointAngle = Math.PI * 2 * 0.15;
        let legAngle = Math.PI * 2 * 0.15;

        // Update body
        let angle = ToolBox.map(output[0], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.leg1AngularSprings.length; i++) {
            this.body.leg1AngularSprings[i].setRestAngleVector(angle);
        }

        angle = ToolBox.map(output[1], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.leg2AngularSprings.length; i++) {
            this.body.leg2AngularSprings[i].setRestAngleVector(angle);
        }

        angle = ToolBox.map(output[2], -1, 1, -legAngle, legAngle);

        for (let i = 0; i < this.body.leg3AngularSprings.length; i++) {
            this.body.leg3AngularSprings[i].setRestAngleVector(angle);
        }
    }
}

export { RoboStarfish };