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

class MoveToTarget extends Node {
    constructor(name, targetNumber) {
        super(name);
        this.targetNumber = targetNumber;
    }
    tick() {
        console.log(`MoveToTarget: tick: moving to target ${this.targetNumber}`);
        return NodeState.SUCCESS;
    }
}

export { Success, Failure, Running, MoveToTarget };