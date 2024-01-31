"use strict";

import { BehaviorTree } from "./behaviorTree.js";
import { ActionCommand } from "./actions/actionCommand.js";
import { Selector } from "./composites/selector.js";
import { Sequence } from "./composites/sequence.js";
import { Serialiser } from "./composites/serialiser.js";
import { AlwaysReturnFailure } from "./decorators/alwaysReturnFailure.js";
import { AlwaysReturnRunning } from "./decorators/alwaysReturnRunning.js";
import { AlwaysReturnSuccess } from "./decorators/alwaysReturnSuccess.js";
import { Delay } from "./decorators/delay.js";
import { Inverter } from "./decorators/inverter.js";
import { Limiter } from "./decorators/limiter.js";
import { Repeater } from "./decorators/repeater.js";

class BehaviorTreeFactory {
    static behaviorTree(entity) {
        return new BehaviorTree(entity);
    }
    static action(command) {
        return new ActionCommand(command);
    }
    static selector(nodes) {
        return new Selector(nodes);
    }
    static sequence(nodes) {
        return new Sequence(nodes);
    }
    static serialiser(nodes) {
        return new Serialiser(nodes);
    }
    static alwaysReturnFailure() {
        return new AlwaysReturnFailure();
    }
    static alwaysReturnRunning() {
        return new AlwaysReturnRunning();
    }
    static alwaysReturnSuccess() {
        return new AlwaysReturnSuccess();
    }
    static delay(delayTime) {
        return new Delay(delayTime);
    }
    static inverter(node) {
        return new Inverter(node);
    }
    static limiter(node, numTimes) {
        return new Limiter(node, numTimes);
    }
    static repeater(node, numRepeats) {
        return new Repeater(node, numRepeats);
    }
}

export { BehaviorTreeFactory };