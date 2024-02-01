"use strict";

import { ActionBase } from "../base/actionBase.js";
import { CommandBase } from "../base/commandBase.js";

class ActionCommand extends ActionBase {
    constructor(command) {
        super();
        if (!(command instanceof CommandBase)) {
            throw new Error("command must be of type CommandBase");
        }
        this.command = command;
    }
    evaluate() {
        this.state = this.command.execute();
        return this.state;
    }
    toString() {
        return super.toString();
    }
}

export { ActionCommand };