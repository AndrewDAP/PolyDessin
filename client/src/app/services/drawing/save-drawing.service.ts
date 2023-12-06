import { Injectable } from '@angular/core';
import { SaveDrawingComponent } from '@app/components/save-drawing/save-drawing.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { Image } from '@common/communication/image';

@Injectable({
    providedIn: 'root',
})
export class SaveDrawingService {
    constructor(
        private drawingService: DrawingService,
        private http: HttpService,
        private keyEventService: KeyEventService,
        public dialogService: DialogService,
        private snackBarService: SnackBarService,
        private toolsInfoService: ToolsInfoService,
    ) {
        this.keyEventService.getKeyDownEvent('s').subscribe((event) => {
            if (event.ctrlKey && !this.toolsInfoService.saveButtonDisabled) this.saveDrawing();
        });
    }

    async saveDrawing(): Promise<void> {
        const image = await this.dialogService.openDialog<SaveDrawingComponent, Image>(SaveDrawingComponent);

        if (image === undefined) {
            this.toolsInfoService.saveButtonDisabled = false;
            return;
        }

        const drawing: string = this.drawingService.canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
        image.data = drawing;

        this.http
            .saveImage(image)
            .then(() => {
                this.snackBarService.openSnackBar("L'image a bien été enregistrée sur le serveur");
            })
            .catch(() => {
                this.snackBarService.openSnackBar("Erreur durant l'enregistrement de l'image sur le serveur");
            })
            .finally(() => {
                this.toolsInfoService.saveButtonDisabled = false;
            });
    }
}
