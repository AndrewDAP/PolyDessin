import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
import { EllipseSelectionCommand } from '@app/classes/commands/ellipse-selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionShapeService } from '@app/services/tools/selection/shape/selection-shape.service';
import { SelectionStateService } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectionService extends SelectionShapeService {
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        protected keyEventService: KeyEventService,
        protected selectionStateService: SelectionStateService,
        protected gridService: GridService,
    ) {
        super(
            drawingService,
            colorService,
            toolsInfoService,
            changingToolsService,
            resizeService,
            undoRedoService,
            keyEventService,
            selectionStateService,
            gridService,
        );
        this.selectionMoveService = new SelectionMoveService();
        this.toolsInfoService.getSizeOf(ToolType.ellipseSelection).subscribe((size) => {
            this.size = size;
        });
    }

    deleteShape(): void {
        if (this.clipCommand) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        } else {
            const command = new DrawEllipseCommand(
                this.drawingService.baseCtx,
                {
                    lastMousePos: { x: this.originalDimension.x + this.originalPos.x, y: this.originalDimension.y + this.originalPos.y },
                    mouseDownCoord: this.originalPos,
                    isEven: false,
                    withFill: true,
                    withStroke: false,
                    size: 0,
                } as EllipseService,
                false,
                'white',
                'white',
            );
            command.do();
            this.undoRedoService.addCommand(command);
        }
    }

    drawPreview(): void {
        if (!this.mouseDown) return;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.adjustEdge();
        const ctx = this.drawingService.previewCtx;
        const offSet = { x: this.lastMousePos.x - this.mouseDownCoord.x, y: this.lastMousePos.y - this.mouseDownCoord.y };
        if (this.isEven) {
            const chosenSide = Math.min(Math.abs(offSet.x), Math.abs(offSet.y));
            offSet.x = chosenSide * Math.sign(offSet.x);
            offSet.y = chosenSide * Math.sign(offSet.y);
        }

        const radius = { x: Math.abs(offSet.x / 2), y: Math.abs(offSet.y / 2) };
        const center: Vec2 = {
            x: this.mouseDownCoord.x + radius.x * Math.sign(offSet.x),
            y: this.mouseDownCoord.y + radius.y * Math.sign(offSet.y),
        };
        this.dimension = { x: Math.abs(offSet.x), y: Math.abs(offSet.y) };
        ctx.strokeStyle = 'black';
        ctx.setLineDash(DASH);
        ctx.lineDashOffset = 0;
        ctx.lineWidth = PERIMETER_STROKE_SIZE;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, offSet.x, offSet.y);
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = LINE_DASH_OFFSET;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, offSet.x, offSet.y);
    }

    pasteSelection(ctx: CanvasRenderingContext2D): Command {
        this.isPreview = ctx === this.drawingService.previewCtx;
        const command = new EllipseSelectionCommand(
            ctx,
            { ...this },
            { x: this.originalDimension.x, y: this.originalDimension.y } as Vec2,
            { x: this.dimension.x, y: this.dimension.y } as Vec2,
            { x: this.selectionPos.x, y: this.selectionPos.y } as Vec2,
            { x: this.originalPos.x, y: this.originalPos.y } as Vec2,
            this.isPreview,
            { vertical: this.hasFlipped.vertical, horizontal: this.hasFlipped.horizontal } as Record<MirrorDirection, boolean>,
        );
        command.do();
        return command;
    }
}
