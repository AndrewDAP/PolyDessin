import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper, HEIGHT, WIDTH } from '@app/classes/canvas-test-helper';
import { IMAGE_TEST_PATH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { NewDrawingService } from './new-drawing.service';

// tslint:disable:no-any
describe('NewDrawingService', () => {
    let service: NewDrawingService;
    let drawingService: DrawingService;
    let resizeServiceSpy: jasmine.SpyObj<ResizeService>;
    let dialogService: jasmine.SpyObj<DialogService>;
    let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

    let canvasTestHelper: CanvasTestHelper;
    let clearCanvas: jasmine.Spy;

    const TIMEOUT_TIME = 100;

    beforeEach(() => {
        drawingService = new DrawingService();
        clearCanvas = spyOn(drawingService, 'clearCanvas');
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        resizeServiceSpy = jasmine.createSpyObj('ResizeService', ['setCanvasSize', 'setPreviewCanvasSize']);
        localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['getDrawing']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingService },
                { provide: ResizeService, useValue: resizeServiceSpy },
                { provide: DialogService, useValue: dialogService },
                { provide: LocalStorageService, useValue: localStorageServiceSpy },
            ],
            imports: [MaterialModule, BrowserAnimationsModule],
        });
        service = TestBed.inject(NewDrawingService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper.createCanvas(WIDTH, HEIGHT);
        drawingService.previewCanvas = canvasTestHelper.createCanvas(WIDTH, HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.drawingService.whiteBackground(drawingService.baseCtx);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load drawing', async () => {
        const setBaseImage = spyOn(drawingService, 'setBaseImage');
        const image = new Image();
        image.src = IMAGE_TEST_PATH;
        await new Promise((resolve) => {
            image.onload = () => {
                service.loadDrawing(image);
                expect(setBaseImage).toHaveBeenCalledWith();
                resolve(null);
            };
        });
    });

    it('should open a MatDialog when openDialog is called', () => {
        dialogService.openDialog.and.returnValue(Promise.resolve(false));

        service.openDialog();
        expect(dialogService.openDialog).toHaveBeenCalled();
    });

    it('should call createNewCanvas after dialog has been closed with true', async () => {
        dialogService.openDialog.and.returnValue(Promise.resolve(true));

        spyOn(service, 'createNewCanvas');

        service.openDialog();

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, TIMEOUT_TIME);
        });

        expect(service.createNewCanvas).toHaveBeenCalled();
    });

    it('should not call createNewCanvas after dialog has been closed with false', () => {
        dialogService.openDialog.and.returnValue(Promise.resolve(false));

        spyOn(service, 'createNewCanvas');

        service.openDialog();

        expect(service.createNewCanvas).not.toHaveBeenCalled();
    });

    it('should not open a confirmation box if the canvas is empty', () => {
        spyOn(service, 'openDialog');
        spyOn(service, 'createNewCanvas');

        drawingService.baseCtx.clearRect(0, 0, drawingService.canvas.width, drawingService.canvas.height);

        service.createNewDrawing();
        expect(service.openDialog).not.toHaveBeenCalled();
        expect(service.createNewCanvas).toHaveBeenCalled();
    });

    it('should open a confirmation box if the canvas is not empty', () => {
        spyOn(service, 'openDialog');
        spyOn(service, 'createNewCanvas');

        service.drawingService.baseCtx.fillStyle = 'black';
        // tslint:disable-next-line:no-magic-numbers
        service.drawingService.baseCtx.fillRect(41, 1, 30, 30);
        service.createNewDrawing();

        expect(service.openDialog).toHaveBeenCalled();
        expect(service.createNewCanvas).not.toHaveBeenCalled();
    });

    it('should set the base and preview canvas blank when a new canvas is made', () => {
        service.createNewCanvas();
        // tslint:disable-next-line:no-magic-numbers
        expect(clearCanvas).toHaveBeenCalledTimes(2);
    });

    it('should resize the base and preview canvas blank when a new canvas is made', () => {
        service.createNewCanvas();
        // TODO: verify if size is ok
        expect(resizeServiceSpy.setCanvasSize).toHaveBeenCalled();
        expect(resizeServiceSpy.setPreviewCanvasSize).toHaveBeenCalled();
    });

    it('should load a drawing from local storage', async () => {
        spyOn(service, 'createNewCanvas');
        localStorageServiceSpy.getDrawing.and.returnValue('allo');
        service.loadFromLocalStorage();
        expect(service.createNewCanvas).not.toHaveBeenCalled();
    });

    it('should not load a drawing from local storage', async () => {
        spyOn(service, 'createNewCanvas');
        localStorageServiceSpy.getDrawing.and.returnValue(null);
        service.loadFromLocalStorage();
        expect(service.createNewCanvas).toHaveBeenCalled();
    });
});
