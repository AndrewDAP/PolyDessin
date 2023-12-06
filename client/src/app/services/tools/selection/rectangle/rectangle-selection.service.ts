import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import { RectangleSelectionCommand } from '@app/classes/commands/rectangle-selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionShapeService } from '@app/services/tools/selection/shape/selection-shape.service';
import { SelectionStateService } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionShapeService {
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        protected keyEventService: KeyEventService,
        protected selectionStateService: SelectionStateService, // protected selectionMoveService: SelectionMoveService,
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
        this.keyEventService.getKeyDownEvent('a').subscribe((event: KeyboardEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                if (this.activeTool !== ToolType.rectangleSelection) {
                    this.changingToolsService.setTool(ToolType.rectangleSelection);
                }
                this.selectAll();
            }
        });
        this.toolsInfoService.getSizeOf(ToolType.rectangleSelection).subscribe((size) => {
            this.size = size;
        });
    }

    deleteShape(): void {
        if (this.clipCommand) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        } else {
            const command = new DrawRectangleCommand(
                this.drawingService.baseCtx,
                {
                    lastMousePos: { x: this.originalDimension.x + this.originalPos.x, y: this.originalDimension.y + this.originalPos.y },
                    mouseDownCoord: this.originalPos,
                    isEven: false,
                    withFill: true,
                    withStroke: false,
                    size: 0,
                } as RectangleService,
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
        const size = { x: this.lastMousePos.x - this.mouseDownCoord.x, y: this.lastMousePos.y - this.mouseDownCoord.y };
        if (this.isEven) {
            const chosenSide = Math.min(Math.abs(size.x), Math.abs(size.y));
            size.x = chosenSide * Math.sign(size.x);
            size.y = chosenSide * Math.sign(size.y);
        }
        this.dimension = { x: Math.abs(size.x), y: Math.abs(size.y) };
        ctx.setLineDash(DASH);
        ctx.lineWidth = PERIMETER_STROKE_SIZE;
        ctx.lineDashOffset = 0;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, size.x, size.y);
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = LINE_DASH_OFFSET;
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, size.x, size.y);
    }

    pasteSelection(ctx: CanvasRenderingContext2D): Command {
        this.isPreview = ctx === this.drawingService.previewCtx;
        const command = new RectangleSelectionCommand(
            ctx,
            { ...this },
            { x: this.originalDimension.x, y: this.originalDimension.y } as Vec2,
            { x: this.dimension.x, y: this.dimension.y } as Vec2,
            { x: this.selectionPos.x, y: this.selectionPos.y } as Vec2,
            { vertical: this.hasFlipped.vertical, horizontal: this.hasFlipped.horizontal } as Record<MirrorDirection, boolean>,
            this.isPreview,
        );
        command.do();
        return command;
    }
}
