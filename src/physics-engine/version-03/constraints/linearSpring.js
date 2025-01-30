"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearLink } from '../base/linearLink.js'

class LinearSpring extends LinearLink{
    constructor(linearStateA, linearStateB, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.correctionFactor = 0.5;
        this.restLength = (this.pointB.position.sub(this.pointA.position)).length();
        this.restImpulse = 0.0;
        this.accumulatedImpulse = new Vector2();

        super.computeReducedMass();
    }
    applyCorrectiveImpulse(){

        const deltaImpulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        const deltaImpulseY = this.pointB.impulse.y - this.pointA.impulse.y;

        const projectedImpulse = this.angleVector.x * deltaImpulseX + this.angleVector.y * deltaImpulseY;
        const impulseError = (projectedImpulse - this.restImpulse) * this.reducedMass * this.correctionFactor;

        const correctiveImpulseX = -this.angleVector.x * impulseError;
        const correctiveImpulseY = -this.angleVector.y * impulseError;

        this.pointA.impulse.x -= correctiveImpulseX * this.pointA.inverseMass;
        this.pointA.impulse.y -= correctiveImpulseY * this.pointA.inverseMass;
        this.pointB.impulse.x += correctiveImpulseX * this.pointB.inverseMass;
        this.pointB.impulse.y += correctiveImpulseY * this.pointB.inverseMass;

        this.accumulatedImpulse.x += correctiveImpulseX;
        this.accumulatedImpulse.y += correctiveImpulseY;

        // if( this.restImpulse == 0.0 ) { return };
        // const deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        // const projectedImpulse = this.angleVector.dot(deltaImpulse);
        // const impulseError = projectedImpulse - this.restImpulse;
        // const correctiveImpulse = this.angleVector.mul(-impulseError * this.reducedMass * this.correctionFactor);
        // this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        // this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        // this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart(){
        const projectedImpulse = this.angleVector.x * this.accumulatedImpulse.x + this.angleVector.y * this.accumulatedImpulse.y;
        if( projectedImpulse > 0.0 ) { return };

        const warmstartImpulseX = this.angleVector.x * projectedImpulse * this.warmStart;
        const warmstartImpulseY = this.angleVector.y * projectedImpulse * this.warmStart;
        this.pointA.impulse.x -= warmstartImpulseX * this.pointA.inverseMass;
        this.pointA.impulse.y -= warmstartImpulseY * this.pointA.inverseMass;
        this.pointB.impulse.x += warmstartImpulseX * this.pointB.inverseMass;
        this.pointB.impulse.y += warmstartImpulseY * this.pointB.inverseMass;
        this.accumulatedImpulse.x = 0.0;
        this.accumulatedImpulse.y = 0.0;

        // const projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        // if( projectedImpulse > 0.0 ) { return };
        // const warmstartImpulse = this.angleVector.mul(projectedImpulse * this.warmStart);
        // this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        // this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        // this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeRestImpulse(){
        const deltaPositionX = this.pointB.position.x - this.pointA.position.x;
        const deltaPositionY = this.pointB.position.y - this.pointA.position.y;
        const deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        const deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;
        const positionError = this.angleVector.x * deltaPositionX + this.angleVector.y * deltaPositionY - this.restLength;
        const velocityError = this.angleVector.x * deltaVelocityX + this.angleVector.y * deltaVelocityY;
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    //     const deltaPosition = this.pointB.position.sub(this.pointA.position);
    //     const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
    //     const positionError = this.angleVector.dot(deltaPosition) - this.restLength;
    //     const velocityError = this.angleVector.dot(deltaVelocity);
    //     this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    // }
    computeData(){
        super.computeData();
        
        // super.computeLengthVector();
		// super.computeAngleVector();
		// super.computeLength();
    }
    // setRestLength(restLength){
    //     this.restLength = restLength;
    // }
};

export { LinearSpring };