import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorHelper } from '@app/classes/color-helper';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable } from 'rxjs';

const R = 0;
const G = 1;
const B = 2;
const A = 3;

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    currentColor: Color = Color.WHITE;
    samplingSize: number = 12;

    pixels: [Color, boolean][] = [];
    pixelsSubject: BehaviorSubject<[Color, boolean][]>;

    shouldShowPreview: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        changingToolsService: ChangingToolsService,
        private colorService: ColorService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.pipette).subscribe((size) => {
            this.size = size;
        });
        for (let i = 0; i < this.samplingSize ** 2; i++) {
            this.pixels.push([Color.WHITE, true]);
        }
        this.pixelsSubject = new BehaviorSubject<[Color, boolean][]>(this.pixels);
    }

    onMouseDown(event: MouseEvent): void {
        if (this.currentColor.a === 0) {
            this.currentColor = new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE, Color.MAX_ALPHA);
        }
        if (event.button === 2) {
            this.colorService.secondaryColor = this.currentColor;
        } else {
            this.colorService.primaryColor = this.currentColor;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.resizeService.overHandles) {
            this.shouldShowPreview.next(false);
        } else {
            this.shouldShowPreview.next(true);
            const currentPos: Vec2 = this.getPositionFromMouse(event, this.left, this.top);
            this.sampleCurrentColor(currentPos.x, currentPos.y);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.undoRedoService.undoRedoDisable = false;
    }

    onMouseLeave(): void {
        this.shouldShowPreview.next(false);
    }

    onMouseEnter(): void {
        this.shouldShowPreview.next(true);
    }

    colorObservable(): Observable<[Color, boolean][]> {
        return this.pixelsSubject.asObservable();
    }

    previewObservable(): Observable<boolean> {
        return this.shouldShowPreview.asObservable();
    }

    private verifyCanSample(x: number, y: number): boolean {
        return (
            Math.round(x) >= 0 &&
            Math.round(y) >= 0 &&
            Math.round(x) <= this.drawingService.canvas.width &&
            Math.round(y) <= this.drawingService.canvas.height
        );
    }

    private sampleCurrentColor(x: number, y: number): void {
        const currentColor = this.drawingService.baseCtx.getImageData(x - 1, y - 1, 1, 1).data;
        this.currentColor = ColorHelper.rbga2hsla(currentColor[R], currentColor[G], currentColor[B], currentColor[A]);
        const pixelsArr: [Color, boolean][] = [];
        const newX = x - (this.samplingSize - 1) / 2;
        const newY = y - (this.samplingSize - 1) / 2;
        const RGB_MAX = 255;

        for (let row = 0; row < this.samplingSize; row++) {
            for (let col = 0; col < this.samplingSize; col++) {
                const pixel = this.drawingService.baseCtx.getImageData(newX + col, newY + row, 1, 1).data;
                if (pixel[A] === 0 && this.verifyCanSample(newX + col, newY + row)) {
                    pixelsArr.push([ColorHelper.rbga2hsla(RGB_MAX, RGB_MAX, RGB_MAX, RGB_MAX), this.verifyCanSample(newX + col, newY + row)]);
                } else {
                    pixelsArr.push([ColorHelper.rbga2hsla(pixel[R], pixel[G], pixel[B], pixel[A]), this.verifyCanSample(newX + col, newY + row)]);
                }
            }
        }
        this.pixelsSubject.next(pixelsArr);
    }
}
