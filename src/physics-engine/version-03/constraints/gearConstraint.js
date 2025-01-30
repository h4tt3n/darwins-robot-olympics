"use strict";

import { constants } from '../constants.js';

class GearConstraint {
    constructor(params = {}) {
        this.angularStateA = params.angularStateA;
        this.angularStateB = params.angularStateB;
        this.gearRatio = params.gearRatio || null;
        this.radiusA = params.radiusA || null;
        this.radiusB = params.radiusB || null;

        this.stiffness = -1.0;
        this.damping = 1.0;
        this.warmStart = 0.5;
        this.correctionFactor = 0.1;    
        this.reducedInertia = 0.0;
        this.restImpulse = 0.0;
        this.accumulatedImpulse = 0.0;
        this.restDeltaAngle = 0.0;

        if (this.gearRatio) {
            this.setGearRatio(this.gearRatio);
        } else if (this.radiusA && this.radiusB) {
            this.setRadii(this.radiusA, this.radiusB);
        } else {    
            this.setGearRatio(1.0);
        }
    }
    applyCorrectiveImpulse() {
        if (this.restImpulse == 0.0) { return; }
        // State
        const impulseA = this.angularStateA.angularImpulse * this.gearRatio;
        const impulseB = this.angularStateB.angularImpulse;
        // Error
        const impulseError = (impulseB - impulseA) - this.restImpulse;
        // Correction
        const correctiveImpulse = -impulseError * this.reducedInertia * this.correctionFactor;
        // Apply
        this.angularStateA.addAngularImpulse(-correctiveImpulse * this.angularStateA.inverseInertia * this.gearRatio);
        this.angularStateB.addAngularImpulse( correctiveImpulse * this.angularStateB.inverseInertia);
        // Warmstart
        this.accumulatedImpulse += correctiveImpulse;
    }
    applyWarmStart() {
        if (this.accumulatedImpulse == 0.0) { return; }
        // State
        const warmstartImpulse = this.accumulatedImpulse * this.warmStart;
        // Apply
        this.angularStateA.addAngularImpulse(-warmstartImpulse * this.angularStateA.inverseInertia * this.gearRatio);
        this.angularStateB.addAngularImpulse( warmstartImpulse * this.angularStateB.inverseInertia);
        // Reset
        this.accumulatedImpulse = 0.0;
    }
    computeData() {
        //this.computeRestImpulse();
    }
    computeReducedInertia() {
        const inverseInertia = this.angularStateA.inverseInertia * this.gearRatio * this.gearRatio + this.angularStateB.inverseInertia;
        this.reducedInertia = inverseInertia > 0.0 ? 1.0 / inverseInertia : 0.0;
    }
    computeRestDeltaAngle() {
        this.restDeltaAngle = this.angularStateB.angle - this.angularStateA.angle * this.gearRatio;
    }
    computeRestImpulse() {
        // State
        const distanceA = this.angularStateA.angle * this.gearRatio;
        const distanceB = this.angularStateB.angle;
        const velocityA = this.angularStateA.angularVelocity * this.gearRatio;
        const velocityB = this.angularStateB.angularVelocity;
        // Error
        const distanceError = distanceB - distanceA - this.restDeltaAngle;
        const velocityError = velocityB - velocityA;
        // Correction
        this.restImpulse = -(this.stiffness * distanceError * constants.INV_DT + this.damping * velocityError);
    }
    reset() {
    }
    setGearRatio(gearRatio) {
        this.gearRatio = gearRatio != 0.0 ? gearRatio : 1.0;
        this.computeReducedInertia();
        this.computeRestDeltaAngle();
    }
    setRadii(radiusA, radiusB) {
        // TODO: Add setter for direction of rotation
        this.gearRatio = radiusA != 0.0 && radiusB != 0.0 ? radiusA / radiusB : 1.0;
        this.computeReducedInertia();
        this.computeRestDeltaAngle();
    }
}

export { GearConstraint };