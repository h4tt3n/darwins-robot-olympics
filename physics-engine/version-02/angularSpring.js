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
        this.linearLinkA = linearLinkA;
        this.linearLinkB = linearLinkB;
        this.objectId = null;

        this.computeData();

        this.restAngleVector = this.angleVector;
    }
    applyCorrectiveImpulse(){
        // distance vector
        // var distanceA = this.linearLinkA.linearStateB.position.sub(this.linearLinkA.linearStateA.position);
        // var distanceB = this.linearLinkB.linearStateB.position.sub(this.linearLinkB.linearStateA.position);
        var distanceA = this.linearLinkA.pointB.position.sub(this.linearLinkA.pointA.position);
        var distanceB = this.linearLinkB.pointB.position.sub(this.linearLinkB.pointA.position);

        // impulse vector
        // var impulseA = this.linearLinkA.linearStateB.impulse.sub(this.linearLinkA.linearStateA.impulse);
        // var impulseB = this.linearLinkB.linearStateB.impulse.sub(this.linearLinkB.linearStateA.impulse);
        var impulseA = this.linearLinkA.pointB.impulse.sub(this.linearLinkA.pointA.impulse);
        var impulseB = this.linearLinkB.pointB.impulse.sub(this.linearLinkB.pointA.impulse);

        // current linear perpendicular impulse scalar
        var localImpulseA = distanceA.perpDot(impulseA) * this.linearLinkA.reducedMass;
        var localImpulseB = distanceB.perpDot(impulseB) * this.linearLinkB.reducedMass;

        // convert to angular impulse scalar
        var angularImpulseA = localImpulseA * this.linearLinkA.inverseInertia;
        var angularImpulseB = localImpulseB * this.linearLinkB.inverseInertia;

        // corrective angular impulse scalar
        var deltaImpulse = angularImpulseB - angularImpulseA;
        var impulseError = deltaImpulse - this.restImpulse;
        var correctiveImpulse = -impulseError * this.reducedInertia;

        // scalar
        var correctiveAngularImpulseA = correctiveImpulse * this.linearLinkA.inverseInertia;
        var correctiveAngularImpulseB = correctiveImpulse * this.linearLinkB.inverseInertia;

        // convert to linear impulse perpendicular vector
        var correctiveImpulseA = distanceA.perpDot(correctiveAngularImpulseA).mul(this.linearLinkA.reducedMass);
        var correctiveImpulseB = distanceB.perpDot(correctiveAngularImpulseB).mul(this.linearLinkB.reducedMass);

        //  
        // this.linearLinkA.linearStateA.impulse = this.linearLinkA.linearStateA.impulse.add(correctiveImpulseA.mul(this.linearLinkA.linearStateA.inverseMass));
        // this.linearLinkA.linearStateB.impulse = this.linearLinkA.linearStateB.impulse.sub(correctiveImpulseA.mul(this.linearLinkA.linearStateB.inverseMass));
        this.linearLinkA.pointA.impulse = this.linearLinkA.pointA.impulse.add(correctiveImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        this.linearLinkA.pointB.impulse = this.linearLinkA.pointB.impulse.sub(correctiveImpulseA.mul(this.linearLinkA.pointB.inverseMass));

        // this.linearLinkB.linearStateA.impulse = this.linearLinkB.linearStateA.impulse.sub(correctiveImpulseB.mul(this.linearLinkB.linearStateA.inverseMass));
        // this.linearLinkB.linearStateB.impulse = this.linearLinkB.linearStateB.impulse.add(correctiveImpulseB.mul(this.linearLinkB.linearStateB.inverseMass));
        this.linearLinkB.pointA.impulse = this.linearLinkB.pointA.impulse.sub(correctiveImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        this.linearLinkB.pointB.impulse = this.linearLinkB.pointB.impulse.add(correctiveImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.accumulatedImpulse += correctiveImpulse;
    }
    applyWarmStart(){
        if(this.accumulatedImpulse === 0){return};

        // var distanceA = this.linearLinkA.linearStateB.position.sub(this.linearLinkA.linearStateA.position);
        // var distanceB = this.linearLinkB.linearStateB.position.sub(this.linearLinkB.linearStateA.position);
        var distanceA = this.linearLinkA.pointB.position.sub(this.linearLinkA.pointA.position);
        var distanceB = this.linearLinkB.pointB.position.sub(this.linearLinkB.pointA.position);

        var warmstartImpulse = this.warmStart * this.accumulatedImpulse;

        var warmstartAngularImpulseA = warmstartImpulse * this.linearLinkA.inverseInertia;
        var warmstartAngularImpulseB = warmstartImpulse * this.linearLinkB.inverseInertia;

        var warmstartImpulseA = distanceA.perpDot(warmstartAngularImpulseA).mul(this.linearLinkA.reducedMass);
        var warmstartImpulseB = distanceB.perpDot(warmstartAngularImpulseB).mul(this.linearLinkB.reducedMass);

        // this.linearLinkA.linearStateA.impulse = this.linearLinkA.linearStateA.impulse.add(warmstartImpulseA.mul(this.linearLinkA.linearStateA.inverseMass));
        // this.linearLinkA.linearStateB.impulse = this.linearLinkA.linearStateB.impulse.sub(warmstartImpulseA.mul(this.linearLinkA.linearStateB.inverseMass));
        this.linearLinkA.pointA.impulse = this.linearLinkA.pointA.impulse.add(warmstartImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        this.linearLinkA.pointB.impulse = this.linearLinkA.pointB.impulse.sub(warmstartImpulseA.mul(this.linearLinkA.pointB.inverseMass));

        // this.linearLinkB.linearStateA.impulse = this.linearLinkB.linearStateA.impulse.sub(warmstartImpulseB.mul(this.linearLinkB.linearStateA.inverseMass));
        // this.linearLinkB.linearStateB.impulse = this.linearLinkB.linearStateB.impulse.add(warmstartImpulseB.mul(this.linearLinkB.linearStateB.inverseMass));
        this.linearLinkB.pointA.impulse = this.linearLinkB.pointA.impulse.sub(warmstartImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        this.linearLinkB.pointB.impulse = this.linearLinkB.pointB.impulse.add(warmstartImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.accumulatedImpulse = 0.0;
    }
    computeAngle(){
        this.angleVector = new Vector2(
            this.linearLinkA.angleVector.dot(this.linearLinkB.angleVector),
            this.linearLinkA.angleVector.perpDot(this.linearLinkB.angleVector)
        );
    }
    computeData(){
        this.computeAngle();
        this.computeReducedInertia();
    }
    computeReducedInertia(){
        var k = this.linearLinkA.inverseInertia + this.linearLinkB.inverseInertia;
        this.reducedInertia = k > 0.0 ? 1.0 / k : 0.0;
    }
    computeRestImpulse(){
        var angleError = this.restAngleVector.perpDot(this.angleVector);
        var velocityError = this.linearLinkB.angularVelocity - this.linearLinkA.angularVelocity;
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