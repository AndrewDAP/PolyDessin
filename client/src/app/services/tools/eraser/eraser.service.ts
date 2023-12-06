import { Injectable } from '@angular/core';
import { AbstractStrokeTool } from '@app/classes/abstract-stroke-tool';
import { Command } from '@app/classes/commands/command';
import { EraseLineCommand } from '@app/classes/commands/erase-line-command';
import { Vec2 } from '@app/classes/vec2';
import { LINE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

export const MINIMAL_ERASER_SIZE = 5;

@Injectable({
    providedIn: 'root',
})
export class EraserService extends AbstractStrokeTool {
    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected colorService: ColorService,
        changingToolsService: ChangingToolsService,
        resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.eraser).subscribe((size) => {
            this.size = size;
        });
        this.clearPath();
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const mousePosition = this.getPositionFromMouse(event, this.left, this.top);
        if (this.mouseDown) {
            this.pathData.push(mousePosition);
            this.drawPath(this.drawingService.baseCtx);
        }
        this.showEraser(mousePosition);
    }

    showEraser(mousePosition: Vec2): void {
        const ctx = this.drawingService.previewCtx;
        const oldFillStyle = ctx.fillStyle;
        ctx.setLineDash(LINE);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(mousePosition.x - this.size / 2, mousePosition.y - this.size / 2, this.size, this.size);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.strokeRect(mousePosition.x - this.size / 2, mousePosition.y - this.size / 2, this.size, this.size);

        ctx.fillStyle = oldFillStyle;
    }

    drawPath(ctx: CanvasRenderingContext2D): Command {
        const command = new EraseLineCommand({ ...this }, ctx);
        command.do();
        return command;
    }
}
