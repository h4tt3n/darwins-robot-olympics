"use strict";

// This is the base class for all robots.

import { Vector2 } from "../../vector-library/version-01/vector2.js";

class RoboBase {
    constructor(brain, body, eyes){
        this.brain = brain;
        this.body = body;
        this.eyes = eyes;
        this.fitness = 0;
        this.ticksAlive = 0;
    }
}

export { RoboBase };