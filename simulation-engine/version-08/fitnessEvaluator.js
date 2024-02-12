"use strict";

import { BehaviorTree, Sequence, Selector, Serializer, HasReachedTarget, HasTimedOut, CalculateFitness, NodeState } from "../../behavior-tree/version-02/wrapper.js";

class RobotFitnessState {
    constructor(robot, behaviorTree) {
        this.robot = robot;
        this.behaviorTree = behaviorTree;
        this.fitnessScore = null;
        this.isCompleted = false;
    }
}

class FitnessEvaluator {
    constructor(simulation) {
        this.simulation = simulation;
        this.RobotFitnessStates = [];
    }
    evaluate() {
        for (let robotFitnessState of this.RobotFitnessStates) {
            if (!robotFitnessState.isCompleted) {
                
                let status = robotFitnessState.behaviorTree.tick();
                
                if (status === NodeState.SUCCESS) {

                    robotFitnessState.isCompleted = true;
                    robotFitnessState.fitnessScore = robotFitnessState.robot.fitness;
                    this.simulation.deleteRobot(robotFitnessState.robot);

                } else if (status === NodeState.RUNNING) {

                    robotFitnessState.robot.ticksAlive++;
                    
                }
            }
        }

    }
    setup() {
        for (let robot of this.simulation.robots) {
            
            let behaviorTree = new Selector("root", [
                    new Serializer("target check", [
                        new HasReachedTarget(robot, this.simulation.wayPoints[0], "HasReachedTarget 1"),
                        new HasReachedTarget(robot, this.simulation.wayPoints[1], "HasReachedTarget 2"),
                        new HasReachedTarget(robot, this.simulation.wayPoints[2], "HasReachedTarget 3"),
                    ]),
                    new HasTimedOut(robot, this.simulation.generationMaxTicks, "hasTimedOut")
                ]);

            this.RobotFitnessStates.push(new RobotFitnessState(robot, behaviorTree));
        }
    }
}

export { FitnessEvaluator };