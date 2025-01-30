"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboDog extends RoboBase {
    constructor(brain, body, eyes) {
		    super(brain, body, eyes);
    }
    update() {
        // Update brain
        //this.brain.update();

        // Update eyes
        //this.eyes.forEach(eye => { eye.update(); });
    }
}

export { RoboDog };