"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { constants } from '../constants.js';
import { LineSegmentParticleCollision } from './lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from './particleParticleCollision.js';
import { LineSegmentWheelCollision } from './lineSegmentWheelCollision.js';

// TODO:
// Move all intersection functions into static class. Ok.
// Move collision logic from this class into the collision classes.
// Integrate all collision functions with the spatialHashGrid class.
// Add Particle-Spring collision resolution class.
// Remove all static Vector2 function calls.

class CollisionHandler {
    constructor(world) {
        this.world = world;
        this.buffer = 0.1;
    }
    
    lineSegmentParticleCollision(lineSegment, particle) {
        // console.log("LineSegmentParticleCollision");
        const point = Intersection.closestPointOnLineSegment(particle.position, lineSegment);
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
        const point = Intersection.closestPointOnLineSegment(wheel.position, lineSegment);
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
            }
        }
    }

    // Phind version
    createCollisionObjectId(objectA, objectB) {
        // Ensures a consistent order for the key regardless of the order of objectA and objectB
        return objectA.objectId < objectB.objectId ? 
            `${objectA.objectId}-${objectB.objectId}` : 
            `${objectB.objectId}-${objectA.objectId}`;
    }

    // Checks if the collision is active by looking up the key in the Map
    isCollisionActive(objectA, objectB) {
        let key = this.createCollisionObjectId(objectA, objectB);
        return this.world.collisions.has(key);
    }

    // Retrieves object IDs from the collision object ID (key)
    getObjectIdsFromCollisionObjectId(collisionObjectId) {
        // Ensures collisionObjectId is treated as a string
        let array = collisionObjectId.toString().split("-");
        return array.map(id => parseInt(id, 10));
    }
}

class Intersection {

    static closestPointOnLineSegment(point, lineSegment) { // Here "Point" refers to vector2 class
        const s = lineSegment.pointB.position.sub(lineSegment.pointA.position);
        const r = point.sub(lineSegment.pointA.position);
        const t = r.dot(s) / s.lengthSquared();
        if (t < 0) { return lineSegment.pointA.position; }
        if (t > 1) { return lineSegment.pointB.position; }
        return lineSegment.pointA.position.add(s.mul(t));
    }
}

export { CollisionHandler };