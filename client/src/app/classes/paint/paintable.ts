import { Color } from '@app/classes/color';

export class Paintable {
    // tslint:disable-next-line: no-magic-numbers
    private readonly DIFFERENCE_MAX_VALUE: number = 1 / (Color.MAX_RGB * 4);

    readonly COLOR_WHITE_HEX: number = 0xffffffff;

    // disabled because it is not a typo. ts-lint reason : Bitwise operators are often typos
    // tslint:disable: no-bitwise
    // tslint:disable: no-magic-numbers for bit wise operations
    colorSimilarity(color1: number, color2: number): number {
        return (
            1 -
            (Math.abs((color1 >> 24) - (color2 >> 24)) +
                Math.abs(((color1 >> 16) & 0xff) - ((color2 >> 16) & 0xff)) +
                Math.abs(((color1 >> 8) & 0xff) - ((color2 >> 8) & 0xff)) +
                Math.abs((color1 & 0xff) - (color2 & 0xff))) *
                this.DIFFERENCE_MAX_VALUE
        );
        // tslint:enable: no-magic-numbers
        // tslint:enable: no-bitwise
    }

    matchColorTolerance(pixelPos: number, imageData: Uint32Array, targetColor: number, tolerance: number): boolean {
        const x = this.colorSimilarity(this.getPixelColor(pixelPos, imageData), targetColor);
        return x * x >= tolerance;
    }

    colorPixel = (pixelPos: number, imageData: Uint32Array | Uint8Array, fillColor: number): number => (imageData[pixelPos] = fillColor);

    getPixelPos = (x: number, y: number, canvasWidth: number): number => y * canvasWidth + x;

    getPixelColor(pixelPos: number, imageData: Uint32Array): number {
        const color = imageData[pixelPos];
        return color ? color : this.COLOR_WHITE_HEX;
    }
}
