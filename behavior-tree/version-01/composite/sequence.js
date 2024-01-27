"use strict";

import { NodeState } from "../nodeState.js";
import { CompositeBase } from "../compositeBase.js";

class Sequence extends CompositeBase {
    constructor(nodes) {
        super(nodes);
    }
    evaluate() {
        let anyChildrenRunning = false;
        if (this.children != null) {
            for (let node of this.children) {
                switch (node.evaluate()) {
                    case NodeState.FAILURE:
                        this.state = NodeState.FAILURE;
                        return this.state;
                    case NodeState.SUCCESS:
                        continue;
                    case NodeState.RUNNING:
                        anyChildrenRunning = true;
                        continue;
                }
            }
        }
        this.state = anyChildrenRunning ? NodeState.RUNNING : NodeState.SUCCESS;
        return this.state;
    }
    toString() {
        return super.toString();
    }
}

export { Sequence };