"use strict";

import { NodeState } from "../nodeState.js";
import { DecoratorBase } from "../decoratorBase.js";

class Delay extends DecoratorBase {
    constructor(node, numTurns) {
        super(node);
        this.numTurns = numTurns;
        this.currentTurn = 0;
    }
    evaluate() {
        if(this.currentTurn < this.numTurns) {
            this.currentTurn++;
            this.state = NodeState.RUNNING;
        } else {
            this.reset();
            this.state = child?.evaluate();
        }
        return this.state;
    }
    reset() {
        this.currentTurn = 0;
    }
    toString() {
        return super.toString();
    }
}

export { Delay };