import { TestBed } from '@angular/core/testing';
import { AbstractShape } from '@app/classes/abstract-shape';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';
import { Command } from './commands/command';

class MockCommand implements Command {
    // tslint:disable-next-line: no-empty
    do(): void {}
}

// tslint:disable-next-line: max-classes-per-file
class MockAbstractShape extends AbstractShape {
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        resizeService: ResizeService,
        undoRedoService: jasmine.SpyObj<UndoRedoService>,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, resizeService, undoRedoService);
    }
    drawShape(): Command {
        return new MockCommand();
    }
}

// tslint:disable:no-any
describe('AbstractShape', () => {
    let service: MockAbstractShape;

    let validMouseEvent: MouseEvent;
    let invalidMouseEvent: MouseEvent;
    let basicMouseEvent: MouseEvent;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let drawShapeSpy: jasmine.Spy<any>;
    // let adjustEdgeSpy: jasmine.Spy<any>;

    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let resizeService: ResizeService;

    const downPos = { x: 50, y: 50 };
    const lastPos = { x: 445, y: 450 };

    beforeEach(() => {
        toolsInfoService = new ToolsInfoService();
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        changingToolServiceSpy = jasmine.createSpyObj('ChangingToolService', {
            getTool: toolTypeSubject.asObservable(),
            setTool: '',
        });
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', ['clearCanvas']);

        keyEventService = jasmine.createSpyObj('KeyEventService', [
            'getKeyDownEvent',
            'getKeyUpEvent',
            'getMouseEvent',
            'getWheelEvent',
            'onMouseMove',
            'onMouseMoveWindow',
            'onMouseDown',
            'onMouseUp',
            'onMouseLeave',
            'onMouseEnter',
            'onKeyDown',
            'onKeyUp',
            'onWheelEvent',
        ]);

        keyEventService.getKeyDownEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getKeyUpEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getMouseEvent.and.returnValue(new Observable<MouseEvent>());
        keyEventService.getWheelEvent.and.returnValue(new Observable<WheelEvent>());
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        service = new MockAbstractShape(drawServiceSpy, colorServiceSpyObj, toolsInfoService, changingToolServiceSpy, resizeService, undoRedoService);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: ChangingToolsService, useValue: changingToolServiceSpy },
                { provide: DrawingService, useValue: drawingService },
                { provide: ResizeService, useValue: resizeService },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        drawShapeSpy = spyOn<any>(service, 'drawShape').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        validMouseEvent = {
            clientX: 445,
            clientY: 450,
            button: 0,
        } as MouseEvent;

        invalidMouseEvent = {
            clientX: 445,
            clientY: 450,
            button: 1,
        } as MouseEvent;

        basicMouseEvent = {
            clientX: 445,
            clientY: 450,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change the value of this.withFill when togglign withFill on the sidebar', () => {
        toolsInfoService.setWithFill(false);
        expect(service.withFill).toEqual(false);
    });

    it('should change the value of this.withFill when togglign withFill on the sidebar', () => {
        toolsInfoService.setWithStroke(true);
        expect(service.withStroke).toEqual(true);
    });

    it('should set mouseDown to true on left-click ', () => {
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('should not set mouseDown to true on non left-click ', () => {
        service.onMouseDown(invalidMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should set mouseDownCoord on left-click', () => {
        const expectedResult = { x: 445, y: 450 };
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('should set mouseDown to false on left-mouseUp when mouseDown is true', () => {
        service.mouseDownCoord = downPos;
        service.lastMousePos = lastPos;
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should not set mouseDown to false on non left-mouseUp', () => {
        service.mouseDown = true;
        service.onMouseUp(invalidMouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('should call drawShape() on left-mouseUp when mouseDown is true', () => {
        service.mouseDownCoord = downPos;
        service.lastMousePos = lastPos;
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(drawShapeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call drawShapeSpy() on non left-mouseUp ', () => {
        const expectedResult = 0;
        service.onMouseUp(invalidMouseEvent);
        expect(drawShapeSpy).toHaveBeenCalledTimes(expectedResult);
    });

    it('should set lastMousePos when mouse moves ', () => {
        const expectedResult = { x: basicMouseEvent.clientX, y: basicMouseEvent.clientY };
        service.onMouseMoveWindow(basicMouseEvent);
        expect(service.lastMousePos).toEqual(expectedResult);
    });

    it('should call clearCanvas() and drawShape() if mouseDown is true when mouse moves ', () => {
        service.mouseDown = true;
        service.onMouseMoveWindow(basicMouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should set isEven to true when shift is pressed', () => {
        service.onKeyDownShift();
        expect(service.isEven).toEqual(true);
    });

    it('should call clearCanvas() and drawShape() when shift is pressed and mouseDown is true', () => {
        service.mouseDownCoord = downPos;
        service.lastMousePos = lastPos;
        service.mouseDown = true;
        service.onKeyDownShift();
        expect(drawShapeSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should set isEven to false when shift is released', () => {
        service.onKeyUpShift();
        expect(service.isEven).toEqual(false);
    });

    it('should execute drawing sequence when shift is pressed or released when mouseDown is true', () => {
        const expectedResult = 2;
        service.mouseDownCoord = downPos;
        service.lastMousePos = lastPos;
        service.mouseDown = true;
        service.onKeyDownShift();
        service.onKeyUpShift();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(expectedResult);
        expect(drawShapeSpy).toHaveBeenCalledTimes(expectedResult);
    });

    it('should call clearCanvas() and set mouseDown to false when escape is pressed', () => {
        service.onKeyDownEscape();
        expect(service.mouseDown).toEqual(false);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});
