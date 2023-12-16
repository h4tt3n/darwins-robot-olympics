"use strict";

import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { LinearState } from './linearState.js'
import { LineSegment } from './lineSegment.js';

class LinearLink extends LineSegment{
    constructor(linearStateA, linearStateB){
        super(linearStateA, linearStateB);
        // this.linearStateA = linearStateA;
        // this.linearStateB = linearStateB;
        this.lengthVector = new Vector2();
        this.angleVector = new Vector2();
        this.angularVelocity = new Number();
        this.angularImpulse = new Number();
        this.inertia = new Number();
        this.inverseInertia = new Number();
        this.length = new Number();
        this.mass = new Number();
        this.reducedMass = new Number();
        this.computeData();
    }
    addImpulse(impulse){

    }
    addVelocity(velocity){

    }
    addPosition(position){

    }
    computeAngleVector(){
        this.angleVector = this.lengthVector.unit();
    }
    computeAngularImpulse(){
        //var impulse = this.linearStateB.impulse.sub(this.linearStateA.impulse);
        var impulse = this.pointB.impulse.sub(this.pointA.impulse);
        this.angularImpulse = this.lengthVector.perpDot(impulse) * this.reducedMass * this.inverseInertia;
    }
    computeAngularVelocity(){
        //var velocity = this.linearStateB.velocity.sub(this.linearStateA.velocity);
        var velocity = this.pointB.velocity.sub(this.pointA.velocity);
        this.angularVelocity = this.lengthVector.perpDot(velocity) * this.reducedMass * this.inverseInertia;
    }
    computeData(){
        this.computeLengthVector();
		this.computeAngleVector();
		this.computeLength();
		this.computeReducedMass();
        this.computeInertia();
		this.computeInverseInertia();
		this.computeAngularVelocity();
    }
    computeInertia(){
        this.inertia = this.lengthVector.lengthSquared() * this.reducedMass;
    }
    computeInverseInertia(){
        this.inverseInertia = this.inertia > 0.0 ? 1.0 / this.inertia : 0.0;
    }
    computeLength(){
        this.length = this.lengthVector.dot(this.angleVector);
    }
    computeLengthVector(){
        //this.lengthVector = this.linearStateB.position.sub(this.linearStateA.position);
        this.lengthVector = this.pointB.position.sub(this.pointA.position);
    }
    computeMass(){
        //this.mass = this.linearStateA.mass + this.linearStateB.mass;
        this.mass = this.pointA.mass + this.pointB.mass;
    }
    computeReducedMass(){
        //var k = this.linearStateA.inverseMass + this.linearStateB.inverseMass;
        var k = this.pointA.inverseMass + this.pointB.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
    getLinearVelocityAtPoint(point){
        //return this.linearStateA.velocity.add(this.linearStateA.velocity.sub(this.linearStateB.velocity).mul(this.lengthVector.perpDot(point.sub(this.linearStateA.position)) / this.lengthVector.lengthSquared()));
        return this.pointA.velocity.add(this.pointA.velocity.sub(this.pointB.velocity).mul(this.lengthVector.perpDot(point.sub(this.pointA.position)) / this.lengthVector.lengthSquared()));
    }
    getLinearImpulseAtPoint(point){
        //return this.linearStateA.impulse.add(this.linearStateA.impulse.sub(this.linearStateB.impulse).mul(this.lengthVector.perpDot(point.sub(this.linearStateA.position)) / this.lengthVector.lengthSquared()));
        return this.pointA.impulse.add(this.pointA.impulse.sub(this.pointB.impulse).mul(this.lengthVector.perpDot(point.sub(this.pointA.position)) / this.lengthVector.lengthSquared()));
    }
    isValid(){
        // return linearStateA instanceof LinearState && 
        //     linearStateB instanceof LinearState && 
        //     linearStateA != linearStateB;
        return pointA instanceof LinearState && 
               pointB instanceof LinearState && 
               pointA != pointB;
    }
};

export { LinearLink };