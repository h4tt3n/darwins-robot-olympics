"use strict";

import { Particle } from "../../../physics-engine/version-01/particle.js";

class Projectile extends Particle{
    constructor(position, velocity, radius, mass, color, lifespan) {
        super(position, mass, radius, color);
        this.lifespan = lifespan;
        this.age = 0;
        this.isDead = false;
    }
    update() {
        this.age++;
        this.isDead = this.age > this.lifespan;
    }
}

export { Projectile };