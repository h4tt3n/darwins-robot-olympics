"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { Point } from './point.js'

class LineSegment {
    constructor(pointA, pointB) {
        if(pointA instanceof Point && pointB instanceof Point){
            this.pointA = pointA;
            this.pointB = pointB;
        } else {
            this.pointA = new Point();
            this.pointB = new Point();
        }
        // this.radius = 8;
        this.objectId = null;

        //Object.seal(this);
    }
}

export { LineSegment };