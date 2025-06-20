"use strict";

import { NodeState, Composite } from './base.js';

class Selector extends Composite {
    constructor(name, children=[]) {
        super(name, children);
    }
    tick() {
        for (let child of this.children) {
            let status = child.tick();
            //console.log(`Selector ${this.name}: tick: evaluating child: ${child.name}`);
            switch (status) {
                case NodeState.SUCCESS:
                case NodeState.RUNNING:
                    //console.log(`Selector ${this.name}: tick: child: ${child.name} status: ${status}`);
                    return status;
                case NodeState.FAILURE:
                    continue;
                default:
                    throw new Error(`Selector: Invalid node state ${status}`);
            }
        }
        //console.log(`Selector ${this.name}: status: ${NodeState.FAILURE}`);
        return NodeState.FAILURE;
    }
    reset() {
        for (let child of this.children) {
            child.reset();
        }
    }
}

/**
 * Represents a sequence in a behavior tree, executing its children sequentially.
 */
class Sequence extends Composite {
    /**
     * Creates a sequence.
     * @constructor
     * @param {string} name - The name of the sequence
     * @param {Node[]} children - The children of the sequence
     */
    constructor(name, children=[]) {
        super(name, children);
    }
    /**
     * Executes the children of the sequence.
     * @return {NodeState} - The state of the sequence
     */
    tick() {
        for (let child of this.children) {
            let status = child.tick();
            //console.log(`Sequence ${this.name}: tick: evaluating child: ${child.name}`);
            switch (status) {
                case NodeState.SUCCESS:
                    continue;
                case NodeState.FAILURE:
                    //console.log(`Sequence ${this.name}: tick: child: ${child.name} status: ${status}`);
                    return NodeState.FAILURE;
                case NodeState.RUNNING:
                    //console.log(`Sequence ${this.name}: tick: child: ${child.name} status: ${status}`);
                    return NodeState.RUNNING;
                default:
                    throw new Error(`Sequence: Invalid node state ${status}`);
            }
        }
        //console.log(`Sequence ${this.name}: status: ${NodeState.SUCCESS}`);
        return NodeState.SUCCESS;
    }
    reset() {
        for (let child of this.children) {
            child.reset();
        }
    }
}

// Serializer node: runs children in sequence in a stateful way
// If a child returns RUNNING, the Serializer will return RUNNING, and the next tick will continue from that child
// If a child returns SUCCESS, the Serializer will return RUNNING, and the next tick will start from the next child, unless it's the last child
// If a child returns FAILURE, the Serializer will reset and return FAILURE, and the next tick will start from the first child
// If all children return SUCCESS, the serializer will reset and return SUCCESS
// If any child returns FAILURE, the serializer will reset and returns FAILURE

class Serializer extends Composite {
    constructor(name, children=[]) {
        super(name, children);
        this.index = 0;
    }
    tick() {
        let status = this.children[this.index].tick();
        //console.log(`Serializer ${this.name}: tick: evaluating child: ${this.children[this.index].name}`);
        switch (status) {
            case NodeState.SUCCESS:
                this.index++;
                if (this.index === this.children.length) {
                    this.reset();
                    //console.log (`class: ${this.constructor.name} | name: ${this.name} | index: ${this.index} | return: SUCCESS;`)
                    return NodeState.SUCCESS;
                }
                //console.log (`class: ${this.constructor.name} | name: ${this.name} | index: ${this.index} | return: RUNNING;`)
                return NodeState.RUNNING;
            case NodeState.FAILURE:
                this.reset();
                return NodeState.FAILURE;
            case NodeState.RUNNING:
                //console.log (`class: ${this.constructor.name} | name: ${this.name} | index: ${this.index} | return: RUNNING;`)
                return NodeState.RUNNING;
            default:
                throw new Error(`Serializer: Invalid node state ${status}`);
        }
    }
    reset() {
        this.index = 0;
        for (let child of this.children) {
            child.reset();
        }
    }
}

// class Serializer extends Composite {
//     constructor(name, children=[]) {
//         super(name, children);
//         this.currentIndex = 0;
//     }
//     tick() {
//         const status = this.children[this.currentIndex].tick();
//         switch (status) {
//             case NodeState.RUNNING:
//                 return NodeState.RUNNING;
//             case NodeState.SUCCESS:
//                 this.currentIndex++;
//                 if (this.currentIndex >= this.children.length) {
//                     this.currentIndex = 0;
//                     return NodeState.SUCCESS;
//                 }
//                 return NodeState.RUNNING;
//             case NodeState.FAILURE:
//                 this.currentIndex = 0;
//                 return NodeState.FAILURE;
//             default:
//                 throw new Error(`Unknown result: ${status}`);
//         }
//     }
// }

// Composite that adheres to the following rules:
// 1. If any child returns SUCCESS, the sequence will stop evaluating and return SUCCESS
// 2. If all children returns RUNNING, the sequence will return RUNNING
// 3. THe composite will effectively work as an "OR" gate, where the first child that returns SUCCESS will stop the evaluation and return SUCCESS

class SequenceOR extends Composite {
    constructor(name, children=[]) {
        super(name, children);   
    }
    tick() {
        for (let child of this.children) {
            let status = child.tick();
            switch (status) {
                case NodeState.SUCCESS:
                    //console.log (`class: ${this.constructor.name} | name: ${this.name} | return: SUCCESS;`)
                    return NodeState.SUCCESS;
                case NodeState.FAILURE:
                    return NodeState.FAILURE;
                case NodeState.RUNNING:
                    continue;
                default:
                    throw new Error(`Unknown result: ${status}`);
            }
        }
        //console.log (`class: ${this.constructor.name} | name: ${this.name} | return: RUNNING;`)
        return NodeState.RUNNING;
    }
    reset() {
        for (let child of this.children) {
            child.reset();
        }
    }
}


export { Selector, Sequence, Serializer, SequenceOR };