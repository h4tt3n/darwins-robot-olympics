"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'
import { AngularState } from './angularState.js';

class Wheel extends AngularState {
    constructor(position, mass, angle, inertia = null, radius) {
        super(position, mass, angle, inertia);
        this.radius = radius;
        this.inertia = inertia || this.calculateInertia();
        this.computeInverseInertia();
        console.log({inertia : this.inertia});
    }
    calculateInertia() {
        return 0.5 * this.mass * this.radius * this.radius;
    }
    computeNewState() {
        super.computeNewState();
    }
}

export { Wheel };