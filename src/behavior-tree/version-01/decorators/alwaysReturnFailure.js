"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../base/decoratorBase.js";

class AlwaysReturnFailure extends DecoratorBase {
    constructor(node) {
        super(node);
    }
    evaluate() {
        this.child?.evaluate()
        this.state = NodeState.FAILURE;
        return this.state;
    }
    toString() {
        return super.toString();
    }
}

export { AlwaysReturnFailure };