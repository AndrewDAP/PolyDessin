import { BIGGEST_LETTER, BOLD, INTERLINE, ITALIC } from '@app/const';
import { TextService } from '@app/services/text/text.service';
import { Command } from './command';

export class DrawTextCommand implements Command {
    constructor(private textService: TextService, private color: string, private ctx: CanvasRenderingContext2D) {}

    do(): void {
        this.ctx.fillStyle = this.color;
        this.ctx.font =
            (this.textService.bold ? BOLD + ' ' : '') +
            (this.textService.italic ? ITALIC + ' ' : '') +
            this.textService.size +
            'px ' +
            this.textService.police;
        this.ctx.textAlign = this.textService.textAlign as CanvasTextAlign;

        const textMetrics = this.ctx.measureText(BIGGEST_LETTER);

        for (let i = 0; i < this.textService.text.length; i++) {
            this.ctx.fillText(
                this.textService.text[i],
                this.textService.startPos,
                this.textService.mouseDownCoord.y +
                    (i + 1) * (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + INTERLINE),
            );
        }
    }
}
