"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { constants } from '../constants.js';
import { LineSegmentParticleCollision } from './lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from './particleParticleCollision.js';
import { LineSegmentWheelCollision } from './lineSegmentWheelCollision.js';

class CollisionHandler {
    constructor(world) {
        this.world = world;
        this.buffer = 0.1;
    }
    planePlaneIntersection(lineSegmentA, lineSegmentB) {
        const p = lineSegmentA.pointA.position;
        const r = lineSegmentA.pointB.position.sub(p);
        const q = lineSegmentB.pointA.position;
        const s = lineSegmentB.pointB.position.sub(q);
        const denominator = Vector2.perpDot(r, s);
        if (denominator == 0) { return null; }  // Line segments are parallel
        const num_t = Vector2.perpDot(q.sub(p), s);
        const t = num_t / denominator;
        //const num_u = Vector2.perpDot(q.sub(p), r);
        //const u = num_u / denominator;
        return p.add(r.mul(t)); // Return intersection point
    }
    closestPointToIntersection2(intersection, lineSegmentA, lineSegmentB) { // Here "Point" refers to Point class
        const points = [lineSegmentA.pointA, lineSegmentA.pointB, lineSegmentB.pointA, lineSegmentB.pointB];
        //console.log({points : points});
        let closestPoint = points[0];
        let smallestDistance = Vector2.distanceSquared(intersection, closestPoint.position);
        for (let i = 1; i < points.length; i++) {
            const distance = Vector2.distanceSquared(intersection, points[i].position);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestPoint = points[i];
            }
        }
        return closestPoint;
    }
    closestPointToIntersection1(intersection, lineSegment) {
        let distanceA = Vector2.distanceSquared(intersection, lineSegment.pointA.position);
        let distanceB = Vector2.distanceSquared(intersection, lineSegment.pointB.position);
        if (distanceA < distanceB) {
            return lineSegment.pointA;
        } else {
            return lineSegment.pointB;
        }
    }
    closestPointOnLineSegment(point, lineSegment) { // Here "Point" refers to vector2 class
        //const p = lineSegment.pointA.position;
        // const s = lineSegment.pointB.position.sub(lineSegment.pointA.position);
        // const r = point.sub(lineSegment.pointA.position);
        // const t = r.dot(s) / s.lengthSquared();
        // if (t < 0) { return lineSegment.pointA.position; }
        // if (t > 1) { return lineSegment.pointB.position; }
        // return lineSegment.pointA.position.add(s.mul(t));
        const sx = lineSegment.pointB.position.x - lineSegment.pointA.position.x;
        const sy = lineSegment.pointB.position.y - lineSegment.pointA.position.y;
        const rx = point.x - lineSegment.pointA.position.x;
        const ry = point.y - lineSegment.pointA.position.y;
        const t = (rx * sx + ry * sy) / (sx * sx + sy * sy);
        if (t < 0) { return lineSegment.pointA.position; }
        if (t > 1) { return lineSegment.pointB.position; }
        return new Vector2(lineSegment.pointA.position.x + t * sx, lineSegment.pointA.position.y + t * sy);
    }
    lineSegmentLineSegmentIntersection(lineSegmentA, lineSegmentB) {
        const p = lineSegmentA.pointA.position;
        const r = lineSegmentA.pointB.position.sub(p);
        const q = lineSegmentB.pointA.position;
        const s = lineSegmentB.pointB.position.sub(q);
        const denominator = Vector2.perpDot(r, s);
        if (denominator == 0) { return null; }  // Line segments are parallel
        const num_t = Vector2.perpDot(q.sub(p), s);
        const t = num_t / denominator;
        if (t < 0 || t > 1) { return null; }  // No intersection
        const num_u = Vector2.perpDot(q.sub(p), r);
        const u = num_u / denominator;
        if (u < 0 || u > 1) { return null; }  // No intersection
        // Return intersection point
        return p.add(r.mul(t));
    }
    lineSegmentLineSegmentIntersection2(lineSegmentA, lineSegmentB) {
        // Returns boolean and plane-plane intersection point, whether intersecting or not
        const p = lineSegmentA.pointA.position;
        const r = lineSegmentA.pointB.position.sub(p);
        const q = lineSegmentB.pointA.position;
        const s = lineSegmentB.pointB.position.sub(q);
        const denominator = Vector2.perpDot(r, s);
         // Line segments are parallel
        if (denominator == 0) { return { isIntersecting : false, intersectionPoint : null }; }  
        const num_t = Vector2.perpDot(q.sub(p), s);
        const t = num_t / denominator;
        //if (t < 0 || t > 1) { isIntersecting = false; }  // No intersection
        const num_u = Vector2.perpDot(q.sub(p), r);
        const u = num_u / denominator;
        //if (u < 0 || u > 1) { isIntersecting = false; }  // No intersection
        // Return intersection point
        let isIntersecting = !((t < 0 || t > 1) || (u < 0 || u > 1));
        let intersectionPoint = p.add(r.mul(t));
        return { isIntersecting : isIntersecting, intersectionPoint : intersectionPoint };
    }
    lineSegmentWithRadiusIntersection(lineSegmentA, lineSegmentB) {
        // Find the intersection point of the two planes
        //let intersection = this.lineSegmentLineSegmentIntersection2(lineSegmentA, lineSegmentB);
        let intersection = this.planePlaneIntersection(lineSegmentA, lineSegmentB);
        // Find the minimum allowed distance between any two points on the line segments
        let radiiSquaredBuffer = (lineSegmentA.radius + lineSegmentB.radius + this.buffer) * (lineSegmentA.radius + lineSegmentB.radius + this.buffer);
        // Find the closest of the four points defining the line segments
        let closestPointOnLineSegmentA = this.closestPointOnLineSegment(intersection, lineSegmentA);
        let closestPointOnLineSegmentB = this.closestPointOnLineSegment(intersection, lineSegmentB);

        // Find the distance between the closest points
        let distanceSquared = Vector2.distanceSquared(closestPointOnLineSegmentA, closestPointOnLineSegmentB);
        // If the distance is less than the minimum allowed distance, return pair of intersection points
        if (distanceSquared < radiiSquaredBuffer) {
            return { isIntersecting : true, intersectionPointA : closestPointOnLineSegmentA, intersectionPointB : closestPointOnLineSegmentB };
        } else {
            return { isIntersecting : false, intersectionPointA : null, intersectionPointB : null };
        }  
    }

    // lineSegmentLinearSpringCollision(lineSegment, linearSpring) {
        
    //     //const intersectionPoint = this.lineSegmentLineSegmentIntersection(lineSegment, linearSpring);
    //     // { isIntersecting : bool, intersectionPointA : ref, intersectionPointB : ref }
    //     const intersectionPoint = this.lineSegmentWithRadiusIntersection(lineSegment, linearSpring)
    //     const isActive = this.isCollisionActive(lineSegment, linearSpring);

    //     // If collision object already exists
    //     if (isActive) {
    //         if (intersectionPoint.isIntersecting == true) {
    //             const distanceVector = intersectionPoint.intersectionPointB.sub(intersectionPoint.intersectionPointA);
    //             const distance = distanceVector.length();
    //             const normal = distanceVector.div(distance);
    //             const collision = this.world.collisions.get(this.createCollisionObjectId(lineSegment, linearSpring));
    //             collision.lineSegmentCollisionPoint = intersectionPoint.intersectionPointA;
    //             collision.linearSpringCollisionPoint = intersectionPoint.intersectionPointB;
    //             collision.distance = distance;
    //             collision.normal = normal;
    //             console.log("Collision updated!");
    //         } else {
    //             this.world.collisions.delete(this.createCollisionObjectId(lineSegment, linearSpring));
    //             console.log("Collision deleted!");
    //         }
    //         return;
    //     // If collision object does not exist
    //     } else {
    //         if (intersectionPoint.isIntersecting == true) {
                
    //             const distanceVector = intersectionPoint.intersectionPointB.sub(intersectionPoint.intersectionPointA);
    //             const distance = distanceVector.length();
    //             const normal = distanceVector.div(distance);
    //             const collision = new LineSegmentLinearSpringCollision(lineSegment, linearSpring, intersectionPoint.intersectionPointA, intersectionPoint.intersectionPointB, distance, normal);
    //             collision.objectId = this.createCollisionObjectId(lineSegment, linearSpring);
    //             this.world.collisions.set(collision.objectId, collision);
    //             console.log("Collision created!");
    //         }
    //     }


        //if (intersectionPoint == null) { 
        // if (intersectionPoint.isIntersecting == false) { 
        //     if (this.isCollisionActive(lineSegment, linearSpring)) {
        //         console.log("Collision deleted!");
        //         this.world.collisions.delete(this.createCollisionObjectId(lineSegment, linearSpring));
        //     }
        //     return; 
        // }
        
        // if (this.isCollisionActive(lineSegment, linearSpring)) {
        //     console.log("Collision already active!");

        //     // Update collision
        //     const closestPoint = this.closestPointToIntersection1(intersectionPoint, linearSpring);
        //     const closestPointOnLineSegment = this.closestPointOnLineSegment(closestPoint.position, lineSegment);
        //     const distanceVector = closestPoint.position.sub(closestPointOnLineSegment);
        //     const distanceSquared = distanceVector.lengthSquared();
        //     const radiiSquaredBuffer = (lineSegment.radius + linearSpring.radius + this.buffer) * (lineSegment.radius + linearSpring.radius + this.buffer);
            
        //     const distance = Math.sqrt(distanceSquared);
        //     const normal = distanceVector.div(distance);
        //     const lineSegmentCollisionPoint = closestPointOnLineSegment.sub(normal.mul(lineSegment.radius));
        //     const linearSpringCollisionPoint = closestPoint;

        //     const collision = this.world.collisions.get(this.createCollisionObjectId(lineSegment, linearSpring));
        //     collision.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        //     collision.linearSpringCollisionPoint = linearSpringCollisionPoint;
        //     collision.distance = distance;
        //     collision.normal = normal;
        //     return;
        // } else {
        //     console.log("Collision created!");
            
        //     const closestPoint = this.closestPointToIntersection1(intersectionPoint, linearSpring);
        //     const closestPointOnLineSegment = this.closestPointOnLineSegment(closestPoint.position, lineSegment);
        //     const distanceVector = closestPoint.position.sub(closestPointOnLineSegment);
        //     const distanceSquared = distanceVector.lengthSquared();
            
        //     const distance = Math.sqrt(distanceSquared);
        //     const normal = distanceVector.div(distance);
        //     const lineSegmentCollisionPoint = closestPointOnLineSegment.sub(normal.mul(lineSegment.radius));
        //     const linearSpringCollisionPoint = closestPoint;

        //     const collision = new LineSegmentLinearSpringCollision(lineSegment, linearSpring, lineSegmentCollisionPoint, linearSpringCollisionPoint, distance, normal);
        //     collision.objectId = this.createCollisionObjectId(lineSegment, linearSpring);
        //     this.world.collisions.set(collision.objectId, collision);
        // }
    //}

    lineSegmentParticleCollision(lineSegment, particle) {
        // console.log("LineSegmentParticleCollision");
        const point = this.closestPointOnLineSegment(particle.position, lineSegment);
        const distanceVector = point.sub(particle.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquared = (particle.radius + lineSegment.radius) * (particle.radius + lineSegment.radius);
        const radiiSquaredBuffer = (particle.radius + lineSegment.radius + this.buffer) * (particle.radius + lineSegment.radius + this.buffer);

        // Check if collision is active
        if (this.isCollisionActive(lineSegment, particle)) {
            
            // If objects no longer intersect, remove collision
            if (distanceSquared > radiiSquaredBuffer) {
                //console.log("Collision deleted!");
                this.world.collisions.delete(this.createCollisionObjectId(lineSegment, particle));
                return;
            
            // If they still intersect, update collision
            } else {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
                const particleCollisionPoint = particle.position.add(normal.mul(particle.radius));

                const collision = this.world.collisions.get(this.createCollisionObjectId(lineSegment, particle));
                collision.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
                collision.particleCollisionPoint = particleCollisionPoint;
                collision.distance = distance;
                collision.normal = normal;
                return;
            }

        // If collision is not active
        } else {
            // If objects intersect, create collision
            if (distanceSquared < radiiSquared) {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
                const particleCollisionPoint = particle.position.add(normal.mul(particle.radius));
                
                const collision = new LineSegmentParticleCollision(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal);
                collision.objectId = this.createCollisionObjectId(lineSegment, particle);
                this.world.collisions.set(collision.objectId, collision);
                return;
            }
        }
    }

    lineSegmentWheelCollision(lineSegment, wheel) {
        // console.log("LineSegmentwheelCollision");
        const point = this.closestPointOnLineSegment(wheel.position, lineSegment);
        const distanceVector = point.sub(wheel.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquaredBuffer = (wheel.radius + lineSegment.radius + this.buffer) * (wheel.radius + lineSegment.radius + this.buffer);

        // Check if collision is active
        if (this.isCollisionActive(lineSegment, wheel)) {
            
            // If objects no longer intersect, remove collision
            if (distanceSquared > radiiSquaredBuffer) {
                
                //console.log("Collision deleted!");
                this.world.collisions.delete(this.createCollisionObjectId(lineSegment, wheel));
                return;
            
            // If they still intersect, update collision
            } else {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
                const wheelCollisionPoint = wheel.position.add(normal.mul(wheel.radius));

                const collision = this.world.collisions.get(this.createCollisionObjectId(lineSegment, wheel));
                collision.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
                collision.wheelCollisionPoint = wheelCollisionPoint;
                collision.distance = distance;
                collision.normal = normal;
                return;
            }

        // If collision is not active
        } else {
            // If objects intersect, create collision
            if (distanceSquared < radiiSquaredBuffer) {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
                const wheelCollisionPoint = wheel.position.add(normal.mul(wheel.radius));
                const collision = new LineSegmentWheelCollision(lineSegment, wheel, lineSegmentCollisionPoint, wheelCollisionPoint, distance, normal);
                collision.objectId = this.createCollisionObjectId(lineSegment, wheel);
                this.world.collisions.set(collision.objectId, collision);
                return;
            }
        }
    }
    particleParticleCollision(particleA, particleB) {
        
        const isActive = this.isCollisionActive(particleA, particleB);
        const distanceVector = particleB.position.sub(particleA.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquaredBuffer = (particleA.radius + particleB.radius + this.buffer) * (particleA.radius + particleB.radius + this.buffer);

        // If collision object already exists
        if (isActive) {
            if (distanceSquared > radiiSquaredBuffer) {
                this.world.collisions.delete(this.createCollisionObjectId(particleA, particleB));
                //console.log("Circle-circle collision deleted!");
            } else {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const particleACollisionPoint = particleA.position.add(normal.mul(particleA.radius));
                const particleBCollisionPoint = particleB.position.add(normal.mul(-particleB.radius));
                const collision = this.world.collisions.get(this.createCollisionObjectId(particleA, particleB));
                collision.particleACollisionPoint = particleACollisionPoint;
                collision.particleBCollisionPoint = particleBCollisionPoint;
                let distVector = particleBCollisionPoint.sub(particleACollisionPoint);
                let dist = distVector.length();
                collision.distance = dist;
                collision.normal = normal;
                //console.log("Circle-circle collision updated!");
            }
            return;
        } else if (isActive == false) {
            if (distanceSquared < radiiSquaredBuffer) {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const particleACollisionPoint = particleA.position.add(normal.mul(particleA.radius));
                const particleBCollisionPoint = particleB.position.add(normal.mul(-particleB.radius));
                let distVector = particleBCollisionPoint.sub(particleACollisionPoint);
                let dist = distVector.length();
                const collision = new ParticleParticleCollision(particleA, particleB, particleACollisionPoint, particleBCollisionPoint, dist, normal);
                collision.objectId = this.createCollisionObjectId(particleA, particleB);
                this.world.collisions.set(collision.objectId, collision);
                //console.log("Circle-circle collision created!");
            }
        }
    }

    // Phind version
    createCollisionObjectId(objectA, objectB) {
        // Ensures a consistent order for the key regardless of the order of objectA and objectB
        // return objectA.objectId < objectB.objectId ? 
        //     `${objectA.objectId}-${objectB.objectId}` : 
        //     `${objectB.objectId}-${objectA.objectId}`;
        return objectA.objectId << 16 | objectB.objectId;
    }

    // Checks if the collision is active by looking up the key in the Map
    isCollisionActive(objectA, objectB) {
        let key = this.createCollisionObjectId(objectA, objectB);
        return this.world.collisions.has(key);
    }

    // Retrieves object IDs from the collision object ID (key)
    getObjectIdsFromCollisionObjectId(collisionObjectId) {
        // Ensures collisionObjectId is treated as a string
        // let array = collisionObjectId.toString().split("-");
        // return array.map(id => parseInt(id, 10));
        return [collisionObjectId >> 16, collisionObjectId & 0xFFFF];
    }

    // Array-string based
    // createCollisionObjectId(objectA, objectB) {
    //     let array = [objectA.objectId, objectB.objectId].sort();
    //     let id = array.toString();
    //     return id;
    // }
    // getObjectIdsFromCollisionObjectId(collisionObjectId) {
    //     //let array = Array.from(collisionObjectId).;
    //     //return array;
    //     let splitArray = collisionObjectId.split(",");
    //     let array = splitArray.map(string => parseInt(string));
    //     return array;
    // }

    // JSON based, works ok but is slow
    // createCollisionObjectId(objectA, objectB) {
    //     let array = [objectA.objectId, objectB.objectId].sort();
    //     let json = JSON.stringify(array);
    //     return json;
    // }
    // getObjectIdsFromCollisionObjectId(collisionObjectId) {
    //     let array = JSON.parse(collisionObjectId);
    //     return array;
    // }
    
    // Original
    // createCollisionObjectId(objectA, objectB) {
    //     // Use an array to collect parts of the string
    //     const parts = objectA.objectId > objectB.objectId ? 
    //         [objectB.objectId, "-", objectA.objectId] : 
    //         [objectA.objectId, "-", objectB.objectId];
    //     // Join the parts into a single string
    //     return parts.join('');
    // }
    
    // createCollisionObjectId(objectA, objectB) {
    //     return objectA.objectId > objectB.objectId ? 
    //         objectB.objectId + "-" + objectA.objectId : 
    //         objectA.objectId + "-" + objectB.objectId;
    // }
    // getObjectIdsFromCollisionObjectId(collisionObjectId) {
    //     let array = collisionObjectId.split("-");
    //     return array;
    // }

    // createCollisionObjectId(...args) {
    //     let id = args.map(arg => arg.objectId).join("-");
    //     //console.log(id);
    //     return id;
    // }
     
    // isCollisionActive(objectA, objectB) {
    //     let key = this.createCollisionObjectId(objectA, objectB);
    //     return this.world.collisions.has(key);
    // }
}

export { CollisionHandler };