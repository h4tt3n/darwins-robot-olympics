"use strict";

/*
 * Copyright (c) 2024 Michael Schmidt Nissen, darwinsrobotolympics@gmail.com
 *
 * All rights reserved.
 *
 * This software and associated documentation files (the "Software"), and the
 * use or other dealings in the Software, are restricted and require the
 * express written consent of the copyright owner. 
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability, 
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other 
 * liability, whether in an action of contract, tort or otherwise, arising 
 * from, out of or in connection with the Software or the use or other 
 * dealings in the Software.
 */

// ******************************************************
//   2D Vector library version 0.3.0
// ******************************************************

class Vector2 {
    
    constructor(x, y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
        return this;
    }

    static zero = new Vector2(0.0, 0.0);

    // Change value of existing vector

    setThis(x, y) {
        this.x = x; this.y = y; return this;
    }
    addThis(vector) {
        this.x += vector.x; this.y += vector.y; return this;
    }
    subThis(vector) {
        this.x -= vector.x; this.y -= vector.y; return this;
    }
    mulThis(scalar) {
        this.x *= scalar; this.y *= scalar; return this;
    }
    divThis(scalar) {
        scalar > 0 ? (this.x /= scalar, this.y /= scalar) : {}; 
        return this;
    }
    normalizeThis() {
        var length = this.length();
        length > 0 ? ( this.x /= length, this.y /= length ) : ( this.x = 0, this.y = 0 );
        return this;
        
        // if(length > 0){
        //     this.x /= length; 
        //     this.y /= length;
        // } else {
        //     this.x = 0;
        //     this.y = 0;
        // }
        // return this;
    }

    // Return new vector with value

    //
    add(v){ 
        //if (v instanceof Vector2){
            return new Vector2(this.x + v.x, this.y + v.y); 
        //}
    }
    static add(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x + b.x, a.y + b.y);
        }
    }
    sub(v){ 
        //if (v instanceof Vector2){
            return new Vector2(this.x - v.x, this.y - v.y);
        //}
    }
    static sub(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x - b.x, a.y - b.y);
        }
    }
    mul(s){ 
        if (s instanceof Vector2){
            return new Vector2(this.x * s.x, this.y * s.y);
        }
        else {
            return new Vector2(this.x * s, this.y * s);
       }
    }
    static mul(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x * b.x, a.y * b.y);
        }
        else if(a instanceof Vector2 && b instanceof Number){
            return new Vector2(a.x * b, a.y * b);
        }
    }
    div(s){ 
        return new Vector2(this.x / s, this.y / s );
    }
    static div(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x / b.x, a.y / b.y);
        }
        else if(a instanceof Vector2 && b instanceof Number){
            return new Vector2(a.x / b, a.y / b);
        }
    }
    normalize() {
        var length = this.length();
        if(length === 0){
            return new Vector2();
        } else {
            return new Vector2( this.x / length, this.y / length );
        }
    }
    static normalize(v) {
        if(v instanceof Vector2){
            var length = v.length();
            if(length === 0){
                return new Vector2();
            } else {
                return new Vector2( v.x / length, v.y / length );
            }
        }
    }
    //
    abs() { 
        return new Vector2( Math.abs(this.x), Math.abs(this.y) ); 
    }
    static angleFromUnitVector(n) { 
        if (v instanceof Vector2){
            return Math.atan2(n.y, n.x);
        }
    }
    component(v) { 
        if (v instanceof Vector2){
            if(v === Vector2.zero){
                return new Vector2();
            } else {
                var result = v.mul( this.dot(v)) / (v.dot(v) ); 
                return new Vector2(result.x, result.y);
            }
        }
    }
    dot(v){ 
        if (v instanceof Vector2){
            return this.x * v.x + this.y * v.y; 
        }
        else { 
            return new Vector2(this.x * v, this.y * v); 
        }
    }
    static dot(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return a.x * b.x + a.y * b.y;
        } else if(a instanceof Vector2 && b instanceof Number){
            return new Vector2(a.x * b, a.y * b);
        }
    }
    length() { 
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    lengthSquared() { 
        return this.x * this.x + this.y * this.y;
    }
    distance(v) {
        if (v instanceof Vector2){
            return Math.sqrt(this.distanceSquared(v));
        }
    }
    static distance(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return Math.sqrt(a.sub(b).lengthSquared());
        }
    }
    distanceSquared(v) {
        if (v instanceof Vector2){
            return this.sub(v).lengthSquared();
        }
    }
    static distanceSquared(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return Vector2.sub(a, b).lengthSquared();
        }
    }
    perp() { 
        return new Vector2(-this.y, this.x); 
    }
    perpDot(v) { 
        if (v instanceof Vector2){
            return this.x * v.y - this.y * v.x; 
        } 
        else { 
            return new Vector2(-this.y * v, this.x * v); 
        }
    }
    static perpDot(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return a.x * b.y - a.y * b.x;
       }
        else if(a instanceof Vector2 && b instanceof Number){
           return new Vector2(-a.y * b, a.x * b);
        }
    }
    project(v) { 
        if (v instanceof Vector2){
            if(this === Vector2.zero){
                return new Vector2();
            } else {
                var result = (this.mul( v.dot(this) / this.dot(this) ));
                return new Vector2(result.x, result.y);
            }
        }
    }
    randomizeCircle(b) {	
        let a = Math.random() * 2.0 * Math.PI; 
        let r = Math.sqrt( Math.random() * b * b ); 
        return new Vector2( Math.cos(a) * r, Math.sin(a) * r ); 
    }
    randomizeSquare(b) { 
        return new Vector2( ( Math.random() - Math.random() ) * b, ( Math.random() - Math.random() ) * b ); 
    }
    rotate(v) { 
        if (v instanceof Vector2){
            var vec = new Vector2(v.x, -v.y);
            return new Vector2(vec.dot(this), vec.perpDot(this));
        } 
        else {
            return new Vector2();
        }
    }
    rotateRight(v) {
        if (v instanceof Vector2){
            var vec = new Vector2(-v.x, v.y);
            return new Vector2(vec.dot(this), vec.perpDot(this));
        } 
        else {
            return new Vector2();
        }
    }
    rotateLeft(v) {
        if (v instanceof Vector2){
            var vec = new Vector2(v.x, -v.y);
            return new Vector2(vec.dot(this), vec.perpDot(this));
        } 
        else {
            return new Vector2();
        }
    }
    unit() { 
        var length = this.length();
        if(length === 0){
            return new Vector2();
        } else {
            return new Vector2( this.x / length, this.y / length );
        }
    }
    static unitVectorFromAngle(a) { 
        return new Vector2(Math.cos(a), Math.sin(a)); 
    }
};

export { Vector2 };