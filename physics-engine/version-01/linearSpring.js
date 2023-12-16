"use strict";

import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { LinearLink } from './linearLink.js'

class LinearSpring extends LinearLink{
    constructor(linearStateA, linearStateB, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        //this.restLength = (this.linearStateB.position.sub(this.linearStateA.position)).length();
        this.restLength = (this.pointB.position.sub(this.pointA.position)).length();
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.computeData();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == 0.0 ) { return };
        // var deltaImpulse = this.linearStateB.impulse.sub(this.linearStateA.impulse);
        var deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        var projectedImpulse = this.angleVector.dot(deltaImpulse);
        var impulseError = projectedImpulse - this.restImpulse;
        var correctiveImpulse = this.angleVector.mul(-impulseError*this.reducedMass);
        // this.linearStateA.impulse = this.linearStateA.impulse.sub(correctiveImpulse.mul(this.linearStateA.inverseMass));
        // this.linearStateB.impulse = this.linearStateB.impulse.add(correctiveImpulse.mul(this.linearStateB.inverseMass));
        // this.linearStateA.addImpulse(correctiveImpulse.mul(-this.linearStateA.inverseMass));
        // this.linearStateB.addImpulse(correctiveImpulse.mul( this.linearStateB.inverseMass));
        this.pointA.addImpulse(correctiveImpulse.mul(-this.pointA.inverseMass));
        this.pointB.addImpulse(correctiveImpulse.mul( this.pointB.inverseMass));
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart(){
        var projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        if( projectedImpulse > 0.0 ) { return };
        var warmstartImpulse = this.angleVector.mul(projectedImpulse*this.warmStart);
        // this.linearStateA.impulse = this.linearStateA.impulse.sub(warmstartImpulse.mul(this.linearStateA.inverseMass));
        // this.linearStateB.impulse = this.linearStateB.impulse.add(warmstartImpulse.mul(this.linearStateB.inverseMass));
        this.pointA.impulse = this.pointA.impulse.sub(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse = this.pointB.impulse.add(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse = new Vector2();
    }
    computeRestImpulse(){
        //var deltaPosition = this.linearStateB.position.sub(this.linearStateA.position);
        var deltaPosition = this.pointB.position.sub(this.pointA.position);
        //var deltaVelocity = this.linearStateB.velocity.sub(this.linearStateA.velocity);
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
        // return this.linearStateA instanceof LinearState && 
        //     this.linearStateB instanceof LinearState && 
        //     this.linearStateA != this.linearStateB;
        return this.pointA instanceof LinearState && 
            this.pointB instanceof LinearState && 
            this.pointA != this.pointB;
    }
};

export { LinearSpring };