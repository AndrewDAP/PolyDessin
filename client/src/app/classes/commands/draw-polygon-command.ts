import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { Command } from './command';

export class DrawPolygonCommand implements Command {
    offSet: Vec2;
    center: Vec2;
    radius: Vec2;
    constructor(private ctx: CanvasRenderingContext2D, private polygon: PolygonService, private strokeColor: string, private fillColor: string) {
        this.offSet = {
            x: this.polygon.lastMousePos.x - this.polygon.mouseDownCoord.x,
            y: this.polygon.lastMousePos.y - this.polygon.mouseDownCoord.y,
        };

        const chosenSide = Math.min(Math.abs(this.offSet.x), Math.abs(this.offSet.y));
        this.offSet.x = chosenSide * Math.sign(this.offSet.x);
        this.offSet.y = chosenSide * Math.sign(this.offSet.y);

        this.radius = { x: Math.abs(this.offSet.x / 2), y: Math.abs(this.offSet.y / 2) };
        this.center = {
            x: this.polygon.mouseDownCoord.x + this.radius.x * Math.sign(this.offSet.x),
            y: this.polygon.mouseDownCoord.y + this.radius.y * Math.sign(this.offSet.y),
        };
    }

    do(): void {
        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineJoin = 'miter';
        this.ctx.setLineDash(LINE);

        this.ctx.beginPath();
        this.ctx.moveTo(this.center.x, this.center.y - this.radius.y);
        const angle = (Math.PI * 2) / this.polygon.sides;

        for (let i = 1; i < this.polygon.sides; i++) {
            this.ctx.lineTo(this.center.x - Math.sin(angle * i) * this.radius.y, this.center.y - Math.cos(angle * i) * this.radius.x);
        }

        if (this.polygon.withFill) {
            this.ctx.fill();
        }

        if (this.polygon.withStroke) {
            this.ctx.lineWidth = this.polygon.size;
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    drawPreviewContour(): void {
        let adjustment = 0;
        if (this.polygon.withStroke) {
            adjustment = 2 + Math.abs(this.polygon.size / 2 / Math.sin(((this.polygon.sides - 2) * Math.PI) / (2 * this.polygon.sides)));
        }
        this.ctx.lineWidth = PERIMETER_STROKE_SIZE;
        this.ctx.setLineDash(DASH);
        this.ctx.lineDashOffset = 0;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(this.center.x, this.center.y, this.radius.x + adjustment, this.radius.y + adjustment, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.lineDashOffset = LINE_DASH_OFFSET;
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();
        this.ctx.ellipse(this.center.x, this.center.y, this.radius.x + adjustment, this.radius.y + adjustment, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
}
