"use strict";

import { CommandBase } from "../base/commandBase.js";
import { NodeState } from "../nodeState.js";

class ReturnFailure extends CommandBase {
    constructor() {
        super();
    }
    execute() {
        console.log("ReturnFailure.execute");
        return NodeState.FAILURE;
    }
}

export { ReturnFailure };