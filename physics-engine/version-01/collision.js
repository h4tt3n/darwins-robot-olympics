"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'
import { constants } from './constants.js';
import { Particle } from './particle.js'
import { LineSegment } from './lineSegment.js'

class ParticleParticleCollisionObject {
    constructor(particleA, particleB, particleACollisionPoint, particleBCollisionPoint, distance, normal) {
        this.stiffness = 1.0;
        this.damping = 0.8;
        this.warmStart = 0.5;
        this.particleA = particleA;
        this.particleB = particleB;
        this.particleACollisionPoint = particleACollisionPoint;
        this.particleBCollisionPoint = particleBCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.reducedMass = 0.0;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
        this.computeReducedMass();
        //console.log(this.reducedMass);
    }
    applyCorrectiveImpulse() {
        if (this.restImpulse == 0.0) { return; }
        const deltaImpulse = this.particleB.impulse.sub(this.particleA.impulse);
        const projectedImpulse = this.normal.dot(deltaImpulse);
        const impulseError = projectedImpulse - this.restImpulse;
        const correctiveImpulse = this.normal.mul(-impulseError * this.reducedMass); // TODO : Add reduced mass
        this.particleA.addImpulse(correctiveImpulse.mul(-this.particleA.inverseMass));
        this.particleB.addImpulse(correctiveImpulse.mul( this.particleB.inverseMass));

        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {

    }
    computeRestImpulse() {
        //console.log("Rest impulse!");
        const deltaPosition = this.particleBCollisionPoint.sub(this.particleACollisionPoint);
        const deltaVelocity = this.particleB.velocity.sub(this.particleA.velocity);
        let positionError = this.normal.dot(deltaPosition);
        //if(positionError < 0.0) { positionError = 0; }
        let velocityError = this.normal.dot(deltaVelocity);
        //if(velocityError < 0.0) { velocityError = 0; }
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeReducedMass(){
        //var k = this.linearStateA.inverseMass + this.linearStateB.inverseMass;
        var k = this.particleA.inverseMass + this.particleB.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
}

class LineSegmentParticleCollisionObject {
    constructor(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal) {
        this.stiffness = 0.5;
        this.damping = 0.8;
        this.warmStart = 0.5;
        this.lineSegment = lineSegment;
        this.particle = particle;
        this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        this.particleCollisionPoint = particleCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
    }
    applyCorrectiveImpulse() {
        //console.log("Corrective impulse!");
        // TODO: Refactor friction out of this function
        if (this.restImpulse == 0.0) { return; }
        const deltaImpulse = this.particle.impulse;

        const deltaVelocity = this.particle.velocity;
        const projectedPerpendicularVelocity = this.normal.perpDot(deltaVelocity);
        //const perpendicularVelocitySquared = projectedPerpendicularVelocity * projectedPerpendicularVelocity;

        //let friction = perpendicularVelocitySquared < 2*2 ? 1.0 : 0.2;
        let friction = Math.abs(projectedPerpendicularVelocity) < 10.0 ? 1.0 : 0.2;

        const projectedNormalImpulse = this.normal.dot(deltaImpulse);
        //const projectedPerpendicularImpulse = this.normal.perpDot(deltaImpulse);

        const normalImpulseError = projectedNormalImpulse - this.restImpulse;
        const perpendicularImpulseError = (projectedPerpendicularVelocity * friction);

        const correctiveNormalImpulse = this.normal.mul(-normalImpulseError * this.particle.mass);
        const correctivePerpendicularImpulse = this.normal.perp().mul(-perpendicularImpulseError * this.particle.mass);

        //const correctiveImpulse = this.normal.mul(-normalImpulseError * this.particle.mass);
        const correctiveImpulse = correctiveNormalImpulse.add(correctivePerpendicularImpulse);
        this.particle.addImpulse(correctiveImpulse.mul(this.particle.inverseMass));
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {
        // Temporarily disabled
        // console.log("Warmstart!");
        const projectedImpulse = this.normal.dot(this.accumulatedImpulse);
        if (projectedImpulse > 0.0) { return; }
        const warmstartImpulse = this.normal.mul(projectedImpulse * this.warmStart);
        //console.log("Warmstart!");
        this.particle.addImpulse(warmstartImpulse.mul(this.particle.inverseMass));
        this.accumulatedImpulse = Vector2.zero;
    }
    computeRestImpulse() {
        //console.log("Rest impulse!");
        const deltaPosition = this.particleCollisionPoint.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.particle.velocity;
        let positionError = this.normal.dot(deltaPosition);
        //if(positionError < 0.0) { positionError = 0; }
        let velocityError = this.normal.dot(deltaVelocity);
        //if(velocityError < 0.0) { velocityError = 0; }
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
}

class LineSegmentLinearSpringCollisionObject {
    constructor(lineSegment, linearSpring, lineSegmentCollisionPoint, linearSpringCollisionPoint, distance, normal) {
        this.stiffness = 0.0;
        this.damping = 1.0;
        this.warmStart = 0.0;
        this.lineSegment = lineSegment;
        this.linearSpring = linearSpring;
        this.lineSegmentCollisionPoint = lineSegmentCollisionPoint;
        this.linearSpringCollisionPoint = linearSpringCollisionPoint;
        this.distance = distance;
        this.normal = normal;
        this.restImpulse = new Vector2();
        this.accumulatedImpulse = new Vector2();
        this.objectId = null;
    }
    applyCorrectiveImpulse() {
        //console.log("Corrective impulse!");
        if (this.restImpulse == 0.0) { return; }
        const deltaImpulse = this.linearSpringCollisionPoint.impulse;
        const projectedImpulse = this.normal.dot(deltaImpulse);
        const impulseError = projectedImpulse - this.restImpulse;
        const correctiveImpulse = this.normal.mul(-impulseError * this.linearSpringCollisionPoint.mass);
        this.linearSpringCollisionPoint.addImpulse(correctiveImpulse.mul(this.linearSpringCollisionPoint.inverseMass));
        this.accumulatedImpulse = this.accumulatedImpulse.add(correctiveImpulse);
    }
    applyWarmStart() {

    }
    computeRestImpulse() {
        const deltaPosition = this.linearSpringCollisionPoint.position.sub(this.lineSegmentCollisionPoint);
        const deltaVelocity = this.linearSpringCollisionPoint.velocity;
        let positionError = this.normal.dot(deltaPosition);
        if(positionError < 0.0) { positionError = 0; }
        let velocityError = this.normal.dot(deltaVelocity);
        if(velocityError < 0.0) { velocityError = 0; }
        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
}

class Collision {
    constructor(world) {
        this.world = world;
        this.buffer = 0.0;
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
        const p = lineSegment.pointA.position;
        const s = lineSegment.pointB.position.sub(p);
        const r = point.sub(lineSegment.pointA.position);
        const t = Vector2.dot(r, s) / Vector2.dot(s, s);
        if (t < 0) { return p; }
        if (t > 1) { return lineSegment.pointB.position; }
        return p.add(s.mul(t));
    }
    // function vec_pnt_lin(a1 as Vec_2DF, a2 as Vec_2DF, p1 as Vec_2DF) as Vec_2DF
    // dim as Vec_2DF ab = a2-a1
    // dim as Vec_2DF ap = p1-a1
    // dim as Sca_Flt t = vec_dot(ap, ab)/vec_mag_sqa(ab)
    // if t < 0 then t = 0
    // if t > 1 then t = 1
    // return a1+ab*t
    // end function
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
        let radiiSquared = (lineSegmentA.radius + lineSegmentB.radius + this.buffer) * (lineSegmentA.radius + lineSegmentB.radius + this.buffer);
        // Find the closest of the four points defining the line segments
        let closestPointOnLineSegmentA = this.closestPointOnLineSegment(intersection, lineSegmentA);
        let closestPointOnLineSegmentB = this.closestPointOnLineSegment(intersection, lineSegmentB);

        // Find the distance between the closest points
        let distanceSquared = Vector2.distanceSquared(closestPointOnLineSegmentA, closestPointOnLineSegmentB);
        // If the distance is less than the minimum allowed distance, return pair of intersection points
        if (distanceSquared < radiiSquared) {
            return { isIntersecting : true, intersectionPointA : closestPointOnLineSegmentA, intersectionPointB : closestPointOnLineSegmentB };
        } else {
            return { isIntersecting : false, intersectionPointA : null, intersectionPointB : null };
        }  
    }

    lineSegmentLinearSpringCollision(lineSegment, linearSpring) {
        
        //const intersectionPoint = this.lineSegmentLineSegmentIntersection(lineSegment, linearSpring);
        // { isIntersecting : bool, intersectionPointA : ref, intersectionPointB : ref }
        const intersectionPoint = this.lineSegmentWithRadiusIntersection(lineSegment, linearSpring)
        const isActive = this.isCollisionActive(lineSegment, linearSpring);

        // If collision object already exists
        if (isActive) {
            if (intersectionPoint.isIntersecting == true) {
                const distanceVector = intersectionPoint.intersectionPointB.sub(intersectionPoint.intersectionPointA);
                const distance = distanceVector.length();
                const normal = distanceVector.div(distance);
                const collision = this.world.collisions.get(this.createCollisionObjectId(lineSegment, linearSpring));
                collision.lineSegmentCollisionPoint = intersectionPoint.intersectionPointA;
                collision.linearSpringCollisionPoint = intersectionPoint.intersectionPointB;
                collision.distance = distance;
                collision.normal = normal;
                console.log("Collision updated!");
            } else {
                this.world.collisions.delete(this.createCollisionObjectId(lineSegment, linearSpring));
                console.log("Collision deleted!");
            }
            return;
        // If collision object does not exist
        } else {
            if (intersectionPoint.isIntersecting == true) {
                
                const distanceVector = intersectionPoint.intersectionPointB.sub(intersectionPoint.intersectionPointA);
                const distance = distanceVector.length();
                const normal = distanceVector.div(distance);
                const collision = new LineSegmentLinearSpringCollisionObject(lineSegment, linearSpring, intersectionPoint.intersectionPointA, intersectionPoint.intersectionPointB, distance, normal);
                collision.objectId = this.createCollisionObjectId(lineSegment, linearSpring);
                this.world.collisions.set(collision.objectId, collision);
                console.log("Collision created!");
            }
        }


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
        //     const radiiSquared = (lineSegment.radius + linearSpring.radius + this.buffer) * (lineSegment.radius + linearSpring.radius + this.buffer);
            
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

        //     const collision = new LineSegmentLinearSpringCollisionObject(lineSegment, linearSpring, lineSegmentCollisionPoint, linearSpringCollisionPoint, distance, normal);
        //     collision.objectId = this.createCollisionObjectId(lineSegment, linearSpring);
        //     this.world.collisions.set(collision.objectId, collision);
        // }
    }

    lineSegmentParticleCollision(lineSegment, particle) {
        // console.log("LineSegmentParticleCollision");
        const point = this.closestPointOnLineSegment(particle.position, lineSegment);
        const distanceVector = point.sub(particle.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquared = (particle.radius + lineSegment.radius + this.buffer) * (particle.radius + lineSegment.radius + this.buffer);

        // Check if collision is active
        if (this.isCollisionActive(lineSegment, particle)) {
            
            if (distanceSquared > radiiSquared) {
                // If objects no longer intersect, remove collision
                //console.log("Collision deleted!");
                this.world.collisions.delete(this.createCollisionObjectId(lineSegment, particle));
                return;
            } else {
                // If they still intersect, update collision
                //console.log("Collision updated!");
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
        }
        if (distanceSquared < radiiSquared) {
            //console.log("Collision created!");
            const distance = Math.sqrt(distanceSquared);
            const normal = distanceVector.div(distance);
            const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
            const particleCollisionPoint = particle.position.add(normal.mul(particle.radius));
            const collision = new LineSegmentParticleCollisionObject(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal);
            collision.objectId = this.createCollisionObjectId(lineSegment, particle);
            this.world.collisions.set(collision.objectId, collision);
        }
    }
    particleParticleCollision(particleA, particleB) {
        
        const isActive = this.isCollisionActive(particleA, particleB);
        const distanceVector = particleB.position.sub(particleA.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquared = (particleA.radius + particleB.radius + this.buffer) * (particleA.radius + particleB.radius + this.buffer);

        // If collision object already exists
        if (isActive) {
            if (distanceSquared > radiiSquared) {
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
            if (distanceSquared < radiiSquared) {
                const distance = Math.sqrt(distanceSquared);
                const normal = distanceVector.div(distance);
                const particleACollisionPoint = particleA.position.add(normal.mul(particleA.radius));
                const particleBCollisionPoint = particleB.position.add(normal.mul(-particleB.radius));
                let distVector = particleBCollisionPoint.sub(particleACollisionPoint);
                let dist = distVector.length();
                const collision = new ParticleParticleCollisionObject(particleA, particleB, particleACollisionPoint, particleBCollisionPoint, dist, normal);
                collision.objectId = this.createCollisionObjectId(particleA, particleB);
                this.world.collisions.set(collision.objectId, collision);
                //console.log("Circle-circle collision created!");
            }
        }
    }
    // Array-string based
    createCollisionObjectId(objectA, objectB) {
        let array = [objectA.objectId, objectB.objectId].sort();
        let id = array.toString();
        return id;
    }
    getObjectIdsFromCollisionObjectId(collisionObjectId) {
        let array = Array.from(collisionObjectId);
        return array;
    }
    // JSON based
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
    //     return objectA.objectId + "-" + objectB.objectId;
    // }
    // createCollisionObjectId(...args) {
    //     let id = args.map(arg => arg.objectId).join("-");
    //     //console.log(id);
    //     return id;
    // }
     
    isCollisionActive(objectA, objectB) {
        let key = this.createCollisionObjectId(objectA, objectB);
        return this.world.collisions.has(key);
    }
}

export { Collision, ParticleParticleCollisionObject, LineSegmentParticleCollisionObject, LineSegmentLinearSpringCollisionObject };