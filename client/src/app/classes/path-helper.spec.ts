import { PathHelper } from './path-helper';
import { Vec2 } from './vec2';

describe('PathHelper', () => {
    it('should convert PathData to a SVG Path', () => {
        const pathData = [{ x: 10, y: 10 } as Vec2, { x: 40, y: 40 } as Vec2, { x: 50, y: 50 } as Vec2, { x: 10, y: 10 } as Vec2];

        const expectedString = 'M 10 10 L 40 40 L 50 50 Z';
        expect(PathHelper.vec2ToSVGPathData(pathData)).toEqual(expectedString);
    });
});
