"use strict";

import { BehaviorTree, Sequence, Selector, Serializer, HasReachedTarget, HasTimedOut, CalculateFitness } from "../../behavior-tree/version-02/wrapper.js";

class FitnessEvaluator {
    constructor() {
        this.behaviorTrees = [];
    }
    setup(robots) {
        for (let robot of robots) {
            
            let behaviorTree = new BehaviorTree(
                new Sequence("sequence", [
                    new Selector("selector", [
                        new Serializer("serializer", [
                            new HasReachedTarget(robot, targets[0], "HasReachedTarget 1"),
                            new HasReachedTarget(robot, targets[1], "HasReachedTarget 2"),
                            new HasReachedTarget(robot, targets[2], "HasReachedTarget 3"),
                        ]),
                        new HasTimedOut(robot, 1000, "HasTimedOut"),
                    ]),
                    new CalculateFitness(robot, "CalculateFitness"),
                ]),
            );

            this.behaviorTrees.push(behaviorTree);
        }
    }
}

export { FitnessEvaluator };