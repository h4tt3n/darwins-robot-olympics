"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../base/decoratorBase.js";

class Inverter extends DecoratorBase {
    constructor(node) {
        super(node);
    }
    evaluate() {
        switch (this.child?.Evaluate())
        {
            case NodeState.FAILURE:
                State = NodeState.SUCCESS;
                break;
            case NodeState.SUCCESS:
                State = NodeState.FAILURE;
                break;
            case NodeState.RUNNING:
                State = NodeState.RUNNING;
                break;
        }
        return State;
    }
    toString() {
        return super.toString();
    }
}

export { Inverter };