import { Util } from './util';

describe('ColorHelper', () => {
    it('should clamp value outside the bounds', () => {
        const outsideValue = -2000;
        expect(Util.clamp(outsideValue, 0, 1)).toEqual(0);
    });

    it('should not clamp value inside the bounds', () => {
        const outsideValue = 0.45;
        expect(Util.clamp(outsideValue, 0, 1)).toEqual(outsideValue);
    });
});
