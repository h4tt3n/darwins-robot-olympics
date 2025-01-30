"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearLink } from '../base/linearLink.js'

class FixedSpring extends LinearLink{
    constructor( linearStateA, linearStateB, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.correctionFactor = 0.05;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.restLength = this.pointB.position.sub(this.pointA.position);

        super.computeReducedMass();
    }
    applyCorrectiveImpulse(){
        // if( this.restImpulse == Vector2.zero) { return };
        // const deltaImpulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        // const deltaImpulseY = this.pointB.impulse.y - this.pointA.impulse.y;
        // const impulseErrorX = deltaImpulseX - this.rest
        // const impulseErrorY = deltaImpulseY - this.rest
        // const correctiveImpulseX = impulseErrorX * -this.reducedMass * this.correctionFactor;
        // const correctiveImpulseY = impulseErrorY * -this.reducedMass * this.correctionFactor;
        // this.pointA.impulse.x -= correctiveImpulseX * this.pointA.inverseMass;
        // this.pointA.impulse.y -= correctiveImpulseY * this.pointA.inverseMass;
        // this.pointB.impulse.x += correctiveImpulseX * this.pointB.inverseMass;
        // this.pointB.impulse.y += correctiveImpulseY * this.pointB.inverseMass;
        // this.accumulatedImpulse.x += correctiveImpulseX;
        // this.accumulatedImpulse.y += correctiveImpulseY;

        if( this.restImpulse == Vector2.zero) { return };
        const deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        const impulseError = deltaImpulse.sub(this.restImpulse);
        const correctiveImpulse = impulseError.mul(-this.reducedMass * this.correctionFactor);
        this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart(){
        // if( this.accumulatedImpulse == Vector2.zero) { return };
        // const warmstartImpulseX = this.accumulatedImpulse.x * this.warmStart;
        // const warmstartImpulseY = this.accumulatedImpulse.y * this.warmStart;
        // this.pointA.impulse.x -= warmstartImpulseX * this.pointA.inverseMass;
        // this.pointA.impulse.y -= warmstartImpulseY * this.pointA.inverseMass;
        // this.pointB.impulse.x += warmstartImpulseX * this.pointB.inverseMass;
        // this.pointB.impulse.y += warmstartImpulseY * this.pointB.inverseMass;
        // this.accumulatedImpulse.x = 0.0;
        // this.accumulatedImpulse.y = 0.0;

        if( this.accumulatedImpulse == Vector2.zero) { return };
        const warmstartImpulse = this.accumulatedImpulse.mul(this.warmStart);
        this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeData(){
    }
    computeRestImpulse(){
        // const deltaPositionX = this.pointB.position.x - this.pointA.position.x;
        // const deltaPositionY = this.pointB.position.y - this.pointA.position.y;
        // const deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        // const deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;
        // const positionErrorX = deltaPositionX - this.restLength.x;
        // const positionErrorY = deltaPositionY - this.restLength.y;
        // const velocityErrorX = deltaVelocityX;
        // const velocityErrorY = deltaVelocityY;
        // this.restImpulse.x = positionErrorX * -this.stiffness * constants.INV_DT + velocityErrorX * -this.damping;
        // this.restImpulse.y = positionErrorY * -this.stiffness * constants.INV_DT + velocityErrorY * -this.damping;
        
        const deltaPosition = this.pointB.position.sub(this.pointA.position);
        const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        const positionError = deltaPosition.sub(this.restLength);
        const velocityError = deltaVelocity;
        this.restImpulse = positionError.mul(-this.stiffness*constants.INV_DT).add(velocityError.mul(-this.damping));
    }
};

export { FixedSpring };