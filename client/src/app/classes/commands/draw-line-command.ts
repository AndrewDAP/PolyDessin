import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE_DASH_OFFSET } from '@app/const';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { Command } from './command';

export class DrawLineCommand implements Command {
    constructor(public ctx: CanvasRenderingContext2D, public lineLogicService: LineLogicService, public color: string) {}
    do(): void {
        for (let i = 0; i < this.lineLogicService.pathData.length; i++) {
            if (this.lineLogicService.withJunction && this.lineLogicService.pathData.length > 0) {
                this.drawJunction(this.lineLogicService.pathData[i]);
            }
            if (i < this.lineLogicService.pathData.length - 1) {
                this.drawLine(this.lineLogicService.pathData[i], this.lineLogicService.pathData[i + 1]);
            }
        }
    }

    drawJunction(pos: Vec2): void {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.lineLogicService.junctionSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawLine(origin: Vec2, destination: Vec2): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.lineLogicService.lineSize;
        this.ctx.lineDashOffset = 0;
        this.ctx.setLineDash(this.lineLogicService.lineDash);
        this.ctx.beginPath();
        this.ctx.moveTo(origin.x, origin.y);
        this.ctx.lineTo(destination.x, destination.y);
        this.ctx.stroke();
        if (this.lineLogicService.lineDash === DASH) {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineDashOffset = LINE_DASH_OFFSET;
            this.ctx.beginPath();
            this.ctx.moveTo(origin.x, origin.y);
            this.ctx.lineTo(destination.x, destination.y);
            this.ctx.stroke();
        }
    }
}
