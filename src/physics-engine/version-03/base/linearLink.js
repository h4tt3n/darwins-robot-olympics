"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { LinearState } from './linearState.js'
import { LineSegment } from './lineSegment.js';

class LinearLink extends LineSegment{
    constructor(linearStateA, linearStateB){
        super(linearStateA, linearStateB);
        this.lengthVector = new Vector2();
        this.angleVector = new Vector2();
        this.angularVelocity = 0.0;
        this.angularImpulse = 0.0;
        this.inertia = 0.0;
        this.inverseInertia = 0.0;
        this.length = 0.0;
        this.mass = 0.0;
        this.reducedMass = 0.0;
        
        this.computeReducedMass();
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
        //let impulse = this.linearStateB.impulse.sub(this.linearStateA.impulse);
        // let impulse = this.pointB.impulse.sub(this.pointA.impulse);
        // this.angularImpulse = this.lengthVector.perpDot(impulse) * this.reducedMass * this.inverseInertia;

        let impulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        let impulseY = this.pointB.impulse.y - this.pointA.impulse.y;
        this.angularImpulse = (this.lengthVector.x * impulseY - this.lengthVector.y * impulseX) * this.reducedMass * this.inverseInertia;
    }
    computeAngularVelocity(){
        //let velocity = this.linearStateB.velocity.sub(this.linearStateA.velocity);
        // let velocity = this.pointB.velocity.sub(this.pointA.velocity);
        // this.angularVelocity = this.lengthVector.perpDot(velocity) * this.reducedMass * this.inverseInertia;

        let velocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        let velocityY = this.pointB.velocity.y - this.pointA.velocity.y;
        this.angularVelocity = (this.lengthVector.x * velocityY - this.lengthVector.y * velocityX) * this.reducedMass * this.inverseInertia;
    }
    computeData(){
        this.computeLengthVector();
		this.computeAngleVector();
		this.computeLength();
        this.computeInertia();
		this.computeInverseInertia();
		this.computeAngularVelocity();
    }
    computeInertia(){
        //this.inertia = this.lengthVector.lengthSquared() * this.reducedMass;
        this.inertia = (this.lengthVector.x * this.lengthVector.x + this.lengthVector.y * this.lengthVector.y) * this.reducedMass;
    }
    computeInverseInertia(){
        this.inverseInertia = this.inertia > 0.0 ? 1.0 / this.inertia : 0.0;
    }
    computeLength(){
        //this.length = this.lengthVector.dot(this.angleVector);
        this.length = this.lengthVector.x * this.angleVector.x + this.lengthVector.y * this.angleVector.y;
    }
    computeLengthVector(){
        //this.lengthVector = this.linearStateB.position.sub(this.linearStateA.position);
        //this.lengthVector = this.pointB.position.sub(this.pointA.position);
        this.lengthVector.x = this.pointB.position.x - this.pointA.position.x;
        this.lengthVector.y = this.pointB.position.y - this.pointA.position.y;
    }
    computeMass(){
        //this.mass = this.linearStateA.mass + this.linearStateB.mass;
        this.mass = this.pointA.mass + this.pointB.mass;
    }
    computeReducedMass(){
        //let k = this.linearStateA.inverseMass + this.linearStateB.inverseMass;
        let k = this.pointA.inverseMass + this.pointB.inverseMass;
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