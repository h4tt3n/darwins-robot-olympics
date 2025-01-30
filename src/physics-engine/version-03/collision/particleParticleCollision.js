"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { constants } from '../constants.js';

class ParticleParticleCollision {
    constructor(particleA, particleB) {
        this.stiffness = 1.0;
        this.damping = 1.0;
        this.warmStart = 0.5;
        this.correctionFactor = 0.5;
        this.buffer = 0.1;
        this.particleA = particleA;
        this.particleB = particleB;
        this.distance = 0.0;
        // this.normal = new Vector2();
        this.normalX = 0.0;
        this.normalY = 0.0;
        this.reducedMass = 0.0;
        this.restImpulse = 0.0;
        //this.accumulatedImpulse = new Vector2();
        this.accumulatedImpulseX = 0.0;
        this.accumulatedImpulseY = 0.0;
        this.objectId = null;
        this.isActive = true;

        this.computeReducedMass();
    }
    applyCorrectiveImpulse() {

        if(this.distance > this.particleA.radius + this.particleB.radius) { return; }

        const deltaImpulseX = this.particleB.impulse.x - this.particleA.impulse.x;
        const deltaImpulseY = this.particleB.impulse.y - this.particleA.impulse.y;

        const projectedImpulse = this.normalX * deltaImpulseX + this.normalY * deltaImpulseY;
        const impulseError = (projectedImpulse - this.restImpulse) * this.reducedMass * this.correctionFactor;

        const correctiveImpulseX = -this.normalX * impulseError;
        const correctiveImpulseY = -this.normalY * impulseError;

        this.particleA.impulse.x -= correctiveImpulseX * this.particleA.inverseMass;
        this.particleA.impulse.y -= correctiveImpulseY * this.particleA.inverseMass;
        this.particleB.impulse.x += correctiveImpulseX * this.particleB.inverseMass;
        this.particleB.impulse.y += correctiveImpulseY * this.particleB.inverseMass;

        this.accumulatedImpulseX += correctiveImpulseX;
        this.accumulatedImpulseY += correctiveImpulseY;
    }
    applyWarmStart() {

        if(this.distance > this.particleA.radius + this.particleB.radius) { return; }
        const projectedImpulse = this.normalX * this.accumulatedImpulseX + this.normalY * this.accumulatedImpulseY;
        if (projectedImpulse < 0.0) { return; }
        const warmstartImpulseX = this.normalX * projectedImpulse * this.warmStart;
        const warmstartImpulseY = this.normalY * projectedImpulse * this.warmStart;
        this.particleA.impulse.x -= warmstartImpulseX * this.particleA.inverseMass;
        this.particleA.impulse.y -= warmstartImpulseY * this.particleA.inverseMass;
        this.particleB.impulse.x += warmstartImpulseX * this.particleB.inverseMass;
        this.particleB.impulse.y += warmstartImpulseY * this.particleB.inverseMass;
        this.accumulatedImpulseX = 0.0;
        this.accumulatedImpulseY = 0.0;
    }
    computeData() {
        const distanceVectorX = this.particleB.position.x - this.particleA.position.x;
        const distanceVectorY = this.particleB.position.y - this.particleA.position.y;
        const distanceSquared = distanceVectorX * distanceVectorX + distanceVectorY * distanceVectorY;
        const radiiSquaredBuffer = (this.particleA.radius + this.particleB.radius + this.buffer) * (this.particleA.radius + this.particleB.radius + this.buffer);

        if (distanceSquared > radiiSquaredBuffer) {
            this.isActive = false;
            return;
        }

        const radiiSquared = (this.particleA.radius + this.particleB.radius) * (this.particleA.radius + this.particleB.radius);

        if (distanceSquared > radiiSquared) {
            return;
        }

        const distance = Math.sqrt(distanceSquared);
        this.normalX = distanceVectorX / distance;
        this.normalY = distanceVectorY / distance;
        this.distance = distance - (this.particleA.radius + this.particleB.radius);
    }
    computeRestImpulse() {
        const deltaVelocityX = this.particleB.velocity.x - this.particleA.velocity.x;
        const deltaVelocityY = this.particleB.velocity.y - this.particleA.velocity.y;
        const velocityError = this.normalX * deltaVelocityX + this.normalY * deltaVelocityY;
        this.restImpulse = -(this.distance * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeReducedMass(){
        const k = this.particleA.inverseMass + this.particleB.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

export { ParticleParticleCollision };