import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { DrawTextCommand } from '@app/classes/commands/draw-text-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { BIGGEST_LETTER, BOLD, DASH, INTERLINE, ITALIC, LINE_DASH_OFFSET, MouseButton, POSSIBLE_ALIGNS } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

const TEXTBOX_PADDING = 5;
const CURSOR_BLINK_INTERVAL = 500;
const CURSOR_WIDTH = 1;

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    isActive: boolean = false;
    writing: boolean = false;

    index: Vec2 = { x: 0, y: 0 };
    text: string[] = [''];

    cursorShown: boolean = true;
    interval: ReturnType<typeof setInterval>;

    police: string = 'serif';
    size: number = 20;
    bold: boolean = false;
    italic: boolean = false;
    textAlign: string = 'left';
    startPos: number = 0;

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected resizeService: ResizeService,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, resizeService, undoRedoService);

        this.toolsInfoService.getSizeOf(ToolType.text).subscribe((size) => {
            this.size = size;
        });
        this.changingToolsService.getTool().subscribe((tool) => {
            if (tool === ToolType.text) {
                this.isActive = true;
            } else {
                if (this.isActive && this.writing) {
                    const command = this.drawTextCommand();
                    this.undoRedoService.addCommand(command);
                    this.endText();
                    this.isActive = false;
                }
            }
        });
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        const coords: Vec2 = this.getPositionFromMouse(event, this.left, this.top);

        if (this.writing && !this.inTextbox(coords)) {
            const command = this.drawTextCommand();
            this.undoRedoService.addCommand(command);
            this.endText();
        } else if (!this.writing) {
            this.setCursorInterval();
            this.writing = true;
            this.mouseDownCoord = coords;
            this.setStartPos();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.writing) return;
        event.preventDefault();
        switch (event.key) {
            case 'Backspace':
                this.backspace();
                break;
            case 'Delete':
                this.delete();
                break;
            case 'Enter':
                this.enter();
                break;
            case 'Escape':
                this.escape();
                return;
            case 'ArrowLeft':
                this.arrowLeft();
                break;
            case 'ArrowRight':
                this.arrowRight();
                break;
            case 'ArrowUp':
                this.arrowUp();
                break;
            case 'ArrowDown':
                this.arrowDown();
                break;
            default:
                break;
        }
        if (event.key.length === 1) {
            this.text[this.index.y] =
                this.text[this.index.y].substring(0, this.index.x) +
                event.key +
                this.text[this.index.y].substring(this.index.x++, this.text[this.index.y].length);
        }

        this.setCursorInterval();
        this.cursorShown = true;
        this.drawPreview();
        this.showCursor();
    }

    backspace(): void {
        if (this.index.x <= 0) {
            if (this.index.y > 0) {
                this.index.x = this.text[--this.index.y].length;
                this.text[this.index.y] = this.text[this.index.y] + this.text[this.index.y + 1];
                this.text.splice(this.index.y + 1, 1);
            }
        } else {
            this.index.x = Math.max(0, --this.index.x);
            this.text[this.index.y] =
                this.text[this.index.y].substring(0, this.index.x) +
                this.text[this.index.y].substring(this.index.x + 1, this.text[this.index.y].length);
        }
    }

    delete(): void {
        if (this.index.x === this.text[this.index.y].length) {
            this.text[this.index.y] += this.text.splice(this.index.y + 1, 1);
        } else {
            this.text[this.index.y] =
                this.text[this.index.y].substring(0, this.index.x) +
                this.text[this.index.y].substring(this.index.x + 1, this.text[this.index.y].length);
        }
    }

    enter(): void {
        this.text.splice(this.index.y + 1, 0, this.text[this.index.y].substring(this.index.x, this.text[this.index.y].length));
        this.text[this.index.y] = this.text[this.index.y].substring(0, this.index.x);
        this.index.y++;
        this.index.x = 0;
    }

    escape(): void {
        this.endText();
        this.undoRedoService.undoRedoDisable = false;
    }

    arrowLeft(): void {
        if (--this.index.x < 0) {
            if (this.index.y > 0) {
                this.index.y--;
                this.index.x = this.text[this.index.y].length;
            } else {
                this.index.x++;
            }
        }
    }

    arrowRight(): void {
        if (++this.index.x > this.text[this.index.y].length) {
            if (this.index.y < this.text.length - 1) {
                this.index.y++;
                this.index.x = 0;
            } else {
                this.index.x--;
            }
        }
    }

    arrowUp(): void {
        const lineStart: number = this.getLineStart();
        const cursorPos = lineStart + this.drawingService.previewCtx.measureText(this.text[this.index.y].substring(0, this.index.x)).width;
        this.index.y = Math.max(0, --this.index.y);
        this.setNewIndex(cursorPos);
    }

    arrowDown(): void {
        const lineStart: number = this.getLineStart();
        const cursorPos = lineStart + this.drawingService.previewCtx.measureText(this.text[this.index.y].substring(0, this.index.x)).width;
        this.index.y = Math.min(this.text.length - 1, ++this.index.y);
        this.setNewIndex(cursorPos);
    }

    setNewIndex(cursorPos: number): void {
        let diff: number = cursorPos;
        for (let i = 0; i < this.text[this.index.y].length; i++) {
            const newPos = this.getLineStart() + this.drawingService.previewCtx.measureText(this.text[this.index.y].substring(0, i)).width;
            if (Math.abs(cursorPos - newPos) <= diff) {
                diff = Math.abs(cursorPos - newPos);
            } else {
                this.index.x = i - 1;
                return;
            }
        }
        this.index.x = this.text[this.index.y].length;
    }

    inTextbox(coords: Vec2): boolean {
        const width = this.getTextWidth();
        if (
            coords.x > this.mouseDownCoord.x - TEXTBOX_PADDING &&
            coords.y > this.mouseDownCoord.y - this.getLineHeight() - TEXTBOX_PADDING &&
            coords.x < this.mouseDownCoord.x + width + 2 * TEXTBOX_PADDING &&
            coords.y < this.mouseDownCoord.y + (this.getLineHeight() + INTERLINE) * (this.text.length - 1) + 2 * TEXTBOX_PADDING
        ) {
            return true;
        }
        return false;
    }

    setCursorInterval(): void {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.cursorShown = !this.cursorShown;
            this.showCursor();
        }, CURSOR_BLINK_INTERVAL);
    }

    showCursor(): void {
        if (this.cursorShown) {
            const width: number = this.drawingService.previewCtx.measureText(this.text[this.index.y].substring(0, this.index.x)).width;
            const heigth: number = this.getLineHeight();
            const lineStart: number = this.getLineStart();

            this.drawingService.previewCtx.fillStyle = this.colorService.primaryColor.hsla();
            this.drawingService.previewCtx.fillRect(
                lineStart + width,
                this.mouseDownCoord.y + (heigth + INTERLINE) * (this.index.y + 1) + INTERLINE / 2,
                CURSOR_WIDTH,
                -(heigth + INTERLINE),
            );
        } else {
            this.drawPreview();
        }
    }

    drawText(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.colorService.primaryColor.hsla();
        ctx.font = (this.bold ? BOLD + ' ' : '') + (this.italic ? ITALIC + ' ' : '') + this.size + 'px ' + this.police;
        ctx.textAlign = this.textAlign as CanvasTextAlign;

        for (let i = 0; i < this.text.length; i++) {
            ctx.fillText(this.text[i], this.startPos, this.mouseDownCoord.y + (i + 1) * (this.getLineHeight() + INTERLINE));
        }
    }

    drawTextbox(ctx: CanvasRenderingContext2D): void {
        const width = this.getTextWidth();
        ctx.lineDashOffset = 0;
        ctx.setLineDash(DASH);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(
            this.mouseDownCoord.x - TEXTBOX_PADDING,
            this.mouseDownCoord.y,
            width + 2 * TEXTBOX_PADDING,
            (this.getLineHeight() + INTERLINE) * this.text.length + 2 * TEXTBOX_PADDING,
        );
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = LINE_DASH_OFFSET;
        ctx.strokeRect(
            this.mouseDownCoord.x - TEXTBOX_PADDING,
            this.mouseDownCoord.y,
            width + 2 * TEXTBOX_PADDING,
            (this.getLineHeight() + INTERLINE) * this.text.length + 2 * TEXTBOX_PADDING,
        );
    }

    drawPreview(): void {
        if (this.writing) {
            this.setStartPos();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawText(this.drawingService.previewCtx);
            this.drawTextbox(this.drawingService.previewCtx);
        }
    }

    endText(): void {
        this.text = [''];
        this.index = { x: 0, y: 0 };
        this.writing = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        clearInterval(this.interval);
    }

    getLineStart(): number {
        let lineStart: number = this.startPos;
        if (this.textAlign === 'right') {
            lineStart -= this.drawingService.previewCtx.measureText(this.text[this.index.y]).width;
        } else if (this.textAlign === 'center') {
            lineStart -= this.drawingService.previewCtx.measureText(this.text[this.index.y]).width / 2;
        }
        return lineStart;
    }

    getTextWidth(): number {
        let width = 0;
        this.drawingService.previewCtx.font = (this.bold ? BOLD + ' ' : '') + (this.italic ? ITALIC + ' ' : '') + this.size + 'px ' + this.police;
        for (const textLine of this.text) {
            const textMetrics = this.drawingService.previewCtx.measureText(textLine);
            if (textMetrics.width > width) {
                width = textMetrics.width;
            }
        }
        return width;
    }

    getLineHeight(): number {
        const metrics = this.drawingService.previewCtx.measureText(BIGGEST_LETTER);
        return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }

    setStartPos(): void {
        if (!POSSIBLE_ALIGNS.includes(this.textAlign)) this.textAlign = 'left';

        let startPos: number = this.mouseDownCoord.x;
        if (this.textAlign !== 'left') {
            const width = this.getTextWidth();
            if (this.textAlign === 'right') {
                startPos += width;
            } else {
                startPos += width / 2;
            }
        }
        this.startPos = startPos;
    }

    drawTextCommand(): Command {
        const command = new DrawTextCommand({ ...this }, this.colorService.primaryColor.hsla(), this.drawingService.baseCtx);
        command.do();
        return command;
    }
}
