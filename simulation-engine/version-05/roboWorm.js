"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboWorm extends RoboBase {
    constructor(brain, body, eyes) {
		super(brain, body, eyes);
    }
    // calculateFitness() {
        
    //     // Update fitness
    //     let position = 0;
    //     let fitness = 0;

    //     // Average position of all particles
    //     for (let i = 0; i < this.body.particles.length; i++) {
    //         position += this.body.particles[i].position.x;
    //     }

    //     this.averagePosition = position / this.body.particles.length;

    //     fitness = -(position - 2000);

    //     // Addition to original simulation
    //     fitness += this.ticksAlive;

    //     this.fitness = fitness;
    // }
    // calculateScore() {
    //     // Update fitness
    //     let position = 0;
    //     let fitness = 0;

    //     // Average position of all particles
    //     for (let i = 0; i < this.body.particles.length; i++) {
    //         position += this.body.particles[i].position.x;
    //     }

    //     this.averagePosition = position / this.body.particles.length;
    // }
    update() {
        // Update eyes
		
        const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
        this.eyes.directionVector = angleVector;
        this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));

        this.eyes.update();

        // Update brain
        let inputs = [];

        let intersections = this.eyes.getOutput();
        //console.log(intersections)
		
		for (let i = 0; i < intersections.length; i++) {
        //for (let i = 0; i < 9; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : 1000);
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
            this.body.angularSprings[i].setRestAngleVector(output[i] * Math.PI * 1 * 0.25);
            //this.body.angularSprings[i].setRestAngleVector(Math.PI * 2 * 0.125);
        }

    }
    // timeouts(timeLimit = 500) {
	// 	return this.ticksAlive > timeLimit;
	// }
}

export { RoboWorm };