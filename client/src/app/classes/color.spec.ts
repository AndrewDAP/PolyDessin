import { Color } from './color';

describe('Color', () => {
    let color: Color;
    beforeEach(() => {
        color = Color.WHITE;
    });

    it('should return hsl of the color', () => {
        expect(color.hsl()).toBe('hsl(0,100%,100%)');
    });

    it('should return hsla of the color', () => {
        expect(color.hsla()).toBe('hsla(0,100%,100%,1)');
    });

    it('should return a copy of the color', () => {
        expect(color.copy()).not.toBe(color);
        expect(color.copy()).toEqual(color);
    });

    it('should equal if the colors are equal', () => {
        const colorEqual = Color.WHITE;
        const colorNotEqual = Color.BLACK;
        expect(color.equals(colorEqual)).toBeTruthy();
        expect(color.equals(colorNotEqual)).not.toBeTruthy();
    });
});
