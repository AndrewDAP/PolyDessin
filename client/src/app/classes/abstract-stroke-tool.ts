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
export abstract class AbstractStrokeTool extends Tool {
    pathData: Vec2[];

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && event.button === MouseButton.Left) {
            this.mouseDown = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const command = this.drawPath(this.drawingService.baseCtx);
            this.undoRedoService.addCommand(command);
            this.clearPath();
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event, this.left, this.top);
            this.pathData.push(mousePosition);
            this.draw();
        }
    }

    //  Functions will be implemented in children

    // tslint:disable-next-line: no-empty
    protected draw(): void {}

    protected abstract drawPath(ctx: CanvasRenderingContext2D): Command;

    clearPath(): void {
        this.pathData = [];
    }
}
