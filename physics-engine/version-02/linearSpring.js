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
        let deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        let projectedImpulse = this.angleVector.dot(deltaImpulse);
        let impulseError = projectedImpulse - this.restImpulse;
        let correctiveImpulse = this.angleVector.mul(-impulseError * this.reducedMass);
        this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart(){
        let projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        if( projectedImpulse > 0.0 ) { return };
        let warmstartImpulse = this.angleVector.mul(projectedImpulse * this.warmStart);
        this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeRestImpulse(){
        let deltaPosition = this.pointB.position.sub(this.pointA.position);
        let deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        let positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        let velocityError = this.angleVector.dot(deltaVelocity);
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