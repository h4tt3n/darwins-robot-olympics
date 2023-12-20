"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'
import { AngularState } from './angularState.js';

class Wheel extends AngularState {
    constructor(position, mass, angle, inertia, radius) {
        super(position, mass, angle, inertia);
        this.radius = radius;
    }
    calculateInertia() {
        return this.mass * this.radius * this.radius;
    }
    computeNewState() {
        super.computeNewState();
    }
}

export { Wheel };