"use strict";

import { NodeState, Decorator } from "./base.js";

class Inverter extends Decorator {
    constructor(name, child) {
        super(name, child);
    }
    tick() {
        //console.log("Inverter: tick");
        switch (this.child.tick()) {
            case NodeState.SUCCESS:
                //console.log("Inverter: SUCCESS");
                return NodeState.FAILURE;
            case NodeState.FAILURE:
                //console.log("Inverter: FAILURE");
                return NodeState.SUCCESS;
            case NodeState.RUNNING:
                //console.log("Inverter: RUNNING");
                return NodeState.RUNNING;
            default:
                throw new Error("Inverter: Invalid node state");
        }
    }
}

class Delay extends Decorator {
    constructor(name, child, delay) {
        super(name, child);
        this.delay = delay;
        this.elapsed = 0;
    }
    tick() {
        if (this.elapsed < this.delay) {
            this.elapsed++;
            console.log (`class: ${this.constructor.name} | name: ${this.name} | elapsed: ${this.elapsed} | return: RUNNING;`)
            return NodeState.RUNNING;
        } else {
            this.elapsed = 0;
            return this.child.tick();
        }
    }
}

class Repeater extends Decorator {
    constructor(name, child, limit) {
        super(name, child);
        this.limit = limit;
        this.count = 0;
    }
    tick() {
        let status = this.child.tick();
        if (status === NodeState.SUCCESS || status === NodeState.FAILURE) {
            this.count++;
            if (this.count === this.limit) {
                this.count = 0;
                return status;
            }
        }
        return NodeState.RUNNING;
    }
}

class UntilFail extends Decorator {
    constructor(name, child) {
        super(name, child);
    }
    tick() {
        while (true) {
            let status = this.child.tick();
            if (status === NodeState.FAILURE) {
                return NodeState.SUCCESS;
            }
        }
    }
}

class UntilSuccess extends Decorator {
    constructor(name, child) {
        super(name, child);
    }
    tick() {
        while (true) {
            let status = this.child.tick();
            if (status === NodeState.SUCCESS) {
                return NodeState.SUCCESS;
            }
        }
    }
}

export { Inverter, Delay, Repeater, UntilFail, UntilSuccess };