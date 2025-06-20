"use strict";

import { Vector2 } from "../../vector-library/version-01/vector2.js";
import { LinearState } from './linearState.js'

class Particle extends LinearState {
    constructor(position = new Vector2(), mass = 1, radius = 4, color = "rgb(255, 255, 255)"){
        super(position, mass);
        this.radius = radius;
        this.color = color;
        this.density = this.calculateDensity();
    }
    calculateDensity() {
        return this.mass / (Math.PI * this.radius * this.radius);
    }
    calculateRadius() {
        this.radius = Math.sqrt(this.mass / (Math.PI * this.density));
    }
}

export { Particle };