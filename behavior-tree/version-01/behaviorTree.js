"use strict";

import { NodeBase } from "./base/nodeBase.js";
import { NodeState } from "./nodeState.js";

class BehaviorTree {
    constructor(entity, rootNode) {
        this.entity = entity;
        this.rootNode = rootNode;
        this.state = NodeState.DEFAULT;
    }
    add(node) {
        if (node instanceof NodeBase) {
            this.rootNode = node;
            this.rootNode.root = this;
            return this.rootNode;
        }
    }
    evaluate() {
        if (this.rootNode != null) {
            this.state = this.rootNode.evaluate();
        }
        return this.state;
    }
    toString() {
        return super.toString();
    }
};

export { BehaviorTree };