"use strict";

import { Vector2 } from '../../../vector-library/version-01/vector2.js'
import { constants } from './../constants.js';

class ParticleParticleCollision {
    constructor(particleA, particleB, particleACollisionPoint, particleBCollisionPoint, distance, normal) {
        this.stiffness = 1.0;
        this.damping = 0.8;
        this.warmStart = 0.5;
        this.particleA = particleA;
        this.particleB = particleB;
        this.particleACollisionPoint = particleACollisionPoint;
        this.particleBCollisionPoint = particleBCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.reducedMass = 0.0;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
        this.computeReducedMass();
        //console.log(this.reducedMass);
    }
    applyCorrectiveImpulse() {
        if (this.restImpulse == 0.0) { return; }
        const deltaImpulse = this.particleB.impulse.sub(this.particleA.impulse);
        const projectedImpulse = this.normal.dot(deltaImpulse);
        const impulseError = projectedImpulse - this.restImpulse;
        const correctiveImpulse = this.normal.mul(-impulseError * this.reducedMass); // TODO : Add reduced mass
        this.particleA.addImpulse(correctiveImpulse.mul(-this.particleA.inverseMass));
        this.particleB.addImpulse(correctiveImpulse.mul( this.particleB.inverseMass));

        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {

    }
    computeRestImpulse() {
        //console.log("Rest impulse!");
        const deltaPosition = this.particleBCollisionPoint.sub(this.particleACollisionPoint);
        const deltaVelocity = this.particleB.velocity.sub(this.particleA.velocity);
        let positionError = this.normal.dot(deltaPosition);
        //if(positionError < 0.0) { positionError = 0; }
        let velocityError = this.normal.dot(deltaVelocity);
        //if(velocityError < 0.0) { velocityError = 0; }
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeReducedMass(){
        //var k = this.linearStateA.inverseMass + this.linearStateB.inverseMass;
        var k = this.particleA.inverseMass + this.particleB.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

export { ParticleParticleCollision };