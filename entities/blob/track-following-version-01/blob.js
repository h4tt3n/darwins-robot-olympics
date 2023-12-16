"use strict";

import { Vector2 } from "../../../vector-library/version-01/vector2.js";

// This version of the Blob is designed to run around in a race-track without hitting the walls.

class RaceTrackBlob {
    constructor(brain, body, eyes){
		this.brain = brain; // new Network(brain.genome, brain.params);
		this.body = body;
		this.eyes = eyes; //new RayCamera(this.body.position, 0, 8, Math.PI * 2 * 0.25);
        this.fitness = 0;
		this.ticksAlive = 0;
    }
    followTrack(tracks) {
		let inputs = [];
		let intersections = this.eyes.castAll(tracks);

		inputs.push(this.body.velocity.x);
		inputs.push(this.body.velocity.y);
		
		for (let i = 0; i < this.eyes.numRays; i++) {
			inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
		}

		this.brain.setInput(inputs);
		this.brain.run();
		let output = this.brain.getOutput();

		// Sigmoid [0, 1]
		//this.body.position.x = (output[1] - 0.5) * 2.0;
		//this.body.position.y = (output[2] - 0.5) * 2.0;

		// Tanh [-1, 1]
		//this.body.addPosition(new Vector2(output[0], output[1]).mul(1));
		//this.body.addVelocity(new Vector2(output[0], output[1]).mul(0.2));
		this.body.addImpulse(new Vector2(output[0], output[1]));
	}
	updateFitness() {
		
		let averageDistance = 0;
		for (let i = 0; i < this.eyes.numRays; i++) {
			if(this.eyes.rays[i].closestIntersection) { // temporary bugfix
				averageDistance += this.eyes.rays[i].closestIntersection.intersection.distance ? this.eyes.rays[i].closestIntersection.intersection.distance : Infinity;
			}
		}
		averageDistance /= this.eyes.numRays;
		this.fitness += 1 / averageDistance;
	}
    calculateFitness() {
		const touchesWallPenalty = 1000;
		if (this.touchesWall()) {
			this.fitness += touchesWallPenalty;
		}

		this.fitness /= this.ticksAlive;
    }

	touchesWall() {
		for (let i = 0; i < this.eyes.numRays; i++) {

			if(this.eyes.rays[i].closestIntersection) { // temporary bugfix

				let distance = this.eyes.rays[i].closestIntersection.intersection.distance ? this.eyes.rays[i].closestIntersection.intersection.distance : Infinity;

				if (distance < this.body.radius) {
					return true;
				}
			}
		}
		return false;
	}
	timeouts(timeLimit = 500) {
		return this.ticksAlive > timeLimit;
	}
}

export { RaceTrackBlob };