import { Injectable } from '@angular/core';
import { AbstractShape } from '@app/classes/abstract-shape';
import { Command } from '@app/classes/commands/command';
import { DrawPolygonCommand } from '@app/classes/commands/draw-polygon-command';
import { MIN_SIDES } from '@app/const';
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
export class PolygonService extends AbstractShape {
    sides: number = MIN_SIDES;
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.polygon).subscribe((size: number) => {
            this.size = size;
        });
        this.toolsInfoService.getSides().subscribe((sides: number) => {
            this.sides = sides;
        });
        this.isEven = true;
    }

    drawShape(ctx: CanvasRenderingContext2D): Command {
        const command = new DrawPolygonCommand(ctx, { ...this }, this.colorService.secondaryColor.hsla(), this.colorService.primaryColor.hsla());
        if (ctx === this.drawingService.previewCtx) command.drawPreviewContour();
        command.do();
        return command;
    }
}
