"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../decoratorBase.js";

class Limiter extends DecoratorBase {
    constructor(node, numTimes) {
        super(node);
        this.numTimes = numTimes;
        this.currentTimes = 0;
    }
    evaluate() {
        if(this.currentTimes < this.numTimes) {
            switch (this.child?.Evaluate())
            {
                case NodeState.FAILURE:
                    this.state = NodeState.FAILURE;
                    break;
                case NodeState.SUCCESS:
                    this.currentTimes++;
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
        this.currentTimes = 0;
    }
    toString() {
        return super.toString();
    }
}

export { Limiter };