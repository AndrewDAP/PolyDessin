import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;

    baseImage: HTMLImageElement | undefined;

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setBaseImage(): void {
        if (this.baseImage !== undefined) this.baseCtx.drawImage(this.baseImage, 0, 0);
    }

    isCanvasBlank(): boolean {
        const pixelBuffer = new Uint32Array(this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
        return !pixelBuffer.some((color: number) => color !== 0);
    }

    whiteBackground(ctx: CanvasRenderingContext2D): void {
        const oldColor = ctx.fillStyle;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);
        ctx.fillStyle = oldColor;
    }
}
