"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';

// This constraint applies drag along velocity vector and lift along perpendicular vector
// Can be used for simulating flight and swimming

// TODO:
// - Refactor drag so that max drag impulse exactly cancels out velocity along the velocity vector
// - Make rest impulse a vector that combines drag and lift.

class AerodynamicConstraint {
    constructor(params = {}) {
        this.linearLink = params.linearLink;
        this.airDensity = 1.225;
        this.restImpulse = 0.0;
        this.velocityDirectionVector = new Vector2();
        this.accumulatedImpulse = new Vector2();
    }
    applyCorrectiveImpulse() {
        if( this.restImpulse == 0.0 ) { return };

        let projectedImpulseA = this.velocityDirectionVector.dot(this.linearLink.pointA.impulse);
        let impulseErrorA = projectedImpulseA - this.restImpulse;
        let correctiveImpulseA = this.velocityDirectionVector.mul(impulseErrorA * 0.00001);
        this.linearLink.pointA.impulse.subThis(correctiveImpulseA);

        let projectedImpulseB = this.velocityDirectionVector.dot(this.linearLink.pointB.impulse);
        let impulseErrorB = projectedImpulseB - this.restImpulse;
        let correctiveImpulseB = this.velocityDirectionVector.mul(impulseErrorB * 0.00001);
        this.linearLink.pointB.impulse.subThis(correctiveImpulseB);
    }
    applyWarmStart() {
    }
    computeData() {
    }
    computeRestImpulse() {
        let velocityX = (this.linearLink.pointA.velocity.x * this.linearLink.pointA.mass + 
                        this.linearLink.pointB.velocity.x  * this.linearLink.pointB.mass ) / 
                        (this.linearLink.pointA.mass + this.linearLink.pointB.mass);

        let velocityY = (this.linearLink.pointA.velocity.y * this.linearLink.pointA.mass +
                        this.linearLink.pointB.velocity.y * this.linearLink.pointB.mass) /
                        (this.linearLink.pointA.mass + this.linearLink.pointB.mass);

        //console.log(velocityX, velocityY);
        
        let velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        this.velocityDirectionVector = new Vector2(velocityX, velocityY).unit();

        let wingDirectionVector = this.linearLink.angleVector;

        let angleOfAttack = Math.atan2(
            this.velocityDirectionVector.perpDot(wingDirectionVector), 
            this.velocityDirectionVector.dot(wingDirectionVector)
        );

        //console.log(angleOfAttack);

        // Calculate drag
        let drag = this.calculateDrag(angleOfAttack, velocity);

        //console.log(drag);

        // Calculate lift
        let lift = this.calculateLift(angleOfAttack, velocity);

        this.restImpulse = -(drag);

    }
    calculateLiftCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const c = 1.0;
        let normalizedLiftCoefficient = 0;
        angleOfAttack = angleOfAttack % (Math.PI);
        
        if ((0 < angleOfAttack && angleOfAttack < Math.PI / 8) || ((7 * Math.PI) / 8 < angleOfAttack && angleOfAttack < Math.PI)) {
            normalizedLiftCoefficient = Math.sin(6 * angleOfAttack);
        } else if (Math.PI / 8 < angleOfAttack && angleOfAttack < (7 * Math.PI) / 8) {
            normalizedLiftCoefficient = Math.sin(2 * angleOfAttack);
        }
    
        // Lerp
        return normalizedLiftCoefficient * c;
    }
    
    calculateDragCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const cMin = 0.0, cMax = 1.0;
        return cMin + Math.sin(angleOfAttack) ** 2 * (cMax - cMin);
    }
    
    calculateLift(angle, velocity) {
        const liftCoefficient = this.calculateLiftCoefficient(angle);
        const area = this.linearLink.length;
        return 0.5 * this.airDensity * velocity ** 2 * area * liftCoefficient;
    }
    
    calculateDrag(angle, velocity) {
        const dragCoefficient = this.calculateDragCoefficient(angle);
        const area = this.linearLink.length;
        return 0.5 * this.airDensity * velocity ** 2 * area * dragCoefficient;
    }
}

export { AerodynamicConstraint };