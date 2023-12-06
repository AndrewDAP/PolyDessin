import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DASH, LINE, PERIMETER_STROKE_SIZE } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

// tslint:disable: no-any
describe('LineLogicService', () => {
    let service: LineLogicService;

    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizeService: ResizeService;
    let toolsInfoService: ToolsInfoService;
    let keyEventService: KeyEventService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let changingToolsService: ChangingToolsService;
    let colorService: ColorService;

    let downCoord: Vec2;
    let pathDataMock: Vec2[];

    let alignSpy: jasmine.Spy<any>;
    let drawPathSpy: jasmine.Spy<any>;
    let updatePreviewSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;
    let drawLine: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        resizeService = new ResizeService(drawServiceSpy);
        toolsInfoService = new ToolsInfoService();
        keyEventService = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolsService = new ChangingToolsService(keyEventService, undoRedoService);
        colorService = new ColorService();

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: ResizeService, useValue: resizeService },
                { provide: ChangingToolsService, useValue: changingToolsService },
                { provide: ColorService, useValue: colorService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(LineLogicService);

        alignSpy = spyOn(service, 'alignTo45DegreeAngle').and.callThrough();
        drawPathSpy = spyOn(service, 'drawPath').and.callThrough();
        updatePreviewSpy = spyOn(service, 'updatePreview').and.callThrough();
        clearPathSpy = spyOn(service, 'clearPath').and.callThrough();
        drawLine = spyOn(service, 'drawLine').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].previewCanvas = canvasTestHelper.drawCanvas;

        downCoord = { x: 25, y: 25 };

        pathDataMock = [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change status when resizeService changes its status enum ', () => {
        resizeService.changeStatus(Status.FREE_RESIZE);
        expect(service.status).toEqual(Status.FREE_RESIZE);
    });

    it('should call stroke two time if lineDash is dash', () => {
        const spy = spyOn(service['drawingService'].baseCtx, 'stroke');
        service.lineDash = DASH;
        service.drawLine(service['drawingService'].baseCtx, { x: 0, y: 0 } as Vec2, { x: 1, y: 1 } as Vec2);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should call stroke one time if lineDash is line', () => {
        const spy = spyOn(service['drawingService'].baseCtx, 'stroke');
        service.lineDash = LINE;
        service.drawLine(service['drawingService'].baseCtx, { x: 0, y: 0 } as Vec2, { x: 1, y: 1 } as Vec2);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should set lineSize, withJunction, junctionSize and lineDash to correct values if currentTool is line', () => {
        const size = 25;
        changingToolsService.setTool(ToolType.line);
        toolsInfoService.setSizeOf(ToolType.line, size);
        toolsInfoService.setShouldDrawJunction(true);
        toolsInfoService.setSizeOfJunction(size);
        expect(service.lineSize).toEqual(size);
        expect(service.withJunction).toEqual(true);
        expect(service.junctionSize).toEqual(size);
        expect(service.lineDash).toEqual(LINE);
    });

    it('should set lineSize, withJunction, junctionSize and lineDash to correct values if currentTool is not line', () => {
        changingToolsService.setTool(ToolType.lassoPolygonal);
        expect(service.lineSize).toEqual(PERIMETER_STROKE_SIZE);
        expect(service.withJunction).toEqual(false);
        expect(service.junctionSize).toEqual(0);
        expect(service.lineDash).toEqual(DASH);
    });

    it('should call alignTo45DegreeAngle() if shiftIsDown and pathData is not empty in processClick()', () => {
        const shiftIsDown = true;
        service.pathData = pathDataMock;
        service.processClick(downCoord, shiftIsDown);
        expect(alignSpy).toHaveBeenCalled();
    });

    it('should not call clearcanvas if click outside canvas', () => {
        const shiftIsDown = false;
        service.pathData = pathDataMock;
        // tslint:disable: no-magic-numbers
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        service.processClick(downCoord, shiftIsDown);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(0);
    });
    it('should push function parameter "mouseDownCoord" to pathData in processClick()', () => {
        service.processClick(downCoord, false);
        expect(service.pathData[0]).toEqual(downCoord);
    });

    it('should call clearCanvas() and drawPath() in processClick()', () => {
        service.processClick(downCoord, false);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('should call clearPath(), clearCanvas() and drawPath() in processEscape()', () => {
        service.processEscape();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('should pop pathData and call clearCanvas() if pathData is not empty in processBackspace()', () => {
        service.pathData = pathDataMock;
        service.processBackSpace(downCoord, false);
        expect(service.pathData.length).toEqual(1);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should call drawPath() and updatePreview() if pathData is not empty in processBackspace()', () => {
        service.pathData = pathDataMock;
        service.processBackSpace(downCoord, false);
        expect(drawPathSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('should do nothing if pathData is empty in processBackspace()', () => {
        service.processBackSpace(downCoord, false);
        expect(service.pathData.length).toEqual(0);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawPathSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('should call updatePreview() if pathData is not empty in processShift()', () => {
        service.pathData = pathDataMock;
        service.processShift(downCoord, false);
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('should do nothing if pathData is empty in processShift()', () => {
        service.processShift(downCoord, false);
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('should empty pathData in clearPath()', () => {
        service.pathData = pathDataMock;
        service.clearPath();
        expect(service.pathData.length).toEqual(0);
    });

    it('should call clearCanvas() and drawPath in updatePreview()', () => {
        service.status = Status.FREE_RESIZE;
        service.updatePreview(downCoord, false);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('should call drawLine() if status is OFF in updatePreview()', () => {
        service.status = Status.OFF;
        service.pathData = pathDataMock;
        service.updatePreview(downCoord, false);
        expect(drawLine).toHaveBeenCalled();
    });

    it('should call alignTo45DegreeAngle() if status is OFF and shiftIsDown is true in updatePreview()', () => {
        const shiftIsDown = true;
        service.status = Status.OFF;
        service.pathData = pathDataMock;
        service.updatePreview(downCoord, shiftIsDown);
        expect(alignSpy).toHaveBeenCalled();
    });

    it('should return if Vec2 function parameter is within 20px of the first point in canConnectToStart()', () => {
        service.pathData = pathDataMock;
        const canConnect = service.canConnectToStart(downCoord);
        expect(canConnect).toEqual(false);
    });

    it('should call arc() (junctions) and lineTo (lines) if withJunction is true in drawPath()', () => {
        const lineToSpy: jasmine.Spy = spyOn(previewCtxStub, 'lineTo').and.callThrough();
        const arcSpy: jasmine.Spy = spyOn(previewCtxStub, 'arc').and.callThrough();
        service.withJunction = true;
        service.pathData = pathDataMock;
        service.drawPath(previewCtxStub);
        expect(lineToSpy).toHaveBeenCalled();
        expect(arcSpy).toHaveBeenCalled();
    });

    it('should set color to primaryColor of ColorService if activeTool is line is true in drawPath()', () => {
        service.activeTool = ToolType.line;
        colorService.primaryColor = Color.RED;
        service.pathData = pathDataMock;
        service.drawPath(previewCtxStub);
        expect(service.color).toEqual(Color.RED.hsla());
    });

    it('should set color to primaryColor of ColorService if activeTool is line is true in drawLine()', () => {
        service.activeTool = ToolType.line;
        colorService.primaryColor = Color.RED;
        service.drawLine(previewCtxStub, { x: 0, y: 0 }, { x: 10, y: 10 });
        expect(service.color).toEqual(Color.RED.hsla());
    });

    // tslint:disable: no-magic-numbers
    it('should give the proper angle in every case in alignTo45DegreeAngle() ', () => {
        // 0 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 25, y: 2 })).toEqual({ x: 25, y: 0 });
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 25, y: -2 })).toEqual({ x: 25, y: 0 });
        // 90 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 1, y: 8 })).toEqual({ x: 0, y: 8 });
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -1, y: 8 })).toEqual({ x: 0, y: 8 });
        // 180 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -25, y: 2 })).toEqual({ x: -25, y: 0 });
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -25, y: -2 })).toEqual({ x: -25, y: 0 });
        // 270 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 1, y: -8 })).toEqual({ x: 0, y: -8 });
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -1, y: -8 })).toEqual({ x: 0, y: -8 });
        // -45 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 4, y: 4 }).x).toBeCloseTo(4);
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 4, y: 4 }).y).toBeCloseTo(4);
        // -45 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 4, y: -4 }).x).toBeCloseTo(4);
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: 4, y: -4 }).y).toBeCloseTo(-4);
        // 135 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -4, y: -4 }).x).toBeCloseTo(-4);
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -4, y: -4 }).y).toBeCloseTo(-4);
        // -135 angle
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -4, y: 4 }).x).toBeCloseTo(-4);
        expect(service.alignTo45DegreeAngle({ x: 0, y: 0 }, { x: -4, y: 4 }).y).toBeCloseTo(4);
    });
});
