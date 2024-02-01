"use strict";

import { CommandBase } from "../base/commandBase.js";
import { NodeState } from "../nodeState.js";

class ReturnRunning extends CommandBase {
    constructor() {
        super();
    }
    execute() {
        console.log("ReturnRunning.execute");
        return NodeState.RUNNING;
    }
}

export { ReturnRunning };