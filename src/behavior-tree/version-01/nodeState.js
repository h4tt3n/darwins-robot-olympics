"use strict";

class NodeState {
    constructor() {
        this.SUCCESS = 0;
        this.RUNNING = 1;
        this.FAILURE = 2;
        this.DEFAULT = 3;
    }
};

export { NodeState };