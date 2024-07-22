"use strict";

class NodeBase {
    constructor() {
        this.root = null;
        this.parent = null;
        this.state = null;
    }
    add(node) {
        return null;
    }
    evaluate() {
        return null;
    }
    up() {
        return this.parent != null ? this.parent : this;
    }
    toString() {
        return this.constructor.name;
    }
};

export { NodeBase };