"use strict";

// Node state enum
/**
 * Represents the state of a node in a behavior tree.
 * @enum {string}
 * @readonly
 * @property {string} SUCCESS - The node has completed successfully
 * @property {string} FAILURE - The node has failed
 * @property {string} RUNNING - The node is running
 */
class NodeState {
    static SUCCESS = "SUCCESS";
    static FAILURE = "FAILURE";
    static RUNNING = "RUNNING";
}

// Node base class
/**
 * Represents a node in a behavior tree.
 * @abstract
 */
class Node {
    /**
     * Creates a node.
     * @constructor
     * @param {string} name - The name of the node
     */
    constructor(name) {
        this.name = name;
    }
    tick() {
        throw new Error("Node: tick method not implemented");
    }
    reset() {
        throw new Error("Node: reset method not implemented");
    }
}

// Composite base class
class Composite extends Node {
    constructor(name, children=[]) {
        super(name);
        if (Array.isArray(children) && children.every(child => child instanceof Node)) {
            this.children = children;
        } else {
            throw new Error("Composite: children must be an array of nodes");
        }
    }
    add(child) {
        if (child instanceof Node) {
            this.children.push(child);
        } else {
            throw new Error("Composite: add method only accepts nodes");
        }
        return this;
    }
    tick() {
        throw new Error("Composite: tick method not implemented");
    }
    reset() {
        throw new Error("Composite: reset method not implemented");
    }
}

// Decorator base class
class Decorator extends Node {
    constructor(name, child) {
        super(name);
        if (child instanceof Node) {
            this.child = child;
        } else {
            throw new Error("Decorator: child must be a node");
        }
    }
    add(child) {
        if (child instanceof Node) {
            this.child = child;
        } else {
            throw new Error("Decorator: add method only accepts nodes");
        }
        return this;
    }
    tick() {
        throw new Error("Decorator: tick method not implemented");
    }
    reset() {
        throw new Error("Decorator: reset method not implemented");
    }
}

// Action base class
class Action extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        throw new Error("Action: tick method not implemented");
    }
    reset() {
        throw new Error("Action: reset method not implemented");
    }
}

// Behavior tree class
class BehaviorTree {
    constructor(root) {
        if (root instanceof Node) {
            this.root = root;
        } else {
            throw new Error("BehaviorTree: root must be a node");
        }
    }
    tick() {
        return this.root.tick();
    }
    reset() {
        return this.root.reset();
    }
}

export { NodeState, Node, Composite, Decorator, Action, BehaviorTree };