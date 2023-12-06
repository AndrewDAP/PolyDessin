import { Vec2 } from '@app/classes/vec2';
import { LINE } from '@app/const';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { Command } from './command';

export class DrawRectangleCommand implements Command {
    constructor(private ctx: CanvasRenderingContext2D, private rectangle: RectangleService, private strokeColor: string, private fillColor: string) {}

    do(): void {
        const dimension: Vec2 = {
            x: this.rectangle.lastMousePos.x - this.rectangle.mouseDownCoord.x,
            y: this.rectangle.lastMousePos.y - this.rectangle.mouseDownCoord.y,
        };
        if (Math.abs(dimension.x) < Math.abs(this.rectangle.size * 2)) {
            dimension.x = this.rectangle.size * 2 * Math.sign(dimension.x);
        }
        if (Math.abs(dimension.y) < Math.abs(this.rectangle.size * 2)) {
            dimension.y = this.rectangle.size * 2 * Math.sign(dimension.y);
        }
        if (this.rectangle.isEven) {
            const chosenSide = Math.min(Math.abs(dimension.x), Math.abs(dimension.y));
            dimension.x = chosenSide * Math.sign(dimension.x);
            dimension.y = chosenSide * Math.sign(dimension.y);
        }

        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineJoin = 'miter';
        this.ctx.setLineDash(LINE);

        if (this.rectangle.withFill) {
            this.ctx.fillRect(this.rectangle.mouseDownCoord.x, this.rectangle.mouseDownCoord.y, dimension.x, dimension.y);
        }
        if (this.rectangle.withStroke) {
            let offSetX = this.rectangle.size / 2;
            let offSetY = this.rectangle.size / 2;
            if (this.rectangle.lastMousePos.x < this.rectangle.mouseDownCoord.x) {
                offSetX = -offSetX;
            }
            if (this.rectangle.lastMousePos.y < this.rectangle.mouseDownCoord.y) {
                offSetY = -offSetY;
            }
            this.ctx.lineWidth = this.rectangle.size;
            this.ctx.strokeRect(
                this.rectangle.mouseDownCoord.x + offSetX,
                this.rectangle.mouseDownCoord.y + offSetY,
                dimension.x - 2 * offSetX,
                dimension.y - 2 * offSetY,
            );
        }
    }
}
