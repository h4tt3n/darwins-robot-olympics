"use strict";

import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-02/vector2.js';
import { LinearLink } from './linearLink.js'

class LinearSpring extends LinearLink{
    constructor(linearStateA, linearStateB, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.restLength = (this.pointB.position.sub(this.pointA.position)).length();
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.computeData();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == 0.0 ) { return };
        var deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        var projectedImpulse = this.angleVector.dot(deltaImpulse);
        var impulseError = projectedImpulse - this.restImpulse;
        var correctiveImpulse = this.angleVector.mul(-impulseError*this.reducedMass);
        this.pointA.addImpulse(correctiveImpulse.mul(-this.pointA.inverseMass));
        this.pointB.addImpulse(correctiveImpulse.mul( this.pointB.inverseMass));
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart(){
        var projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        if( projectedImpulse > 0.0 ) { return };
        var warmstartImpulse = this.angleVector.mul(projectedImpulse*this.warmStart);
        this.pointA.impulse = this.pointA.impulse.sub(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse = this.pointB.impulse.add(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse = Vector2.zero;
    }
    computeRestImpulse(){
        var deltaPosition = this.pointB.position.sub(this.pointA.position);
        var deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        var positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        var velocityError = this.angleVector.dot(deltaVelocity);
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeData(){
        super.computeData();
    }
    setRestLength(restLength){
        this.restLength = restLength;
    }
    isValid() {
        return this.pointA instanceof LinearState && 
               this.pointB instanceof LinearState && 
               this.pointA != this.pointB;
    }
};

export { LinearSpring };