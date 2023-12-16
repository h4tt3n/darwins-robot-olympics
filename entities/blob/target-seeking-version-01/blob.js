"use strict";

import { Vector2 } from "../../../vector-library/version-01/vector2.js";
import { Network, ActivationFunctions } from "../../../neural-network-engine/version-01/neural-network.js";

class Blob {
    constructor(brain, body){
		//this.brain = brain;
		this.brain = new Network(brain.genome, brain.params);
		this.body = body;
        this.fitness = 0;
		this.ticksAlive = 0;
    }
    seekTarget(target) {
		let inputs = [];

		// inputs[0] = this.body.position.x - target.position.x;
		// inputs[1] = this.body.position.y - target.position.y;
		// inputs[2] = this.body.velocity.x - target.velocity.x;
		// inputs[3] = this.body.velocity.y - target.velocity.y;

		inputs[0] = this.body.position.x;
		inputs[1] = this.body.position.y;
		inputs[2] = target.position.x;
		inputs[3] = target.position.y;

		this.brain.setInput(inputs);
		this.brain.run();
		let output = this.brain.getOutput();

		// Sigmoid [0, 1]
		//this.body.position.x = (output[1] - 0.5) * 2.0;
		//this.body.position.y = (output[2] - 0.5) * 2.0;

		// Tanh [-1, 1]
		this.body.addPosition(new Vector2(output[0], output[1]));
		//this.body.addVelocity(new Vector2(output[0], output[1]));
		//this.body.addImpulse(new Vector2(output[0], output[1]));
	}
    calculateFitness(target) {

		// fitness modifiers (lower is better)
		const hitTargetModifier = 0.1;
		const ticksModifier = 10;
		const targetDistanceModifier = 1;
		const tooFarAwayFromTargetModifier = 10;
		const timeoutModifier = 1;

		let distanceToTarget = this.body.position.distance(target.position);
		
		// Base fitness
		//this.fitness = this.ticksAlive * ticksModifier + distanceToTarget * targetDistanceModifier;
		this.fitness = 1.0;
		
		//this.fitness += this.ticksAlive * ticksModifier;

		this.fitness += distanceToTarget * targetDistanceModifier;

		// fitness modifier for hitting target
		if (this.hitsTarget(target)) {
			this.fitness *= hitTargetModifier;
		}

		// fitness modifier for being too far away from target
		if (this.tooFarAwayFromTarget(target, 1200)) {
			this.fitness *= tooFarAwayFromTargetModifier;
		}

		// fitness modifier for timing out
		// if (this.timeouts(500)) {
		// 	this.fitness *= timeoutModifier;
		// }

		console.log("fitness: ", this.fitness);
    }

	tooFarAwayFromTarget(target, maxDist = 1200) {
		let distx = target.position.x - this.body.position.x;
		let disty = target.position.y - this.body.position.y;
		let dist = Math.sqrt(distx * distx + disty * disty);
		return dist > maxDist;
	}

	hitsTarget(target) {
		let distx = target.position.x - this.body.position.x;
        let disty = target.position.y - this.body.position.y;
        let dist = Math.sqrt(distx * distx + disty * disty);
        return dist < target.radius + this.body.radius;
	}

	timeouts(timeLimit = 500) {
		return this.ticksAlive > timeLimit;
	}
}

export { Blob };