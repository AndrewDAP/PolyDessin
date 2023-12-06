import { Injectable } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export abstract class SelectionShapeService extends SelectionBehaviourService {
    protected isPreview: boolean = false;

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

    processMouseDownOFF(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
    }

    processMouseUpOFF(): void {
        this.extractImage();
    }

    processShift(): void {
        if (this.mouseDown) {
            if (this.state === State.OFF) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawPreview();
            }
        }
    }

    processEscape(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    placeSelection(): void {
        const offSet = { x: 0, y: 0 };
        if (this.isEven) {
            const minSide = Math.min(this.dimension.x, this.dimension.y);
            offSet.x = this.mouseDownCoord.x - minSide - this.lastMousePos.x;
            offSet.y = this.mouseDownCoord.y - minSide - this.lastMousePos.y;
        }
        this.selectionPos = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y };
        if (this.lastMousePos.x < this.mouseDownCoord.x) {
            this.selectionPos.x = this.lastMousePos.x + offSet.x;
        }
        if (this.lastMousePos.y < this.mouseDownCoord.y) {
            this.selectionPos.y = this.lastMousePos.y + offSet.y;
        }
        this.originalPos = { x: this.selectionPos.x, y: this.selectionPos.y };
        this.originalDimension = { x: this.dimension.x, y: this.dimension.y };
        this.ratioDimension = { x: this.dimension.x, y: this.dimension.y };
    }

    adjustEdge(): void {
        if (this.lastMousePos.x < 0) {
            this.lastMousePos.x = 0;
        }
        if (this.lastMousePos.x > this.canvasSize.x) {
            this.lastMousePos.x = this.canvasSize.x;
        }
        if (this.lastMousePos.y < 0) {
            this.lastMousePos.y = 0;
        }
        if (this.lastMousePos.y > this.canvasSize.y) {
            this.lastMousePos.y = this.canvasSize.y;
        }
    }
}
