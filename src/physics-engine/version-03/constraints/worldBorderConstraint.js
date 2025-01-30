"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';

class WorldBorderConstraint {
    constructor(objectArray = [], minX = 0, maxX = 100, minY = 0, maxY = 100, stiffness = 0.5, damping = 0.5, friction = 0.25) {
        this.objectArray = objectArray;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.stiffness = stiffness;
        this.damping = damping;
        this.friction = friction;
    }
    
    applyCorrectiveImpulse() {
        for (let i = 0; i < this.objectArray.length; i++) {
            const object = this.objectArray[i];
            if (object.position.x < this.minX + object.radius) {
                object.impulse.x -= (object.position.x - (this.minX + object.radius)) * constants.INV_DT * this.stiffness + object.velocity.x * this.damping;
                // Perpendicular friction
                object.impulse.y -= object.velocity.y * this.friction;
            }
            if (object.position.x > this.maxX - object.radius) {
                object.impulse.x -= (object.position.x - (this.maxX - object.radius)) * constants.INV_DT * this.stiffness + object.velocity.x * this.damping;
                // Perpendicular friction
                object.impulse.y -= object.velocity.y * this.friction;
            }
            if (object.position.y < this.minY + object.radius) {
                object.impulse.y -= (object.position.y - (this.minY + object.radius)) * constants.INV_DT * this.stiffness + object.velocity.y * this.damping;
                // Perpendicular friction
                object.impulse.x -= object.velocity.x * this.friction;
            }
            if (object.position.y > this.maxY - object.radius) {
                object.impulse.y -= (object.position.y - (this.maxY - object.radius)) * constants.INV_DT * this.stiffness + object.velocity.y * this.damping;
                // Perpendicular friction
                object.impulse.x -= object.velocity.x * this.friction;
            }
        }
    }
}

export { WorldBorderConstraint };