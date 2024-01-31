"use strict";

class NodeBase {
    constructor() {
        this.root = null;
        this.parent = null;
        this.state = null;
        this.timeStamp = new Date().getTime();
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