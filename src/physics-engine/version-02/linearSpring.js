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

        Object.seal(this);

        this.computeData();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == 0.0 ) { return };

        // let deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        let deltaImpulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        let deltaImpulseY = this.pointB.impulse.y - this.pointA.impulse.y;

        //let projectedImpulse = this.angleVector.dot(deltaImpulse);
        let projectedImpulse = this.angleVector.x * deltaImpulseX + this.angleVector.y * deltaImpulseY;

        let impulseError = projectedImpulse - this.restImpulse;
        
        //let correctiveImpulse = this.angleVector.mul(-impulseError * this.reducedMass);
        let correctiveImpulseX = -impulseError * this.reducedMass * this.angleVector.x;
        let correctiveImpulseY = -impulseError * this.reducedMass * this.angleVector.y;

        // this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        // this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        this.pointA.impulse.x -= correctiveImpulseX * this.pointA.inverseMass;
        this.pointA.impulse.y -= correctiveImpulseY * this.pointA.inverseMass;
        this.pointB.impulse.x += correctiveImpulseX * this.pointB.inverseMass;
        this.pointB.impulse.y += correctiveImpulseY * this.pointB.inverseMass;
        
        // this.accumulatedImpulse.addThis(correctiveImpulse);
        this.accumulatedImpulse.x += correctiveImpulseX;
        this.accumulatedImpulse.y += correctiveImpulseY;
    }
    applyWarmStart(){
        // let projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        let projectedImpulse = this.angleVector.x * this.accumulatedImpulse.x + this.angleVector.y * this.accumulatedImpulse.y;
        if( projectedImpulse > 0.0 ) { return };
        // let warmstartImpulse = this.angleVector.mul(projectedImpulse * this.warmStart);
        let warmstartImpulseX = projectedImpulse * this.angleVector.x * this.warmStart;
        let warmstartImpulseY = projectedImpulse * this.angleVector.y * this.warmStart;

        // this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        // this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        this.pointA.impulse.x -= warmstartImpulseX * this.pointA.inverseMass;
        this.pointA.impulse.y -= warmstartImpulseY * this.pointA.inverseMass;
        this.pointB.impulse.x += warmstartImpulseX * this.pointB.inverseMass;
        this.pointB.impulse.y += warmstartImpulseY * this.pointB.inverseMass;

        // this.accumulatedImpulse.setThis(0.0, 0.0);
        this.accumulatedImpulse.x = 0.0;
        this.accumulatedImpulse.y = 0.0;
    }
    computeRestImpulse(){
        // let deltaPosition = this.pointB.position.sub(this.pointA.position);
        let deltaPositionX = this.pointB.position.x - this.pointA.position.x;
        let deltaPositionY = this.pointB.position.y - this.pointA.position.y;

        // let deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        let deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        let deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;

        //let positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        let positionError = this.angleVector.x * deltaPositionX + this.angleVector.y * deltaPositionY - this.restLength;
        //let velocityError = this.angleVector.dot(deltaVelocity);
        let velocityError = this.angleVector.x * deltaVelocityX + this.angleVector.y * deltaVelocityY;
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeData(){
        super.computeData();
    }
    setRestLength(restLength){
        this.restLength = restLength;
    }
};

export { LinearSpring };