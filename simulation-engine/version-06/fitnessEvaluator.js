"use strict";

/*
    This class contains all functions and variables responsible for
    evaluating the fitness score of each individual in a population.

    The fitness evaluation process consists of one or more steps, to be completed in order.
    Each fitness step is a class instance that contains its own unique set of functions and variables.

    Each fitness step contains a set of target values that the robot must attempt to reach.

    A target value may be a specific body position, angle, velocity etc.

    A target value may change during the evaluation, and it may be a function 
    of other values such as elapsed time or number of simulation ticks.

    Once the target values of a fitness step has been reached, the step is marked as complete,
    and the evaulator begins to calculate the fitness score based on the next target values etc.

    This process teaches the robot to solve a series of specific tasks at specific times, and in a specific order.

    The fitness evaluator holds information about fitness score, and the current fitness step and target values for each robot.

    fitnessEvaluatorArgs = {
        fitnessSteps : [

        ]
    }

*/

class FitnessStep {
    constructor(args = {}) {
        this.args = args;
    }
}

class FitnessEvaluator {
    constructor(args = {}) {
        this.args = args;
        this.fitnessSteps = [];
        this.isCompleted = false;
    }
    createFitnessSteps() {
        for(let i = 0; i < this.args.fitnessSteps.length; i++) {
            this.fitnessSteps.push(new FitnessStep(this.args.fitnessSteps[i]));
        }
    }
}

export { FitnessStep, FitnessEvaluator };