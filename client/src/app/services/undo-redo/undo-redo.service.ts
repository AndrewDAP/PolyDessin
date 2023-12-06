import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { ResizeCanvasCommand } from '@app/classes/commands/resize-canvas-command';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, MouseButton } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService } from '@app/services/resize/resize.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    private pastCommand: Command[] = [];
    private redoCommand: Command[] = [];
    undoRedoDisable: boolean = false;
    widthInit: number = DEFAULT_WIDTH;
    heightInit: number = DEFAULT_HEIGHT;

    constructor(
        private keyEventService: KeyEventService,
        private drawingService: DrawingService,
        private resizeService: ResizeService,
        private localStorageService: LocalStorageService,
    ) {
        this.keyEventService.getKeyDownEvent('z').subscribe((event: KeyboardEvent) => {
            if (event.ctrlKey && !event.shiftKey) this.undo();
        });
        this.keyEventService.getKeyDownEvent('Z').subscribe((event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey) this.redo();
        });

        this.keyEventService.getMouseEvent('onMouseDown').subscribe((event: MouseEvent) => {
            if (event.button === MouseButton.Left) {
                this.undoRedoDisable = true;
            }
        });
    }

    async undo(): Promise<void> {
        if (this.undoRedoDisable) return;
        if (this.pastCommand.length > 0) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.setBaseImage();
            new ResizeCanvasCommand(this.drawingService, this.resizeService, {
                x: this.widthInit,
                y: this.heightInit,
            } as Vec2).do();
            this.redoCommand.push(this.pastCommand.pop() as Command);
            for (const command of this.pastCommand) {
                await command.do();
            }
            this.localStorageService.setDrawing();
        }
    }

    async redo(): Promise<void> {
        if (this.undoRedoDisable) return;
        if (this.redoCommand.length > 0) {
            const command: Command = this.redoCommand.pop() as Command;
            await command.do();
            this.pastCommand.push(command);
            this.localStorageService.setDrawing();
        }
    }

    addCommand(command: Command): void {
        this.pastCommand.push(command);
        this.clearRedoCommand();
        this.undoRedoDisable = false;
        this.localStorageService.setDrawing();
    }

    private clearRedoCommand(): void {
        this.redoCommand = [];
    }

    get pastCommandSize(): number {
        return this.pastCommand.length;
    }

    get redoCommandSize(): number {
        return this.redoCommand.length;
    }

    clearAllCommand(): void {
        this.redoCommand = [];
        this.pastCommand = [];
    }
}
