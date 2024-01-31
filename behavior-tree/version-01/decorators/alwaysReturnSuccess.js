"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../base/decoratorBase.js";

class AlwaysReturnSuccess extends DecoratorBase {
    constructor(node) {
        super(node);
    }
    evaluate() {
        this.child?.evaluate()
        this.state = NodeState.SUCCESS;
        return this.state;
    }
    toString() {
        return super.toString();
    }
}

export { AlwaysReturnSuccess };