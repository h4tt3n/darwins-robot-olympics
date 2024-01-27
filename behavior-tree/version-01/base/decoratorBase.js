"use strict";

import { NodeBase } from "./nodeBase.js";

class DecoratorBase extends NodeBase {
    constructor(node) {
        super();
        this.add(node);
    }
    add(node) {
        node.root = this.root;
        node.parent = this;
        this.child = node;
        return this;
    }
    toString() {
        return super.toString();
    }
}

