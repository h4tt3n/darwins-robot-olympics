import { Vector2 } from '../../../vector-library/version-02/vector2.js'
//import { LineSegment } from '../objects/lineSegment.js';

class Intersection {

    static closestPointOnLineSegment(point, lineSegment) { // Here "Point" refers to vector2 class
        const s = lineSegment.pointB.position.sub(lineSegment.pointA.position);
        const r = point.sub(lineSegment.pointA.position);
        const t = r.dot(s) / s.lengthSquared();
        if (t < 0) { return lineSegment.pointA.position; }
        if (t > 1) { return lineSegment.pointB.position; }
        return lineSegment.pointA.position.add(s.mul(t));
    }

    static isPointInsidePolygon(particle, vertices) {
        let isInside = false;
        for (let i = 0; i < vertices.length; i++) {
            const vertexI = vertices[i].linearStateA.position;
            const vertexJ = vertices[i].linearStateB.position;
    
            const isVertexIYGreaterThanParticleY = vertexI.y > particle.position.y;
            const isVertexJYGreaterThanParticleY = vertexJ.y > particle.position.y;
            const isYCoordinateBetweenVertices = isVertexIYGreaterThanParticleY !== isVertexJYGreaterThanParticleY;
    
            const slope = (vertexJ.x - vertexI.x) / (vertexJ.y - vertexI.y);
            const pointAtY = slope * (particle.position.y - vertexI.y) + vertexI.x;
    
            if (isYCoordinateBetweenVertices && particle.position.x < pointAtY) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    static findNearestEdge(point, vertices) {
        let nearestVertice = null;
        let minDistance = Infinity;
        let nearestPoint = null;
    
        for (let i = 0; i < vertices.length; i++) {
            const edgeStart = vertices[i].linearStateA.position;
            const edgeEnd = vertices[i].linearStateB.position;
            const edgeVector = edgeEnd.sub(edgeStart);
            const pointVector = point.position.sub(edgeStart);
            const edgeLengthSquared = edgeVector.dot(edgeVector);
            const t = Math.max(0, Math.min(1, pointVector.dot(edgeVector) / edgeLengthSquared));
            const projection = edgeStart.add(edgeVector.mul(t));
            const distanceVector = point.position.sub(projection);
            const distanceSquared = distanceVector.dot(distanceVector);
    
            if (distanceSquared < minDistance) {
                minDistance = distanceSquared;
                nearestVertice = vertices[i];
                nearestPoint = projection;
            }
        }
        
        minDistance = Math.sqrt(minDistance);
        return { nearestVertice, nearestPoint, minDistance };
    }

    static areLineSegmentsIntersecting(lineSegmentA, lineSegmentB) {
        const p0 = lineSegmentA.pointA.position;
        const p1 = lineSegmentA.pointB.position;
        const p2 = lineSegmentB.pointA.position;
        const p3 = lineSegmentB.pointB.position;
    
        const s1 = p1.sub(p0);
        const s2 = p3.sub(p2);
    
        const s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
        const t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);
    
        return s >= 0 && s <= 1 && t >= 0 && t <= 1;
    }

    static areLinesIntersecting(vectorA, vectorB, lineSegment) {
        const p0 = vectorA;
        const p1 = vectorB;
        const p2 = lineSegment.pointA.position;
        const p3 = lineSegment.pointB.position;
    
        const s1 = p1.sub(p0);
        const s2 = p3.sub(p2);
    
        const s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
        const t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);
    
        return s >= 0 && s <= 1 && t >= 0 && t <= 1;
    }

    static shortestDistanceBetweenLines(vectorA, vectorB, lineSegment) {
        const p0 = vectorA;
        const p1 = vectorB;
        const p2 = lineSegment.pointA.position;
        const p3 = lineSegment.pointB.position;
    
        const s1 = p1.sub(p0);
        const s2 = p3.sub(p2);
    
        const s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
        const t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);
    
        const intersectionPoint = p0.add(s1.mul(s));
        const distance = intersectionPoint.distance(p0);
    
        return distance;
    }
}

export { Intersection };