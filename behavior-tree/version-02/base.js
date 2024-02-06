"use strict";

// Node state enum
class NodeState {
    static SUCCESS = "SUCCESS";
    static FAILURE = "FAILURE";
    static RUNNING = "RUNNING";
}

// Node base class
class Node {
    constructor(name) {
        this.name = name;
    }
    tick() {
        throw new Error("Node: tick method not implemented");
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
}

// Action base class
class Action extends Node {
    constructor(name) {
        super(name);
    }
    tick() {
        throw new Error("Action: tick method not implemented");
    }
}

// Behavior tree class
// Only needed for blackboard support
class BehaviorTree {
    constructor(entity, root) {
        this.entity = entity;
        if (root instanceof Node) {
            this.root = root;
        } else {
            throw new Error("BehaviorTree: root must be a node");
        }
        this.blackboard = new Map();
    }
    tick() {
        return this.root.tick();
    }
}

export { NodeState, Node, Composite, Decorator, Action, BehaviorTree };