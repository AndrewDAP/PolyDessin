import { Color } from './color';
import { ColorHelper } from './color-helper';

describe('ColorHelper', () => {
    it('should convert hex to hsl', () => {
        const whiteHex = 'FFFFFF';
        const redHex = 'FF0000';
        const greenHex = '00FF00';
        const blueHex = '0000FF';
        const fushiaHex = 'FF00FA';
        expect(ColorHelper.hex2hsl(whiteHex)).toEqual(new Color(0, 0, Color.MAX_LUMINANCE));
        expect(ColorHelper.hex2hsl(redHex)).toEqual(Color.RED);
        expect(ColorHelper.hex2hsl(greenHex)).toEqual(Color.GREEN);
        expect(ColorHelper.hex2hsl(blueHex)).toEqual(Color.BLUE);
        expect(ColorHelper.hex2hsl(fushiaHex)).toEqual(Color.FUSHIA);
    });

    it('should convert hsl to hsv', () => {
        const s = 1;
        const v = 1;
        const l = 1;
        expect(ColorHelper.hsl2hsv(s, v)).toEqual([0, l]);
    });

    it('should convert hsv to hsl', () => {
        const s = 1;
        const v = 0.5;
        const l = 1;
        expect(ColorHelper.hsv2hsl(s, l)).toEqual([s, v]);
    });

    it('should convert hsl to hex', () => {
        const whiteHex = 'FFFFFF';
        const redHex = 'FF0000';
        const greenHex = '00FF00';
        const blueHex = '0000FF';
        expect(ColorHelper.hsl2hex(Color.WHITE)).toEqual(whiteHex);
        expect(ColorHelper.hsl2hex(Color.RED)).toEqual(redHex);
        expect(ColorHelper.hsl2hex(Color.GREEN)).toEqual(greenHex);
        expect(ColorHelper.hsl2hex(Color.BLUE)).toEqual(blueHex);
    });

    it('should convert hsl to rgb', () => {
        const white = [Color.MAX_RGB, Color.MAX_RGB, Color.MAX_RGB];
        const red = [Color.MAX_RGB, 0, 0];
        const green = [0, Color.MAX_RGB, 0];
        const blue = [0, 0, Color.MAX_RGB];
        const black = [0, 0, 0];
        // tslint:disable-next-line no-magic-numbers
        const fushia = [Color.MAX_RGB, 0, 251];
        // tslint:disable-next-line no-magic-numbers
        const wineRed = [173, 0, 0];
        expect(ColorHelper.hsl2rgb(Color.WHITE)).toEqual(white);
        expect(ColorHelper.hsl2rgb(Color.RED)).toEqual(red);
        expect(ColorHelper.hsl2rgb(Color.GREEN)).toEqual(green);
        expect(ColorHelper.hsl2rgb(Color.BLUE)).toEqual(blue);
        expect(ColorHelper.hsl2rgb(new Color(0, 0, 0))).toEqual(black);
        expect(ColorHelper.hsl2rgb(Color.FUSHIA)).toEqual(fushia);
        // tslint:disable-next-line no-magic-numbers
        expect(ColorHelper.hsl2rgb(new Color(0, Color.MAX_SATURATION, 34))).toEqual(wineRed);
    });

    it('should convert rgb to hex', () => {
        const colorMax = 255;
        const whiteHex = 'FFFFFF';
        const redHex = 'FF0000';
        const greenHex = '00FF00';
        const blueHex = '0000FF';
        expect(ColorHelper.rgb2hex(colorMax, colorMax, colorMax)).toEqual(whiteHex);
        expect(ColorHelper.rgb2hex(colorMax, 0, 0)).toEqual(redHex);
        expect(ColorHelper.rgb2hex(0, colorMax, 0)).toEqual(greenHex);
        expect(ColorHelper.rgb2hex(0, 0, colorMax)).toEqual(blueHex);
    });

    it('should convert rgba to hsla', () => {
        const colorMax = 255;
        const RGBA = {
            R: colorMax,
            G: 0,
            B: 0,
            A: colorMax,
        };
        expect(ColorHelper.rbga2hsla(RGBA.R, RGBA.G, RGBA.B, RGBA.A)).toEqual(new Color(Color.RED.h, Color.RED.s, Color.RED.l, 1));
    });
});
