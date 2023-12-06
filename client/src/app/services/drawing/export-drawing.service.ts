import { Injectable } from '@angular/core';
import { ExportDrawingComponent } from '@app/components/export-drawing/export-drawing.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';

@Injectable({
    providedIn: 'root',
})
export class ExportDrawingService {
    constructor(public dialogService: DialogService, private keyEventService: KeyEventService) {
        this.keyEventService.getKeyDownEvent('e').subscribe((keyEvent: KeyboardEvent) => {
            if (keyEvent.ctrlKey) {
                this.exportDrawing();
            }
        });
    }

    exportDrawing(): void {
        this.dialogService.openDialog<ExportDrawingComponent, void>(ExportDrawingComponent);
    }
}
