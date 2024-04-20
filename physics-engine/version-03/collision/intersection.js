import { Vector2 } from '../../../vector-library/version-02/vector2.js'
import { LineSegment } from '../lineSegment.js';

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

export { Intersection };