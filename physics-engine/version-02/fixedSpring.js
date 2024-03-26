"use strict";

import { constants } from './constants.js'
import { Vector2 } from '../../vector-library/version-02/vector2.js';
import { LinearLink } from './linearLink.js'

class FixedSpring extends LinearLink{
    constructor( linearStateA, linearStateB, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.restLength = this.pointB.position.sub(this.pointA.position);
        this.computeData();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == Vector2.zero) { return };
        var deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        var impulseError = deltaImpulse.sub(this.restImpulse);
        var correctiveImpulse = impulseError.mul(-this.reducedMass);
        this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart(){
        if( this.accumulatedImpulse == Vector2.zero) { return };
        var warmstartImpulse = this.accumulatedImpulse.mul(this.warmStart);
        this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeData(){
        super.computeData();
    }
    computeRestImpulse(){
        var deltaPosition = this.pointB.position.sub(this.pointA.position);
        var deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        var positionError = deltaPosition.sub(this.restLength);
        var velocityError = deltaVelocity;
        this.restImpulse = positionError.mul(-this.stiffness*constants.INV_DT).add(velocityError.mul(-this.damping));
    }
    isValid() {
        return this.linearStateA instanceof PointMass && 
            this.linearStateB instanceof PointMass && 
            this.linearStateA != this.linearStateB;
    }
};

export { FixedSpring };