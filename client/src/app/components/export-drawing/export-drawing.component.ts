import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ACCESS_TOKEN, FileChoice, FilterChoice, filterMax, nameOfFilter, SaveChoice } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { MAX_TITLE_SIZE } from '@common/const';
import { ShowUrlComponent } from './show-url/show-url.component';

const MAX_DIVISION = 100;
const LENGTH_HEAD_PNG = 'data:image/png;base64,'.length;
const LENGTH_HEAD_JPEG = 'data:image/jpeg;base64,'.length;

@Component({
    selector: 'app-export-drawing',
    templateUrl: './export-drawing.component.html',
    styleUrls: ['./export-drawing.component.scss'],
})
export class ExportDrawingComponent implements AfterViewInit {
    @ViewChild('workingCanvas', { static: false }) workingCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('download', { static: false }) download: ElementRef<HTMLAnchorElement>;

    readonly MAX_TITLE_SIZE: number = MAX_TITLE_SIZE;
    titleFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);

    saveChoice: SaveChoice = SaveChoice.Local;
    filterChoice: FilterChoice = FilterChoice.NoFilter;
    fileChoice: FileChoice = FileChoice.Png;
    workingCanvasCtx: CanvasRenderingContext2D;
    aspectRatio: number;
    width: number;
    height: number;

    sliderMax: number = 100;
    sliderMin: number = 0;
    sliderStep: number = 1;
    sliderValue: number = this.sliderMax;
    showSlider: boolean = false;
    acceptButton: string = 'Ok';

    constructor(public dialogRef: MatDialog, private drawingService: DrawingService, private snackBarService: SnackBarService) {
        this.aspectRatio = this.drawingService.canvas.height / this.drawingService.canvas.width;
        this.width = this.drawingService.canvas.width;
        this.height = this.drawingService.canvas.height;
    }

    ngAfterViewInit(): void {
        this.workingCanvasCtx = this.workingCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.cloneCanvas();
    }

    cloneCanvas(): void {
        this.workingCanvasCtx.filter = 'none';
        this.drawingService.whiteBackground(this.workingCanvasCtx);
        this.workingCanvasCtx.drawImage(
            this.drawingService.canvas,
            0,
            0,
            this.workingCanvas.nativeElement.width,
            this.workingCanvas.nativeElement.height,
        );
    }

    accept(): void {
        this.saveImage();
    }

    filterChange(filterChoice: FilterChoice): void {
        this.filterChoice = filterChoice;
        this.cloneCanvas();
        if (this.filterChoice === FilterChoice.NoFilter) {
            this.showSlider = false;
            return;
        }
        this.showSlider = true;
        this.sliderMax = filterMax.get(filterChoice) as number;
        this.sliderMin = 0;
        this.sliderValue = this.sliderMax;

        this.applyFilter(this.sliderValue);
    }

    fileChange(fileChoice: FileChoice): void {
        this.fileChoice = fileChoice;
    }

    saveChange(saveChoice: SaveChoice): void {
        this.saveChoice = saveChoice;
        this.acceptButton = this.saveChoice === SaveChoice.Local ? 'Ok' : 'Téléverser';
    }

    applyFilter(value: number): void {
        this.cloneCanvas();
        this.sliderValue = value;
        const filterUrl = nameOfFilter.get(this.filterChoice) + '(';
        if (this.filterChoice === FilterChoice.HueRotate) {
            this.workingCanvasCtx.filter = filterUrl + value + 'deg)';
        } else if (this.filterChoice === FilterChoice.Blur) {
            this.workingCanvasCtx.filter = filterUrl + value + 'px)';
        } else {
            this.workingCanvasCtx.filter = filterUrl + value / MAX_DIVISION + ')';
        }
        this.workingCanvasCtx.drawImage(
            this.workingCanvas.nativeElement,
            0,
            0,
            this.workingCanvas.nativeElement.width,
            this.workingCanvas.nativeElement.height,
        );
    }

    async requestImgur(pictureData: string, fileName: string, fileType: string): Promise<Response> {
        const formData = new FormData();
        formData.append('image', pictureData.substring(fileType === 'png' ? LENGTH_HEAD_PNG : LENGTH_HEAD_JPEG));
        formData.append('name', fileName);
        formData.append('title', this.titleFormControl.value);
        formData.append('type', fileType);
        return fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + ACCESS_TOKEN,
            }),
            body: formData,
        });
    }

    async saveImage(): Promise<void> {
        this.dialogRef.closeAll();
        const fileType: string = this.fileChoice === FileChoice.Png ? 'png' : 'jpg';
        const dataType: string = this.fileChoice === FileChoice.Png ? 'image/png' : 'image/jpeg';
        const pictureData = this.workingCanvas.nativeElement.toDataURL(dataType);
        const fileName = this.titleFormControl.value + '.' + fileType;
        if (this.saveChoice === SaveChoice.Local) {
            const link = this.download.nativeElement;
            link.download = fileName;
            link.href = pictureData;
            link.click();
        } else {
            await this.requestImgur(pictureData, fileName, fileType)
                .then(async (response) => {
                    if (response.ok) {
                        const value = await response.json();
                        this.dialogRef.open(ShowUrlComponent).componentInstance.url = value.data.link;
                    } else {
                        this.snackBarService.openSnackBar("Le téléversement vers Imgur n'a pas réussi");
                    }
                })
                .catch((error) => {
                    this.snackBarService.openSnackBar("Le téléversement vers Imgur n'a pas réussi");
                });
        }
    }
}
