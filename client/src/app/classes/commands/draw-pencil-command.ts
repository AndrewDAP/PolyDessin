import { LINE } from '@app/const';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { Command } from './command';

export class DrawPencilCommand implements Command {
    constructor(public pencilService: PencilService, public color: string, public ctx: CanvasRenderingContext2D) {}

    do(): void {
        this.ctx.setLineDash(LINE);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.pencilService.size;
        this.ctx.beginPath();
        for (const point of this.pencilService.pathData) {
            this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
    }
}
