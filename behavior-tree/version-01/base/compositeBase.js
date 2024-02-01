"use strict";

import { NodeBase } from "./nodeBase.js";

class CompositeBase extends NodeBase {
    constructor(nodes) {
        super();
        // for (let i = 0; i < arguments.length; i++) {
        //     console.log(arguments[i]);
        // }

        this.children = nodes;
        
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