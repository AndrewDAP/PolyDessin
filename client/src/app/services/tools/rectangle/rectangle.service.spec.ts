import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ToolType } from '@app/tool-type';

// tslint:disable:no-any
describe('RectangleService', () => {
    let service: RectangleService;

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

        service = TestBed.inject(RectangleService);
        colorService = TestBed.inject(ColorService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change size when toolsInfoService calls setSizeOf() with ToolType.rectangle', () => {
        const size = 20;
        toolsInfoService.setSizeOf(ToolType.rectangle, size);
        expect(service.size).toEqual(size);
    });

    it('should set width and height to the lowest absolute value between both when isEven it true in drawShape() ', () => {
        const expectedValue = 20;
        const fillRectSpy: jasmine.Spy = spyOn(previewCtxStub, 'fillRect');
        service.isEven = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 20, y: 30 };
        service.drawShape(previewCtxStub);
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, expectedValue, expectedValue);
    });

    it('should set width and height to size * 2 it true in drawShape() ', () => {
        const expectedValue = 50;
        const fillRectSpy: jasmine.Spy = spyOn(previewCtxStub, 'fillRect');
        service.size = expectedValue / 2;
        service.isEven = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 20, y: 30 };
        service.drawShape(previewCtxStub);
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, expectedValue, expectedValue);
    });

    it('should call fillRect() on context when withFill is true in drawShape() ', () => {
        const downPos = { x: 0, y: 0 };
        const currentPos = { x: 20, y: 30 };
        const fillRectSpy: jasmine.Spy = spyOn(previewCtxStub, 'fillRect');
        service.mouseDownCoord = downPos;
        service.lastMousePos = currentPos;
        service.drawShape(previewCtxStub);
        expect(fillRectSpy).toHaveBeenCalledWith(downPos.x, downPos.y, currentPos.x, currentPos.y);
    });

    it('should call strokeRect() with correct values (negative offSet) when withStroke is true in drawShape() ', () => {
        const expectedPos = { x: 17.5, y: 17.5 };
        const expectedSize = { x: -5, y: -15 };
        const strokeRectSpy: jasmine.Spy = spyOn(previewCtxStub, 'strokeRect');
        service.mouseDownCoord = { x: 20, y: 20 };
        service.lastMousePos = { x: 10, y: 0 };
        service.withFill = false;
        service.withStroke = true;
        service.drawShape(previewCtxStub);
        expect(strokeRectSpy).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectedSize.x, expectedSize.y);
    });

    it('should call strokeRect() with correct values (positive offSet) on context when withStroke is true in drawShape() ', () => {
        const expectedPos = { x: 12.5, y: 2.5 };
        const expectedSize = { x: 5, y: 15 };
        const strokeRectSpy: jasmine.Spy = spyOn(previewCtxStub, 'strokeRect');
        service.mouseDownCoord = { x: 10, y: 0 };
        service.lastMousePos = { x: 20, y: 20 };
        service.withFill = false;
        service.withStroke = true;
        service.drawShape(previewCtxStub);
        expect(strokeRectSpy).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectedSize.x, expectedSize.y);
    });
});
