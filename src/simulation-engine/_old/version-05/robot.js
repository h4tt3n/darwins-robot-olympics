"use strict";

/*

*/

import { Vector2 } from "../../vector-library/version-01/vector2.js";

class Robot {
    constructor(params = {}) {
        this.brain = params.brain;
        this.body = params.body;
        this.sensors = params.sensors;
        this.fitness = 0;
        this.ticksAlive = 0;
    }
}

export { Robot };