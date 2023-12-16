"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { RoboBase } from "./roboBase.js";

class RoboCar extends RoboBase {
    constructor(brain, body, eyes) {
        super(brain, body, eyes);
    }
    update() {

    }
}

export { RoboCar };