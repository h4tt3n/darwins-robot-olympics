"use strict";

// ******************************************************
//   Utility toolbox version 0.0
// ******************************************************

class Vector2 {
    
    // constructor that takes any number of variables
    // constructor(...args) {
    //     if(args.length === 1){
    //         if(args[0] instanceof Vector2){
    //             this.x = args[0].x || 0.0;
    //             this.y = args[0].y || 0.0;
    //         } else {
    //             this.x = args[0] || 0.0;
    //             this.y = args[0] || 0.0;
    //         }
    //     } else if(args.length === 2){
    //         this.x = args[0] || 0.0;
    //         this.y = args[1] || 0.0;
    //     } else {
    //         this.x = 0.0;
    //         this.y = 0.0;
    //     }
    //     return this;
    // }
    constructor(x, y) {
        if(x instanceof Vector2){
            this.x = x.x || 0.0;
            this.y = x.y || 0.0;
        } else {
            this.x = x || 0.0;
            this.y = y || 0.0;
        }
        return this;
    }

    static zero = new Vector2(0.0, 0.0);
    //
    add(v){ 
        if (v instanceof Vector2){
            return new Vector2(this.x + v.x, this.y + v.y); 
        }
    }
    static add(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x + b.x, a.y + b.y);
        }
    }
    sub(v){ 
        if (v instanceof Vector2){
            return new Vector2(this.x - v.x, this.y - v.y);
        }
    }
    static sub(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return new Vector2(a.x - b.x, a.y - b.y);
        }
    }

    mul(s){ 
        // if (s instanceof Vector2){
        //     return new Vector2(this.x * s.x, this.y * s.y);
        // }
        //else if (s instanceof Number){
            return new Vector2(this.x * s, this.y * s);
        //}
    }
    static mul(a, b){
        //if(a instanceof Vector2 && b instanceof Vector2){
        //    return new Vector2(a.x * b.x, a.y * b.y);
        //}
        // else if(a instanceof Vector2 && b instanceof Number){
            return new Vector2(a.x * b, a.y * b);
        // }
    }
    div(s){ 
        if (s instanceof Number) {
            return new Vector2(this.x / s, this.y / s );
        }
    }
    static div(a, b){
        //if(a instanceof Vector2 && b instanceof Number){
            return new Vector2(a.x / b, a.y / b);
        //}
    }
    normalize() {
        var length = this.length();
        if(length === 0){
            return new Vector2();
        } else {
            return new Vector2( this.x / length, this.y / length );
        }
    }
    static normalize(v){
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
        // if (v instanceof Vector2){
            return this.x * v.x + this.y * v.y; 
        // }
        // else if (v instanceof Number){ 
        //     return new Vector2(this.x * v, this.y * v); 
        // }
    }
    static dot(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return a.x * b.x + a.y * b.y;
        }
    }
    length() { 
        return Math.sqrt(this.lengthSquared());
    }
    static length(v){
        if(v instanceof Vector2){
            return Math.sqrt(v.x*v.x + v.y*v.y);
        }
    }
    lengthSquared() { 
        return this.dot(this);
    }
    static lengthSquared(v){
        if(v instanceof Vector2){
            return v.dot(v);
        }
    }
    distance(v) {
        if (v instanceof Vector2){
            return Math.sqrt(this.distanceSquared(v));
        }
    }
    static distance(a, b){
        if(a instanceof Vector2 && b instanceof Vector2){
            return Math.sqrt(Vector2.sub(a, b).lengthSquared());
        }
    }
    distanceSquared(v) {
        if (v instanceof Vector2){
            return Vector2.sub(this, v).lengthSquared();
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
        // if (v instanceof Vector2){
            return this.x * v.y - this.y * v.x; 
        // } 
        // else if (v instanceof Number){ 
        //     return new Vector2(-this.y * v, this.x * v); 
        // }
    }
    static perpDot(a, b){
        //if(a instanceof Vector2 && b instanceof Vector2){
            return a.x * b.y - a.y * b.x;
       // }
        //else if(a instanceof Vector2 && b instanceof Number){
        //    return new Vector2(-a.y * b, a.x * b);
        //}
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
    static randomizeCircle(b) {	
        let a = Math.random() * 2.0 * Math.PI; 
        let r = Math.sqrt( Math.random() * b * b ); 
        return new Vector2( Math.cos(a) * r, Math.sin(a) * r ); 
    }
    static randomizeSquare(b) { 
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