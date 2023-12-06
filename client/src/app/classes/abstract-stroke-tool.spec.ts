import { TestBed } from '@angular/core/testing';
import { AbstractStrokeTool } from '@app/classes/abstract-stroke-tool';
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
class MockAbstractStrokeTool extends AbstractStrokeTool {
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
    drawPath(): Command {
        return new MockCommand();
    }
}

// tslint:disable:no-any
describe('AbstractStrokeTool', () => {
    let service: MockAbstractStrokeTool;

    let validMouseEvent: MouseEvent;
    let invalidMouseEvent: MouseEvent;
    let mouseMoveEvent: MouseEvent;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let drawSpy: jasmine.Spy<any>;
    let drawPathSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;

    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let resizeService: ResizeService;

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
        service = new MockAbstractStrokeTool(
            drawServiceSpy,
            colorServiceSpyObj,
            toolsInfoService,
            changingToolServiceSpy,
            resizeService,
            undoRedoService,
        );
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

        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        drawPathSpy = spyOn<any>(service, 'drawPath').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        validMouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 0,
        } as MouseEvent;

        invalidMouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 1,
        } as MouseEvent;

        mouseMoveEvent = {
            clientX: 10,
            clientY: 10,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set mouseDown to true on left-click ', () => {
        service.pathData = [];
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('should not set mouseDown to true on non left-click ', () => {
        service.onMouseDown(invalidMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should set mouseDownCoord to mouse position and push it to pathData on left-click ', () => {
        const expectedResult = { x: validMouseEvent.clientX, y: validMouseEvent.clientY };
        service.pathData = [];
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
        expect(service.pathData[service.pathData.length - 1]).toEqual(expectedResult);
    });

    it('should not set mouseDownCoord to mouse position and push it to pathData on non left-click ', () => {
        const expectedResult = { x: invalidMouseEvent.clientX, y: invalidMouseEvent.clientY };
        service.pathData = [];
        service.onMouseDown(invalidMouseEvent);
        expect(service.mouseDownCoord).not.toEqual(expectedResult);
        expect(service.pathData.length).toEqual(0);
    });

    it('should set mouseDown to false on left-mouseUp', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should not push mouse position to pathData and not set mouseDown to false on non left-mouseUp', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseUp(invalidMouseEvent);
        expect(service.mouseDown).not.toEqual(false);
    });

    it('should clear canvas and pathData on left-mouseUp', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should not clear canvas and pathData on non left-mouseUp', () => {
        service.pathData = [];
        service.onMouseUp(invalidMouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it('should call drawPath() on left-mouseUp', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('should not call drawPath() on non left-mouseUp', () => {
        service.pathData = [];
        service.onMouseUp(invalidMouseEvent);
        expect(drawPathSpy).not.toHaveBeenCalled();
    });

    it('should not call drawPath() on non left-mouseUp', () => {
        service.pathData = [];
        service.onMouseUp(invalidMouseEvent);
        expect(drawPathSpy).not.toHaveBeenCalled();
    });

    it('should push mouse position in pathData and call draw() on mouseMoveWindow if mouseDown is true', () => {
        service.pathData = [];
        service.mouseDown = true;
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(service.pathData.length).toEqual(1);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should not push mouse position in pathData or call draw() on mouseMoveWindow if mouseDown is false', () => {
        service.pathData = [];
        service.onMouseMoveWindow(mouseMoveEvent);
        expect(service.pathData.length).toEqual(0);
        expect(drawSpy).not.toHaveBeenCalled();
    });
});
