"use strict";

import { constants } from '../version-01/constants.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { LinearState } from './linearState.js';
import { AngularState } from './angularState.js';

class Body extends AngularState {
    constructor(args = {}) {
        super(args);
        this.args = args;
        this.linearStates = new Map();
        this.computeData();
    }
    addLinearState(key, linearState) {
        if(linearState instanceof LinearState){
            this.linearStates.set(key, linearState);
            this.computeData();
        }
    }
    removeLinearState(key) {
        this.linearStates.delete(key);
        this.computeData();
    }
    // LinearState method overrides
    addImpulse(impulse) {
        super.addImpulse(impulse);
        this.linearStates.forEach(l => { l.addImpulse(impulse); });
    }
    addVelocity(velocity) {
        super.addVelocity(velocity);
        this.linearStates.forEach(l => { l.addVelocity(velocity); });
    }
    addPosition(position) {
        super.addPosition(position);
        this.linearStates.forEach(l => { l.addPosition(position); });
    }
    // AngularState method overrides
    addAngle(angle) {

    }
    addAngleVector(angleVector) {

    }
    addAngularImpulse(angularImpulse){
        super.addAngularImpulse(angularImpulse);
        this.linearStates.forEach(l => {
            var localPosition = l.position.sub(this.position);
            var localImpulse = localPosition.perpDot(angularImpulse);
            l.addImpulse(localImpulse);
        });
    }
    addAngularVelocity(angularVelocity){
        super.addAngularVelocity(angularVelocity);
        this.linearStates.forEach(l => {
            var localPosition = l.position.sub(this.position);
            var localImpulse = localPosition.perpDot(angularVelocity);
            l.addVelocity(localImpulse);
        });
    }
    // Body methods
    computeAngularImpulse(){
        // TODO: Check this
        var angularImpulse = 0.0;
        this.linearStates.forEach(l => {
            var localPosition = l.position.sub(this.position);
            var localImpulse = localPosition.perpDot(l.impulse);
            angularImpulse += localImpulse;
        });
        this.angularImpulse = angularImpulse;
    }
    computeAngularVelocity(){
        var angularMomentum = 0.0;
        this.linearStates.forEach(l => {
            var localPosition = l.position.sub(this.position);
            var localVelocity = l.velocity.sub(this.velocity);
            angularMomentum += localPosition.perpDot(localVelocity.mul(l.mass));
        });
        this.angularVelocity = angularMomentum * this.inverseInertia;
    }
    computeData(){
        super.computeData();
        // Linear Data
        this.computeMass();
        this.computeInverseMass();
        this.computeStateVectors();
        // Angular Data
        this.computeInertia();
        this.computeInverseInertia();
        this.computeAngularVelocity();
    }
    computeInertia(){
        this.inertia = 0.0;
        this.linearStates.forEach( l => {
            var localPosition = l.position.sub(this.position);
            this.inertia += localPosition.dot(localPosition) * l.mass;
        });
    }
    computeMass(){
        this.mass = 0.0;
        this.linearStates.forEach(l => {
            this.mass += l.mass;
        });
    }
    computeStateVectors(){
        this.position = Vector2.zero;
        this.velocity = Vector2.zero;
        this.linearStates.forEach(l => {
            this.position = this.position.add(l.position.mul(l.mass));
            this.velocity = this.velocity.add(l.velocity.mul(l.mass));
        });
        this.position = this.position.mul(this.inverseMass);
        this.velocity = this.velocity.mul(this.inverseMass);
    }
};

export { Body };