import { Color } from '@app/classes/color';
import { ColorHelper } from '@app/classes/color-helper';
import { Vec2 } from '@app/classes/vec2';
import { MAX_TOLERANCE } from '@app/const';
import { Paintable } from './paintable';

export class PaintContiguous extends Paintable {
    private readonly visited: number = 0xff;

    // algorithm found on: http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
    paint(ctx: CanvasRenderingContext2D, seed: Vec2, tolerance: number, color: Color): ImageData {
        const adjustedTolerance = 1 - tolerance / MAX_TOLERANCE;

        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const canvasWidth: number = ctx.canvas.width;
        const canvasHeight: number = ctx.canvas.height;
        const resultImageData = new Uint32Array(imageData.data.buffer);
        const visitedPixels = new Uint8Array(canvasWidth * canvasHeight);

        const parsedColor = parseInt(ColorHelper.hsl2hex(color), 16);

        // disabled because it is not a typo. ts-lint reason : Bitwise operators are often typos
        // tslint:disable: no-bitwise
        const fillColor = // tslint:disable-next-line: no-magic-numbers for bit wise operations
            ((color.a * Color.MAX_RGB) << 24) | ((parsedColor & 0xff) << 16) | (parsedColor & 0xff00) | ((parsedColor & 0xff0000) >> 16);
        // tslint:disable: no-bitwise

        const targetPixelPos = this.getPixelPos(seed.x, seed.y, canvasWidth);
        const targetColor = this.getPixelColor(targetPixelPos, resultImageData);

        const pixelStack = [[seed.x, seed.y]];

        while (pixelStack.length) {
            const newPos = pixelStack.pop() as number[];
            const x = newPos[0];
            let y = newPos[1];
            let pixelPos = this.getPixelPos(x, y, canvasWidth);
            while (this.canMoveUp(y, pixelPos, visitedPixels, resultImageData, targetColor, adjustedTolerance)) {
                pixelPos -= canvasWidth;
                --y;
            }
            pixelPos += canvasWidth;
            ++y;

            let reachLeft = false;
            let reachRight = false;

            while (this.canMoveDown(y, canvasHeight, pixelPos, visitedPixels, resultImageData, targetColor, adjustedTolerance)) {
                this.colorPixel(pixelPos, resultImageData, fillColor);
                this.colorPixel(pixelPos, visitedPixels, this.visited);

                if (x > 0) {
                    if (this.canMoveLeft(pixelPos, visitedPixels, resultImageData, targetColor, adjustedTolerance)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) reachLeft = false;
                }

                if (x < canvasWidth - 1) {
                    if (this.canMoveRight(pixelPos, visitedPixels, resultImageData, targetColor, adjustedTolerance)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) reachRight = false;
                }
                y++;
                pixelPos += canvasWidth;
            }
        }
        return imageData;
    }

    wasVisited = (pixelPos: number, imageData: Uint8Array): boolean => imageData[pixelPos] === this.visited;

    private canMoveRight(
        pixelPos: number,
        visitedPixels: Uint8Array,
        resultImageData: Uint32Array,
        targetColor: number,
        adjustedTolerance: number,
    ): boolean {
        return (
            !this.wasVisited(pixelPos + 1, visitedPixels) && this.matchColorTolerance(pixelPos + 1, resultImageData, targetColor, adjustedTolerance)
        );
    }

    private canMoveLeft(
        pixelPos: number,
        visitedPixels: Uint8Array,
        resultImageData: Uint32Array,
        targetColor: number,
        adjustedTolerance: number,
    ): boolean {
        return (
            !this.wasVisited(pixelPos - 1, visitedPixels) && this.matchColorTolerance(pixelPos - 1, resultImageData, targetColor, adjustedTolerance)
        );
    }

    private canMoveDown(
        y: number,
        canvasHeight: number,
        pixelPos: number,
        visitedPixels: Uint8Array,
        resultImageData: Uint32Array,
        targetColor: number,
        adjustedTolerance: number,
    ): boolean {
        return (
            y < canvasHeight &&
            !this.wasVisited(pixelPos, visitedPixels) &&
            this.matchColorTolerance(pixelPos, resultImageData, targetColor, adjustedTolerance)
        );
    }

    private canMoveUp(
        y: number,
        pixelPos: number,
        visitedPixels: Uint8Array,
        resultImageData: Uint32Array,
        targetColor: number,
        adjustedTolerance: number,
    ): boolean {
        return (
            y >= 0 && !this.wasVisited(pixelPos, visitedPixels) && this.matchColorTolerance(pixelPos, resultImageData, targetColor, adjustedTolerance)
        );
    }
}
