import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

const WAIT_TIME_BEFORE_CLICK = 250;

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    lastMousePos: Vec2 = { x: 0, y: 0 };
    shiftIsDown: boolean = false;
    doubleClick: boolean = false;
    withJunction: boolean = false;
    clickCount: number = 0;

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        protected colorService: ColorService,
        protected lineLogicService: LineLogicService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOf(ToolType.line).subscribe((size: number) => {
            this.size = size;
        });
        lineLogicService = new LineLogicService(drawingService, colorService, resizeService, toolsInfoService, changingToolsService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;

        this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
        this.clickCount++;
        setTimeout(() => {
            if (this.clickCount > 1 && this.lineLogicService.pathData.length > 0) {
                this.doubleClick = true;
                this.onMouseDoubleClick(event);
            } else {
                this.doubleClick = false;
            }
            if (this.clickCount === 1 && !this.doubleClick) {
                this.lineLogicService.processClick(this.mouseDownCoord, this.shiftIsDown);
            }
            this.clickCount = 0;
        }, WAIT_TIME_BEFORE_CLICK);
    }

    onMouseDoubleClick(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
        let lineLastPoint = this.mouseDownCoord;
        if (this.shiftIsDown) {
            lineLastPoint = this.lineLogicService.alignTo45DegreeAngle(
                this.lineLogicService.pathData[this.lineLogicService.pathData.length - 1],
                lineLastPoint,
            );
        }
        if (this.lineLogicService.canConnectToStart(this.mouseDownCoord)) {
            lineLastPoint = this.lineLogicService.pathData[0];
        }
        this.lineLogicService.pathData.push(lineLastPoint);
        this.applyToBase();
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        if (this.lineLogicService.pathData.length > 0) {
            this.lineLogicService.updatePreview(this.lastMousePos, this.shiftIsDown);
        }
    }

    onKeyDownEscape(): void {
        this.lineLogicService.processEscape();
        this.undoRedoService.undoRedoDisable = false;
    }

    onKeyDownBackSpace(): void {
        this.lineLogicService.processBackSpace(this.lastMousePos, this.shiftIsDown);
    }

    onKeyDownShift(): void {
        this.shiftIsDown = true;
        this.lineLogicService.processShift(this.lastMousePos, this.shiftIsDown);
    }

    onKeyUpShift(): void {
        this.shiftIsDown = false;
        this.lineLogicService.processShift(this.lastMousePos, this.shiftIsDown);
    }

    applyToBase(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.undoRedoService.addCommand(this.lineLogicService.drawPath(this.drawingService.baseCtx));
        this.lineLogicService.clearPath();
    }
}
