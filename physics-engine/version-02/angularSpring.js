"use strict";

import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-02/vector2.js';
import { LinearSpring } from './linearSpring.js'

class AngularSpring {
    constructor(linearLinkA, linearLinkB, stiffness, damping, warmStart){
        this.angleVector = new Vector2();
        this.restAngleVector = new Vector2();
        this.accumulatedImpulse = new Number();
        this.reducedInertia = new Number();
        this.restImpulse = new Number();
        this.stiffness = new Number(stiffness);
        this.damping = new Number(damping);
        this.warmStart = new Number(warmStart);
        this.distanceA = new Vector2();
        this.distanceB = new Vector2();
        this.linearLinkA = linearLinkA;
        this.linearLinkB = linearLinkB;
        this.objectId = null;

        this.computeData();

        this.restAngleVector = this.angleVector;
    }
    applyCorrectiveImpulse(){
        // impulse vector
        // let impulseA = this.linearLinkA.linearStateB.impulse.sub(this.linearLinkA.linearStateA.impulse);
        // let impulseB = this.linearLinkB.linearStateB.impulse.sub(this.linearLinkB.linearStateA.impulse);
        let impulseA = this.linearLinkA.pointB.impulse.sub(this.linearLinkA.pointA.impulse);
        let impulseB = this.linearLinkB.pointB.impulse.sub(this.linearLinkB.pointA.impulse);

        // current linear perpendicular impulse scalar
        let localImpulseA = this.distanceA.perpDot(impulseA) * this.linearLinkA.reducedMass;
        let localImpulseB = this.distanceB.perpDot(impulseB) * this.linearLinkB.reducedMass;

        // convert to angular impulse scalar
        let angularImpulseA = localImpulseA * this.linearLinkA.inverseInertia;
        let angularImpulseB = localImpulseB * this.linearLinkB.inverseInertia;

        // corrective angular impulse scalar
        let deltaImpulse = angularImpulseB - angularImpulseA;
        let impulseError = deltaImpulse - this.restImpulse;
        let correctiveImpulse = -impulseError * this.reducedInertia;

        // scalar
        let correctiveAngularImpulseA = correctiveImpulse * this.linearLinkA.inverseInertia;
        let correctiveAngularImpulseB = correctiveImpulse * this.linearLinkB.inverseInertia;

        // convert to linear impulse perpendicular vector
        let correctiveImpulseA = this.distanceA.perpDot(correctiveAngularImpulseA * this.linearLinkA.reducedMass);
        let correctiveImpulseB = this.distanceB.perpDot(correctiveAngularImpulseB * this.linearLinkB.reducedMass);

        //  
        // this.linearLinkA.linearStateA.impulse = this.linearLinkA.linearStateA.impulse.add(correctiveImpulseA.mul(this.linearLinkA.linearStateA.inverseMass));
        // this.linearLinkA.linearStateB.impulse = this.linearLinkA.linearStateB.impulse.sub(correctiveImpulseA.mul(this.linearLinkA.linearStateB.inverseMass));
        this.linearLinkA.pointA.impulse.addThis(correctiveImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        this.linearLinkA.pointB.impulse.subThis(correctiveImpulseA.mul(this.linearLinkA.pointB.inverseMass));

        // this.linearLinkB.linearStateA.impulse = this.linearLinkB.linearStateA.impulse.sub(correctiveImpulseB.mul(this.linearLinkB.linearStateA.inverseMass));
        // this.linearLinkB.linearStateB.impulse = this.linearLinkB.linearStateB.impulse.add(correctiveImpulseB.mul(this.linearLinkB.linearStateB.inverseMass));
        this.linearLinkB.pointA.impulse.subThis(correctiveImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        this.linearLinkB.pointB.impulse.addThis(correctiveImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.accumulatedImpulse += correctiveImpulse;
    }
    applyWarmStart(){
        if(this.accumulatedImpulse === 0){return};

        let warmstartImpulse = this.warmStart * this.accumulatedImpulse;

        let warmstartAngularImpulseA = warmstartImpulse * this.linearLinkA.inverseInertia;
        let warmstartAngularImpulseB = warmstartImpulse * this.linearLinkB.inverseInertia;

        let warmstartImpulseA = this.distanceA.perpDot(warmstartAngularImpulseA * this.linearLinkA.reducedMass);
        let warmstartImpulseB = this.distanceB.perpDot(warmstartAngularImpulseB * this.linearLinkB.reducedMass);

        // this.linearLinkA.linearStateA.impulse = this.linearLinkA.linearStateA.impulse.add(warmstartImpulseA.mul(this.linearLinkA.linearStateA.inverseMass));
        // this.linearLinkA.linearStateB.impulse = this.linearLinkA.linearStateB.impulse.sub(warmstartImpulseA.mul(this.linearLinkA.linearStateB.inverseMass));
        this.linearLinkA.pointA.impulse.addThis(warmstartImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        this.linearLinkA.pointB.impulse.subThis(warmstartImpulseA.mul(this.linearLinkA.pointB.inverseMass));

        // this.linearLinkB.linearStateA.impulse = this.linearLinkB.linearStateA.impulse.sub(warmstartImpulseB.mul(this.linearLinkB.linearStateA.inverseMass));
        // this.linearLinkB.linearStateB.impulse = this.linearLinkB.linearStateB.impulse.add(warmstartImpulseB.mul(this.linearLinkB.linearStateB.inverseMass));
        this.linearLinkB.pointA.impulse.subThis(warmstartImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        this.linearLinkB.pointB.impulse.addThis(warmstartImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.accumulatedImpulse = 0.0;
    }
    computeAngle(){
        this.angleVector = new Vector2(
            this.linearLinkA.angleVector.dot(this.linearLinkB.angleVector),
            this.linearLinkA.angleVector.perpDot(this.linearLinkB.angleVector)
        );
    }
    computeData(){

        this.distanceA = this.linearLinkA.pointB.position.sub(this.linearLinkA.pointA.position);
        this.distanceB = this.linearLinkB.pointB.position.sub(this.linearLinkB.pointA.position);

        this.computeAngle();
        this.computeReducedInertia();
    }
    computeReducedInertia(){
        let k = this.linearLinkA.inverseInertia + this.linearLinkB.inverseInertia;
        this.reducedInertia = k > 0.0 ? 1.0 / k : 0.0;
    }
    computeRestImpulse(){
        let angleError = this.restAngleVector.perpDot(this.angleVector);
        let velocityError = this.linearLinkB.angularVelocity - this.linearLinkA.angularVelocity;
        this.restImpulse = -(this.stiffness * angleError * constants.INV_DT + this.damping * velocityError);
    }
    isValid() {
        return this.linearLinkA instanceof LinearSpring && 
            this.linearLinkB instanceof LinearSpring && 
            this.linearLinkA != this.linearLinkB;
    }
    setRestAngleVector(angle) {
        this.restAngleVector = new Vector2(Math.cos(angle), Math.sin(angle));
    }
};

export { AngularSpring };