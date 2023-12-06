import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { Command } from './command';

export class EraseLineCommand implements Command {
    constructor(public eraser: EraserService, public ctx: CanvasRenderingContext2D) {}

    do(): void {
        const oldFillStyle = this.ctx.fillStyle;

        this.ctx.fillStyle = 'rgb(255, 255, 255)';

        this.ctx.beginPath();

        this.ctx.clearRect(
            this.eraser.pathData[0].x - this.eraser.size / 2,
            this.eraser.pathData[0].y - this.eraser.size / 2,
            this.eraser.size,
            this.eraser.size,
        );

        let oldPoint = this.eraser.pathData[0];

        for (const point of this.eraser.pathData) {
            const rectangleNumber = Math.max(Math.abs(oldPoint.x - point.x), Math.abs(oldPoint.y - point.y));
            for (let i = 0; i < rectangleNumber; i++) {
                const x = point.x - ((point.x - oldPoint.x) * i) / rectangleNumber;
                const y = point.y - ((point.y - oldPoint.y) * i) / rectangleNumber;
                this.ctx.clearRect(x - this.eraser.size / 2, y - this.eraser.size / 2, this.eraser.size, this.eraser.size);
            }
            oldPoint = point;
        }

        this.ctx.fillStyle = oldFillStyle;
    }
}
