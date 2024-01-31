"use strict";

import { CommandBase } from "../base/commandBase.js";
import { NodeState } from "../nodeState.js";

class ReturnSuccess extends CommandBase {
    constructor() {
        super();
    }
    execute() {
        return NodeState.SUCCESS;
    }
}

export { ReturnSuccess };