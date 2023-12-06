import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MagnetGrabHandle } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { ArrowDirection, SelectionMoveService, TIME_INITIAL } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject } from 'rxjs';

export const TRANSLATION_VALUE = 3;
const MOVE_INTERVAL = 100;
const MAGNET_TOTAL_ROW = 3;

export type MirrorDirection = 'vertical' | 'horizontal';

export type Anchor = {
    TL: Vec2;
    BR: Vec2;
};

export type Coordinate = {
    previous: Vec2;
    current: Vec2;
};

@Injectable({
    providedIn: 'root',
})
export abstract class SelectionLogicService extends Tool {
    selectionMoveService: SelectionMoveService;
    resizeOffset: Vec2 = { x: 0, y: 0 };
    // Top left corner where the selection was first sampled
    originalPos: Vec2 = { x: 0, y: 0 };
    // Current top left corner of the selection
    selectionPos: Vec2 = { x: 0, y: 0 };
    // Not used by selection service
    selectionPosOnMouseDown: Vec2 = { x: 0, y: 0 };
    // Position of the mouse at the beginning of the mouse move event
    oldMousePos: Vec2;
    // Current position of the mouse
    lastMousePos: Vec2;
    // Current dimension of the selection (width, height)
    dimension: Vec2 = { x: 0, y: 0 };
    // Either the originalDimension or the dimension of the latest mouseup
    ratioDimension: Vec2 = { x: 0, y: 0 };
    // The original dimension where the selection was first sampled
    originalDimension: Vec2 = { x: 0, y: 0 };

    anchors: Anchor;
    ogAnchors: Anchor;
    start: Vec2;

    state: State;
    isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    content: ImageData;
    imageBitmap: ImageBitmap;
    isEven: boolean;
    canvasSize: Vec2;
    activeTool: ToolType;
    isMagnetActive: boolean = false;
    magnetHandle: MagnetGrabHandle = MagnetGrabHandle.MiddleCenter;
    hasFlipped: Record<MirrorDirection, boolean>;
    drawOG: boolean = true;
    clipCommand: boolean = false;
    protected isSelectedAll: boolean = false;
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
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.resizeService.getCanvasSize().subscribe((canvasSize: Vec2) => {
            this.canvasSize = canvasSize;
        });
        this.selectionStateService.stateObserver().subscribe((state) => {
            this.state = state;
        });
        this.changingToolsService.getTool().subscribe((tool) => {
            this.activeTool = tool;
        });
        this.toolsInfoService.getMagnetActive().subscribe((magnetActive: boolean) => {
            this.isMagnetActive = magnetActive;
        });
        this.toolsInfoService.getMagnetHandle().subscribe((magnetHandleChoosen: MagnetGrabHandle) => {
            this.magnetHandle = magnetHandleChoosen;
        });
        this.isEven = false;
        this.hasFlipped = {
            vertical: false,
            horizontal: false,
        };
    }

    applyToBase(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.undoRedoService.addCommand(this.pasteSelection(this.drawingService.baseCtx));
        this.resetSelection();
    }

    movePreview(offset: Vec2): void {
        this.selectionPos.x += offset.x;
        this.selectionPos.y += offset.y;
    }

    insidePreview(): boolean {
        return (
            this.lastMousePos.x > this.selectionPos.x &&
            this.lastMousePos.x < this.selectionPos.x + this.dimension.x &&
            this.lastMousePos.y > this.selectionPos.y &&
            this.lastMousePos.y < this.selectionPos.y + this.dimension.y
        );
    }

    resetSelection(): void {
        this.selectionPos = { x: 0, y: 0 };
        this.originalPos = { x: 0, y: 0 };
        this.dimension = { x: 0, y: 0 };
        this.originalDimension = { x: 0, y: 0 };
        this.ratioDimension = { x: 0, y: 0 };
        this.anchors = {
            TL: { x: 0, y: 0 },
            BR: { x: 0, y: 0 },
        };
        this.ogAnchors = {
            TL: { x: 0, y: 0 },
            BR: { x: 0, y: 0 },
        };
        this.hasFlipped = {
            vertical: false,
            horizontal: false,
        };
        this.isEven = false;
        this.changeState(State.OFF);
        this.isActive.next(false);
        this.selectionMoveService.resetKeys();
        this.mouseDown = false;
        this.undoRedoService.undoRedoDisable = false;
        this.clearPath();
    }

    selectAll(): void {
        this.resetSelection();
        this.originalDimension.x = this.canvasSize.x;
        this.originalDimension.y = this.canvasSize.y;
        this.dimension = { x: this.originalDimension.x, y: this.originalDimension.y };
        this.ratioDimension = { x: this.originalDimension.x, y: this.originalDimension.y };
        this.isActive.next(true);
        this.content = this.drawingService.baseCtx.getImageData(this.selectionPos.x, this.selectionPos.y, this.dimension.x, this.dimension.y);
        this.pasteSelection(this.drawingService.previewCtx);
        this.changeState(State.IDLE);
    }

    moveSelection(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.pasteSelection(this.drawingService.previewCtx);
    }

    changeState(state: State): void {
        this.selectionStateService.changeState(state);
    }

    onKeyDownUpArrow(): void {
        this.onArrowDown('up');
    }

    onKeyDownDownArrow(): void {
        this.onArrowDown('down');
    }

    onKeyDownLeftArrow(): void {
        this.onArrowDown('left');
    }

    onKeyDownRightArrow(): void {
        this.onArrowDown('right');
    }

    onKeyUpUpArrow(): void {
        if (this.state === State.IDLE) {
            this.selectionMoveService.onArrowUp('up');
        }
    }

    onKeyUpDownArrow(): void {
        if (this.state === State.IDLE) {
            this.selectionMoveService.onArrowUp('down');
        }
    }

    onKeyUpLeftArrow(): void {
        if (this.state === State.IDLE) {
            this.selectionMoveService.onArrowUp('left');
        }
    }

    onKeyUpRightArrow(): void {
        if (this.state === State.IDLE) {
            this.selectionMoveService.onArrowUp('right');
        }
    }

    onArrowDown(key: ArrowDirection): void {
        if (this.state === State.IDLE) {
            if (this.selectionMoveService.verifyIfKeyHeld() === 0) {
                this.switchKeys(key);
                this.moveSelection();
                this.selectionMoveService.timeout = setTimeout(() => {
                    this.selectionMoveService.interval = setInterval(this.moveWithKeys.bind(this), MOVE_INTERVAL);
                }, TIME_INITIAL);
            }
            this.selectionMoveService.keysPressed[key] = true;
        }
    }

    moveWithKeys(): void {
        (Object.keys(this.selectionMoveService.keysPressed) as ArrowDirection[]).map((value: ArrowDirection) => {
            if (this.selectionMoveService.keysPressed[value]) {
                this.switchKeys(value);
            }
        });
        this.moveSelection();
    }

    switchKeys(key: ArrowDirection): void {
        let displacement: number = TRANSLATION_VALUE;
        const pos = this.changePositionReference();
        let moveVec2: Vec2 = { x: 0, y: 0 };
        switch (key as string) {
            case 'left': {
                if (this.isMagnetActive) {
                    displacement = Math.abs(this.gridService.lowerNearestMultiple(pos.x, this.gridService.canvasSquareSize) - pos.x);
                }
                moveVec2 = { x: -displacement, y: 0 };
                break;
            }
            case 'right': {
                if (this.isMagnetActive) {
                    displacement = Math.abs(this.gridService.upperNearestMultiple(pos.x, this.gridService.canvasSquareSize) - pos.x);
                }
                moveVec2 = { x: displacement, y: 0 };
                break;
            }
            case 'up': {
                if (this.isMagnetActive) {
                    displacement = Math.abs(this.gridService.lowerNearestMultiple(pos.y, this.gridService.canvasSquareSize) - pos.y);
                }
                moveVec2 = { x: 0, y: -displacement };
                break;
            }
            case 'down': {
                if (this.isMagnetActive) {
                    displacement = Math.abs(this.gridService.upperNearestMultiple(pos.y, this.gridService.canvasSquareSize) - pos.y);
                }
                moveVec2 = { x: 0, y: displacement };
                break;
            }
        }
        this.movePreview(moveVec2);
    }

    changePositionReference(): Vec2 {
        let xPosOfReference = this.selectionPos.x;
        let yPosOfReference = this.selectionPos.y;
        if (Math.floor(this.magnetHandle / MAGNET_TOTAL_ROW) === 1) {
            yPosOfReference += this.dimension.y / 2;
        } else if (Math.floor(this.magnetHandle / MAGNET_TOTAL_ROW) === 2) {
            yPosOfReference += this.dimension.y;
        }

        if (this.magnetHandle % MAGNET_TOTAL_ROW === 1) {
            xPosOfReference += this.dimension.x / 2;
        } else if (this.magnetHandle % MAGNET_TOTAL_ROW === 2) {
            xPosOfReference += this.dimension.x;
        }
        return { x: xPosOfReference, y: yPosOfReference } as Vec2;
    }

    abstract pasteSelection(ctx: CanvasRenderingContext2D): Command;
}
