"use strict";

import { Vector2 } from "../../vector-library/version-02/vector2.js";
import { Point } from "../../physics-engine/version-02/point.js";

class WayPoint extends Point {
    constructor(position, radius, color) {
        super(position);
        this.radius = radius;
        this.color = color;
    }
}

export { WayPoint };