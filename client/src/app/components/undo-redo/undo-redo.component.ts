import { Component } from '@angular/core';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-undo-redo',
    templateUrl: './undo-redo.component.html',
    styleUrls: ['./undo-redo.component.scss'],
})
export class UndoRedoComponent {
    constructor(public undoRedoService: UndoRedoService) {}

    onUndo(): void {
        this.undoRedoService.undo();
    }

    onRedo(): void {
        this.undoRedoService.redo();
    }

    get undoDisabled(): boolean {
        return this.undoRedoService.pastCommandSize <= 0 || this.undoRedoService.undoRedoDisable;
    }

    get redoDisabled(): boolean {
        return this.undoRedoService.redoCommandSize <= 0 || this.undoRedoService.undoRedoDisable;
    }
}
