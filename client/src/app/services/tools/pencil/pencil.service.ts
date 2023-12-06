import { Injectable } from '@angular/core';
import { AbstractStrokeTool } from '@app/classes/abstract-stroke-tool';
import { Command } from '@app/classes/commands/command';
import { DrawPencilCommand } from '@app/classes/commands/draw-pencil-command';
import { LINE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends AbstractStrokeTool {
    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected colorService: ColorService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.pencil).subscribe((size) => {
            this.size = size;
        });
        this.clearPath();
    }

    draw(): void {
        const length = this.pathData.length;
        const ctx = this.drawingService.previewCtx;
        ctx.setLineDash(LINE);
        ctx.strokeStyle = this.colorService.primaryColor.hsla();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.size;
        ctx.beginPath();
        if (length > 2) {
            ctx.moveTo(this.pathData[length - 2].x, this.pathData[length - 2].y);
        }
        ctx.lineTo(this.pathData[length - 1].x, this.pathData[length - 1].y);
        ctx.stroke();
    }

    drawPath(ctx: CanvasRenderingContext2D): Command {
        const command = new DrawPencilCommand({ ...this }, this.colorService.primaryColor.hsla(), ctx);
        command.do();
        return command;
    }
}
