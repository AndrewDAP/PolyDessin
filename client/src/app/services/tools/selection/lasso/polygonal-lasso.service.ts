import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { PolyLassoSelectionCommand } from '@app/classes/commands/poly-lasso-selection-command';
import { Segments } from '@app/classes/segments';
import { Vec2 } from '@app/classes/vec2';
import { LINE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export abstract class PolygonalLassoService extends SelectionBehaviourService {
    isPreview: boolean = false;
    previousPathData: Vec2[];
    pathData: Vec2[];
    intersectsFirst: boolean = false;
    intersectsOthers: boolean = false;
    closed: boolean = false;
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        protected keyEventService: KeyEventService,
        protected selectionStateService: SelectionStateService,
        public lineLogicService: LineLogicService,
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
        lineLogicService = new LineLogicService(drawingService, colorService, resizeService, toolsInfoService, changingToolsService);
        this.selectionMoveService = new SelectionMoveService();
        this.toolsInfoService.getSizeOf(ToolType.lassoPolygonal).subscribe((size) => {
            this.size = size;
        });
    }

    processMouseDownOFF(event: MouseEvent): void {
        const pathData = this.lineLogicService.pathData;
        let samePos = false;
        let segmentEnd = this.lastMousePos as Vec2;
        const lastDown = pathData[pathData.length - 1];

        if (pathData.length > 0) {
            samePos = segmentEnd.x - lastDown.x === 0 && segmentEnd.y - lastDown.y === 0;
            if (this.isEven) {
                segmentEnd = this.lineLogicService.alignTo45DegreeAngle(lastDown, this.lastMousePos);
            }
        }

        if (!samePos) {
            if (pathData.length > 2 && this.lineLogicService.canConnectToStart(this.lastMousePos) && !this.intersectsOthers) {
                this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
                this.lineLogicService.pathData.push(pathData[0] as Vec2);
                this.pathData = [...this.lineLogicService.pathData] as Vec2[];
                this.extractImage();
                this.closed = true;
            } else if (!this.intersectsOthers && !this.intersectsFirst) {
                this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
                this.lineLogicService.processClick(this.mouseDownCoord, this.isEven);
            }
        }
    }

    processMouseUpOFF(): void {
        this.intersectsFirst = false;
        this.intersectsOthers = false;
        this.changeState(State.IDLE);
        this.isActive.next(true);
        this.undoRedoService.undoRedoDisable = true;
    }

    processShift(): void {
        this.lineLogicService.processShift(this.lastMousePos, this.isEven);
    }

    processEscape(): void {
        this.clearPath();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.closed = false;
        this.intersectsFirst = false;
        this.intersectsOthers = false;
    }

    onKeyDownBackSpace(): void {
        if (this.state === State.OFF) {
            this.lineLogicService.processBackSpace(this.lastMousePos, this.isEven);
        }
    }

    placeSelection(): void {
        const pathData = this.lineLogicService.pathData as Vec2[];
        const minCoord = { x: pathData[0].x, y: pathData[0].y };
        const maxCoord = { x: pathData[0].x, y: pathData[0].y };
        for (const coord of pathData) {
            if (coord.x < minCoord.x) {
                minCoord.x = coord.x;
            } else if (coord.x > maxCoord.x) {
                maxCoord.x = coord.x;
            }
            if (coord.y < minCoord.y) {
                minCoord.y = coord.y;
            } else if (coord.y > maxCoord.y) {
                maxCoord.y = coord.y;
            }
        }
        this.selectionPos = { x: minCoord.x, y: minCoord.y };
        this.originalPos = { x: minCoord.x, y: minCoord.y };
        this.dimension = { x: maxCoord.x - minCoord.x, y: maxCoord.y - minCoord.y };
        this.originalDimension = { x: this.dimension.x, y: this.dimension.y };
        this.ratioDimension = { x: this.dimension.x, y: this.dimension.y };
    }

    deleteShape(): void {
        if (this.clipCommand) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        } else {
            if (this.lineLogicService.pathData.length !== 0) this.previousPathData = [...this.lineLogicService.pathData];
            const command = new PolyLassoSelectionCommand(
                this.drawingService.baseCtx,
                { ...this },
                { x: this.dimension.x, y: this.dimension.y } as Vec2,
                { x: this.originalDimension.x, y: this.originalDimension.y } as Vec2,
                { x: this.selectionPos.x, y: this.selectionPos.y } as Vec2,
                { x: this.originalPos.x, y: this.originalPos.y } as Vec2,
                false,
                this.lineLogicService.pathData.length === 0 ? (this.previousPathData as Vec2[]) : ([...this.lineLogicService.pathData] as Vec2[]),
                { vertical: this.hasFlipped.vertical, horizontal: this.hasFlipped.horizontal },
                true,
            );
            command.do().finally(() => {
                this.clearPath();
                this.closed = false;
                this.intersectsFirst = false;
                this.intersectsOthers = false;
            });
            this.undoRedoService.addCommand(command);
        }
    }

    clearPath(): void {
        this.pathData = [];
        this.lineLogicService.clearPath();
    }

    drawPreview(): void {
        const length = this.lineLogicService.pathData.length;
        if (length > 0 && !this.closed) {
            let mousePos = this.lastMousePos;
            if (this.isEven) {
                mousePos = this.lineLogicService.alignTo45DegreeAngle(this.lineLogicService.pathData[length - 1], mousePos);
            }
            this.lineLogicService.updatePreview(mousePos, this.isEven);
            if (length > 1) {
                this.intersectsOthers = this.intersectsPath();
            }
            if (this.intersectsOthers || (this.intersectsFirst && !this.lineLogicService.canConnectToStart(mousePos))) {
                this.drawInvalidCursor();
            }
        }
    }

    pasteSelection(ctx: CanvasRenderingContext2D): Command {
        this.isPreview = ctx === this.drawingService.previewCtx;
        if (this.lineLogicService.pathData.length !== 0) this.previousPathData = [...this.lineLogicService.pathData];
        const command = new PolyLassoSelectionCommand(
            ctx,
            { ...this },
            { x: this.dimension.x, y: this.dimension.y } as Vec2,
            { x: this.originalDimension.x, y: this.originalDimension.y } as Vec2,
            { x: this.selectionPos.x, y: this.selectionPos.y } as Vec2,
            { x: this.originalPos.x, y: this.originalPos.y } as Vec2,
            this.isPreview,
            this.lineLogicService.pathData.length === 0 ? (this.previousPathData as Vec2[]) : ([...this.lineLogicService.pathData] as Vec2[]),
            { vertical: this.hasFlipped.vertical, horizontal: this.hasFlipped.horizontal },
            false,
        );
        command.do().finally(() => {
            if (!this.isPreview && !this.clipCommand) {
                this.clearPath();
                this.closed = false;
                this.intersectsFirst = false;
                this.intersectsOthers = false;
            }
        });
        return command;
    }

    drawInvalidCursor(): void {
        const pCtx = this.drawingService.previewCtx;
        const offSet = 10;
        const width = 5;
        pCtx.save();
        pCtx.beginPath();
        pCtx.strokeStyle = 'red';
        pCtx.lineWidth = width;
        pCtx.setLineDash(LINE);
        pCtx.moveTo(this.lastMousePos.x - offSet, this.lastMousePos.y - offSet);
        pCtx.lineTo(this.lastMousePos.x + offSet, this.lastMousePos.y + offSet);
        pCtx.moveTo(this.lastMousePos.x + offSet, this.lastMousePos.y - offSet);
        pCtx.lineTo(this.lastMousePos.x - offSet, this.lastMousePos.y + offSet);
        pCtx.stroke();
        pCtx.restore();
    }

    intersectsPath(): boolean {
        const pathData = this.lineLogicService.pathData;
        const currentSegmentStart = pathData[pathData.length - 1];
        let currentSegmentEnd = this.lastMousePos;
        this.intersectsFirst = false;

        if (this.isEven) {
            currentSegmentEnd = this.lineLogicService.alignTo45DegreeAngle(currentSegmentStart, this.lastMousePos);
            // Check if segment would intersect when trying to close the shape
            if (this.lineLogicService.canConnectToStart(this.lastMousePos)) {
                for (let i = 1; i < pathData.length - 2; i++) {
                    if (Segments.segmentsIntersect(currentSegmentStart, this.lastMousePos, pathData[i], pathData[i + 1])) {
                        return true;
                    }
                }
            }
        }

        // Unique case for the last drawn segment and active segment as they share a point and mathematically always intersect
        if (Segments.intersectsLast(currentSegmentEnd, pathData[pathData.length - 2], currentSegmentStart)) {
            return true;
        }

        // Check if current segment intersects first drawn segment, used for closing logic
        if (pathData.length > 2 && Segments.segmentsIntersect(currentSegmentStart, currentSegmentEnd, pathData[0], pathData[1])) {
            this.intersectsFirst = true;
        }

        // Check if you cross any segment except the lasts
        for (let i = 1; i < pathData.length - 2; i++) {
            if (Segments.segmentsIntersect(currentSegmentStart, currentSegmentEnd, pathData[i], pathData[i + 1])) {
                return true;
            }
        }
        return false;
    }
}
