"use strict";

/*
    This class contains all functions and variables responsible for
    evaluating the fitness score of an individual.

    Contains waypoints. Contains knowledge of each individual's waypoint progress.

    fitnessEvaluatorArgs = {
        wayPoints: [wayPoint1, wayPoint2, wayPoint3, ...],
        challengeCompletedFunc: function(robot) { ... },
        calculateFitnessFunc: function(robot) { ... }
    }

*/

class FitnessEvaluator {
    constructor(args = {}) {
        this.args = args;
    }
    update(robots) {
        for (let i = 0; i < robots.length; i++) {
            let robot = robots[i];
            if (this.args.challengeCompletedFunc(robot)) {
                this.args.calculateFitnessFunc(robot);
            }
        }
    }
}

export { FitnessEvaluator };