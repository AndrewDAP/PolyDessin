import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { DrawStamp } from '@app/classes/commands/draw-stamp';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ANGLE_MAX_VALUE, MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

const DEFAULT_RATIO_VALUE = 1;
const DEFAULT_ANGLE = 0;
const DEFAULT_ANGLE_CHANGE = 15;
const NUMBER_OF_STAMP = 6;

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    ratio: number = DEFAULT_RATIO_VALUE;
    angle: number = DEFAULT_ANGLE;
    stampChoice: number = 0;
    altIsDown: boolean = false;
    lastMousePos: Vec2 = { x: 0, y: 0 };

    bindingStampChoiceData: Map<number, HTMLImageElement> = new Map();

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
        private keyEventService: KeyEventService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.keyEventService.getKeyDownEvent('Alt').subscribe(() => {
            this.altIsDown = true;
        });

        this.keyEventService.getKeyUpEvent('Alt').subscribe(() => {
            this.altIsDown = false;
        });

        this.fetchImage();
    }

    fetchImage(): void {
        for (let i = 0; i < NUMBER_OF_STAMP; i++) {
            const img = new Image();
            img.src = '../../../assets/stamp/' + i + '.png';
            this.bindingStampChoiceData.set(i, img);
        }
    }

    onMouseDown(mouseEvent: MouseEvent): void {
        this.mouseDown = mouseEvent.button === MouseButton.Left;

        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(mouseEvent, this.left, this.top);
            this.undoRedoService.addCommand(this.drawStamp(this.mouseDownCoord, this.drawingService.baseCtx));
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.insideCanvas(this.lastMousePos)) {
            this.drawStamp(this.lastMousePos, this.drawingService.previewCtx);
        }
    }

    onWheelEvent(wheelEvent: WheelEvent): void {
        const delta = this.altIsDown ? 1 : DEFAULT_ANGLE_CHANGE;
        wheelEvent.deltaY > 0
            ? (this.angle = (this.angle + delta) % ANGLE_MAX_VALUE)
            : (this.angle = this.angle - delta < 0 ? ANGLE_MAX_VALUE - delta : this.angle - delta);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawStamp(this.lastMousePos, this.drawingService.previewCtx);
    }

    drawStamp(position: Vec2, ctx: CanvasRenderingContext2D): Command {
        const command = new DrawStamp(this.bindingStampChoiceData.get(this.stampChoice) as HTMLImageElement, { ...this }, position, ctx);
        command.do();
        return command;
    }

    insideCanvas(position: Vec2): boolean {
        return (
            this.lastMousePos.x < this.drawingService.canvas.width &&
            this.lastMousePos.y < this.drawingService.canvas.height &&
            this.lastMousePos.x > 0 &&
            this.lastMousePos.y > 0
        );
    }
}
