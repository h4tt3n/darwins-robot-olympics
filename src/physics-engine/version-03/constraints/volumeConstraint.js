"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';

// TODO:
// - Refactor
// - Optimize
// - Test: Opposite equal impulse between volume link particles and volume constraint particles minus volume link particles.
// - Test: VolumeLink impulse function of link length, relative to total circumference.
// - Support individual particle mass.
//   Can a "VolumeLink" be reused by several different VolumeConstraints?
//   Each VolumeConstraint holds a collection of objects with a linearlink and a direction (left / right)?
// - Find a way to represent perpendicular vector direction, decoupled from the linear states. Ok.
// - Find a robust way to ensure that opposite equal forces are always applied. Ok.

class Direction {
    static none = 0;
    static left = -1;
    static right = 1;
}

class VolumeLink {
    constructor(linearStateA, linearStateB, parent) {
        this.stiffness = 1.0;
        this.damping = 0.5;
        this.warmStart = 0.5;
        this.correctionFactor = 0.05;
        this.linearStateA = linearStateA;
        this.linearStateB = linearStateB;
        this.parent = parent;
        this.direction = Direction.left;
        this.mass = 0;
        this.reducedMass = 0.0;
        this.unitVector = new Vector2();
        this.length = 0.0;
        this.restImpulse = 0.0;
        this.accumulatedImpulse = new Vector2();

        this.computeMass();
        this.computeReducedMass();
        this.computeData();
    }
    applyCorrectiveImpulse(){
        if( this.restImpulse == Vector2.zero) { return };

        // deltaImpulse = volume constraint sum of impulses - volumelink sum of impulses
        
        // Calculate the sum of all impulses in the volume constraint, weighted by mass (1)
        let volumeConstraintImpulse = new Vector2();
        this.parent.linearStates.forEach(linearState => {
            volumeConstraintImpulse = volumeConstraintImpulse.add(linearState.impulse);
        });
        volumeConstraintImpulse = volumeConstraintImpulse.div(this.parent.linearStates.length);
        
        // Calculate the sum of all impulses in the volume link, weighted by mass (1)
        let volumeLinkImpulse = this.linearStateA.impulse.add(this.linearStateB.impulse);
        volumeLinkImpulse = volumeLinkImpulse.div(2);

        const deltaImpulse = volumeLinkImpulse.sub(volumeConstraintImpulse);
        
        const projectedImpulse = this.unitVector.dot(deltaImpulse);

        const impulseError = projectedImpulse - this.restImpulse;

        const correctiveImpulse = this.unitVector.mul(impulseError * this.reducedMass * this.correctionFactor);

        this.linearStateA.addImpulse(correctiveImpulse.mul(-this.linearStateA.inverseMass));
        this.linearStateB.addImpulse(correctiveImpulse.mul(-this.linearStateB.inverseMass));

        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);

        return correctiveImpulse;
    }
    applyWarmStart(){
    }
    computeData(){
        const distanceVector = this.linearStateB.position.sub(this.linearStateA.position);
        this.length = distanceVector.length();
        this.unitVector = distanceVector.div(this.length).perp().mul(this.direction);
        //this.unitVector = this.linearStateB.position.sub(this.linearStateA.position).unit().perp().mul(this.direction); 
    }
    computeMass() {
        this.mass = this.linearStateA.mass + this.linearStateB.mass;
    }
    computeReducedMass(){
        // 1 / ( 1 / (volumelink sum of two masses) + 1 / (VolumeConstraint sum of all masses) )
        const k = (1 / this.mass) + (1 / this.parent.mass);
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
    computeRestImpulse(){
        // Calculate the sum of all velocities in the volume constraint, weighted by mass (1)
        let volumeConstraintVelocity = new Vector2();
        this.parent.linearStates.forEach(linearState => {
            volumeConstraintVelocity = volumeConstraintVelocity.add(linearState.velocity);
        });
        volumeConstraintVelocity = volumeConstraintVelocity.div(this.parent.linearStates.length);
        
        // Calculate the sum of all impulvelocitiesses in the volume link, weighted by mass (1)
        let volumeLinkVelocity = this.linearStateA.velocity.add(this.linearStateB.velocity);
        volumeLinkVelocity = volumeLinkVelocity.div(2);

        const deltaVelocity = volumeLinkVelocity.sub(volumeConstraintVelocity);
        
        const velocityError = this.unitVector.dot(deltaVelocity);
        const positionError = (1 - this.parent.scaleFactor) * this.parent.sqrtRestArea;

        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
}

class VolumeConstraint {
    constructor(linearStates = []) {
        this.linearStates = linearStates;
        this.volumeLinks = [];
        // this.stiffness = 0.5;
        // this.damping = 0.5;
        // this.warmStart = 0.5;
        this.correctionFactor = 0.1;
        this.circumference = 0.0;
        this.scaleFactor = 0.0;
        this.area = this.calculateArea();
        this.restArea = this.area * 1.2; //(200 * 200) * 4; //
        this.sqrtRestArea = Math.sqrt(this.restArea);
        this.objectId = null;
        this.mass = 0.0;

        this.computeMass();
        this.computeData();

        // Create volume links
        this.linearStates.forEach((linearState, index) => {
            const nextIndex = (index + 1) % this.linearStates.length;
            const volumeLink = new VolumeLink(linearState, this.linearStates[nextIndex], this);
            this.volumeLinks.push(volumeLink);
        });
    }
    applyCorrectiveImpulse() {
        
        let correctiveImpulseSum = new Vector2();

        this.volumeLinks.forEach(volumeLink => {
            correctiveImpulseSum = correctiveImpulseSum.add(volumeLink.applyCorrectiveImpulse());
        });

        correctiveImpulseSum = correctiveImpulseSum.div(this.volumeLinks.length);

        this.volumeLinks.forEach(volumeLink => {
            volumeLink.linearStateA.impulse = volumeLink.linearStateA.impulse.add(correctiveImpulseSum);
            volumeLink.linearStateB.impulse = volumeLink.linearStateB.impulse.add(correctiveImpulseSum);
        });
    }
    applyCorrectiveImpulseReverse() {
        let correctiveImpulseSum = new Vector2();

        this.volumeLinks.reverse().forEach(volumeLink => {
            correctiveImpulseSum = correctiveImpulseSum.add(volumeLink.applyCorrectiveImpulse());
        });

        correctiveImpulseSum = correctiveImpulseSum.div(this.volumeLinks.length);

        this.volumeLinks.forEach(volumeLink => {
            volumeLink.linearStateA.impulse = volumeLink.linearStateA.impulse.add(correctiveImpulseSum);
            volumeLink.linearStateB.impulse = volumeLink.linearStateB.impulse.add(correctiveImpulseSum);
        });
    }
    applyWarmStart() {
    }
    computeCircumference() {
        let circumference = 0;
        for (let i = 0; i < this.volumeLinks.length; i++) {
            circumference += this.volumeLinks[i].length;
        }
        return circumference;
    }
    computeMass() {
        this.mass = 0;
        this.linearStates.forEach(linearState => {
            this.mass += linearState.mass;
        });
    }
    calculateArea() {
        let area = 0;
        for (let i = 0; i < this.linearStates.length; i++) {
            let j = (i + 1) % this.linearStates.length;
            area += this.linearStates[i].position.x * this.linearStates[j].position.y;
            area -= this.linearStates[i].position.y * this.linearStates[j].position.x;
        }
        area *= 0.5;
        //console.log(area);
        return area;
    }
    calculateScaleFactor() {
        //const scaleFactor = 1 - (Math.sqrt(this.area) - Math.sqrt(this.restArea));
        //const scaleFactor = this.area != 0 ? Math.sqrt(this.restArea / this.area) : 1;
        const scaleFactor = this.area != 0 ? this.sqrtRestArea / Math.sqrt(this.area) : 1;
        //const scaleFactor = this.area > 0 ? this.restArea / this.area : 1;
        //const scaleFactor = this.area - this.restArea;
        //console.log(scaleFactor);
        return scaleFactor;
    }
    computeData() {

        this.volumeLinks.forEach(volumeLink => {
            volumeLink.computeData();
        });

        this.area = this.calculateArea();
        this.scaleFactor = this.calculateScaleFactor();
        this.circumference = this.computeCircumference();
        //console.log(this.circumference);
    }
    computeRestImpulse() {
        this.volumeLinks.forEach(volumeLink => {
            volumeLink.computeRestImpulse();
        });
    }
}

export { VolumeConstraint };