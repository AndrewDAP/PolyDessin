import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_TEST_PATH } from '@app/const';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should return true when canvas is white', () => {
        service.clearCanvas(service.baseCtx);
        const canvasIsBlank = service.isCanvasBlank();
        expect(canvasIsBlank).toBeTrue();
    });

    it('should return false when canvas is not blank', () => {
        service.clearCanvas(service.baseCtx);
        service.baseCtx.fillStyle = 'black';
        // tslint:disable-next-line:no-magic-numbers
        service.baseCtx.fillRect(1, 1, 30, 30);

        const canvasIsBlank = service.isCanvasBlank();
        expect(canvasIsBlank).toBeFalse();
    });

    it('should set the baseImage if it is not undefined', async () => {
        const drawImage = spyOn(service.baseCtx, 'drawImage');
        const image = new Image();
        image.src = IMAGE_TEST_PATH;
        await new Promise((resolve) => {
            image.onload = () => {
                service.baseImage = image;
                service.setBaseImage();
                expect(drawImage).toHaveBeenCalled();
                resolve(null);
            };
        });
    });

    it('should not set the baseImage if it is undefined', () => {
        const drawImage = spyOn(service.baseCtx, 'drawImage');
        service.baseImage = undefined;
        service.setBaseImage();
        expect(drawImage).not.toHaveBeenCalled();
    });
});
