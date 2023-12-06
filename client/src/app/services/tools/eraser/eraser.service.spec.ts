import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

// tslint:disable:no-any
describe('EraserService', () => {
    let service: EraserService;

    let mouseMoveEvent: MouseEvent;

    let drawPathSpy: jasmine.Spy<any>;
    let showEraserSpy: jasmine.Spy<any>;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EraserService);

        drawPathSpy = spyOn<any>(service, 'drawPath').and.callThrough();
        showEraserSpy = spyOn<any>(service, 'showEraser').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseMoveEvent = {
            clientX: 10,
            clientY: 10,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear preview context when mouse moves', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
    });

    it('should push mouse position in pathData and call drawPath() when mouse moves if mouseDown is true', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(service.pathData.length).toEqual(1);
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('should not push mouse position in pathData or call drawPath() when mouse moves if mouseDown is false', () => {
        service.pathData = [];
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(service.pathData.length).toEqual(0);
        expect(drawPathSpy).not.toHaveBeenCalled();
    });

    it('should call showEraser() when mouse moves', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(showEraserSpy).toHaveBeenCalled();
    });

    it('should call fillRect() and strokeRect() when showEraser() is called', () => {
        const strokeRectSpy = spyOn<any>(previewCtxStub, 'strokeRect').and.callThrough();
        const fillRectSpy = spyOn<any>(previewCtxStub, 'fillRect').and.callThrough();
        const expectedPos = 7.5;
        const expectedSize = 5;
        const mousePosition = { x: 10, y: 10 };
        service.showEraser(mousePosition);
        expect(strokeRectSpy).toHaveBeenCalledWith(expectedPos, expectedPos, expectedSize, expectedSize);
        expect(fillRectSpy).toHaveBeenCalledWith(expectedPos, expectedPos, expectedSize, expectedSize);
    });

    it('should maintain fill colour even if showEraser() is called', () => {
        const mousePosition = { x: 10, y: 10 };
        const originalFill = previewCtxStub.fillStyle;
        service.showEraser(mousePosition);
        expect(previewCtxStub.fillStyle).toEqual(originalFill);
    });

    it('should draw rectangles at the correct position and size when drawPath() is called', () => {
        const clearRectSpy = spyOn<any>(previewCtxStub, 'clearRect').and.callThrough();
        const expectedPos = 7.5;
        const expectedSize = 5;
        service.pathData = [
            { x: 10, y: 10 },
            { x: 11, y: 11 },
            { x: 12, y: 12 },
        ];
        service.drawPath(previewCtxStub);
        expect(clearRectSpy).toHaveBeenCalledWith(expectedPos, expectedPos, expectedSize, expectedSize);
    });

    it('should maintain fill colour even if drawPath() is called', () => {
        const originalFill = previewCtxStub.fillStyle;
        service.pathData = [{ x: 10, y: 10 }];
        service.drawPath(previewCtxStub);
        expect(previewCtxStub.fillStyle).toEqual(originalFill);
    });
});
