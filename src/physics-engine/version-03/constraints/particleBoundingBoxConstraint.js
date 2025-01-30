"use strict";

import { constants } from '../constants.js';

class ParticleBoundingBoxConstraint {
    constructor(particle, boundingBox, stiffness = 0.5, damping = 0.5, friction = 0.25) {
        this.particle = particle;
        this.boundingBox = boundingBox;
        this.stiffness = stiffness;
        this.damping = damping;
        this.friction = friction;
        this.warmStart = 0.0;
        this.correctionFactor = 0.5;
        this.distance = 0.0;
        this.restImpulseX = 0.0;
        this.restImpulseY = 0.0;
        this.collides = false;
    }
    applyCorrectiveImpulse() {
        if (this.collides === false) { return; }

        const correctiveImpulseX = (this.particle.impulse.x - this.restImpulseX) * this.correctionFactor;
        const correctiveImpulseY = (this.particle.impulse.y - this.restImpulseY) * this.correctionFactor;

        this.particle.impulse.x -= correctiveImpulseX;
        this.particle.impulse.y -= correctiveImpulseY;
    }
    computeRestImpulse() {

        //console.log('computeRestImpulse');
        
        this.restImpulseX = 0.0;
        this.restImpulseY = 0.0;
        this.collides = false;

        if (this.particle.position.x < this.boundingBox.minX + this.particle.radius) {
            const distance = this.particle.position.x - (this.boundingBox.minX + this.particle.radius);
            this.restImpulseX -= distance * constants.INV_DT * this.stiffness + this.particle.velocity.x * this.damping;
            // Perpendicular friction
            this.restImpulseY -= this.particle.velocity.y * this.friction;
            this.collides = true;
        }
        else if (this.particle.position.x > this.boundingBox.maxX - this.particle.radius) {
            const distance = this.particle.position.x - (this.boundingBox.maxX - this.particle.radius);
            this.restImpulseX -= distance* constants.INV_DT * this.stiffness + this.particle.velocity.x * this.damping;
            // Perpendicular friction
            this.restImpulseY -= this.particle.velocity.y * this.friction;
            this.collides = true;
        }

        if (this.particle.position.y < this.boundingBox.minY + this.particle.radius) {
            const distance = this.particle.position.y - (this.boundingBox.minY + this.particle.radius);
            this.restImpulseY -= distance * constants.INV_DT * this.stiffness + this.particle.velocity.y * this.damping;
            // Perpendicular friction
            this.restImpulseX -= this.particle.velocity.x * this.friction;
            this.collides = true;
        }
        else if (this.particle.position.y > this.boundingBox.maxY - this.particle.radius) {
            const distance = this.particle.position.y - (this.boundingBox.maxY - this.particle.radius);
            this.restImpulseY -= distance * constants.INV_DT * this.stiffness + this.particle.velocity.y * this.damping;
            // Perpendicular friction
            this.restImpulseX -= this.particle.velocity.x * this.friction;
            this.collides = true;
        }

    }
}

export { ParticleBoundingBoxConstraint };