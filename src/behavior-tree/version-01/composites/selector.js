"use strict";

import { NodeState } from "../nodeState.js";
import { CompositeBase } from "../base/compositeBase.js";

class Selector extends CompositeBase {
    constructor(nodes) {
        super(nodes);
    }
    evaluate() {
        if (this.children != null) {
            for (let node of this.children) {
                switch (node.evaluate()) {
                    case NodeState.FAILURE:
                        continue;
                    case NodeState.SUCCESS:
                        this.state = NodeState.SUCCESS;
                        return this.state;
                    case NodeState.RUNNING:
                        this.state = NodeState.RUNNING;
                        return this.state;
                }
            }
        }
        this.state = NodeState.FAILURE;
        return this.state;
    }
    toString() {
        return super.toString();
    }
}

export { Selector };