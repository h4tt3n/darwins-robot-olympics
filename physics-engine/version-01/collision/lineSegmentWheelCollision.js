"use strict";

import { Vector2 } from '../../../vector-library/version-01/vector2.js'
import { constants } from './../constants.js';

class LineSegmentWheelCollision {
    constructor(lineSegment, wheel, lineSegmentCollisionPoint, wheelCollisionPoint, distance, normal) {
        this.stiffness = 1.0;
        this.damping = 0.7;
        this.warmStart = 0.5;
        this.staticFrictionVelocity = 10.0;
        this.staticFriction = 1.0;
        this.dynamicFriction = 0.5;
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
        //console.log("Corrective impulse!");
        // TODO: Move friction to computeRestImpulse
        //if (this.restImpulse == 0.0) { return; }

        const relativeCollisionPoint = this.wheelCollisionPoint.sub(this.wheel.position);
        
        const deltaImpulse = this.wheel.impulse.add(relativeCollisionPoint.perpDot(-this.wheel.angularImpulse));

        const impulseErrorNormal = this.normal.dot(deltaImpulse.sub(this.restImpulse));
        const impulseErrorTangent = this.normal.perpDot(deltaImpulse.sub(this.restImpulse));

        const correctiveImpulse = (this.normal.mul(-impulseErrorNormal * this.reducedMass).add(this.normal.perp().mul(-impulseErrorTangent * this.reducedMass)));

        //console.log({correctiveImpulse : correctiveImpulse});

        this.wheel.addImpulse(correctiveImpulse.mul(this.wheel.inverseMass));
        this.wheel.addAngularImpulse(correctiveImpulse.perpDot(relativeCollisionPoint) * this.wheel.inverseInertia);

        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {
    }
    computeRestImpulse() {
        //console.log("Rest impulse!");
        const relativeCollisionPoint = this.wheelCollisionPoint.sub(this.wheel.position);
        //console.log({relativeCollisionPoint : relativeCollisionPoint});
        
        const deltaPosition = this.wheelCollisionPoint.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.wheel.velocity.add(relativeCollisionPoint.perpDot(-this.wheel.angularVelocity));

        //console.log({angularVelocity : this.wheel.angularVelocity})
        
        const deltaVelocityNormal = this.normal.dot(deltaVelocity);
        const deltaVelocityTangent = this.normal.perpDot(deltaVelocity);

        //console.log({deltaVelocityTangent : deltaVelocityTangent});

        const positionErrorNormal = this.normal.dot(deltaPosition);
        const velocityErrorNormal = deltaVelocityNormal;
        const velocityErrorTangent = deltaVelocityTangent;

        const restImpulseNormal = -(positionErrorNormal * this.stiffness * constants.INV_DT + velocityErrorNormal * this.damping);
        const restImpulseTangent = -(velocityErrorTangent * 0.1);

        const FrictionCoefficient = Math.abs(deltaVelocityTangent) < this.staticFrictionVelocity ? this.staticFriction : this.dynamicFriction;

        //const restImpulseTangentWithFriction = Math.abs(restImpulseTangent) < FrictionCoefficient * restImpulseNormal ? restImpulseTangent : Math.sign(restImpulseTangent) * FrictionCoefficient * restImpulseNormal;
        const restImpulseTangentWithFriction = restImpulseTangent * FrictionCoefficient;

        this.restImpulse = this.normal.mul(restImpulseNormal).add(this.normal.perp().mul(restImpulseTangentWithFriction));
        //console.log({restImpulse : this.restImpulse});
    }
    computeReducedMass(){
        console.log("Reduced mass!");
        const k1 = this.wheel.inverseMass;
        const k2 = this.wheel.radius * this.wheel.radius * this.wheel.inverseInertia;
        const k = k1 + k2;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

export { LineSegmentWheelCollision };
