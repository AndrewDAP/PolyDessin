import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { Command } from './command';

export class ResizeCanvasCommand implements Command {
    constructor(private drawingService: DrawingService, private resizeService: ResizeService, private size: Vec2) {}

    do(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.resizeService.setCanvasSize(this.size);

        const oldColor = this.drawingService.baseCtx.fillStyle;
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(0, 0, this.size.x, this.size.y);
        this.drawingService.baseCtx.fillStyle = oldColor;

        this.drawingService.baseCtx.drawImage(this.drawingService.previewCanvas, 0, 0);
        this.resizeService.setPreviewCanvasSize(this.size);
    }
}
