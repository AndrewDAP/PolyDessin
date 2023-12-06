import { Vec2 } from '@app/classes/vec2';

const MAX_DIFF = 0.01;

export class Segments {
    static intersectsLast(mousePos: Vec2, segmentStart: Vec2, segmentEnd: Vec2): boolean {
        const closeToLine = this.distanceBetweenPointAndSegment(mousePos, segmentStart, segmentEnd) < 1;
        const isWithinBoundaries = this.onSegment(segmentStart, mousePos, segmentEnd);

        const slope1 = (mousePos.y - segmentEnd.y) / (mousePos.x - segmentEnd.x);
        const slope2 = (segmentStart.y - segmentEnd.y) / (segmentStart.x - segmentEnd.x);

        if (Math.abs(slope1) === Infinity && Math.abs(slope2) === Infinity && Math.sign(slope1) === Math.sign(slope2)) {
            return true;
        }

        const isAligned = Math.abs(slope1 - slope2) < MAX_DIFF;
        const isOver =
            Math.sign(mousePos.x - segmentEnd.x) === Math.sign(segmentStart.x - segmentEnd.x) &&
            Math.sign(mousePos.y - segmentEnd.y) === Math.sign(segmentStart.y - segmentEnd.y);
        return (closeToLine && isWithinBoundaries) || (isAligned && isOver);
    }

    // Les 2 méthodes suivantes ont étés prises de https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac

    static distanceBetweenPoints(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    static distanceBetweenPointAndSegment(mousePos: Vec2, segmentStart: Vec2, segmentEnd: Vec2): number {
        const dx = segmentEnd.x - segmentStart.x;
        const dy = segmentEnd.y - segmentStart.y;
        const l2 = Math.pow(dx, 2) + Math.pow(dy, 2);

        if (l2 === 0) {
            return this.distanceBetweenPoints(mousePos, segmentStart);
        }

        let t = ((mousePos.x - segmentStart.x) * dx + (mousePos.y - segmentStart.y) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.distanceBetweenPoints(mousePos, { x: segmentStart.x + t * dx, y: segmentStart.y + t * dy });
    }

    // Les 3 méthodes suivantes ont été prises de https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/

    // Given three colinear points p, q, r, the function checks if
    // point q lies on line segment 'pr'
    static onSegment(p: Vec2, q: Vec2, r: Vec2): boolean {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) return true;
        return false;
    }

    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are colinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    static orientation(p: Vec2, q: Vec2, r: Vec2): number {
        // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
        // for details of below formula.
        const val: number = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) {
            return 0; // colinear
        }
        return val > 0 ? 1 : 2; // clock or counterclock wise
    }

    // The main function that returns true if line segment 'p1q1'
    // and 'p2q2' intersect.
    static segmentsIntersect(p1: Vec2, q1: Vec2, p2: Vec2, q2: Vec2): boolean {
        // Find the four orientations needed for general and
        // special cases
        const o1 = this.orientation(p1, q1, p2);
        const o2 = this.orientation(p1, q1, q2);
        const o3 = this.orientation(p2, q2, p1);
        const o4 = this.orientation(p2, q2, q1);

        // General case
        if (o1 !== o2 && o3 !== o4) return true;

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        // if (o1 === 0 && this.onSegment(p1, p2, q1)) return true;

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        // if (o2 === 0 && this.onSegment(p1, q2, q1)) return true;

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        // if (o3 === 0 && this.onSegment(p2, p1, q2)) return true;

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        // if (o4 === 0 && this.onSegment(p2, q1, q2)) return true;

        return false; // Doesn't fall in any of the above cases
    }
}
