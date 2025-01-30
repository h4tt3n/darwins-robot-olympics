"use strict";

import { 
    NodeState, BehaviorTree, 
    Sequence, Selector, Serializer, SequenceOR,
    Success, Failure, Running, HasReachedTarget, HasTimedOut, CalculateFitness,
    Inverter, Delay, Repeater, UntilFail, UntilSuccess
} from "../../../behavior-tree/version-02/wrapper.js";

class Entity {
    constructor() {
        this.name = "Entity";
    }
}

var entity = new Entity();

var tree = new SequenceOR("root", [
    new Serializer("target check", [
        new Delay("delay 1", new Success("success 1"), 1),
        new Delay("delay 2", new Success("success 2"), 1),
    ]),
    new Delay("delay 3", new Success("success 3"), 1),
]);

let state = null;

do {
    state = tree.tick();
} while (state === NodeState.RUNNING);