"use strict";

import { Vector2 } from '../../../vector-library/version-01/vector2.js'
import { constants } from './../constants.js';

class LineSegmentParticleCollision {
    constructor(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal) {
        this.stiffness = 0.5;
        this.damping = 0.5;
        this.warmStart = 0.5;
        this.staticFrictionVelocity = 1.0;
        this.staticFriction = 1;
        this.dynamicFriction = 0.5;
        this.lineSegment = lineSegment;
        this.particle = particle;
        this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        this.particleCollisionPoint = particleCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.reducedMass = 0.0;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
        this.computeReducedMass();
    }
    applyCorrectiveImpulse() {
        if (this.restImpulse == Vector2.zero) { return; }
        // State
        const deltaImpulse = this.particle.impulse;
        // Error
        const impulseErrorNormal = this.normal.dot(deltaImpulse.sub(this.restImpulse));
        const impulseErrorTangent = this.normal.perpDot(deltaImpulse.sub(this.restImpulse));
        //const impulseErrorTangent = this.normal.perpDot(this.restImpulse.mul(-1));
        // Correction
        const correctiveImpulse = (this.normal.mul(-impulseErrorNormal * this.reducedMass).add(this.normal.perp().mul(-impulseErrorTangent * this.reducedMass)));
        // Apply
        this.particle.addImpulse(correctiveImpulse.mul(this.particle.inverseMass));
        // Warmstart
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {
        const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
        if (projectedImpulse > 0.0) { return; }
        // State
        const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
        // Apply
        this.particle.addImpulse(warmstartImpulse.mul(this.particle.inverseMass));
        // Reset Warmstart
        this.accumulatedImpulse = Vector2.zero;
    }
    computeRestImpulse() {
        // State
        const deltaPosition = this.particleCollisionPoint.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.particle.velocity;
        const deltaVelocityNormal = this.normal.dot(deltaVelocity);
        const deltaVelocityTangent = this.normal.perpDot(deltaVelocity);
        // Error
        const positionErrorNormal = this.normal.dot(deltaPosition);
        if (positionErrorNormal < 0.0) { 
            this.restImpulse = Vector2.zero;
            return; 
        }
        const velocityErrorNormal = deltaVelocityNormal;
        const velocityErrorTangent = deltaVelocityTangent;
        // Correction
        const restImpulseNormal = -(positionErrorNormal * this.stiffness * constants.INV_DT + velocityErrorNormal * this.damping);
        const restImpulseTangent = -velocityErrorTangent;
        const FrictionCoefficient = Math.abs(deltaVelocityTangent) < this.staticFrictionVelocity ? this.staticFriction : this.dynamicFriction;
        //const restImpulseTangentWithFriction = Math.abs(restImpulseTangent) < FrictionCoefficient * restImpulseNormal ? restImpulseTangent : Math.sign(-restImpulseTangent) * FrictionCoefficient * restImpulseNormal;
        const restImpulseTangentWithFriction = restImpulseTangent * FrictionCoefficient;
        // Apply
        this.restImpulse = this.normal.mul(restImpulseNormal).add(this.normal.perp().mul(restImpulseTangentWithFriction));
        // if (positionErrorNormal > 0.0) {
        //     this.restImpulse = this.normal.mul(restImpulseNormal).add(this.normal.perp().mul(restImpulseTangentWithFriction));
        // } else {
        //     this.restImpulse = Vector2.zero;
        // }
    }
    computeReducedMass(){
        const k = this.particle.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

export { LineSegmentParticleCollision };


// "use strict";

// import { Vector2 } from '../../../vector-library/version-01/vector2.js'
// import { constants } from './../constants.js';

// class LineSegmentParticleCollision {
//     constructor(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal) {
//         this.stiffness = 0.5;
//         this.damping = 0.5;
//         this.warmStart = 0.5;
//         this.staticFrictionVelocity = 1.0;
//         this.staticFriction = 0.9;
//         this.dynamicFriction = 0.1;
//         this.lineSegment = lineSegment;
//         this.particle = particle;
//         this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
//         this.particleCollisionPoint = particleCollisionPoint;
//         this.distance = distance;
//         this.normal = normal;
//         this.reducedMass = 0.0;
//         this.restImpulse = new Vector2();
//         this.accumulatedImpulse = new Vector2();
//         this.objectId = null;
//         this.computeReducedMass();
//     }
//     applyCorrectiveImpulse() {
//         // if (this.restImpulse == 0.0) { return; }
//         // // State
//         // const deltaImpulse = this.particle.impulse;
//         // // Error
//         // const impulseErrorNormal = this.normal.dot(deltaImpulse.sub(this.restImpulse));
//         // const impulseErrorTangent = this.normal.perpDot(deltaImpulse.sub(this.restImpulse));
//         // // Correction
//         // const correctiveImpulse = (this.normal.mul(-impulseErrorNormal * this.reducedMass).add(this.normal.perp().mul(-impulseErrorTangent * this.reducedMass)));
//         // // Apply
//         // this.particle.addImpulse(correctiveImpulse.mul(this.particle.inverseMass));
//         // // Warmstart
//         // this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);

//         //console.log("Corrective impulse!");
//         // TODO: Move friction to computeRestImpulse
//         if (this.restImpulse == 0.0) { return; }
//         const deltaImpulse = this.particle.impulse;

//         const deltaVelocity = this.particle.velocity;
//         const projectedPerpendicularVelocity = this.normal.perpDot(deltaVelocity);

//         let friction = Math.abs(projectedPerpendicularVelocity) < 10.0 ? 1.0 : 0.2;

//         const projectedNormalImpulse = this.normal.dot(deltaImpulse);

//         const normalImpulseError = projectedNormalImpulse - this.restImpulse;
//         const perpendicularImpulseError = projectedPerpendicularVelocity * friction;

//         const correctiveNormalImpulse = this.normal.mul(-normalImpulseError * this.particle.mass);
//         const correctivePerpendicularImpulse = this.normal.perp().mul(-perpendicularImpulseError * this.particle.mass);

//         const correctiveImpulse = correctiveNormalImpulse.add(correctivePerpendicularImpulse);

//         this.particle.addImpulse(correctiveImpulse.mul(this.particle.inverseMass));

//         this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
//     }
//     applyWarmStart() {
//         // const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
//         // if (projectedImpulse > 0.0) { return; }
//         // // State
//         // const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
//         // // Apply
//         // this.particle.addImpulse(warmstartImpulse.mul(this.particle.inverseMass));
//         // // Reset Warmstart
//         // this.accumulatedImpulse = Vector2.zero;
//         // const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
//         // if (projectedImpulse > 0.0) { return; }
//         // const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
//         // //console.log("Warmstart!");
//         // this.particle.addImpulse(warmstartImpulse.mul(this.particle.inverseMass));
//         // this.accumulatedImpulse = Vector2.zero;
//     }
//     computeRestImpulse() {
//         // // State
//         // const deltaPosition = this.particleCollisionPoint.sub(this.lineSegmentCollisionPoint);
//         // const deltaVelocity = this.particle.velocity;
//         // const deltaVelocityNormal = this.normal.dot(deltaVelocity);
//         // const deltaVelocityTangent = this.normal.perpDot(deltaVelocity);
//         // // Error
//         // const positionErrorNormal = this.normal.dot(deltaPosition);
//         // const velocityErrorNormal = deltaVelocityNormal;
//         // const velocityErrorTangent = deltaVelocityTangent;
//         // // Correction
//         // const restImpulseNormal = -(positionErrorNormal * this.stiffness * constants.INV_DT + velocityErrorNormal * this.damping);
//         // const restImpulseTangent = -velocityErrorTangent;
//         // const FrictionCoefficient = Math.abs(deltaVelocityTangent) < this.staticFrictionVelocity ? this.staticFriction : this.dynamicFriction;
//         // const restImpulseTangentWithFriction = restImpulseTangent * FrictionCoefficient;
//         // // Apply
//         // this.restImpulse = this.normal.mul(restImpulseNormal).add(this.normal.perp().mul(restImpulseTangentWithFriction));

//         //console.log("Rest impulse!");
//         const deltaPosition = this.particleCollisionPoint.sub(this.lineSegmentCollisionPoint);
//         const deltaVelocity = this.particle.velocity;
//         let positionError = this.normal.dot(deltaPosition);
//         let velocityError = this.normal.dot(deltaVelocity);
//         this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
//     }
//     computeReducedMass(){
//         const k = this.particle.inverseMass;
//         this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
//     }
// }

// export { LineSegmentParticleCollision };