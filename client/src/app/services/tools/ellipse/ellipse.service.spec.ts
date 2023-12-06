import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorHelper } from '@app/classes/color-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { ToolType } from '@app/tool-type';
import { EllipseService } from './ellipse.service';

// tslint:disable:no-any
describe('EllipseService', () => {
    let service: EllipseService;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let colorService: ColorService;
    let toolsInfoService: ToolsInfoService;

    const downPos = { x: 0, y: 0 };
    const currentPos = { x: 20, y: 30 };

    beforeEach(() => {
        toolsInfoService = new ToolsInfoService();
        colorService = new ColorService();

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: ColorService, useValue: colorService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseService);
        colorService = TestBed.inject(ColorService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change size when toolsInfoService calls setSizeOf() with ToolType.ellipse', () => {
        const size = 20;
        toolsInfoService.setSizeOf(ToolType.ellipse, size);
        expect(service.size).toEqual(size);
    });

    it('should call strokeRect() when drawing on the preview canvas in drawShape()', () => {
        const ctxSpy: jasmine.Spy = spyOn(previewCtxStub, 'strokeRect');
        service.mouseDownCoord = downPos;
        service.lastMousePos = currentPos;
        service.drawShape(previewCtxStub);
        expect(ctxSpy).toHaveBeenCalled();
    });

    it('should set width and height to the lowest absolute value between both when isEven it true in drawShape()', () => {
        const expectedCoord = 10;
        const expectedRadius = 10;
        const ctxSpy: jasmine.Spy = spyOn(baseCtxStub, 'ellipse');
        service.mouseDownCoord = downPos;
        service.lastMousePos = currentPos;

        service.isEven = true;
        service.drawShape(baseCtxStub);
        expect(ctxSpy).toHaveBeenCalledWith(expectedCoord, expectedCoord, expectedRadius, expectedRadius, 0, 0, 2 * Math.PI);
    });

    it('should offSet ellipse to the right and downwards when lastMousePos is left of and over mouseDownCoord in drawShape()', () => {
        const expectedCoord = 20;
        const expectedRadius = 10;
        const mousePos = { x: 10, y: 10 };
        const ctxSpy: jasmine.Spy = spyOn(baseCtxStub, 'ellipse');
        service.mouseDownCoord = { x: 30, y: 30 };
        service.lastMousePos = mousePos;
        service.drawShape(baseCtxStub);

        expect(ctxSpy).toHaveBeenCalledWith(expectedCoord, expectedCoord, expectedRadius, expectedRadius, 0, 0, 2 * Math.PI);
    });

    it('should offSet ellipse to the left and upwards when lastMousePos is right of and under of mouseDownCoord in drawShape()', () => {
        const expectedCoord = 20;
        const expectedRadius = 10;
        const mousePos = { x: 30, y: 30 };
        const ctxSpy: jasmine.Spy = spyOn(baseCtxStub, 'ellipse');
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = mousePos;

        service.drawShape(baseCtxStub);
        expect(ctxSpy).toHaveBeenCalledWith(expectedCoord, expectedCoord, expectedRadius, expectedRadius, 0, 0, 2 * Math.PI);
    });

    it('should adjust radius for filled ellipse when withFill and withStroke are true in drawShape()', () => {
        const expectedCoord = 20;
        const expectedRadius = 7.5;
        const mousePos = { x: 30, y: 30 };
        const ellipseSpy: jasmine.Spy = spyOn(baseCtxStub, 'ellipse');
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = mousePos;

        service.withStroke = true;
        service.drawShape(baseCtxStub);
        expect(ellipseSpy).toHaveBeenCalledWith(expectedCoord, expectedCoord, expectedRadius, expectedRadius, 0, 0, 2 * Math.PI);
    });

    it('should call stroke() on context if calculated radius is over half the stroke size in drawShape()', () => {
        const mousePos = { x: 30, y: 30 };
        const strokeSpy: jasmine.Spy = spyOn(baseCtxStub, 'stroke');
        service.mouseDownCoord = { x: 10, y: 10 };
        service.withFill = false;
        service.lastMousePos = mousePos;

        service.withStroke = true;
        service.drawShape(baseCtxStub);

        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should call fill() on context if calculated radius is under half the stroke size in drawShape()', () => {
        const size = 40;
        const mousePos = { x: 30, y: 30 };
        const fillSpy: jasmine.Spy = spyOn(baseCtxStub, 'fill');
        service.size = size;
        service.lastMousePos = mousePos;

        service.mouseDownCoord = { x: 10, y: 10 };
        service.withStroke = true;
        service.drawShape(baseCtxStub);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('should set the stroke color to the secondary color when withFill and withFill are true in drawShape()', () => {
        const mousePos = { x: 20, y: 30 };
        service.withFill = true;
        service.withStroke = true;
        service.lastMousePos = mousePos;

        colorService.secondaryColor = ColorHelper.hex2hsl('AAAAAA');
        const colorSecondary = '#aaaaaa';
        service.mouseDownCoord = downPos;
        service.drawShape(baseCtxStub);
        expect(baseCtxStub.strokeStyle.toString()).toEqual(colorSecondary);
    });

    it('should set the fill color to the primary color when withFill and withStroke are true in drawShape()', () => {
        const mousePos = { x: 5, y: 5 };
        service.withFill = true;
        service.lastMousePos = mousePos;

        colorService.primaryColor = ColorHelper.hex2hsl('AAAAAA');
        const primaryColor = '#aaaaaa';
        service.mouseDownCoord = downPos;
        service.drawShape(baseCtxStub);
        expect(baseCtxStub.fillStyle.toString()).toEqual(primaryColor);
    });

    it('should set the fill color to the secondary color if withFill is false and withStroke is true in drawShape()', () => {
        const mousePos = { x: 5, y: 5 };
        service.withStroke = true;
        service.lastMousePos = mousePos;

        colorService.secondaryColor = ColorHelper.hex2hsl('AAAAAA');
        const secondaryColor = '#aaaaaa';
        service.mouseDownCoord = downPos;
        service.drawShape(baseCtxStub);
        expect(baseCtxStub.strokeStyle.toString()).toEqual(secondaryColor);
    });
});
