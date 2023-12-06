import { Injectable } from '@angular/core';
import { AbstractShape } from '@app/classes/abstract-shape';
import { Command } from '@app/classes/commands/command';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
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
export class EllipseService extends AbstractShape {
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.ellipse).subscribe((size: number) => {
            this.size = size;
        });
    }

    drawShape(ctx: CanvasRenderingContext2D): Command {
        const drawPreview = ctx === this.drawingService.previewCtx;
        const command = new DrawEllipseCommand(
            ctx,
            { ...this },
            drawPreview,
            this.colorService.secondaryColor.hsla(),
            this.colorService.primaryColor.hsla(),
        );
        command.do();
        return command;
    }
}
