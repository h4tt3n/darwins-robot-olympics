import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearLink } from '../base/linearLink.js'

class LinearMotorConstraint extends LinearLink {
    constructor(linearStateA, linearStateB, restVelocity, stiffness, damping, warmStart ) {
        super(linearStateA, linearStateB);
        this.restVelocity = restVelocity;
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.correctionFactor = 0.25;
        this.restImpulse = 0.0;
        this.accumulatedImpulse = new Vector2();

        super.computeReducedMass();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == 0.0 ) { return };
        const deltaImpulse = this.pointB.impulse.sub(this.pointA.impulse);
        const projectedImpulse = this.angleVector.dot(deltaImpulse);
        const impulseError = projectedImpulse - this.restImpulse;
        const correctiveImpulse = this.angleVector.mul(-impulseError * this.reducedMass * this.correctionFactor);
        this.pointA.impulse.subThis(correctiveImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(correctiveImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.addThis(correctiveImpulse);
    }
    applyWarmStart(){
        const projectedImpulse = this.angleVector.dot(this.accumulatedImpulse);
        if( projectedImpulse > 0.0 ) { return };
        const warmstartImpulse = this.angleVector.mul(projectedImpulse * this.warmStart);
        this.pointA.impulse.subThis(warmstartImpulse.mul(this.pointA.inverseMass));
        this.pointB.impulse.addThis(warmstartImpulse.mul(this.pointB.inverseMass));
        this.accumulatedImpulse.setThis(0.0, 0.0);
    }
    computeData(){
        super.computeLengthVector();
		super.computeAngleVector();
		super.computeLength();
    }
    computeRestImpulse(){
        const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        const velocityError = this.angleVector.dot(deltaVelocity) - this.restVelocity;
        this.restImpulse = -this.damping * velocityError;
    }
}

export { LinearMotorConstraint };