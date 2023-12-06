import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_OPACITY_CANVAS, DEFAULT_SQUARE_GRID_SIZE, MAX_SLIDER_SQUARE_GRID_SIZE, MIN_SLIDER_SQUARE_GRID_SIZE } from '@app/const';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';

const ROUND_UP = 5;

const PERCENTAGE = 100;

const findClosestMultiple = (inputNumber: number, multiple: number): number => {
    inputNumber += multiple / 2;
    inputNumber -= inputNumber % multiple;
    return inputNumber;
};

@Injectable({
    providedIn: 'root',
})
export class GridService {
    canvasSquareSize: number = DEFAULT_SQUARE_GRID_SIZE;
    gridOpacity: number = DEFAULT_OPACITY_CANVAS;
    showGridCanvas: boolean = false;
    gridCanvas: HTMLCanvasElement;
    gridCtx: CanvasRenderingContext2D;
    constructor(private toolsInfoService: ToolsInfoService, private keyEventService: KeyEventService, private resizeService: ResizeService) {
        this.keyEventService.getKeyDownEvent('g').subscribe((event: KeyboardEvent) => {
            if (!event.ctrlKey) {
                this.toolsInfoService.setShowGridCanvas(!this.showGridCanvas);
            }
        });

        this.keyEventService.getKeyDownEvent('+').subscribe((event: KeyboardEvent) => {
            if (!event.ctrlKey) {
                this.increaseSquareSize();
            }
        });

        this.keyEventService.getKeyDownEvent('=').subscribe((event: KeyboardEvent) => {
            if (!event.ctrlKey) {
                this.increaseSquareSize();
            }
        });

        this.keyEventService.getKeyDownEvent('-').subscribe((event: KeyboardEvent) => {
            if (!event.ctrlKey) {
                this.decreaseSquareSize();
            }
        });

        this.toolsInfoService.getSizeSquareCanvas().subscribe((size: number) => {
            this.canvasSquareSize = size;
            this.updateGrid();
        });

        this.toolsInfoService.getOpacityCanvas().subscribe((opacity: number) => {
            this.gridOpacity = opacity;
            this.updateGrid();
        });

        this.toolsInfoService.getShowGridCanvas().subscribe((shouldShow: boolean) => {
            this.showGridCanvas = shouldShow;
            this.showGridCanvas ? this.updateGrid() : this.removeGrid();
        });

        this.resizeService.getCanvasSize().subscribe((canvasSize: Vec2) => {
            if (this.gridCanvas) {
                this.gridCanvas.width = canvasSize.x;
                this.gridCanvas.height = canvasSize.y;
                this.updateGrid();
            }
        });
    }

    upperNearestMultiple(inputNumber: number, multiple: number, maxRange?: number): number {
        return Math.min(inputNumber + multiple - ((inputNumber + multiple) % multiple), maxRange ? maxRange : Infinity);
    }

    lowerNearestMultiple(inputNumber: number, multiple: number, minRange?: number): number {
        return Math.max(
            inputNumber % multiple === 0 ? inputNumber - multiple : inputNumber - (inputNumber % multiple),
            minRange ? minRange : -Infinity,
        );
    }

    findNearestColAndRow(position: Vec2): Vec2 {
        const xClosetNumber = findClosestMultiple(position.x, this.canvasSquareSize);
        const yClosetNumber = findClosestMultiple(position.y, this.canvasSquareSize);
        return { x: xClosetNumber, y: yClosetNumber };
    }

    increaseSquareSize(): void {
        this.toolsInfoService.setSizeSquareCanvas(this.upperNearestMultiple(this.canvasSquareSize, ROUND_UP, MAX_SLIDER_SQUARE_GRID_SIZE));
        this.updateGrid();
    }

    decreaseSquareSize(): void {
        this.toolsInfoService.setSizeSquareCanvas(this.lowerNearestMultiple(this.canvasSquareSize, ROUND_UP, MIN_SLIDER_SQUARE_GRID_SIZE));
        this.updateGrid();
    }

    opacityStyle(): string {
        return `hsla(0, 0%, 0%, ${this.gridOpacity / PERCENTAGE})`;
    }

    updateGrid(): void {
        if (!this.gridCtx) return;
        if (this.showGridCanvas) this.drawGrid();
    }

    drawGrid(): void {
        this.removeGrid();
        this.gridCtx.strokeStyle = this.opacityStyle();
        this.gridCtx.lineCap = 'round';
        this.gridCtx.lineWidth = 1;
        // draw row
        this.gridCtx.beginPath();

        for (let i = 0; i < this.gridCanvas.height; i += this.canvasSquareSize) {
            this.gridCtx.moveTo(0, i);
            this.gridCtx.lineTo(this.gridCanvas.width, i);
        }

        // draw col
        for (let j = 0; j < this.gridCanvas.width; j += this.canvasSquareSize) {
            this.gridCtx.moveTo(j, 0);
            this.gridCtx.lineTo(j, this.gridCanvas.height);
        }
        this.gridCtx.stroke();
    }

    removeGrid(): void {
        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    }
}
