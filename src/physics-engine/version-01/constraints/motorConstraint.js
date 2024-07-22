"use strict";

import { constants } from './../constants.js';

class MotorConstraint {
    constructor(params = {}) {
        this.angularStateA = params.angularStateA;
        this.angularStateB = params.angularStateB;
        this.restVelocity = params.restVelocity || 0.0;
        this.stiffness = params.stiffness || 0.5;
        this.damping = params.damping || 0.5;
        this.warmStart = params.warmStart || 0.5;       

        this.reducedInertia = 0.0;
        this.restImpulse = 0.0;
        this.accumulatedImpulse = 0.0;

        this.computeReducedInertia();
    }
    applyCorrectiveImpulse() {
        if (this.restImpulse == 0.0) { return; }
        // State
        const impulseA = this.angularStateA.angularImpulse
        const impulseB = this.angularStateB.angularImpulse;
        // Error
        const impulseError = (impulseB - impulseA) - this.restImpulse;
        // Correction
        const correctiveImpulse = -impulseError * this.reducedInertia;
        // Apply
        this.angularStateA.addAngularImpulse(-correctiveImpulse * this.angularStateA.inverseInertia);
        this.angularStateB.addAngularImpulse( correctiveImpulse * this.angularStateB.inverseInertia);
        // Warmstart
        this.accumulatedImpulse += correctiveImpulse;
    }
    applyWarmStart() {
        if (this.accumulatedImpulse == 0.0) { return; }
        // State
        const warmstartImpulse = this.accumulatedImpulse * this.warmStart;
        // Apply
        this.angularStateA.addAngularImpulse(-warmstartImpulse * this.angularStateA.inverseInertia);
        this.angularStateB.addAngularImpulse( warmstartImpulse * this.angularStateB.inverseInertia);
        // Reset
        this.accumulatedImpulse = 0.0;
    }
    computeData() {
        this.computeRestImpulse();
    }
    computeReducedInertia() {
        const inverseInertia = this.angularStateA.inverseInertia + this.angularStateB.inverseInertia;
        this.reducedInertia = inverseInertia > 0.0 ? 1.0 / inverseInertia : 0.0;
    }
    computeRestImpulse() {
        // State
        const velocityA = this.angularStateA.angularVelocity;
        const velocityB = this.angularStateB.angularVelocity;
        // Error
        const velocityError = (velocityB - velocityA) - this.restVelocity;
        // Correction
        this.restImpulse = -(this.damping * velocityError);
    }
    setRestVelocity(restVelocity) {
        this.restVelocity = restVelocity;
        this.computeData();
    }
}

export { MotorConstraint };