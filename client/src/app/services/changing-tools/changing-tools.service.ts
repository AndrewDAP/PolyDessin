import { Injectable } from '@angular/core';
import { keyForTools } from '@app/const';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChangingToolsService {
    constructor(private keyEventService: KeyEventService, private undoRedoService: UndoRedoService) {
        for (const key of Array.from(keyForTools.keys())) {
            this.keyEventService.getKeyDownEvent(keyForTools.get(key) as string).subscribe((event) => {
                if (!event.ctrlKey) this.setTool(key);
            });
        }
    }
    private subject: Subject<ToolType> = new Subject<ToolType>();

    getTool(): Observable<ToolType> {
        return this.subject.asObservable();
    }

    setTool(tool: ToolType): void {
        this.subject.next(tool);
        this.undoRedoService.undoRedoDisable = false;
    }
}
