import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionLogicService } from '@app/services/tools/selection/logic/selection-logic.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export abstract class SelectionResizeService extends SelectionLogicService {
    functionMap: Map<State, () => void>;
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
        this.initFunctionMap();
    }

    private moveN(): void {
        if (this.flipToSouth(State.S)) return;
        this.selectionPos = { x: this.anchors.TL.x, y: this.lastMousePos.y };
        this.dimension.y = this.anchors.BR.y - this.lastMousePos.y;
    }

    private moveS(): void {
        if (this.flipToNorth(State.N)) return;
        this.dimension.y = this.lastMousePos.y - this.anchors.TL.y;
    }

    private moveE(): void {
        if (this.flipToWest(State.W)) return;
        this.dimension.x = this.lastMousePos.x - this.anchors.TL.x;
    }

    private moveW(): void {
        if (this.flipToEast(State.E)) return;
        this.selectionPos = { x: this.lastMousePos.x, y: this.anchors.TL.y };
        this.dimension.x = this.anchors.BR.x - this.lastMousePos.x;
    }

    private moveSE(): void {
        if (this.flipToNorth(State.NE) || this.flipToWest(State.SW)) return;
        this.selectionPos = { x: this.anchors.TL.x, y: this.anchors.TL.y };
        this.dimension = { x: this.lastMousePos.x - this.anchors.TL.x, y: this.lastMousePos.y - this.anchors.TL.y };
        const ogDim = { x: Math.abs(this.ogAnchors.TL.x - this.ogAnchors.BR.x), y: Math.abs(this.ogAnchors.TL.y - this.ogAnchors.BR.y) };
        const end = { x: this.start.x + ogDim.x, y: this.start.y + ogDim.y };
        if (this.isEven) {
            if (this.isBelow(this.start, end, this.lastMousePos)) {
                this.dimension.y = (this.ratioDimension.y / this.ratioDimension.x) * this.dimension.x;
            } else {
                this.dimension.x = (this.ratioDimension.x / this.ratioDimension.y) * this.dimension.y;
            }
        }
    }

    private moveSW(): void {
        if (this.flipToNorth(State.NW) || this.flipToEast(State.SE)) return;
        this.selectionPos = { x: this.lastMousePos.x, y: this.anchors.TL.y };
        this.dimension = { x: this.anchors.BR.x - this.selectionPos.x, y: this.lastMousePos.y - this.anchors.TL.y };
        const ogDim = { x: Math.abs(this.ogAnchors.TL.x - this.ogAnchors.BR.x), y: Math.abs(this.ogAnchors.TL.y - this.ogAnchors.BR.y) };
        const end = { x: this.start.x - ogDim.x, y: this.start.y + ogDim.y };
        if (this.isEven) {
            if (this.isBelow(this.start, end, this.lastMousePos)) {
                this.dimension.y = (this.ratioDimension.y / this.ratioDimension.x) * this.dimension.x;
            } else {
                this.dimension.x = (this.ratioDimension.x / this.ratioDimension.y) * this.dimension.y;
                this.selectionPos.x = this.anchors.BR.x - this.dimension.x;
            }
        }
    }

    private moveNE(): void {
        if (this.flipToSouth(State.SE) || this.flipToWest(State.NW)) return;
        this.selectionPos = { x: this.anchors.TL.x, y: this.lastMousePos.y };
        this.dimension = { x: this.lastMousePos.x - this.anchors.TL.x, y: this.anchors.BR.y - this.lastMousePos.y };
        const ogDim = { x: Math.abs(this.ogAnchors.TL.x - this.ogAnchors.BR.x), y: Math.abs(this.ogAnchors.TL.y - this.ogAnchors.BR.y) };
        const end = { x: this.start.x + ogDim.x, y: this.start.y - ogDim.y };
        if (this.isEven) {
            if (this.isBelow(this.start, end, this.lastMousePos)) {
                this.dimension.y = (this.ratioDimension.y / this.ratioDimension.x) * this.dimension.x;
                this.selectionPos.y = this.anchors.BR.y - this.dimension.y;
            } else {
                this.dimension.x = (this.ratioDimension.x / this.ratioDimension.y) * this.dimension.y;
            }
        }
    }

    private moveNW(): void {
        if (this.flipToSouth(State.SW) || this.flipToEast(State.NE)) return;
        this.selectionPos = { x: this.lastMousePos.x, y: this.lastMousePos.y };
        this.dimension = { x: this.anchors.BR.x - this.lastMousePos.x, y: this.anchors.BR.y - this.lastMousePos.y };
        const ogDim = { x: Math.abs(this.ogAnchors.TL.x - this.ogAnchors.BR.x), y: Math.abs(this.ogAnchors.TL.y - this.ogAnchors.BR.y) };
        const end = { x: this.start.x - ogDim.x, y: this.start.y - ogDim.y };
        if (this.isEven) {
            if (this.isBelow(this.start, end, this.lastMousePos)) {
                this.dimension.y = (this.ratioDimension.y / this.ratioDimension.x) * this.dimension.x;
                this.selectionPos.y = this.anchors.BR.y - this.dimension.y;
            } else {
                this.dimension.x = (this.ratioDimension.x / this.ratioDimension.y) * this.dimension.y;
                this.selectionPos.x = this.anchors.BR.x - this.dimension.x;
            }
        }
    }

    flipToNorth(targetState: State): boolean {
        if (this.lastMousePos.y < this.anchors.TL.y) {
            this.state = targetState;
            this.hasFlipped.horizontal = !this.hasFlipped.horizontal;
            this.anchors.BR.y = this.anchors.TL.y;
            return true;
        }
        return false;
    }

    flipToSouth(targetState: State): boolean {
        if (this.lastMousePos.y > this.anchors.BR.y) {
            this.state = targetState;
            this.hasFlipped.horizontal = !this.hasFlipped.horizontal;
            this.anchors.TL.y = this.anchors.BR.y;
            this.selectionPos.y = this.anchors.TL.y;
            return true;
        }
        return false;
    }

    flipToEast(targetState: State): boolean {
        if (this.lastMousePos.x > this.anchors.BR.x) {
            this.state = targetState;
            this.hasFlipped.vertical = !this.hasFlipped.vertical;
            this.anchors.TL.x = this.anchors.BR.x;
            this.selectionPos.x = this.anchors.TL.x;
            return true;
        }
        return false;
    }

    flipToWest(targetState: State): boolean {
        if (this.lastMousePos.x < this.anchors.TL.x) {
            this.state = targetState;
            this.hasFlipped.vertical = !this.hasFlipped.vertical;
            this.anchors.BR.x = this.anchors.TL.x;
            return true;
        }
        return false;
    }

    isBelow(start: Vec2, end: Vec2, current: Vec2): boolean {
        const d: Vec2 = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
        const m: Vec2 = {
            x: current.x - start.x,
            y: current.y - start.y,
        };
        const cross = d.x * m.y - d.y * m.x;
        let below = cross > 0;
        if (d.x !== 0) {
            if (d.y / d.x < 0) {
                below = !below;
            }
        }
        return below;
    }

    private initFunctionMap(): void {
        this.functionMap = new Map<State, () => void>([
            [State.N, () => this.moveN()],
            [State.E, () => this.moveE()],
            [State.S, () => this.moveS()],
            [State.W, () => this.moveW()],
            [State.SE, () => this.moveSE()],
            [State.SW, () => this.moveSW()],
            [State.NW, () => this.moveNW()],
            [State.NE, () => this.moveNE()],
        ]);
    }
}
