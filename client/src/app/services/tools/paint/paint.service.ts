import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { PaintCommand } from '@app/classes/commands/paint-command';
import { PaintContiguous } from '@app/classes/paint/paint-contiguous';
import { PaintNonContiguous } from '@app/classes/paint/paint-non-contiguous';
import { Tool } from '@app/classes/tool';
import { Util } from '@app/classes/util';
import { MAX_TOLERANCE, MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PaintService extends Tool {
    paintTolerance: number = 10;

    set tolerance(tolerance: number) {
        this.paintTolerance = Util.clamp(tolerance, 0, MAX_TOLERANCE);
    }
    // For the [(ngModel)] in sidebarComponent
    get tolerance(): number {
        return this.paintTolerance;
    }

    readonly paintNonContiguous: PaintNonContiguous = new PaintNonContiguous();
    readonly paintContiguous: PaintContiguous = new PaintContiguous();

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
        private colorService: ColorService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
    }

    onMouseDown(event: MouseEvent): void {
        let command: Command;
        if (event.button === MouseButton.Left) {
            command = new PaintCommand(
                this.drawingService.baseCtx,
                this.paintContiguous.paint(
                    this.drawingService.baseCtx,
                    { x: event.offsetX, y: event.offsetY },
                    this.paintTolerance,
                    this.colorService.primaryColor,
                ),
            );
            this.undoRedoService.addCommand(command);
            command.do();
        } else if (event.button === MouseButton.Right) {
            command = new PaintCommand(
                this.drawingService.baseCtx,
                this.paintNonContiguous.paint(
                    this.drawingService.baseCtx,
                    { x: event.offsetX, y: event.offsetY },
                    this.paintTolerance,
                    this.colorService.primaryColor,
                ),
            );
            this.undoRedoService.addCommand(command);
            command.do();
        }
    }
}
