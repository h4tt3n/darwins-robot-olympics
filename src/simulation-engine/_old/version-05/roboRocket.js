"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";

class RoboRocket {
    constructor(brain, body, eyes){
		this.brain = brain;
		this.body = body;
		this.eyes = eyes;
        this.fitness = 0;
		this.ticksAlive = 0;
    }
}

export { RoboRocket };