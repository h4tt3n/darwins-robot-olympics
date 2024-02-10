"use strict";

import { BehaviorTree, Sequence, Selector, Serializer, HasReachedTarget, HasTimedOut, CalculateFitness, BumpTicksAlive } from "../../behavior-tree/version-02/wrapper.js";


class FitnessEvaluator {
    constructor(simulation) {
        this.simulation = simulation;
        this.behaviorTrees = [];
    }
    evaluate() {
        for (let behaviorTree of this.behaviorTrees) {
            behaviorTree.tick();
        }
    }
    setup(robots) {

        for (let robot of robots) {
            
            let behaviorTree = new BehaviorTree(
                new Sequence("sequence", [
                    new Selector("selector", [
                        new Serializer("serializer", [
                            new HasReachedTarget(robot, this.simulation.wayPoints[0], "HasReachedTarget 1"),
                            new HasReachedTarget(robot, this.simulation.wayPoints[1], "HasReachedTarget 2"),
                            new HasReachedTarget(robot, this.simulation.wayPoints[2], "HasReachedTarget 3"),
                        ]),
                        new HasTimedOut(robot, 1000, "HasTimedOut"),
                        //new BumpTicksAlive(robot, "BumpTicksAlive"),
                    ]),
                    new CalculateFitness(robot, "CalculateFitness"),
                ]),
            );

            this.behaviorTrees.push(behaviorTree);
        }
    }
}

export { FitnessEvaluator };