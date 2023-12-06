import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { Command } from './command';

export class DrawEllipseCommand implements Command {
    offSet: Vec2;
    constructor(
        private ctx: CanvasRenderingContext2D,
        private ellipse: EllipseService,
        private drawPreview: boolean,
        private strokeColor: string,
        private fillColor: string,
    ) {
        this.offSet = {
            x: this.ellipse.lastMousePos.x - this.ellipse.mouseDownCoord.x,
            y: this.ellipse.lastMousePos.y - this.ellipse.mouseDownCoord.y,
        };
    }

    do(): void {
        if (this.ellipse.isEven) {
            const chosenSide = Math.min(Math.abs(this.offSet.x), Math.abs(this.offSet.y));
            this.offSet.x = chosenSide * Math.sign(this.offSet.x);
            this.offSet.y = chosenSide * Math.sign(this.offSet.y);
        }
        const radius = { x: Math.abs(this.offSet.x / 2), y: Math.abs(this.offSet.y / 2) };
        const center: Vec2 = {
            x: this.ellipse.mouseDownCoord.x + radius.x * Math.sign(this.offSet.x),
            y: this.ellipse.mouseDownCoord.y + radius.y * Math.sign(this.offSet.y),
        };

        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineJoin = 'miter';
        this.ctx.setLineDash(LINE);

        if (this.ellipse.withStroke) {
            const halfSize = this.ellipse.size / 2;
            radius.x -= halfSize;
            radius.y -= halfSize;
            if (radius.x < halfSize) radius.x = halfSize;

            if (radius.y < halfSize) radius.y = halfSize;

            if (Math.abs(this.offSet.x) < 2 * this.ellipse.size) {
                this.offSet.x = 2 * this.ellipse.size * Math.sign(this.offSet.x);
                center.x = this.ellipse.mouseDownCoord.x + this.ellipse.size * Math.sign(this.offSet.x);
            }
            if (Math.abs(this.offSet.y) < 2 * this.ellipse.size) {
                this.offSet.y = 2 * this.ellipse.size * Math.sign(this.offSet.y);
                center.y = this.ellipse.mouseDownCoord.y + this.ellipse.size * Math.sign(this.offSet.y);
            }
        }

        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);

        if (this.ellipse.withFill) this.ctx.fill();

        if (this.ellipse.withStroke) {
            this.ctx.lineWidth = this.ellipse.size;
            this.ctx.stroke();
        }

        if (this.drawPreview) this.drawPreviewContour();
    }

    drawPreviewContour(): void {
        this.ctx.lineWidth = PERIMETER_STROKE_SIZE;
        this.ctx.lineDashOffset = 0;
        this.ctx.setLineDash(DASH);
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(this.ellipse.mouseDownCoord.x, this.ellipse.mouseDownCoord.y, this.offSet.x, this.offSet.y);
        this.ctx.lineDashOffset = LINE_DASH_OFFSET;
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(this.ellipse.mouseDownCoord.x, this.ellipse.mouseDownCoord.y, this.offSet.x, this.offSet.y);
    }
}
