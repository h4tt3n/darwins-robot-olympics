"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearLink } from '../base/linearLink.js'

class DeformableSpring extends LinearLink{
    constructor(linearStateA, linearStateB, stiffness, damping, warmStart, restLength) {
        super(linearStateA, linearStateB);
        this.stiffness = stiffness || 1.0;
        this.damping = damping || 1.0;
        this.warmStart = warmStart || 0.5;
        this.deformationThreshold = 10.0; // Units / pixels
        this.deformationFactor = 0.2; // coefficient [0, 1]
        this.minLength = (this.pointB.position.sub(this.pointA.position)).length();
        this.maxLength = (this.pointA.radius + this.pointB.radius) * 1.0;
        this.correctionFactor = 0.5;
        this.restLength = restLength || (this.pointB.position.sub(this.pointA.position)).length();
        this.restImpulse = 0.0;
        this.accumulatedImpulse = new Vector2();
        this.isActive = true;

        //this.computeData();
        super.computeReducedMass();
    }
    applyCorrectiveImpulse(){
        const deltaImpulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        const deltaImpulseY = this.pointB.impulse.y - this.pointA.impulse.y;
        const projectedImpulse = this.angleVector.x * deltaImpulseX + this.angleVector.y * deltaImpulseY;
        const impulseError = projectedImpulse - this.restImpulse;
        const correctiveImpulseX = -this.angleVector.x * impulseError * this.reducedMass * this.correctionFactor;
        const correctiveImpulseY = -this.angleVector.y * impulseError * this.reducedMass * this.correctionFactor;
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

        // const deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        // const projectedImpulse = this.angleVector.dot(deltaImpulse);
        // const impulseError = projectedImpulse - this.restImpulse;
        // const correctiveImpulse = this.angleVector.mul(-impulseError * this.reducedMass * this.correctionFactor);
        // this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        // this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        // this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    computeRestImpulse(){

        const deltaPositionX = this.pointB.position.x - this.pointA.position.x;
        const deltaPositionY = this.pointB.position.y - this.pointA.position.y;
        const deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        const deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;

        const positionError = this.angleVector.x * deltaPositionX + this.angleVector.y * deltaPositionY - this.restLength;
        const velocityError = this.angleVector.x * deltaVelocityX + this.angleVector.y * deltaVelocityY;

        if( Math.abs(positionError) > this.deformationThreshold ) {
            //console.log("deformation!");

            const distanceCorrection = positionError * this.deformationFactor;
            
            this.restLength += distanceCorrection;

            if(this.restLength > this.maxLength) {  
                this.restLength = this.maxLength;
            }
            if(this.restLength < this.minLength) {
                this.restLength = this.minLength;
            }
        }

        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);

        // const deltaPosition = this.pointB.position.sub(this.pointA.position);
        // const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        // const positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        // const velocityError = this.angleVector.dot(deltaVelocity);
        // this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
        
        
        
        // const deltaPosition = this.pointB.position.sub(this.pointA.position);
        // const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);

        // const positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        // const velocityError = this.angleVector.dot(deltaVelocity);

        // if( Math.abs(positionError) > this.deformationThreshold ) {
		// 	const distanceCorrection = positionError * this.deformationFactor;
            
        //     this.restLength += distanceCorrection;

        //     if(this.restLength > this.maxLength) {  
        //         this.restLength = this.maxLength;
        //     }
        //     if(this.restLength < this.minLength) {
        //         this.restLength = this.minLength;
        //     }
		// }

        // this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeData(){
        super.computeLengthVector();
		super.computeAngleVector();
		super.computeLength();

        //this.restLength = this.length;

        this.isActive = this.length > this.maxLength ? false : true;
	}
    // setRestLength(restLength){
    //     this.restLength = restLength;
    // }
};

export { DeformableSpring };