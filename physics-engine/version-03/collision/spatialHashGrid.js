import { ParticleParticleCollision } from './particleParticleCollision.js';
import { LineSegmentParticleCollision } from './lineSegmentParticleCollision.js';
import { ObjectType } from './objectType.js';
import { Intersection } from './intersection.js';


class SpatialHashGrid {
    constructor(world, cellSize, width, height) {
        this.world = world;
        this.defaultCellSize = 10;
        this.buffer = 0.1;
        this.cellSize = cellSize > 0 ? cellSize : this.defaultCellSize;
        this.invCellSize = cellSize > 0 ? 1 / cellSize : this.defaultCellSize;
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

    insertLineSegment(lineSegment) {
        
        let x0 = Math.floor(lineSegment.pointA.position.x * this.invCellSize);
        let y0 = Math.floor(lineSegment.pointA.position.y * this.invCellSize);
        let x1 = Math.floor(lineSegment.pointB.position.x * this.invCellSize);
        let y1 = Math.floor(lineSegment.pointB.position.y * this.invCellSize);
    
        let dx = Math.abs(x1 - x0);
        let dy = -Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx + dy;  // error value e_xy
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

    insertObjectAtCoordinate(x, y, object) {
        const key = `${x},${y}`;
        if (!this.buckets.has(key)) {
            this.buckets.set(key, new Set([object]));
        } else {
            this.buckets.get(key).add(object);
        }
    }

    // Create collision candidates
    // This method needs to be moved out of the class
    createCollisions() {

        for (const [key, bucket] of this.buckets) {

            if (bucket.size < 2) {
                bucket.clear();
                continue;
            }

            const objects = Array.from(bucket);

            for (let i = 0; i < objects.length - 1; i++) {
                for (let j = i + 1; j < objects.length; j++) {

                    if (!this.world.collisions.has(key)){

                        const objectA = objects[i];
                        const objectB = objects[j];

                        // Particle - Particle collision
                        // if (objectA.type === ObjectType.PARTICLE && objectB.type === ObjectType.PARTICLE) {

                        //     const sumRadii = objectA.radius + objectB.radius;

                        //     const dx = objectA.position.x - objectB.position.x;
                        //     const dy = objectA.position.y - objectB.position.y;

                        //     if (Math.abs(dx) > sumRadii || Math.abs(dy) > sumRadii) { continue; }

                        //     const distanceSquared = dx * dx + dy * dy;

                        //     if (distanceSquared > sumRadii * sumRadii) { continue; }

                        //     const collisionKey = `${objectA.objectId}-${objectB.objectId}`;
                        //     const newCollision = new ParticleParticleCollision(objectA, objectB);

                        //     this.world.collisions.set(collisionKey, newCollision);
                        // }

                        // Particle - DistanceConstraint collision
                        if (objectA.type === ObjectType.PARTICLE && objectB.type === ObjectType.LINE_SEGMENT) {

                            // Check if particle is also part of the distance constraint
                            if (objectA.objectId === objectB.pointA.objectId || 
                                objectA.objectId === objectB.pointB.objectId) { continue; }

                            this.createLineSegmentParticleCollision(objectB, objectA);

                            // const collisionKey = `${objectA.objectId}-${objectB.objectId}`;
                            // const newCollision = new LineSegmentParticleCollision(objectA, objectB);

                            // this.world.collisions.set(collisionKey, newCollision);
                        }

                        // DistanceConstraint - Particle collision
                        if (objectA.type === ObjectType.LINE_SEGMENT && objectB.type === ObjectType.PARTICLE) {

                            if (objectB.objectId === objectA.pointA.objectId || 
                                objectB.objectId === objectA.pointB.objectId) { continue; }

                            this.createLineSegmentParticleCollision(objectA, objectB);

                            // const collisionKey = `${objectB.objectId}-${objectA.objectId}`;
                            // const newCollision = new LineSegmentParticleCollision(objectB, objectA);

                            // this.world.collisions.set(collisionKey, newCollision);
                        }
                    }
                }
            }

            bucket.clear();
        }
    }

    resolveCollisions() {
        for (const [key] of this.world.collisions) {

            const collision = this.world.collisions.get(key);

            collision.resolve();

            if (!collision.isActive) {
                this.world.collisions.delete(key);
            }
        }
    }

    createLineSegmentParticleCollision(lineSegment, particle) {
        
        if (this.isCollisionActive(lineSegment, particle)) { return; }

        const point = Intersection.closestPointOnLineSegment(particle.position, lineSegment);
        const distanceVector = point.sub(particle.position);
        const distanceSquared = distanceVector.lengthSquared();
        const radiiSquared = (particle.radius + lineSegment.radius) * (particle.radius + lineSegment.radius);
        //const radiiSquaredBuffer = (particle.radius + lineSegment.radius + this.buffer) * (particle.radius + lineSegment.radius + this.buffer);

        if (distanceSquared < radiiSquared) {
            const distance = Math.sqrt(distanceSquared);
            const normal = distanceVector.div(distance);
            const lineSegmentCollisionPoint = point.sub(normal.mul(lineSegment.radius));
            const particleCollisionPoint = particle.position.add(normal.mul(particle.radius));

            // const collisionKey = `${lineSegment.objectId}-${particle.objectId}`;
            // const newCollision = new LineSegmentParticleCollision(objectA, objectB);
            // this.world.collisions.set(collisionKey, newCollision);
            
            const collision = new LineSegmentParticleCollision(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal);
            collision.objectId = this.createCollisionObjectId(lineSegment, particle);
            this.world.collisions.set(collision.objectId, collision);
            return;
        }
    }

    updateLineSegmentParticleCollision(lineSegment, particle) {
        // console.log("LineSegmentParticleCollision");
        const point = Intersection.closestPointOnLineSegment(particle.position, lineSegment);
        const distanceVector = point.sub(particle.position);
        const distanceSquared = distanceVector.lengthSquared();
        //const radiiSquared = (particle.radius + lineSegment.radius) * (particle.radius + lineSegment.radius);
        const radiiSquaredBuffer = (particle.radius + lineSegment.radius + this.buffer) * (particle.radius + lineSegment.radius + this.buffer);

        // Check if collision is active
        if (!this.isCollisionActive(lineSegment, particle)) { return; }
            
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

                // const collisionKey = `${lineSegment.objectId}-${particle.objectId}`;
                // const newCollision = new LineSegmentParticleCollision(objectA, objectB);
                // this.world.collisions.set(collisionKey, newCollision);
                
                const collision = new LineSegmentParticleCollision(lineSegment, particle, lineSegmentCollisionPoint, particleCollisionPoint, distance, normal);
                collision.objectId = this.createCollisionObjectId(lineSegment, particle);
                this.world.collisions.set(collision.objectId, collision);
                return;
            }
        }
    }

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

export { SpatialHashGrid };