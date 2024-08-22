"use strict";

import { constants } from '../constants.js';

// This constraint applies drag along velocity vector and lift along perpendicular vector
// Can be used for simulating flight and swimming

class AerodynamicConstraint {
    constructor(params = {}) {
        this.linearLink = params.linearLink;
        this.airDensity = 1.225;
    }
    applyCorrectiveImpulse() {
    }
    applyWarmStart() {
    }
    computeData() {
    }
    computeRestImpulse() {
        let velocityX = (this.linearLink.LinearStateA.velocity.x * this.linearLink.LinearStateA.mass + 
                        this.linearLink.LinearStateB.velocity.x  * this.linearLink.LinearStateB.mass ) / 
                        (this.linearLink.LinearStateA.mass + this.linearLink.LinearStateB.mass);

        let velocityY = (this.linearLink.LinearStateA.velocity.y * this.linearLink.LinearStateA.mass +
                        this.linearLink.LinearStateB.velocity.y * this.linearLink.LinearStateB.mass) /
                        (this.linearLink.LinearStateA.mass + this.linearLink.LinearStateB.mass);
        
        let velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);


    }
    calculateLiftCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const cMax = 1.0;
        let normalizedLiftCoefficient = 0;
        angleOfAttack = angleOfAttack % (Math.PI);
        
        if ((0 < angleOfAttack && angleOfAttack < Math.PI / 8) || ((7 * Math.PI) / 8 < angleOfAttack && angleOfAttack < Math.PI)) {
            normalizedLiftCoefficient = Math.sin(6 * angleOfAttack);
        } else if (Math.PI / 8 < angleOfAttack && angleOfAttack < (7 * Math.PI) / 8) {
            normalizedLiftCoefficient = Math.sin(2 * angleOfAttack);
        }
    
        // Lerp
        return normalizedLiftCoefficient * cMax;
    }
    
    calculateDragCoefficient(angleOfAttack) {
        // Approximation for thin airfoil / flat plate
        const cMin = 0.01, cMax = 2.0;
        return cMin + Math.sin(angleOfAttack) ** 2 * (cMax - cMin);
    }
    
    calculateLift(angle, velocity) {
        const liftCoefficient = calculateLiftCoefficient(angle);
        const area = plateLength * plateWidth;
        return 0.5 * airDensity * velocity ** 2 * area * liftCoefficient;
    }
    
    calculateDrag(angle, velocity) {
        const dragCoefficient = calculateDragCoefficient(angle);
        const area = plateLength * plateWidth;
        return 0.5 * airDensity * velocity ** 2 * area * dragCoefficient;
    }
}

export { AerodynamicConstraint };