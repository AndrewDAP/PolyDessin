import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionResizeService } from '@app/services/tools/selection/resize/selection-resize.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

const diffBetweenVec2 = (lastV: Vec2, newV: Vec2): Vec2 => {
    return { x: newV.x - lastV.x, y: newV.y - lastV.y } as Vec2;
};

@Injectable({
    providedIn: 'root',
})
export abstract class SelectionBehaviourService extends SelectionResizeService {
    pathData: Vec2[];

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
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        this.selectionPosOnMouseDown = this.selectionPos;
        this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
        this.lastMousePos = this.mouseDownCoord;
        switch (this.state) {
            case State.OFF: {
                this.undoRedoService.undoRedoDisable = true;
                this.processMouseDownOFF(event);
                break;
            }
            case State.IDLE: {
                if (this.insidePreview()) {
                    this.state = State.MOVE;
                } else {
                    this.applyToBase();
                    this.drawOG = true;
                    this.clipCommand = false;
                    this.mouseDown = false;
                }
                break;
            }
            case State.SE: {
                this.start = { x: this.selectionPos.x, y: this.selectionPos.y };
                break;
            }
            case State.SW: {
                this.start = { x: this.selectionPos.x + this.dimension.x, y: this.selectionPos.y };
                break;
            }
            case State.NE: {
                this.start = { x: this.selectionPos.x, y: this.selectionPos.y + this.dimension.y };
                break;
            }

            case State.NW: {
                this.start = { x: this.selectionPos.x + this.dimension.x, y: this.selectionPos.y + this.dimension.y };
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown || event.button !== MouseButton.Left) return;
        this.mouseDown = false;
        switch (this.state) {
            case State.OFF: {
                if (this.dimension.x > 0 && this.dimension.y > 0) {
                    this.processMouseUpOFF();
                    this.changeState(State.IDLE);
                    this.isActive.next(true);
                    this.undoRedoService.undoRedoDisable = true;
                    this.setAnchors();
                    this.drawOG = true;
                    this.clipCommand = false;
                }
                break;
            }
            case State.MOVE: {
                this.changeState(State.IDLE);
                this.undoRedoService.undoRedoDisable = true;
                this.setAnchors();
                break;
            }
            case State.IDLE: {
                this.changeState(State.OFF);
                this.undoRedoService.undoRedoDisable = false;
                break;
            }
            default: {
                this.ratioDimension = { x: this.dimension.x, y: this.dimension.y };
                this.changeState(State.IDLE);
                this.setAnchors();
            }
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.oldMousePos = this.lastMousePos;
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        switch (this.state) {
            case State.OFF: {
                this.drawPreview();
                break;
            }
            case State.MOVE: {
                if (this.mouseDown) {
                    if (this.isMagnetActive) {
                        this.moveSelectionMagnet();
                    } else {
                        const offSet = diffBetweenVec2(this.oldMousePos, this.lastMousePos);
                        this.movePreview(offSet);
                        this.moveSelection();
                    }
                }
                break;
            }
            case State.IDLE:
                break;

            default: {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                (this.functionMap.get(this.state) as () => void)();
                this.pasteSelection(this.drawingService.previewCtx);
                break;
            }
        }
    }

    onKeyDownShift(): void {
        this.isEven = true;
        if (this.state === State.OFF) {
            this.processShift();
        }
    }

    onKeyUpShift(): void {
        this.isEven = false;
        if (this.state === State.OFF) {
            this.processShift();
        }
    }

    onKeyDownEscape(): void {
        if (this.state === State.OFF) {
            this.processEscape();
            this.resetSelection();
        } else {
            this.applyToBase();
            this.drawOG = true;
            this.clipCommand = false;
        }
    }

    onKeyDownDelete(): void {
        if (this.state !== State.OFF) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.deleteShape();
            this.resetSelection();
            this.isActive.next(false);
            this.mouseDown = false;
            this.drawOG = true;
            this.clearPath();
        }
    }

    extractImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.placeSelection();
        this.content = this.drawingService.baseCtx.getImageData(this.selectionPos.x, this.selectionPos.y, this.dimension.x, this.dimension.y);
        this.pasteSelection(this.drawingService.previewCtx);
    }

    moveSelectionMagnet(): void {
        const injectionFromMouse = diffBetweenVec2(this.mouseDownCoord, this.lastMousePos);
        const newPosition = {
            x: this.selectionPosOnMouseDown.x + injectionFromMouse.x,
            y: this.selectionPosOnMouseDown.y + injectionFromMouse.y,
        };
        this.selectionPos = newPosition;
        const pos = this.changePositionReference();
        this.movePreview(diffBetweenVec2(pos, this.gridService.findNearestColAndRow(pos)));
        this.moveSelection();
    }

    setAnchors(): void {
        this.anchors = {
            TL: { x: this.selectionPos.x, y: this.selectionPos.y },
            BR: { x: this.selectionPos.x + this.dimension.x, y: this.selectionPos.y + this.dimension.y },
        };
        this.ogAnchors = {
            TL: { x: this.anchors.TL.x, y: this.anchors.TL.y },
            BR: { x: this.anchors.BR.x, y: this.anchors.BR.y },
        };
    }

    //  Functions will be implemented in inherinting classes
    // tslint:disable: no-empty
    abstract processMouseDownOFF(event: MouseEvent): void;
    abstract processMouseUpOFF(): void;
    abstract processShift(): void;
    abstract processEscape(): void;
    abstract deleteShape(): void;
    abstract drawPreview(): void;
    abstract placeSelection(): void;
}
