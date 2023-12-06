import { Injectable } from '@angular/core';
import { DEFAULT_TOOL_SIZE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
@Injectable({
    providedIn: 'root',
})
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    size: number = DEFAULT_TOOL_SIZE;
    top: number = 0;
    left: number = 0;

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        this.changingToolsService.getTool().subscribe(() => {
            this.clearPath();
            this.mouseDown = false;
        });

        this.toolsInfoService.getNewDrawing().subscribe(() => {
            this.clearPath();
            this.mouseDown = false;
        });
    }

    onMouseDown(event: MouseEvent): void {}

    onMouseDoubleClick(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseMoveWindow(event: MouseEvent): void {}

    onMouseLeave(event: MouseEvent): void {}

    onMouseEnter(event: MouseEvent): void {}

    onWheelEvent(event: WheelEvent): void {}

    onKeyDownEscape(): void {}

    onKeyDownBackSpace(): void {}

    onKeyDownShift(): void {}

    onKeyUpShift(): void {}

    onKeyDownEnter(): void {}

    onKeyDownDelete(): void {}

    onKeyDownUpArrow(): void {}

    onKeyDownDownArrow(): void {}

    onKeyDownLeftArrow(): void {}

    onKeyDownRightArrow(): void {}

    onKeyUpUpArrow(): void {}

    onKeyUpDownArrow(): void {}

    onKeyUpLeftArrow(): void {}

    onKeyUpRightArrow(): void {}

    getPositionFromMouse(event: MouseEvent, left: number, top: number): Vec2 {
        return { x: event.clientX - left + this.resizeService.offsetLeft, y: event.clientY - top + this.resizeService.offsetTop };
    }

    setLeftAndTopOffsets(left: number, top: number): void {
        this.top = top;
        this.left = left;
    }

    clearPath(): void {}
}
