"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearSpring } from './linearSpring.js'

class AngularSpring {
    constructor(linearLinkA, linearLinkB, stiffness, damping, warmStart){
        this.angleVector = new Vector2();
        this.restAngleVector = new Vector2();
        this.accumulatedImpulse = 0.0;
        this.reducedInertia = 0.0;
        this.restImpulse = 0.0;
        this.stiffness = stiffness;
        this.damping = damping;
        this.warmStart = warmStart;
        this.distanceA = new Vector2();
        this.distanceB = new Vector2();
        this.linearLinkA = linearLinkA;
        this.linearLinkB = linearLinkB;
        this.objectId = null;

        Object.seal(this);

        this.computeData();

        this.restAngleVector = this.angleVector;
    }
    applyCorrectiveImpulse(){
        // impulse vector
        // let impulseA = this.linearLinkA.pointB.impulse.sub(this.linearLinkA.pointA.impulse);
        // let impulseB = this.linearLinkB.pointB.impulse.sub(this.linearLinkB.pointA.impulse);

        let impulseAx = this.linearLinkA.pointB.impulse.x - this.linearLinkA.pointA.impulse.x;
        let impulseAy = this.linearLinkA.pointB.impulse.y - this.linearLinkA.pointA.impulse.y;

        let impulseBx = this.linearLinkB.pointB.impulse.x - this.linearLinkB.pointA.impulse.x;
        let impulseBy = this.linearLinkB.pointB.impulse.y - this.linearLinkB.pointA.impulse.y;

        // current linear perpendicular impulse scalar
        // let localImpulseA = this.distanceA.perpDot(impulseA) * this.linearLinkA.reducedMass;
        // let localImpulseB = this.distanceB.perpDot(impulseB) * this.linearLinkB.reducedMass;

        let localImpulseA = (this.distanceA.x * impulseAy - this.distanceA.y * impulseAx) * this.linearLinkA.reducedMass;
        let localImpulseB = (this.distanceB.x * impulseBy - this.distanceB.y * impulseBx) * this.linearLinkB.reducedMass;

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
        // let correctiveImpulseA = this.distanceA.perpDot(correctiveAngularImpulseA * this.linearLinkA.reducedMass);
        // let correctiveImpulseB = this.distanceB.perpDot(correctiveAngularImpulseB * this.linearLinkB.reducedMass);

        let scaledAngularImpulseA = correctiveAngularImpulseA * this.linearLinkA.reducedMass;
        let scaledAngularImpulseB = correctiveAngularImpulseB * this.linearLinkB.reducedMass;

        // this.distanceA.perpDot(impulseA)
        // (this.distanceA.x * impulseA.y - this.distanceA.y * impulseA.x)
        // perpDot(v) { 
        //     if (v instanceof Vector2){
        //         return this.x * v.y - this.y * v.x; 
        //     } 
        //     else { 
        //         return new Vector2(-this.y * v, this.x * v); 
        //     }
        // }

        let correctiveImpulseAx = -this.distanceA.y * scaledAngularImpulseA;
        let correctiveImpulseAy =  this.distanceA.x * scaledAngularImpulseA;

        let correctiveImpulseBx = -this.distanceB.y * scaledAngularImpulseB;
        let correctiveImpulseBy =  this.distanceB.x * scaledAngularImpulseB;

        // let correctiveImpulseA = new Vector2(correctiveImpulseAx, correctiveImpulseAy);
        // let correctiveImpulseB = new Vector2(correctiveImpulseBx, correctiveImpulseBy);

        // //  
        // this.linearLinkA.pointA.impulse.addThis(correctiveImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        // this.linearLinkA.pointB.impulse.subThis(correctiveImpulseA.mul(this.linearLinkA.pointB.inverseMass));
        // this.linearLinkB.pointA.impulse.subThis(correctiveImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        // this.linearLinkB.pointB.impulse.addThis(correctiveImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.linearLinkA.pointA.impulse.x += correctiveImpulseAx * this.linearLinkA.pointA.inverseMass;
        this.linearLinkA.pointA.impulse.y += correctiveImpulseAy * this.linearLinkA.pointA.inverseMass;

        this.linearLinkA.pointB.impulse.x -= correctiveImpulseAx * this.linearLinkA.pointB.inverseMass;
        this.linearLinkA.pointB.impulse.y -= correctiveImpulseAy * this.linearLinkA.pointB.inverseMass;

        this.linearLinkB.pointA.impulse.x -= correctiveImpulseBx * this.linearLinkB.pointA.inverseMass;
        this.linearLinkB.pointA.impulse.y -= correctiveImpulseBy * this.linearLinkB.pointA.inverseMass;

        this.linearLinkB.pointB.impulse.x += correctiveImpulseBx * this.linearLinkB.pointB.inverseMass;
        this.linearLinkB.pointB.impulse.y += correctiveImpulseBy * this.linearLinkB.pointB.inverseMass;

        this.accumulatedImpulse += correctiveImpulse;
    }
    applyWarmStart(){
        if(this.accumulatedImpulse === 0){return};

        let warmstartImpulse = this.warmStart * this.accumulatedImpulse;

        let warmstartAngularImpulseA = warmstartImpulse * this.linearLinkA.inverseInertia;
        let warmstartAngularImpulseB = warmstartImpulse * this.linearLinkB.inverseInertia;

        // let warmstartImpulseA = this.distanceA.perpDot(warmstartAngularImpulseA * this.linearLinkA.reducedMass);
        // let warmstartImpulseB = this.distanceB.perpDot(warmstartAngularImpulseB * this.linearLinkB.reducedMass);

        let scaledWarmstartAngularImpulseA = warmstartAngularImpulseA * this.linearLinkA.reducedMass;
        let scaledWarmstartAngularImpulseB = warmstartAngularImpulseB * this.linearLinkB.reducedMass;

        let warmstartImpulseAx = -this.distanceA.y * scaledWarmstartAngularImpulseA;
        let warmstartImpulseAy =  this.distanceA.x * scaledWarmstartAngularImpulseA;

        let warmstartImpulseBx = -this.distanceB.y * scaledWarmstartAngularImpulseB;
        let warmstartImpulseBy =  this.distanceB.x * scaledWarmstartAngularImpulseB;

        // this.linearLinkA.pointA.impulse.addThis(warmstartImpulseA.mul(this.linearLinkA.pointA.inverseMass));
        // this.linearLinkA.pointB.impulse.subThis(warmstartImpulseA.mul(this.linearLinkA.pointB.inverseMass));
        // this.linearLinkB.pointA.impulse.subThis(warmstartImpulseB.mul(this.linearLinkB.pointA.inverseMass));
        // this.linearLinkB.pointB.impulse.addThis(warmstartImpulseB.mul(this.linearLinkB.pointB.inverseMass));

        this.linearLinkA.pointA.impulse.x += warmstartImpulseAx * this.linearLinkA.pointA.inverseMass;
        this.linearLinkA.pointA.impulse.y += warmstartImpulseAy * this.linearLinkA.pointA.inverseMass;

        this.linearLinkA.pointB.impulse.x -= warmstartImpulseAx * this.linearLinkA.pointB.inverseMass;
        this.linearLinkA.pointB.impulse.y -= warmstartImpulseAy * this.linearLinkA.pointB.inverseMass;

        this.linearLinkB.pointA.impulse.x -= warmstartImpulseBx * this.linearLinkB.pointA.inverseMass;
        this.linearLinkB.pointA.impulse.y -= warmstartImpulseBy * this.linearLinkB.pointA.inverseMass;

        this.linearLinkB.pointB.impulse.x += warmstartImpulseBx * this.linearLinkB.pointB.inverseMass;
        this.linearLinkB.pointB.impulse.y += warmstartImpulseBy * this.linearLinkB.pointB.inverseMass;

        this.accumulatedImpulse = 0.0;
    }
    computeAngle(){
        // return this.x * v.x + this.y * v.y; 
        // return this.x * v.y - this.y * v.x; 
        // this.angleVector = new Vector2(
        //     this.linearLinkA.angleVector.dot(this.linearLinkB.angleVector),
        //     this.linearLinkA.angleVector.perpDot(this.linearLinkB.angleVector)
        // );
        //this.angleVector.x = this.linearLinkA.angleVector.x * this.linearLinkB.angleVector.x + this.linearLinkA.angleVector.y * this.linearLinkB.angleVector.y;
        //this.angleVector.y = this.linearLinkA.angleVector.x * this.linearLinkB.angleVector.y - this.linearLinkA.angleVector.y * this.linearLinkB.angleVector.x;
        this.angleVector = new Vector2(
            this.linearLinkA.angleVector.x * this.linearLinkB.angleVector.x + this.linearLinkA.angleVector.y * this.linearLinkB.angleVector.y,
            this.linearLinkA.angleVector.x * this.linearLinkB.angleVector.y - this.linearLinkA.angleVector.y * this.linearLinkB.angleVector.x
        );
    }
    computeData(){

        // this.distanceA = this.linearLinkA.pointB.position.sub(this.linearLinkA.pointA.position);
        // this.distanceB = this.linearLinkB.pointB.position.sub(this.linearLinkB.pointA.position);

        this.distanceA.x = this.linearLinkA.pointB.position.x - this.linearLinkA.pointA.position.x;
        this.distanceA.y = this.linearLinkA.pointB.position.y - this.linearLinkA.pointA.position.y;

        this.distanceB.x = this.linearLinkB.pointB.position.x - this.linearLinkB.pointA.position.x;
        this.distanceB.y = this.linearLinkB.pointB.position.y - this.linearLinkB.pointA.position.y;

        this.computeAngle();
        this.computeReducedInertia();
    }
    computeReducedInertia(){
        let k = this.linearLinkA.inverseInertia + this.linearLinkB.inverseInertia;
        this.reducedInertia = k > 0.0 ? 1.0 / k : 0.0;
    }
    computeRestImpulse(){
        //let angleError = this.restAngleVector.perpDot(this.angleVector);
        let angleError = this.restAngleVector.x * this.angleVector.y - this.restAngleVector.y * this.angleVector.x;
        let velocityError = this.linearLinkB.angularVelocity - this.linearLinkA.angularVelocity;
        this.restImpulse = -(this.stiffness * angleError * constants.INV_DT + this.damping * velocityError);
    }
    setRestAngleVector(angle) {
        this.restAngleVector = new Vector2(Math.cos(angle), Math.sin(angle));
    }
};

export { AngularSpring };