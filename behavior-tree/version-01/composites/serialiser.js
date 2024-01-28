"use strict";

import { NodeState } from "../nodeState";
import { CompositeBase } from "../compositeBase";

class Serialiser extends CompositeBase {
    constructor(nodes) {
        super(nodes);
        this.nodeIndex = 0;
    }
    evaluate() {
        if(this.children == null) {
            this.state = NodeState.FAILURE;
            return this.state;
        }
        if(this.nodeIndex == this.children.length-1) {
            this.state = NodeState.SUCCESS;
            this.reset();
            return this.state;
        }
        switch (this.children[this.nodeIndex].evaluate()) {
            case NodeState.SUCCESS:
                this.nodeIndex++;
                this.evaluate();
                this.state = NodeState.RUNNING;
                break;
            case NodeState.RUNNING:
                this.state = NodeState.RUNNING;
                break;
            case NodeState.FAILURE:
                this.reset();
                this.state = NodeState.FAILURE;
                break;
        }
        return this.state;
    }
    reset() {
        this.nodeIndex = 0;
    }
    toString() {
        return super.toString();
    }
}

export { Serialiser };