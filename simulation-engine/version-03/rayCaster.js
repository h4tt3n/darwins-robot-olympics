"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'

class Ray {
    constructor(origin, directionVector) {
        this.origin = origin;
        this.directionVector = directionVector;
        this.closestIntersection = null;
    }
    cast(segment) {
        const q = segment.pointA.position;
        const s = segment.pointB.position.sub(segment.pointA.position);
        const r = this.directionVector;
        const denominator = Vector2.perpDot(r, s);

        if (denominator == 0) { return null; }  // Ray is parallel to segment

        const num_t = Vector2.perpDot(q.sub(this.origin), s);
        const t = num_t / denominator;

        if (t < 0) { return null; } // No intersection

        const num_u = Vector2.perpDot(q.sub(this.origin), r);
        const u = num_u / denominator;

        if (u < 0 || u > 1) { return null; }  // No intersection

        const intersectionPoint = this.origin.add(r.mul(t));
        //const distance = t * r.length();
        const distance = t * r.lengthSquared();
        return { point: intersectionPoint, distance: distance };
    }
    castAll(segments) {
        // Faster
        let closestIntersection = null;
        for (let i = 0; i < segments.length; i++) {
            const intersection = this.cast(segments[i]);
            if (intersection) {
                if (!closestIntersection || intersection.distance < closestIntersection.intersection.distance) {
                    closestIntersection = { intersection: intersection, segment: segments[i] };
                }
            }
        }
        // Null if no intersections were found
        this.closestIntersection = closestIntersection;
        return closestIntersection;
    }
    // castAll(segments) {
    //     // Slower
    //     this.intersections = [];
    //     for (let i = 0; i < segments.length; i++) {
    //         const intersection = this.cast(segments[i]);
    //         if (intersection) {
    //             this.intersections.push( { intersection : intersection, segment : segments[i] } );
    //         } 
    //         // sort this.intersections by intersection.distance 
    //         this.intersections.sort((a, b) => a.intersection.distance - b.intersection.distance);
    //     }
    //     // Null if no intersections were found
    //     this.closestIntersection = this.intersections[0] || null;
    //     return this.closestIntersection;  
    // }

}

// This Camera class is for simple computer vision and for allowing entities to perform obstacle detection.
class RayCamera {
    constructor(origin, direction, numRays, fov) {
        this.origin = origin;
        this.direction = direction;
        //this.directionVector = directionVector;
        this.numRays = numRays;
        this.fov = fov;

        //
        this.rays = [];
        this.closestIntersections = [];
        //this.direction = Math.atan2(this.directionVector.y, this.directionVector.x);
        this.directionVector = new Vector2(Math.cos(this.direction), Math.sin(this.direction));
        this.deltaAngle = this.fov / (this.numRays - 1);
        this.deltaAngleVector = new Vector2(Math.cos(this.deltaAngle), Math.sin(this.deltaAngle));
        this.halfFov = -this.fov * 0.5;
        this.halfFovVector = new Vector2(Math.cos(this.halfFov), Math.sin(this.halfFov));

        // Intialize rays
        for (let i = 0; i < numRays; i++) {
            const angle = this.direction + fov * (i / (numRays - 1)) - fov * 0.5;
            let angeVector = new Vector2(Math.cos(angle), Math.sin(angle));
            this.rays.push(new Ray(this.origin, angeVector));
        }
    }
    // updatePosition() {
    //     for (let i = 0; i < this.rays.length; i++) {
    //         this.rays[i].origin = this.origin;
    //     }
    // }
    // updateDirection() {
    //     for (let i = 0; i < this.rays.length; i++) {
    //         this.rays[i].directionVector = this.directionVector;
    //         this.rays[i].directionVector = this.rays[i].directionVector.rotate(this.halfFovVector);
    //     }
    //     // Rotate rays
    //     for (let i = 0; i < this.rays.length; i++) {
    //         for (let j = this.rays.length-1; j > i; j--) {
    //             this.rays[j].directionVector = this.rays[j].directionVector.rotate(this.deltaAngleVector);
    //             this.rays[i].origin = this.origin;
    //         }
    //     }
    // }
    update() {
        this.closestIntersections = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.rays[i].directionVector = this.directionVector;
            this.rays[i].directionVector = this.rays[i].directionVector.rotate(this.halfFovVector);
        }
        // Rotate rays
        for (let i = 0; i < this.rays.length; i++) {
            for (let j = this.rays.length - 1; j > i; j--) {
                this.rays[j].directionVector = this.rays[j].directionVector.rotate(this.deltaAngleVector);
            }
            this.rays[i].origin = this.origin;
            this.closestIntersections[i] = this.rays[i].closestIntersection;
        }
    }
    castAll(segments) {
        let intersections = [];
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            const intersection = ray.castAll(segments);
            if (intersection) {
                intersections.push(intersection);
            }
        }
        return intersections;
    }
}

export { Ray, RayCamera };