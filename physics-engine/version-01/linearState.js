"use strict";

import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { Point } from './point.js';

class LinearState extends Point{
    constructor(position, mass){
        super(position);
        //this.position = position;
        this.velocity = new Vector2();
        this.impulse = new Vector2();
        this.mass = mass;
        this.inverseMass = 0.0;
        this.computeInverseMass();
    }
    addImpulse(impulse){
        if (impulse instanceof Vector2){
            this.impulse = this.impulse.add(impulse);
        }
    }
    addVelocity(velocity){
        if (velocity instanceof Vector2){
            this.velocity = this.velocity.add(velocity);
        }
    }
    addPosition(position){
        if (position instanceof Vector2){
            this.position = this.position.add(position);
        }
    }
    computeInverseMass() {
        this.inverseMass = this.mass > 0.0 ? 1.0 / this.mass : 0.0;
    }
    computeNewState(){
        if( this.inverseMass != 0.0 ){ 
            this.addVelocity(this.impulse);
            this.addPosition(this.velocity.mul(constants.DT));
        }
        this.impulse = Vector2.zero;
    }
    isValid(){
        return this.mass > 0.0;
    }
};

export { LinearState };