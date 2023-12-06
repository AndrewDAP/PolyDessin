import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { LineService } from '@app/services/tools/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';

// tslint:disable:no-any
describe('LineService', () => {
    const TIMER = 510;

    let service: LineService;

    let validMouseEvent: MouseEvent;
    let invalidMouseEvent: MouseEvent;
    let pathDataMock: Vec2[];

    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorService: ColorService;
    let resizeService: ResizeService;
    let toolsInfoService: ToolsInfoService;
    let lineLogicService: LineLogicService;
    let keyEventService: KeyEventService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let changingToolsService: ChangingToolsService;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        colorService = new ColorService();
        resizeService = new ResizeService(drawServiceSpy);
        toolsInfoService = new ToolsInfoService();
        keyEventService = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolsService = new ChangingToolsService(keyEventService, undoRedoService);
        lineLogicService = new LineLogicService(drawServiceSpy, colorService, resizeService, toolsInfoService, changingToolsService);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: LineLogicService, useValue: lineLogicService },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: ToolsInfoService, useValue: toolsInfoService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(LineService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].previewCanvas = canvasTestHelper.drawCanvas;

        validMouseEvent = {
            clientX: 25,
            clientY: 25,
            button: 0,
        } as MouseEvent;

        invalidMouseEvent = {
            clientX: 25,
            clientY: 25,
            button: 1,
        } as MouseEvent;

        pathDataMock = [{ x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2];
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change size when toolsInfoService calls setSizeOf() with ToolType.line', () => {
        const size = 20;
        toolsInfoService.setSizeOf(ToolType.line, size);
        expect(service.size).toEqual(size);
    });

    it('should set mouseDown to true and increment clickCount on left-click', () => {
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDown).toBeTrue();
    });

    it('should not set mouseDown to true on non left-click', () => {
        service.onMouseDown(invalidMouseEvent);
        expect(service.mouseDown).toBeFalse();
    });

    it('should set mouseDownCoord to mouse position and increment clickCount in onMouseDown()', () => {
        const expectedResult = { x: 25, y: 25 };
        service.clickCount = 0;
        service.onMouseDown(validMouseEvent);
        expect(service.clickCount).toEqual(1);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('should set doubleClick to true and call onMouseDoubleClick() when clickCount > 1 in onMouseDown()', (done: DoneFn) => {
        const onMouseDoubleClickSpy: jasmine.Spy = spyOn(service, 'onMouseDoubleClick');
        service.clickCount = 2;
        lineLogicService.pathData.push({} as Vec2);
        service.onMouseDown(validMouseEvent);
        setTimeout(() => {
            expect(service.doubleClick).toEqual(true);
            expect(onMouseDoubleClickSpy).toHaveBeenCalled();
            done();
        }, TIMER);
    });

    it('should set doubleClick to false when clickCount <= 1 in onMouseDown()', (done: DoneFn) => {
        service.onMouseDown(validMouseEvent);
        setTimeout(() => {
            expect(service.doubleClick).toEqual(false);
            done();
        }, TIMER);
    });

    it('should call processClick() of LineLogicService if clickCount = 1 and doubleClick is false in onMouseDown()', (done: DoneFn) => {
        lineLogicService.pathData.push({} as Vec2);
        service.onMouseDown(validMouseEvent);
        setTimeout(() => {
            expect(service.doubleClick).toEqual(false);
            done();
        }, TIMER);
    });

    it('should set clickCount to 0 if none of the conditions are met in onMouseDown()', (done: DoneFn) => {
        service.doubleClick = true;
        // tslint:disable-next-line: no-magic-numbers
        service.clickCount = 3;
        service.onMouseDown(validMouseEvent);
        setTimeout(() => {
            expect(service.clickCount).toEqual(0);
            done();
        }, TIMER);
    });

    it('should set mouseDownCoord to mousePosition in onMouseDoubleClick()', () => {
        const mousePos = { x: 25, y: 25 };
        lineLogicService.pathData = pathDataMock;
        service.onMouseDoubleClick(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(mousePos);
    });

    it('should call alignTo45DegreeAngle of LineLogicService if shiftIsDown is true in onMouseDoubleClick()', () => {
        const alignSpy: jasmine.Spy = spyOn(lineLogicService, 'alignTo45DegreeAngle').and.callThrough();
        lineLogicService.pathData = pathDataMock;
        service.shiftIsDown = true;
        service.onMouseDoubleClick(validMouseEvent);
        expect(alignSpy).toHaveBeenCalled();
    });

    it('should return true canConnectToStart  if near initial point on onMouseDoubleClick()', () => {
        const expectedValue = { x: 12, y: 12 };
        const canConnectToStart: jasmine.Spy = spyOn(lineLogicService, 'canConnectToStart').and.callThrough();
        lineLogicService.pathData = pathDataMock;
        service.onMouseDoubleClick({ clientX: 12, clientY: 12, button: 1 } as MouseEvent);
        expect(canConnectToStart).toHaveBeenCalledWith(expectedValue);
        lineLogicService.pathData = pathDataMock;
        expect(lineLogicService.canConnectToStart({ x: 11, y: 11 })).toEqual(true);
    });

    it('should change lastMousePos property on mouseMoveWindow()', () => {
        const mousePos = { x: 25, y: 25 };
        service.onMouseMoveWindow(validMouseEvent);
        expect(service.lastMousePos).toEqual(mousePos);
    });

    it('should call updatePreview() of LineLogicService if its pathData size > 0 on mouseMoveWindow()', () => {
        const updatePreviewSpy: jasmine.Spy = spyOn(lineLogicService, 'updatePreview');
        lineLogicService.pathData.push({} as Vec2);
        service.onMouseMoveWindow(validMouseEvent);
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('should call processEscape() of LineLogicService and set undoRedoDisable of UndoRedoService to false in onKeyDownEscape()', () => {
        const processEscapeSpy: jasmine.Spy = spyOn(lineLogicService, 'processEscape');
        service.onKeyDownEscape();
        expect(processEscapeSpy).toHaveBeenCalled();
        expect(undoRedoService.undoRedoDisable).toEqual(false);
    });

    it('should call processBackSpace() of LineLogicService in onKeyDownBackSpace()', () => {
        const processBackSpaceSpy: jasmine.Spy = spyOn(lineLogicService, 'processBackSpace');
        service.onKeyDownBackSpace();
        expect(processBackSpaceSpy).toHaveBeenCalled();
    });

    it('should set shiftIsDown to true and call processShift() of LineLogicService in onKeyDownShift()', () => {
        const processShiftSpy: jasmine.Spy = spyOn(lineLogicService, 'processShift');
        service.onKeyDownShift();
        expect(service.shiftIsDown).toEqual(true);
        expect(processShiftSpy).toHaveBeenCalled();
    });

    it('should set shiftIsDown to false and call processShift() of LineLogicService in onKeyDownShift()', () => {
        const processShiftSpy: jasmine.Spy = spyOn(lineLogicService, 'processShift');
        service.onKeyUpShift();
        expect(service.shiftIsDown).toEqual(false);
        expect(processShiftSpy).toHaveBeenCalled();
    });

    it('should call clearCanvas(), addCommand() and clearPath)() of correct services in applyToBase()', () => {
        const clearPathSpy: jasmine.Spy = spyOn(lineLogicService, 'clearPath');
        service.applyToBase();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoService.addCommand).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });
});
