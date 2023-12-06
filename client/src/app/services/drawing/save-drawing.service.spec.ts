import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MaterialModule } from '@app/modules/material.module';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Image } from '@common/communication/image';
import { environment } from 'src/environments/environment';
import { SaveDrawingService } from './save-drawing.service';
// tslint:disable:no-any
describe('SaveDrawingService', () => {
    let service: SaveDrawingService;

    let httpMock: HttpTestingController;
    let keyEventService: KeyEventService;
    let baseUrl: string;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let snackBarSpy: jasmine.SpyObj<SnackBarService>;
    let dialogService: jasmine.SpyObj<DialogService>;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const TIMEOUT_TIME = 100;
    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        keyEventService = new KeyEventService();

        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['canvas']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DialogService, useValue: dialogService },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SnackBarService, useValue: snackBarSpy },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [MaterialModule, HttpClientTestingModule, BrowserAnimationsModule],
        });
        service = TestBed.inject(SaveDrawingService);
        httpMock = TestBed.inject(HttpTestingController);

        baseUrl = environment.SERVER_URL;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].previewCanvas = canvasTestHelper.drawCanvas;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not save the drawing after dialog has been closed with an invalid image', async () => {
        dialogService.openDialog.and.returnValue(Promise.resolve(undefined));

        await service.saveDrawing();

        expect(snackBarSpy.openSnackBar).not.toHaveBeenCalled();
        expect(dialogService.openDialog).toHaveBeenCalled();
    });

    it('should save image after dialog has been closed with a valid image', async () => {
        const dataSent = service['drawingService'].canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
        const imageToSend: Image = { title: 'imbecile', tags: ['cave', 'pasFin'], data: dataSent };

        dialogService.openDialog.and.returnValue(Promise.resolve(imageToSend));

        await service.saveDrawing();

        expect(dialogService.openDialog).toHaveBeenCalled();

        const req = httpMock.expectOne(baseUrl + '/save-image');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(imageToSend);
        req.flush(imageToSend);

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith("L'image a bien été enregistrée sur le serveur"));
            }, TIMEOUT_TIME);
        });
    });

    it('should open a snackbar if POST request has an error', async () => {
        service['drawingService'].baseCtx.fillRect(0, 0, 1, 1);
        const dataSent = service['drawingService'].canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
        const imageToSend: Image = { title: 'imbecile', tags: ['cave', 'pasFin'], data: dataSent };

        dialogService.openDialog.and.returnValue(Promise.resolve(imageToSend));

        await service.saveDrawing();

        const req = httpMock.expectOne(baseUrl + '/save-image');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(imageToSend);
        req.error(new ErrorEvent('Random error occured'));

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith("Erreur durant l'enregistrement de l'image sur le serveur"));
            }, TIMEOUT_TIME);
        });
    });

    it('should open dialog when receiving a keyDown event (ctrl + s)', (done: DoneFn) => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 's', ctrlKey: true });
        const spy = spyOn(service, 'saveDrawing');
        keyEventService.onKeyDown(keyEvent);
        expect(spy).toHaveBeenCalled();
        done();
    });

    it('should not open dialog when receiving a keyUp event (only s)', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 's', ctrlKey: false });
        const spy = spyOn(service, 'saveDrawing');
        keyEventService.onKeyDown(keyEvent);
        expect(spy).not.toHaveBeenCalled();
    });
});
