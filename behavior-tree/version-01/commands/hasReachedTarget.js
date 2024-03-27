"use strict";

import { CommandBase } from "../base/commandBase.js";
import { NodeState } from "../nodeState.js";

class HasReachedTarget extends CommandBase {
    constructor(entity, target) {
        super();
        this.entity = entity;
        this.target = target;
    }
    execute() {
        let distance = this.entity.position.distanceTo(this.target.position);
        let hasReachedTarget = distance < 1;
        return hasReachedTarget ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}

export { HasReachedTarget };