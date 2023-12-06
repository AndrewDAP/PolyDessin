import { Segments } from './segments';
import { Vec2 } from './vec2';

describe('Segments', () => {
    const segmentStart: Vec2 = { x: 5, y: 10 };
    const segmentEnd: Vec2 = { x: 15, y: 10 };

    const pointOnSeg: Vec2 = { x: 10, y: 10 };
    const pointNotOnSeg: Vec2 = { x: 5, y: 20 };

    it('should create an instance', () => {
        expect(new Segments()).toBeTruthy();
    });

    it('should return true if mouse position is on last segment in onLastSegement()', () => {
        const onLastSegment = Segments.intersectsLast(pointOnSeg, segmentStart, segmentEnd);
        expect(onLastSegment).toEqual(true);
    });

    it('should return true if active line and last segment intersect in onLastSegement()', () => {
        const onLastSegment = Segments.intersectsLast({ x: 1, y: 10 }, segmentStart, segmentEnd);
        expect(onLastSegment).toEqual(true);
    });

    it('should return true if active line and last draw segment are vertical and intersect in onLastSegement()', () => {
        const onLastSegment = Segments.intersectsLast({ x: 10, y: 5 }, { x: 10, y: 10 }, { x: 10, y: 20 });
        expect(onLastSegment).toEqual(true);
    });

    it('should return false if active line does not intersects last draw segment in onLastSegement()', () => {
        const onLastSegment = Segments.intersectsLast(pointNotOnSeg, segmentStart, segmentEnd);
        expect(onLastSegment).toEqual(false);
    });

    it('should return true if a point is  within the boundaries of a segment in onSegment()', () => {
        const onSegment = Segments.onSegment(segmentStart, pointOnSeg, segmentEnd);
        expect(onSegment).toEqual(true);
    });

    it('should return false if a point is  within the boundaries of a segment in onSegment()', () => {
        const onSegment = Segments.onSegment(segmentStart, pointNotOnSeg, segmentEnd);
        expect(onSegment).toEqual(false);
    });

    it('should return 0 if the 3 points are colinear in orientation()', () => {
        const orientation = Segments.orientation(segmentStart, pointOnSeg, segmentEnd);
        expect(orientation).toEqual(0);
    });

    it('should return 1 if the 3 points are clockwise in orientation()', () => {
        const orientation = Segments.orientation(segmentStart, pointNotOnSeg, segmentEnd);
        expect(orientation).toEqual(1);
    });

    it('should return 2 if the 3 points are counter-clockwise in orientation()', () => {
        const orientation = Segments.orientation(segmentStart, segmentEnd, pointNotOnSeg);
        expect(orientation).toEqual(2);
    });

    it('should return true if 2 segments intersect normally in segmentsIntersect()', () => {
        const normIntersectStart: Vec2 = { x: 10, y: 5 };
        const normIntersectEnd: Vec2 = { x: 10, y: 15 };
        const intersects = Segments.segmentsIntersect(segmentStart, segmentEnd, normIntersectStart, normIntersectEnd);
        expect(intersects).toEqual(true);
    });

    it('should return false if 2 segments do not intersect segmentsIntersect()', () => {
        const noIntersectStart: Vec2 = { x: 5, y: 5 };
        const noIntersectEnd: Vec2 = { x: 15, y: 5 };
        const intersects = Segments.segmentsIntersect(segmentStart, segmentEnd, noIntersectStart, noIntersectEnd);
        expect(intersects).toEqual(false);
    });

    it('should call distanceBetweenPoints() with correct values if segment start and end are the same in distanceBetweenPointAndSegment()', () => {
        // tslint:disable-next-line: no-any
        const distanceBetweenPointsSpy = spyOn<any>(Segments, 'distanceBetweenPoints');
        Segments.distanceBetweenPointAndSegment(pointNotOnSeg, segmentStart, segmentStart);
        expect(distanceBetweenPointsSpy).toHaveBeenCalledWith(pointNotOnSeg, segmentStart);
    });
});
