import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { ToolType } from '@app/tool-type';
import { PolygonService } from './polygon.service';

// tslint:disable:no-any
describe('PolygonService', () => {
    let service: PolygonService;

    const downCoord = { x: 0, y: 0 };
    const mouseCoord = { x: 20, y: 20 };

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let colorService: ColorService;
    let toolsInfoService: ToolsInfoService;

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
        colorService = TestBed.inject(ColorService);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PolygonService);
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
        toolsInfoService.setSizeOf(ToolType.polygon, size);
        expect(service.size).toEqual(size);
    });

    it('should change sides when toolsInfoService calls setSides', () => {
        const sides = 5;
        toolsInfoService.setSides(sides);
        expect(service.size).toEqual(sides);
    });

    it('should call lineTo() "sides - 1" times in drawShape() ( final line is drawn by closePath() and stroke() or fill() ) ', () => {
        const lineToSpy: jasmine.Spy = spyOn(baseCtxStub, 'lineTo');
        const sides = 5;
        const expectedCalls = 4;
        service.mouseDownCoord = downCoord;
        service.lastMousePos = mouseCoord;
        service.sides = sides;
        service.drawShape(drawServiceSpy.baseCtx);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCalls);
    });

    it('should call fill() in drawShape() if withFill is true', () => {
        const fillSpy: jasmine.Spy = spyOn(baseCtxStub, 'fill');
        service.mouseDownCoord = downCoord;
        service.lastMousePos = mouseCoord;
        service.drawShape(drawServiceSpy.baseCtx);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('should call closePath and stroke() in drawShape() if withStroke is true', () => {
        const closePathSpy: jasmine.Spy = spyOn(baseCtxStub, 'closePath');
        const strokeSpy: jasmine.Spy<any> = spyOn(baseCtxStub, 'stroke');
        service.mouseDownCoord = downCoord;
        service.lastMousePos = mouseCoord;
        service.withFill = false;
        service.withStroke = true;
        service.drawShape(drawServiceSpy.baseCtx);
        expect(closePathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should call and ellipse() with correct parameters in drawShape() when drawing on the preview context ', () => {
        const center = { x: 10, y: 10 };
        const radius = { x: 10, y: 10 };
        const strokeSpy: jasmine.Spy<any> = spyOn(previewCtxStub, 'stroke');
        const ellipseSpy: jasmine.Spy<any> = spyOn(previewCtxStub, 'ellipse');
        service.mouseDownCoord = downCoord;
        service.lastMousePos = mouseCoord;
        service.drawShape(drawServiceSpy.previewCtx);
        expect(ellipseSpy).toHaveBeenCalledWith(center.x, center.y, radius.x, radius.y, 0, 0, Math.PI * 2);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should adjust ellipse radius in drawShape() when drawing on preview canvas, withStroke is true', () => {
        const radius = 17;
        const center = { x: 10, y: 10 };
        const strokeSpy: jasmine.Spy<any> = spyOn(previewCtxStub, 'stroke');
        const ellipseSpy: jasmine.Spy<any> = spyOn(previewCtxStub, 'ellipse');
        service.mouseDownCoord = downCoord;
        service.lastMousePos = mouseCoord;
        service.withStroke = true;
        service.drawShape(drawServiceSpy.previewCtx);
        expect(ellipseSpy).toHaveBeenCalledWith(center.x, center.y, radius, radius, 0, 0, Math.PI * 2);
        expect(strokeSpy).toHaveBeenCalled();
    });
});
