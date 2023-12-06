import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { ToolType } from '@app/tool-type';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let toolsInfoService: ToolsInfoService;
    let colorService: ColorService;

    beforeEach(() => {
        colorService = new ColorService();
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        toolsInfoService = new ToolsInfoService();

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

        service = TestBed.inject(PencilService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change size when toolsInfoService calls setSizeOf with ToolType.pencil', () => {
        const size = 20;
        toolsInfoService.setSizeOf(ToolType.pencil, size);
        expect(service.size).toEqual(size);
    });

    it('draw() should only call lineTo() if pathData length is smaller than or equal to 2', () => {
        const moveToSpy = spyOn<any>(previewCtxStub, 'moveTo').and.callThrough();
        const lineToSpy = spyOn<any>(previewCtxStub, 'lineTo').and.callThrough();
        service.pathData = [{ x: 10, y: 10 }];
        service.draw();
        expect(moveToSpy).not.toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('draw() should call moveTo() before lineTo() if pathData length is greater than 2', () => {
        const moveToSpy = spyOn<any>(previewCtxStub, 'moveTo').and.callThrough();
        const lineToSpy = spyOn<any>(previewCtxStub, 'lineTo').and.callThrough();
        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.draw();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawPath() should call lineTo() pathData.length times ', () => {
        const lineToSpy = spyOn<any>(baseCtxStub, 'lineTo').and.callThrough();
        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.drawPath(drawServiceSpy.baseCtx);
        expect(lineToSpy).toHaveBeenCalledTimes(service.pathData.length);
    });
});
