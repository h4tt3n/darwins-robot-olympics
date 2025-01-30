"use strict";

import { Vector2 } from "../../../vector-library/version-02/vector2.js";
import { LinearState } from '../base/linearState.js'
import { ObjectType } from "../objectType.js";
import { Particle } from "./particle.js";

class FluidParticle extends LinearState {
    constructor(position = new Vector2(), mass = 1, radius = 4, color = "rgb(255, 255, 255)") {
        super(position, mass, radius, color);
        this.density = 0.0;
        this.projectedVel = 0.0;
        this.radius = radius;
        this.color = color;
        this.type = ObjectType.FLUID_PARTICLE;
    }
    computeNewState() {
        super.computeNewState();
        this.density = 0.0;
        this.projectedVel = 0.0;
    }
    getBoundingBox() {
        return {
            minX: this.position.x - this.radius,
            minY: this.position.y - this.radius,
            maxX: this.position.x + this.radius,
            maxY: this.position.y + this.radius
        };
    }
}

export { FluidParticle };