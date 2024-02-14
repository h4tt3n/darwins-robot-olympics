"use strict";

import { NodeState, Node, Action } from './base.js';

class Success extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.SUCCESS;
    }
    reset() {
        return;
    }
}

class Failure extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.FAILURE;
    }
    reset() {
        return;
    }
}

class Running extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        return NodeState.RUNNING;
    }
    reset() {
        return;
    }
}

class HasTimedOut extends Node {
    constructor(robot, timeout, name) {
        super(name);
        this.robot = robot;
        this.timeout = timeout;
    }
    tick() {
        //console.log("HasTimedOut: tick");
        if(this.robot.ticksAlive >= this.timeout) {
            return NodeState.SUCCESS;
        } else {
            return NodeState.RUNNING;
        }
    }
    reset() {
        return;
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
        this.targetReached = false;
    }
    tick() {
        //console.log("HasReachedTarget: tick " + this.name);
        let position = this.robot.body.particles[0].position;
        let distance = position.distance(this.target.position);
        if(distance < this.target.radius + this.robot.body.particles[0].radius) {
            
            if(this.targetReached === false) {
                this.targetReached = true;
                this.robot.fitness *= 0.5;
            }
            
            return NodeState.SUCCESS;
        } else {
            return NodeState.RUNNING;
        }
    }
    reset() {
        this.targetReached = false;
        return;
    }
}

class CalculateFitness extends Node {
    constructor(robot, name) {
        super(name);
        this.robot = robot;
    }
    tick() {
        //console.log("CalculateFitness: tick");
        let fitness = 0;
        // let position = this.robot.body.particles[0].position;
        // let distance = position.distance(this.target.position);
        // fitness += distance;
        fitness += this.robot.ticksAlive;
        this.robot.fitness = fitness;
        return NodeState.SUCCESS;
    }
    reset() {
        return;
    }
}

export { Success, Failure, Running, HasTimedOut, HasReachedTarget, CalculateFitness};