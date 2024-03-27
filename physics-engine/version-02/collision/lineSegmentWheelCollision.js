"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { constants } from '../constants.js';

class LineSegmentWheelCollision {
    constructor(lineSegment, wheel, lineSegmentCollisionPoint, wheelCollisionPoint, distance, normal) {
        this.stiffness = 0.5;
        this.damping = 0.5;
        this.warmStart = 0.5;
        this.staticFrictionVelocity = 1.0;
        this.staticFriction = 1.0;
        this.dynamicFriction = 0.1;
        this.lineSegment = lineSegment;
        this.wheel = wheel;
        this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        this.wheelCollisionPoint = wheelCollisionPoint;
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
        const relativeCollisionPoint = this.wheelCollisionPoint.sub(this.wheel.position);
        const deltaImpulse = this.wheel.impulse.add(relativeCollisionPoint.perpDot(-this.wheel.angularImpulse));
        // Error
        const impulseErrorNormal = this.normal.dot(deltaImpulse.sub(this.restImpulse));
        const impulseErrorTangent = this.normal.perpDot(deltaImpulse.sub(this.restImpulse));
        // Correction
        const correctiveImpulse = (this.normal.mul(-impulseErrorNormal * this.reducedMass).add(this.normal.perp().mul(-impulseErrorTangent * this.reducedMass)));
        // Apply
        this.wheel.impulse.addThis(correctiveImpulse.mul(this.wheel.inverseMass));
        this.wheel.addAngularImpulse(correctiveImpulse.perpDot(relativeCollisionPoint) * this.wheel.inverseInertia);
        // Warmstart
        this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart() {
        const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
        if (projectedImpulse > 0.0) { return; }
        // State
        const relativeCollisionPoint = this.wheelCollisionPoint.sub(this.wheel.position);
        const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
        // Apply
        this.wheel.addImpulse(warmstartImpulse.mul(this.wheel.inverseMass));
        this.wheel.addAngularImpulse(warmstartImpulse.perpDot(relativeCollisionPoint) * this.wheel.inverseInertia);
        // Reset Warmstart
        this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeRestImpulse() {
        // State
        const relativeCollisionPoint = this.wheelCollisionPoint.sub(this.wheel.position);
        const deltaPosition = this.wheelCollisionPoint.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.wheel.velocity.add(relativeCollisionPoint.perpDot(-this.wheel.angularVelocity));
        const deltaVelocityNormal = this.normal.dot(deltaVelocity);
        const deltaVelocityTangent = this.normal.perpDot(deltaVelocity);
        // Error
        const positionErrorNormal = this.normal.dot(deltaPosition);
        if (positionErrorNormal < 0.0) { 
            this.restImpulse.setThis(0.0, 0.0);
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
        const k = this.wheel.inverseMass + this.wheel.radius * this.wheel.radius * this.wheel.inverseInertia;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

export { LineSegmentWheelCollision };
