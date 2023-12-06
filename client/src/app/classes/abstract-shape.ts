import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Command } from './commands/command';

@Injectable({
    providedIn: 'root',
})
export abstract class AbstractShape extends Tool {
    isEven: boolean;
    withFill: boolean;
    withStroke: boolean;
    lastMousePos: Vec2;
    canvasSize: Vec2;
    sides: number;
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);

        this.toolsInfoService.getWithFill().subscribe((withFill: boolean) => {
            this.withFill = withFill;
        });
        this.toolsInfoService.getWithStroke().subscribe((withStroke: boolean) => {
            this.withStroke = withStroke;
        });
        this.resizeService.getCanvasSize().subscribe((canvasSize: Vec2) => {
            this.canvasSize = canvasSize;
        });
        this.isEven = false;
        this.withFill = true;
        this.withStroke = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && event.button === MouseButton.Left) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const command = this.drawShape(this.drawingService.baseCtx);
            this.undoRedoService.addCommand(command);
            this.mouseDown = false;
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    onKeyDownShift(): void {
        this.isEven = true;
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    onKeyUpShift(): void {
        this.isEven = false;
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    onKeyDownEscape(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.undoRedoService.undoRedoDisable = false;
        this.mouseDown = false;
    }

    protected abstract drawShape(ctx: CanvasRenderingContext2D): Command;
}
