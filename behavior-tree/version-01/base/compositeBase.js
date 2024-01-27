"use strict";

import NodeBase from "./nodeBase.js";

class CompositeBase extends NodeBase {
    constructor(nodes) {
        super();
        this.children = [];
        
    }
    add(node) {
        if (node instanceof NodeBase) {
            this.children.push(node);
            return this;
        }
    }
    toString() {
        return super.toString();
    }
}

export { CompositeBase };