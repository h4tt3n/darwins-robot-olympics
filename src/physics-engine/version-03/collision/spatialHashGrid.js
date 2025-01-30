"use strict";

import { ParticleParticleCollision } from './particleParticleCollision.js';
//import { LineSegmentParticleCollision } from './lineSegmentParticleCollision.js';
import { FluidConstraint } from '../constraints/fluidConstraint.js';
import { DeformableSpring } from '../moduleBundler.js';
import { ObjectType } from '../objectType.js';
//import { Intersection } from './intersection.js';
// import { Particle } from '../objects/particle.js';
// import { FluidParticle } from '../objects/fluidParticle.js';
// import { DeformableParticle } from '../objects/deformableParticle.js';


class SpatialHashGrid {
    constructor(world, cellSize, width, height) {
        this.world = world;
        this.defaultCellSize = 10;
        this.buffer = 0.1;
        this.cellSize = cellSize > 0 ? cellSize : this.defaultCellSize;
        this.invCellSize = cellSize > 0 ? 1 / cellSize : 1 / this.defaultCellSize;
        this.width = width;
        this.height = height;
        this.buckets = new Map();
        //this.collisions = new Map();

        // For each cell in the grid, create a set to store object IDs
        for (let x = 0; x <= this.width; x += this.cellSize) {
            for (let y = 0; y <= this.height; y += this.cellSize) {
                const key = this.hash(x, y);
                this.buckets.set(key, new Set());
            }
        }
            
    }

    // Hash function to calculate the key for each cell based on position
    hash(x, y) {
        const col = Math.floor(x * this.invCellSize);
        const row = Math.floor(y * this.invCellSize);
        return `${col},${row}`;
    }

    // Insert an object into all cells it overlaps
    insertParticle(object) {
    
        const bbox = object.getBoundingBox();
    
        const startCol = Math.floor(bbox.minX * this.invCellSize);
        const endCol = Math.floor(bbox.maxX * this.invCellSize);
        const startRow = Math.floor(bbox.minY * this.invCellSize);
        const endRow = Math.floor(bbox.maxY * this.invCellSize);
    
        // Iterate through the range and add cells
        for (let col = startCol; col <= endCol; col++) {
            for (let row = startRow; row <= endRow; row++) {

                this.insertObjectAtCoordinate(col, row, object);
            }
        }
    }

    // boundingBoxesOverlapping(boxA, boxB) {
    //     return boxA.minX <= boxB.maxX && boxA.maxX >= boxB.minX && boxA.minY <= boxB.maxY && boxA.maxY >= boxB.minY;
    // }

    insertLineSegment(lineSegment) {
        
        const x0 = Math.floor(lineSegment.pointA.position.x * this.invCellSize);
        const y0 = Math.floor(lineSegment.pointA.position.y * this.invCellSize);
        const x1 = Math.floor(lineSegment.pointB.position.x * this.invCellSize);
        const y1 = Math.floor(lineSegment.pointB.position.y * this.invCellSize);
    
        const dx = Math.abs(x1 - x0);
        const dy = -Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        const err = dx + dy;  // error value e_xy
        let e2; // error value doubled
    
        while (true) {

            this.insertObjectAtCoordinate(x0, y0, lineSegment);
            this.insertObjectAtCoordinate(x0+1, y0, lineSegment);
            this.insertObjectAtCoordinate(x0-1, y0, lineSegment);
            this.insertObjectAtCoordinate(x0, y0+1, lineSegment);
            this.insertObjectAtCoordinate(x0, y0-1, lineSegment);
    
            if (x0 === x1 && y0 === y1) break;
            e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
    }

    // insertObjectAtCoordinate(x, y, object) {
    //     const key = `${x},${y}`;
    //     if (!this.buckets.has(key)) {
    //         this.buckets.set(key, new Set([object]));
    //     } else {
    //         this.buckets.get(key).add(object);
    //     }
    // }

    insertObjectAtCoordinate(x, y, object) {
        const key = `${x},${y}`;
        const bucket = this.buckets.get(key);
        if (!bucket) {
            this.buckets.set(key, new Set([object]));
        } else {
            bucket.add(object);
        }
    }

    // Create collision candidates
    // This method needs to be moved out of the class
    createCollisions() {

        for (const [key, bucket] of this.buckets) {

            if (bucket.size < 2) {
                //bucket.clear();
                continue;
            }

            const objects = Array.from(bucket);

            for (let i = 0; i < objects.length - 1; i++) {

                const objectA = objects[i];

                for (let j = i + 1; j < objects.length; j++) {

                    const objectB = objects[j];

                    // Particle - Particle collision
                    if (objectA.type === ObjectType.PARTICLE && objectB.type === ObjectType.PARTICLE) {
                        const sumRadii = objectA.radius + objectB.radius + this.buffer;
                        const dx = objectA.position.x - objectB.position.x;
                        const dy = objectA.position.y - objectB.position.y;
                        //if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }
                        const distanceSquared = dx * dx + dy * dy;
                        if (distanceSquared > sumRadii * sumRadii) { continue; }
                        if (this.world.collisions.has(key)) { continue; }

                        this.createParticleParticleCollision(objectA, objectB);

                        continue;
                    }

                    // FluidParticle - FluidParticle collision
                    if (objectA.type === ObjectType.FLUID_PARTICLE && objectB.type === ObjectType.FLUID_PARTICLE) {
                        const sumRadii = objectA.radius + objectB.radius;
                        const dx = objectA.position.x - objectB.position.x;
                        const dy = objectA.position.y - objectB.position.y;
                        //if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }
                        const distanceSquared = dx * dx + dy * dy;
                        if (distanceSquared > sumRadii * sumRadii) { continue; }
                        if (this.world.collisions.has(key)) { continue; }

                        this.createFluidConstraint(objectA, objectB);

                        continue;
                    }
                    
                    // DeformableParticle - DeformableParticle collision
                    if (objectA.type === ObjectType.DEFORMABLE_PARTICLE && objectB.type === ObjectType.DEFORMABLE_PARTICLE) {
                        const sumRadii = objectA.radius + objectB.radius;
                        const dx = objectA.position.x - objectB.position.x;
                        const dy = objectA.position.y - objectB.position.y;
                        //if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }
                        const distanceSquared = dx * dx + dy * dy;
                        if (distanceSquared > sumRadii * sumRadii) { continue; }
                        if (this.world.collisions.has(key)) { continue; }

                        this.createDeformableConstraint(objectA, objectB);

                        continue;
                    }

                    // FluidParticle - Pointer collision
                    if (objectB.type === ObjectType.POINTER) {
                        const sumRadii = objectA.radius + objectB.radius;
                        const dx = objectA.position.x - objectB.position.x;
                        const dy = objectA.position.y - objectB.position.y;
                        //if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }
                        const distanceSquared = dx * dx + dy * dy;
                        if (distanceSquared > sumRadii * sumRadii) { continue; }
                        if (this.world.collisions.has(key)) { continue; }

                        this.createParticleParticleCollision(objectA, objectB);

                        continue;
                    }

                    // FluidParticle - Pointer collision
                    if (objectB.type === ObjectType.ROCK) {
                        const sumRadii = objectA.radius + objectB.radius;
                        const dx = objectA.position.x - objectB.position.x;
                        const dy = objectA.position.y - objectB.position.y;
                        //if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }
                        const distanceSquared = dx * dx + dy * dy;
                        if (distanceSquared > sumRadii * sumRadii) { continue; }
                        if (this.world.collisions.has(key)) { continue; }

                        this.createParticleParticleCollision(objectA, objectB);

                        continue;
                    }


                    // Particle - DistanceConstraint collision
                    // if (objectA.type === ObjectType.PARTICLE && objectB.type === ObjectType.LINE_SEGMENT) {

                    //     // Check if particle is also part of the distance constraint
                    //     if (objectA.objectId === objectB.pointA.objectId || 
                    //         objectA.objectId === objectB.pointB.objectId) { continue; }

                    //     this.createLineSegmentParticleCollision(objectB, objectA);

                    //     // const collisionKey = `${objectA.objectId}-${objectB.objectId}`;
                    //     // const newCollision = new LineSegmentParticleCollision(objectA, objectB);

                    //     // this.world.collisions.set(collisionKey, newCollision);
                    // }

                    // // DistanceConstraint - Particle collision
                    // if (objectA.type === ObjectType.LINE_SEGMENT && objectB.type === ObjectType.PARTICLE) {

                    //     if (objectB.objectId === objectA.pointA.objectId || 
                    //         objectB.objectId === objectA.pointB.objectId) { continue; }

                    //     this.createLineSegmentParticleCollision(objectA, objectB);

                    //     // const collisionKey = `${objectB.objectId}-${objectA.objectId}`;
                    //     // const newCollision = new LineSegmentParticleCollision(objectB, objectA);

                    //     // this.world.collisions.set(collisionKey, newCollision);
                    // }
                }
            }

            //bucket.clear();
        }
    }

    clear() {
        this.buckets.forEach((bucket) => {
            bucket.clear();
        });

        // for (const [key, bucket] of this.buckets) {
        //     bucket.clear();
        // }
    }

    // Remove inactive collisions
    removeInactiveCollisions() {
        // this.world.collisions.forEach((key, collision) => {
        //     if (!collision.isActive) {
        //         this.world.collisions.delete(key);
        //     }
        // });

        for (const [key, collision] of this.world.collisions) {
            if (!collision.isActive) {
                //console.log("Collision deleted! " + this.world.collisions.size);
                this.world.collisions.delete(key);
            }
        }

        for (const [key, collision] of this.world.fluidConstraints) {
            if (!collision.isActive) {
                //console.log("FluidConstraint deleted! " + this.world.fluidConstraints.size);
                this.world.fluidConstraints.delete(key);
            }
        }

        for (const [key, collision] of this.world.deformableConstraints) {
            if (!collision.isActive) {
                //console.log("DeformableConstraint deleted! " + this.world.deformableConstraints.size);
                //console.log(this.world.deformableConstraints.size);
                this.world.deformableConstraints.delete(key);
            }
        }
    }

    createDeformableConstraint(particleA, particleB) {
        const collisionKey = this.createCollisionObjectId(particleA, particleB);
        if (this.isDeformableConstraintActive(particleA, particleB)) { return; }

        const collision = new DeformableSpring(particleA, particleB);
        collision.computeData();
        collision.objectId = collisionKey;
        this.world.deformableConstraints.set(collisionKey, collision);

        //console.log(collision);
        //console.log(this.world.deformableConstraints.size);
    }

    createFluidConstraint(particleA, particleB) {

        if (this.isFluidConstraintActive(particleA, particleB)) { return; }

        const collision = new FluidConstraint(particleA, particleB);

        collision.computeData();

        collision.objectId = this.createCollisionObjectId(particleA, particleB);
        this.world.fluidConstraints.set(collision.objectId, collision);

        //console.log("FluidConstraint created! " + collision.objectId);
    }

    createParticleParticleCollision(particleA, particleB) {
        
        if (this.isCollisionActive(particleA, particleB)) { return; }

        const collision = new ParticleParticleCollision(particleA, particleB);

        collision.computeData();

        collision.objectId = this.createCollisionObjectId(particleA, particleB);
        this.world.collisions.set(collision.objectId, collision);

        //console.log("Collision created! " + collision.objectId);
    }

    createCollisionObjectId(objectA, objectB) {
        // Use BigInt for large object IDs
        const idA = BigInt(objectA.objectId);
        const idB = BigInt(objectB.objectId);
    
        // Ensure consistent order of IDs (smallest first)
        return idA < idB ? (idA << 32n) | idB : (idB << 32n) | idA;
    }
    
    // Retrieves object IDs from the collision object ID (key)
    getObjectIdsFromCollisionObjectId(collisionObjectId) {
        // Use BigInt to handle large numbers
        const idA = collisionObjectId >> 32n;
        const idB = collisionObjectId & 0xFFFFFFFFn;
    
        return [Number(idA), Number(idB)];
    }

    isCollisionActive(objectA, objectB) {
        const key = this.createCollisionObjectId(objectA, objectB);
        return this.world.collisions.has(key);
    }

    // getObjectIdsFromCollisionObjectId(collisionObjectId) {
    //     const array = collisionObjectId.toString().split("-");
    //     return array.map(id => parseInt(id, 10));
    // }
    
    // createCollisionObjectId(objectA, objectB) {
    //     return `${objectA.objectId}-${objectB.objectId}`
    // }

    isFluidConstraintActive(objectA, objectB) {
        const key = this.createCollisionObjectId(objectA, objectB);
        return this.world.fluidConstraints.has(key);
    }

    isDeformableConstraintActive(objectA, objectB) {
        const key = this.createCollisionObjectId(objectA, objectB);
        return this.world.deformableConstraints.has(key);
    }
}

export { SpatialHashGrid };