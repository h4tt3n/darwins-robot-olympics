"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
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
        //if (impulse instanceof Vector2){
            this.impulse.addThis(impulse);
        //}
    }
    addVelocity(velocity){
        //if (velocity instanceof Vector2){
            this.velocity.addThis(velocity);
        //}
    }
    addPosition(position){
        //if (position instanceof Vector2){
            this.position.addThis(position);
        //}
    }
    computeInverseMass() {
        this.inverseMass = this.mass > 0.0 ? 1.0 / this.mass : 0.0;
    }
    computeNewState(){
        if( this.inverseMass != 0.0 ){ 
            //this.impulse.x += constants.GRAVITY.x * 0.25; // Don't fucking ask!
            //this.impulse.y += constants.GRAVITY.y * 0.25;
            this.velocity.x += this.impulse.x;
            this.velocity.y += this.impulse.y;
            this.position.x += this.velocity.x * constants.DT;
            this.position.y += this.velocity.y * constants.DT;
            this.velocity.x += constants.GRAVITY.x;
            this.velocity.y += constants.GRAVITY.y;
        }
        //this.impulse.x = constants.GRAVITY.x * 0.75; // Don't fucking ask!
        //this.impulse.y = constants.GRAVITY.y * 0.75;
        this.impulse.x = 0.0;
        this.impulse.y = 0.0;
    }
};

export { LinearState };