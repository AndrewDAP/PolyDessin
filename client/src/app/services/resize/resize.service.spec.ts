import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService, Status } from './resize.service';

describe('ResizeService', () => {
    let service: ResizeService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ResizeService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService = TestBed.inject(DrawingService);
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.previewCanvas = canvasTestHelper.drawCanvas;
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a default value of OFF', () => {
        expect(service.statusSubject.value).toEqual(Status.OFF);
    });

    it('should set left and top offsets', () => {
        const offsetLeft = 20;
        const offsetTop = 20;
        service.setOffsets(offsetLeft, offsetTop);

        expect(service.offsetLeft).toEqual(offsetLeft);
        expect(service.offsetTop).toEqual(offsetTop);
    });

    it('changeStatus should change if given a Status enum', () => {
        const newStatus = Status.FREE_RESIZE;
        service.changeStatus(newStatus);
        expect(service.statusSubject.value).toEqual(newStatus);
    });

    it('changeStatus should change if given a number', () => {
        const newStatus = 4;
        service.changeStatus(newStatus);
        expect(service.statusSubject.value).toEqual(newStatus);
    });

    it('setCanvasSize should change the value of the subject and change the canvas size', () => {
        const newSize = { x: 500, y: 500 } as Vec2;
        service.setCanvasSize(newSize);
        expect(service.canvasSizeSubject.value).toEqual(newSize);
        expect(drawingService.canvas.width).toEqual(newSize.x);
        expect(drawingService.canvas.height).toEqual(newSize.y);
    });

    it('setPreviewCanvasSize should change the value of the subject and change the previewCanvas size', () => {
        const newSize = { x: 500, y: 500 } as Vec2;
        service.setPreviewCanvasSize(newSize);
        expect(service.previewCanvasSizeSubject.value).toEqual(newSize);
        expect(drawingService.previewCanvas.width).toEqual(newSize.x);
        expect(drawingService.previewCanvas.height).toEqual(newSize.y);
    });
});
