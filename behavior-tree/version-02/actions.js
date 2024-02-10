"use strict";

import { NodeState, Node, Action } from './base.js';

class Success extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.SUCCESS;
    }
}

class Failure extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.FAILURE;
    }
}

class Running extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.RUNNING;
    }
}

class HasTimedOut extends Node {
    constructor(robot, timeout, name) {
        super(name);
        this.robot = robot;
        this.timeout = timeout;
    }
    tick() {
        console.log("HasTimedOut: tick");
        if(this.robot.ticksAlive > this.timeout) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.FAILURE;
        }
    }
}
// JSDoc description with params and return
/**
 * Represents a node that checks if a robot has reached a target.
 * @extends Node
 * @param {Robot} robot - The robot to check
 * @param {Target} target - The target to check
 * @param {string} name - The name of the node
 * @return {NodeState} - The state of the node
 */
class HasReachedTarget extends Node {
    constructor(robot, target, name) {
        super(name);
        this.robot = robot;
        this.target = target;
    }
    tick() {
        console.log("HasReachedTarget: tick");
        let position = this.robot.body.particles[0].position;
        let distance = position.distance(this.target.position);
        if(distance < this.target.radius + this.robot.body.particles[0].radius) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.FAILURE;
        }
    }
}

class CalculateFitness extends Node {
    constructor(robot, name) {
        super(name);
        this.robot = robot;
    }
    tick() {
        console.log("CalculateFitness: tick");
        let fitness = 0;
        let position = this.robot.body.particles[0].position;
        let distance = position.distance(this.target.position);
        fitness += distance;
        fitness += this.robot.ticksAlive;
        this.robot.fitness = fitness;
        return NodeState.SUCCESS;
    }
}

class BumpTicksAlive extends Action {
    constructor(robot, name) {
        super(name);
        this.robot = robot;
    }
    tick() {
        console.log("BumpTicksAlive: tick");
        this.robot.ticksAlive++;
        return NodeState.SUCCESS;
    }
}

export { Success, Failure, Running, HasTimedOut, HasReachedTarget, CalculateFitness, BumpTicksAlive};