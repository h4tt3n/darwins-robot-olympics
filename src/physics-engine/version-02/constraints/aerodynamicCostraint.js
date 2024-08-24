"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';

// This constraint applies drag along velocity vector and lift along perpendicular vector
// Can be used for simulating flight and swimming

// TODO:
// - Refactor drag so that max drag impulse exactly cancels out velocity along the velocity vector
// - Make rest impulse a vector that combines drag and lift.
// - Refactor constraint to work on linear spring as a whole, not individual points
// - Optimize for speed, if possible

class AerodynamicConstraint {
    constructor(params = {}) {
        this.linearLink = params.linearLink;
        this.fluidDensity = 1.225;
        this.dragRestImpulse = 0.0;
        this.liftRestImpulse = 0.0;
        this.velocityDirectionVector = new Vector2();
        this.accumulatedImpulse = new Vector2();
    }
    applyCorrectiveImpulse() {

        let projectedImpulseA = this.velocityDirectionVector.dot(this.linearLink.pointA.impulse);
        let projectedPerpImpulseA = this.velocityDirectionVector.perpDot(this.linearLink.pointA.impulse);
        let dragImpulseErrorA = projectedImpulseA - this.dragRestImpulse;
        let liftImpulseErrorA = projectedPerpImpulseA - this.liftRestImpulse;
        let correctiveImpulseA = this.velocityDirectionVector.mul(dragImpulseErrorA * 0.000001)
        correctiveImpulseA.addThis(this.velocityDirectionVector.perp().mul(liftImpulseErrorA * 0.000001));
        this.linearLink.pointA.impulse.subThis(correctiveImpulseA);

        let projectedImpulseB = this.velocityDirectionVector.dot(this.linearLink.pointB.impulse);
        let projectedPerpImpulseB = this.velocityDirectionVector.perpDot(this.linearLink.pointB.impulse);
        let dragImpulseErrorB = projectedImpulseB - this.dragRestImpulse;
        let liftImpulseErrorB = projectedPerpImpulseB - this.liftRestImpulse;
        let correctiveImpulseB = this.velocityDirectionVector.mul(dragImpulseErrorB * 0.000001);
        correctiveImpulseB.addThis(this.velocityDirectionVector.perp().mul(liftImpulseErrorB * 0.000001));
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
        
        let velocitySquared = velocityX * velocityX + velocityY * velocityY;

        this.velocityDirectionVector = new Vector2(velocityX, velocityY).unit();

        let angleOfAttack = Math.atan2(
            this.velocityDirectionVector.perpDot(this.linearLink.angleVector), 
            this.velocityDirectionVector.dot(this.linearLink.angleVector)
        ) + Math.PI;

        let drag = this.calculateDrag(angleOfAttack, velocitySquared);
        let lift = this.calculateLift(angleOfAttack, velocitySquared);

        this.dragRestImpulse = -drag;
        this.liftRestImpulse = lift;
    }
    calculateLiftCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const c = 0.6;
        let normalizedLiftCoefficient = 0;
        angleOfAttack = angleOfAttack % (Math.PI);
        
        if ((0 < angleOfAttack && angleOfAttack < Math.PI / 8) || ((7 * Math.PI) / 8 < angleOfAttack && angleOfAttack < Math.PI)) {
            normalizedLiftCoefficient = Math.sin(6 * angleOfAttack);
        } else if (Math.PI / 8 < angleOfAttack && angleOfAttack < (7 * Math.PI) / 8) {
            normalizedLiftCoefficient = Math.sin(2 * angleOfAttack);
        }
    
        return normalizedLiftCoefficient * c;
    }
    
    calculateDragCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const cMin = 0.01, cMax = 0.6;
        return cMin + Math.sin(angleOfAttack) ** 2 * (cMax - cMin);
    }
    
    calculateLift(angle, velocitySquared) {
        const liftCoefficient = this.calculateLiftCoefficient(angle);
        const area = this.linearLink.length;
        return 0.5 * this.fluidDensity * velocitySquared * area * liftCoefficient;
    }
    
    calculateDrag(angle, velocitySquared) {
        const dragCoefficient = this.calculateDragCoefficient(angle);
        const area = this.linearLink.length;
        return 0.5 * this.fluidDensity * velocitySquared * area * dragCoefficient;
    }
}

export { AerodynamicConstraint };