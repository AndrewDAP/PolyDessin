import { Injectable } from '@angular/core';

export const WIDTH = 100;
export const HEIGHT = 100;

@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    canvas: HTMLCanvasElement;
    drawCanvas: HTMLCanvasElement;
    selectionCanvas: HTMLCanvasElement;

    constructor() {
        this.canvas = this.createCanvas(WIDTH, HEIGHT);
        this.drawCanvas = this.createCanvas(WIDTH, HEIGHT);
        this.selectionCanvas = this.createCanvas(WIDTH, HEIGHT);
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}
