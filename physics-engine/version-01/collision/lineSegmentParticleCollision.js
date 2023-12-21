"use strict";

import { Vector2 } from '../../../vector-library/version-01/vector2.js'
import { constants } from './../constants.js';

class LineSegmentParticleCollision {
    constructor(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal) {
        this.stiffness = 0.5;
        this.damping = 0.8;
        this.warmStart = 0.5;
        this.lineSegment = lineSegment;
        this.particle = particle;
        this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        this.particleCollisionPoint = particleCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
    }
    applyCorrectiveImpulse() {
        //console.log("Corrective impulse!");
        // TODO: Refactor friction out of this function
        if (this.restImpulse == 0.0) { return; }
        const deltaImpulse = this.particle.impulse;

        const deltaVelocity = this.particle.velocity;
        const projectedPerpendicularVelocity = this.normal.perpDot(deltaVelocity);
        //const perpendicularVelocitySquared = projectedPerpendicularVelocity * projectedPerpendicularVelocity;

        //let friction = perpendicularVelocitySquared < 2*2 ? 1.0 : 0.2;
        let friction = Math.abs(projectedPerpendicularVelocity) < 10.0 ? 1.0 : 0.2;

        const projectedNormalImpulse = this.normal.dot(deltaImpulse);
        //const projectedPerpendicularImpulse = this.normal.perpDot(deltaImpulse);

        const normalImpulseError = projectedNormalImpulse - this.restImpulse;
        const perpendicularImpulseError = (projectedPerpendicularVelocity * friction);

        const correctiveNormalImpulse = this.normal.mul(-normalImpulseError * this.particle.mass);
        const correctivePerpendicularImpulse = this.normal.perp().mul(-perpendicularImpulseError * this.particle.mass);

        //const correctiveImpulse = this.normal.mul(-normalImpulseError * this.particle.mass);
        const correctiveImpulse = correctiveNormalImpulse.add(correctivePerpendicularImpulse);
        this.particle.addImpulse(correctiveImpulse.mul(this.particle.inverseMass));
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {
        // Temporarily disabled
        // console.log("Warmstart!");
        const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
        if (projectedImpulse > 0.0) { return; }
        const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
        //console.log("Warmstart!");
        this.particle.addImpulse(warmstartImpulse.mul(this.particle.inverseMass));
        this.accumulatedImpulse = Vector2.zero;
    }
    computeRestImpulse() {
        //console.log("Rest impulse!");
        const deltaPosition = this.particleCollisionPoint.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.particle.velocity;
        let positionError = this.normal.dot(deltaPosition);
        //if(positionError < 0.0) { positionError = 0; }
        let velocityError = this.normal.dot(deltaVelocity);
        //if(velocityError < 0.0) { velocityError = 0; }
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
}

export { LineSegmentParticleCollision };