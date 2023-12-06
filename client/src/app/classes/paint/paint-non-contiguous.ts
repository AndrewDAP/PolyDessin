import { Color } from '@app/classes/color';
import { ColorHelper } from '@app/classes/color-helper';
import { Vec2 } from '@app/classes/vec2';
import { MAX_TOLERANCE } from '@app/const';
import { Paintable } from './paintable';

export class PaintNonContiguous extends Paintable {
    paint(ctx: CanvasRenderingContext2D, seed: Vec2, tolerance: number, color: Color): ImageData {
        const adjustedTolerance = 1 - tolerance / MAX_TOLERANCE;

        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const canvasWidth: number = ctx.canvas.width;

        const resultImageData = new Uint32Array(imageData.data.buffer);

        const parsedColor = parseInt(ColorHelper.hsl2hex(color), 16);

        // disabled because it is not a typo. ts-lint reason : Bitwise operators are often typos
        // tslint:disable: no-bitwise
        const fillColor = // tslint:disable-next-line: no-magic-numbers for bit wise operations
            ((color.a * Color.MAX_RGB) << 24) | ((parsedColor & 0xff) << 16) | (parsedColor & 0xff00) | ((parsedColor & 0xff0000) >> 16);
        // tslint:enable: no-bitwise

        const targetPixelPos = this.getPixelPos(seed.x, seed.y, canvasWidth);
        const targetColor = this.getPixelColor(targetPixelPos, resultImageData);

        for (let pixelPos = 0; pixelPos < resultImageData.length; pixelPos++)
            if (this.matchColorTolerance(pixelPos, resultImageData, targetColor, adjustedTolerance))
                this.colorPixel(pixelPos, resultImageData, fillColor);

        return imageData;
    }
}
