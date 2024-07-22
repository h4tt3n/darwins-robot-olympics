"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../base/decoratorBase.js";

class Repeater extends DecoratorBase {
    constructor(node, numRepeats) {
        super(node);
        this.numRepeats = numRepeats;
        this.currentRepeats = 0;
    }
    evaluate() {
        if(this.currentRepeats < this.numRepeats) {
            switch (this.child?.Evaluate())
            {
                case NodeState.FAILURE:
                    this.state = NodeState.FAILURE;
                    break;
                case NodeState.SUCCESS:
                    this.numRepeats++;
                    this.state = NodeState.RUNNING;
                    break;
                case NodeState.RUNNING:
                    this.state = NodeState.RUNNING;
                    break;
            }
            return this.state;
        }
    }
    reset() {
        this.currentRepeats = 0;
    }
    toString() {
        return super.toString();
    }
}

export { Repeater };