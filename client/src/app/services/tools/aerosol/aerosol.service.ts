import { Injectable } from '@angular/core';
import { DrawAerosolCommand } from '@app/classes/commands/draw-aerosol-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_DROPLET_SIZE, DEFAULT_DROPLET_SPEED, MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

const SECOND = 1000;

@Injectable({
    providedIn: 'root',
})
export class AerosolService extends Tool {
    dropletSize: number = DEFAULT_DROPLET_SIZE;
    dropletSpeed: number = DEFAULT_DROPLET_SPEED;
    dropletPosition: Vec2[] = [];
    timer: ReturnType<typeof setInterval>;
    constructor(
        protected drawingService: DrawingService,
        private colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
        this.toolsInfoService.getSizeOfDroplet().subscribe((size: number) => {
            this.dropletSize = size;
        });
        this.toolsInfoService.getSpeedOfDroplet().subscribe((speed: number) => {
            this.dropletSpeed = speed;
        });
        this.toolsInfoService.getSizeOf(ToolType.aerosol).subscribe((size: number) => {
            this.size = size;
        });
        changingToolsService.getTool().subscribe(() => {
            clearInterval(this.timer);
        });
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
            this.timer = setInterval(this.draw.bind(this), SECOND / this.dropletSpeed);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && event.button === MouseButton.Left) {
            this.mouseDown = false;
            this.undoRedoService.addCommand(this.drawPath());
            clearInterval(this.timer);
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        if (this.mouseDown) this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
    }
    // math coming from https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
    draw(): void {
        this.drawingService.previewCtx.fillStyle = this.colorService.primaryColor.hsla();
        const r = (this.size / 2) * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const xPosition = this.mouseDownCoord.x + r * Math.cos(theta);
        const yPosition = this.mouseDownCoord.y + r * Math.sin(theta);
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.arc(xPosition, yPosition, this.dropletSize / 2, 0, 2 * Math.PI);
        this.drawingService.previewCtx.fill();
        this.dropletPosition.push({ x: xPosition, y: yPosition } as Vec2);
    }

    drawPath(): DrawAerosolCommand {
        const command = new DrawAerosolCommand({ ...this }, this.colorService.primaryColor.hsla(), this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        command.do();
        this.clearPath();
        return command;
    }

    clearPath(): void {
        this.dropletPosition = [];
    }
}
