import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';
import { State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    mode: Mode;
    content: ImageData | undefined;
    dimension: Vec2;
    originalDimension: Vec2;
    extractPos: Vec2 = { x: -1, y: -1 };
    originalPath: Vec2[] = [];
    validTool: boolean;
    lastMode: Mode;
    currentTool: ToolType;
    hasData: Subject<ImageData | undefined> = new Subject<ImageData | undefined>();
    hasFlipped: Record<MirrorDirection, boolean>;

    constructor(
        private drawingService: DrawingService,
        private keyEventService: KeyEventService,
        private changeSelectionService: ChangeSelectionService,
        private changingToolsService: ChangingToolsService,
        private undoRedoService: UndoRedoService,
    ) {
        this.changeSelectionService.modeObserver().subscribe((mode) => {
            this.mode = mode;
        });
        this.changingToolsService.getTool().subscribe((tool) => {
            this.currentTool = tool;
            this.validTool = tool === ToolType.rectangleSelection || tool === ToolType.ellipseSelection || tool === ToolType.lassoPolygonal;
        });
        this.keyEventService.getKeyDownEvent('c').subscribe((event) => {
            if (event.ctrlKey) this.copySelection();
        });
        this.keyEventService.getKeyDownEvent('v').subscribe((event) => {
            if (event.ctrlKey) this.pasteSelection();
        });
        this.keyEventService.getKeyDownEvent('x').subscribe((event) => {
            if (event.ctrlKey) this.cutSelection();
        });
        this.hasFlipped = {
            vertical: false,
            horizontal: false,
        };
    }

    contentObserver(): Observable<ImageData | undefined> {
        return (this.hasData as Subject<ImageData | undefined>).asObservable();
    }

    copySelection(): void {
        const selection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
        if (this.validTool && selection.state === State.IDLE) {
            this.extractProperties();
        }
    }

    pasteSelection(): void {
        if (this.content !== undefined) {
            const currentSelection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.validTool && this.mode === this.lastMode && currentSelection.state === State.IDLE) {
                const command = currentSelection.pasteSelection(this.drawingService.baseCtx);
                this.undoRedoService.addCommand(command);
            } else {
                switch (this.lastMode) {
                    case Mode.Rectangle: {
                        this.changingToolsService.setTool(ToolType.rectangleSelection);
                        break;
                    }
                    case Mode.Ellipse: {
                        this.changingToolsService.setTool(ToolType.ellipseSelection);
                        break;
                    }
                    case Mode.PolygonalLasso: {
                        this.changingToolsService.setTool(ToolType.lassoPolygonal);
                        break;
                    }
                }
            }
            currentSelection.resetSelection();
            const newSelection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
            this.setProperties();
            newSelection.pasteSelection(this.drawingService.previewCtx);
        }
    }

    cutSelection(): void {
        const selection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
        if (this.validTool && selection.state === State.IDLE) {
            this.extractProperties();
            selection.deleteShape();
            selection.resetSelection();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }

    setProperties(): void {
        const selection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
        this.undoRedoService.undoRedoDisable = true;
        selection.changeState(State.IDLE);
        selection.drawOG = false;
        selection.clipCommand = true;
        selection.isActive.next(true);
        selection.selectionPos = { x: 0, y: 0 };
        selection.originalPos = { x: this.extractPos.x, y: this.extractPos.y } as Vec2;
        if (this.content !== undefined) {
            selection.content = this.content as ImageData;
        }
        selection.dimension = { x: this.dimension.x, y: this.dimension.y } as Vec2;
        selection.ratioDimension = { x: this.dimension.x, y: this.dimension.y } as Vec2;
        selection.originalDimension = { x: this.originalDimension.x, y: this.originalDimension.y } as Vec2;
        selection.pathData = this.originalPath as Vec2[];
        if (this.lastMode === Mode.PolygonalLasso) {
            const lasso = this.changeSelectionService.selectionMap.get(this.mode) as PolygonalLassoService;
            lasso.lineLogicService.pathData = this.originalPath as Vec2[];
        }
        selection.hasFlipped = { vertical: this.hasFlipped.vertical, horizontal: this.hasFlipped.horizontal };
    }

    extractProperties(): void {
        const selection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService;
        this.dimension = { x: selection.ratioDimension.x, y: selection.ratioDimension.y } as Vec2;
        this.lastMode = this.mode;
        this.extractPos = { x: selection.originalPos.x, y: selection.originalPos.y } as Vec2;
        this.originalDimension = { x: selection.originalDimension.x, y: selection.originalDimension.y } as Vec2;
        this.hasFlipped = { vertical: selection.hasFlipped.vertical, horizontal: selection.hasFlipped.horizontal };
        if (this.currentTool === ToolType.lassoPolygonal && this.content !== selection.content) {
            this.copyPath(selection.pathData);
        }
        if (selection.content !== undefined) {
            const copiedData = new Uint8ClampedArray(selection.content.data);
            this.content = new ImageData(copiedData, selection.content.width, selection.content.height);
        }
        this.changeHasData();
        selection.changeState(State.IDLE);
    }

    copyPath(originalPath: Vec2[]): void {
        this.originalPath = [];
        for (const coord of originalPath) {
            this.originalPath.push({ x: coord.x, y: coord.y });
        }
    }

    changeHasData(): void {
        this.hasData.next({} as ImageData);
    }
}
