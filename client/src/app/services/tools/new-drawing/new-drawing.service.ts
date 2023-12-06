import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { MIN_WIDTH_HEIGHT } from '@app/const';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class NewDrawingService {
    constructor(
        public drawingService: DrawingService,
        public dialogService: DialogService,
        private resizeService: ResizeService,
        private keyEventService: KeyEventService,
        private toolsInfoService: ToolsInfoService,
        private undoRedoService: UndoRedoService,
        private localStorageService: LocalStorageService,
        private snackBar: SnackBarService,
    ) {
        this.keyEventService.getKeyDownEvent('o').subscribe((event) => {
            if (event.ctrlKey) {
                this.createNewDrawing();
            }
        });
    }

    left: number = 0;
    top: number = 0;
    wasLoaded: boolean = false;

    createNewDrawing(): void {
        if (!this.drawingService.isCanvasBlank()) {
            this.openDialog();
        } else {
            this.createNewCanvas();
        }
    }

    openDialog(): void {
        this.dialogService.openDialog<ConfirmationDialogComponent, boolean>(ConfirmationDialogComponent).then((result) => {
            if (result) this.createNewCanvas();
        });
    }

    createNewCanvas(): void {
        const newCanvasSize: Vec2 = {
            x: Math.max((window.innerWidth - this.left) / 2, MIN_WIDTH_HEIGHT),
            y: Math.max((window.innerHeight - this.top) / 2, MIN_WIDTH_HEIGHT),
        };
        this.setupCanvas(newCanvasSize);

        this.drawingService.baseImage = undefined;
        this.drawingService.setBaseImage();
    }

    loadDrawing(image: HTMLImageElement): void {
        this.wasLoaded = true;

        const newCanvasSize: Vec2 = {
            x: image.width,
            y: image.height,
        };
        this.setupCanvas(newCanvasSize);

        this.drawingService.baseImage = image;
        this.drawingService.setBaseImage();
    }

    setupCanvas(newCanvasSize: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.resizeService.setCanvasSize(newCanvasSize);
        this.resizeService.setPreviewCanvasSize(newCanvasSize);

        this.toolsInfoService.setNewDrawing();

        this.undoRedoService.clearAllCommand();
        this.undoRedoService.heightInit = newCanvasSize.y;
        this.undoRedoService.widthInit = newCanvasSize.x;
    }

    loadFromLocalStorage(): void {
        const image = new Image();
        const url = this.localStorageService.getDrawing();
        if (url) {
            image.src = url;
            image.onload = () => this.loadDrawing(image);
        } else {
            this.snackBar.openSnackBar("Le dessin n'a pas pus être téléchargé correctement");
            this.createNewCanvas();
        }
    }
}
