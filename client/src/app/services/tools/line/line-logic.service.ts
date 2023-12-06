import { Injectable } from '@angular/core';
import { DrawLineCommand } from '@app/classes/commands/draw-line-command';
import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE, PERIMETER_STROKE_SIZE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { ToolType } from '@app/tool-type';

const MAX_DISTANCE = 20;
// tslint:disable-next-line: no-magic-numbers
const ANGLE_22_5 = Math.PI / 8;
// tslint:disable-next-line: no-magic-numbers
const ANGLE_67_5 = ANGLE_22_5 * 3;
// tslint:disable-next-line: no-magic-numbers
const ANGLE_PROJECTION = Math.PI / 4;

@Injectable({
    providedIn: 'root',
})
export class LineLogicService {
    pathData: Vec2[] = [];
    status: Status;
    junctionSize: number = 0;
    withJunction: boolean = false;
    lineSize: number = PERIMETER_STROKE_SIZE;
    lineDash: number[] = DASH;
    activeTool: ToolType;
    color: string;

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected resizeService: ResizeService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
    ) {
        this.resizeService.getStatusSubject().subscribe((status: Status) => {
            this.status = status;
        });
        this.changingToolsService.getTool().subscribe((tool) => {
            this.activeTool = tool;
            this.color = 'black';
            if (tool === ToolType.line) {
                this.toolsInfoService.getSizeOf(ToolType.line).subscribe((size: number) => {
                    this.lineSize = size;
                });
                this.toolsInfoService.getShouldDrawJunction().subscribe((shouldDraw: boolean) => {
                    this.withJunction = shouldDraw;
                });
                this.toolsInfoService.getSizeOfJunction().subscribe((size: number) => {
                    this.junctionSize = size;
                });
                this.lineDash = LINE;
            } else {
                this.junctionSize = 0;
                this.withJunction = false;
                this.lineSize = PERIMETER_STROKE_SIZE;
                this.lineDash = DASH;
            }
        });
        this.clearPath();
    }

    processClick(mouseDownCoord: Vec2, shiftIsDown: boolean): void {
        if (shiftIsDown && this.pathData.length > 0) {
            mouseDownCoord = this.alignTo45DegreeAngle(this.pathData[this.pathData.length - 1], mouseDownCoord);
        }
        if (!this.insideCanvas(mouseDownCoord)) return;
        this.pathData.push(mouseDownCoord);
        const pCtx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(pCtx);
        this.drawPath(pCtx);
    }

    insideCanvas(coord: Vec2): boolean {
        return coord.x < this.drawingService.canvas.width && coord.x > 0 && coord.y < this.drawingService.canvas.height && coord.y > 0;
    }

    processEscape(): void {
        this.clearPath();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPath(this.drawingService.previewCtx);
    }

    processBackSpace(lastMousePos: Vec2, shiftIsDown: boolean): void {
        if (this.pathData.length > 1) {
            this.pathData.pop();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPath(this.drawingService.previewCtx);
            this.updatePreview(lastMousePos, shiftIsDown);
        }
    }

    processShift(lastMousePos: Vec2, shiftIsDown: boolean): void {
        if (this.pathData.length > 0) {
            this.updatePreview(lastMousePos, shiftIsDown);
        }
    }

    clearPath(): void {
        this.pathData = [];
    }

    updatePreview(lastMousePos: Vec2, shiftIsDown: boolean): void {
        const pCtx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(pCtx);
        this.drawPath(pCtx);
        let projection: Vec2 = lastMousePos;
        if (this.status === Status.OFF) {
            if (shiftIsDown) {
                projection = this.alignTo45DegreeAngle(this.pathData[this.pathData.length - 1], lastMousePos);
            }
            this.drawLine(pCtx, this.pathData[this.pathData.length - 1], projection);
        }
    }

    canConnectToStart(mousePos: Vec2): boolean {
        const firstDown = this.pathData[0];
        const distance = Math.sqrt(Math.pow(mousePos.x - firstDown.x, 2) + Math.pow(mousePos.y - firstDown.y, 2));
        return distance <= MAX_DISTANCE;
    }

    alignTo45DegreeAngle(lastPoint: Vec2, mousePosition: Vec2): Vec2 {
        const deltaY = lastPoint.y - mousePosition.y;
        const deltaX = mousePosition.x - lastPoint.x;
        const angle = Math.abs(Math.atan(deltaY / deltaX));
        if (angle < ANGLE_22_5) {
            return { x: lastPoint.x + deltaX, y: lastPoint.y };
        } else if (angle >= ANGLE_22_5 && angle <= ANGLE_67_5) {
            return { x: lastPoint.x + deltaX, y: lastPoint.y - Math.tan(ANGLE_PROJECTION) * Math.abs(deltaX) * Math.sign(deltaY) };
        }
        return { x: lastPoint.x, y: lastPoint.y - deltaY };
    }

    drawPath(ctx: CanvasRenderingContext2D): DrawLineCommand {
        if (this.activeTool === ToolType.line) this.color = this.colorService.primaryColor.hsla();
        const command: DrawLineCommand = new DrawLineCommand(ctx, { ...this }, this.color);
        command.do();
        return command;
    }

    drawLine(ctx: CanvasRenderingContext2D, origin: Vec2, destination: Vec2): void {
        if (this.activeTool === ToolType.line) this.color = this.colorService.primaryColor.hsla();
        new DrawLineCommand(ctx, { ...this }, this.color).drawLine(origin, destination);
    }
}
