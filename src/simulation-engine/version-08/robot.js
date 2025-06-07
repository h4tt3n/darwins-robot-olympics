"use strict";

/*

*/

class Robot {
    constructor(brain, body, eyes, update) {
        this.brain = brain;
        this.body = body;
        this.eyes = eyes;
        this.update = update;
        this.fitness = 0;
        this.distance = Infinity;
        this.ticksAlive = 0;
    }
}

export { Robot };