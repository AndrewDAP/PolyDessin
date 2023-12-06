// tslint:disable: max-file-line-count
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MagnetGrabHandle } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { MockSelectionBehaviourService } from '@app/services/tools/selection/behaviour/mock-selection-behaviour';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// tslint:disable:no-any
describe('SelectionBehaviourService', () => {
    let service: MockSelectionBehaviourService;

    let validMouseEvent: MouseEvent;
    let invalidMouseEvent: MouseEvent;
    let basicMouseEvent: MouseEvent;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let resizeService: ResizeService;
    let gridService: GridService;

    let selectionMoveService: SelectionMoveService;
    let selectionStateService: SelectionStateService;

    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();
    const stateSubject: BehaviorSubject<State> = new BehaviorSubject<State>(State.OFF);

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        toolsInfoService = new ToolsInfoService();
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        selectionMoveService = new SelectionMoveService();
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
        selectionStateService = new SelectionStateService();
        spyOn(selectionStateService, 'stateObserver').and.returnValue(stateSubject.asObservable());
        spyOn(selectionStateService, 'changeState').and.callFake((state: State) => {
            stateSubject.next(state);
        });

        gridService = new GridService(toolsInfoService, keyEventService, resizeService);
        service = new MockSelectionBehaviourService(
            drawServiceSpy,
            colorServiceSpyObj,
            toolsInfoService,
            changingToolServiceSpy,
            resizeService,
            undoRedoService,
            keyEventService,
            selectionStateService,
            gridService,
        );

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: ChangingToolsService, useValue: changingToolServiceSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ResizeService, useValue: resizeService },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: SelectionMoveService, useValue: selectionMoveService },
                { provide: SelectionStateService, useValue: selectionStateService },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        spyOn(service, 'applyToBase');
        spyOn(service, 'moveSelection');
        spyOn(service, 'resetSelection');
        spyOn(service, 'changeState');
        spyOn(service, 'processShift').and.callThrough();

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

        basicMouseEvent = {
            clientX: 10,
            clientY: 10,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set mouseDown to true on left-click ', () => {
        service.state = State.MOVE;
        service.onMouseDown(validMouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('should keep mouseDown false on non left-click ', () => {
        service.onMouseDown(invalidMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should call processMouseDownOFF() if state is OFF on left-click', () => {
        const processMouseDownOFFSpy = spyOn<any>(service, 'processMouseDownOFF').and.callThrough();
        service.state = State.OFF;
        service.onMouseDown(validMouseEvent);
        expect(processMouseDownOFFSpy).toHaveBeenCalled();
    });

    it('should set state to MOVE if mouse is inside the selection and current state is IDLE on left-click', () => {
        service.lastMousePos = { x: 10, y: 10 };
        service.selectionPos = { x: 0, y: 0 };
        service.dimension = { x: 20, y: 20 };
        service.state = State.IDLE;
        service.onMouseDown(validMouseEvent);
        expect(service.state.valueOf()).toEqual(State.MOVE);
    });

    it('should call applyToBase() and set mouseDown to false if state is IDLE on left-click outside the selection', () => {
        service.lastMousePos = { x: 10, y: 10 };
        service.selectionPos = { x: 20, y: 20 };
        service.dimension = { x: 2, y: 2 };
        service.state = State.IDLE;
        service.onMouseDown(validMouseEvent);
        expect(service.applyToBase).toHaveBeenCalled();
        expect(service.mouseDown).toEqual(false);
    });

    it('should set mouseDown to false on left-mouseUp ', () => {
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should keep mouseDown true on non left-mouseUp ', () => {
        service.mouseDown = true;
        service.onMouseUp(invalidMouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('should call processMouseUpOFF() if state is OFF and selection area is > 0 on left-mouseUp', () => {
        const processMouseUpOFFSpy = spyOn<any>(service, 'processMouseUpOFF').and.callThrough();
        service.mouseDown = true;
        service.state = State.OFF;
        service.dimension = { x: 10, y: 10 };
        service.onMouseUp(validMouseEvent);
        expect(processMouseUpOFFSpy).toHaveBeenCalled();
    });

    it('should set properties to correct values if state is OFF and selection area is > 0 on left-mouseUp', () => {
        service.mouseDown = true;
        service.state = State.OFF;
        service.dimension = { x: 10, y: 10 };
        service.onMouseUp(validMouseEvent);
        expect(service.changeState).toHaveBeenCalledWith(State.IDLE);
        expect(service.isActive.value).toEqual(true);
        expect(undoRedoService.undoRedoDisable.valueOf()).toEqual(true);
    });

    it('should call changeSet() with State.IDLE and disable undo/redo on left-mouseUp if current state is MOVE', () => {
        service.mouseDown = true;
        service.state = State.MOVE;
        service.onMouseUp(validMouseEvent);
        expect(service.changeState).toHaveBeenCalledWith(State.IDLE);
        expect(undoRedoService.undoRedoDisable.valueOf()).toEqual(true);
    });

    it('should call changeSet() with State.OFF and enable undo/redo on left-mouseUp if current state is IDLE', () => {
        service.mouseDown = true;
        service.state = State.IDLE;
        service.onMouseUp(validMouseEvent);
        expect(service.changeState).toHaveBeenCalledWith(State.OFF);
        expect(undoRedoService.undoRedoDisable.valueOf()).toEqual(false);
    });

    it('should set State to IDLE onMouseUp if state is not OFF, MOVE or IDLE ', () => {
        service.mouseDown = true;
        service.state = State.N;
        service.onMouseUp(validMouseEvent);
        expect(service.changeState).toHaveBeenCalledWith(State.IDLE);
    });

    it('should set oldMousePos to former lastMousePos and update lastMousePos in onMouseMoveWindow()', () => {
        const initialLastMousePos = { x: 1, y: 1 };
        const expectedPos = { x: 10, y: 10 };
        service.state = State.IDLE;
        service.lastMousePos = initialLastMousePos;
        service.onMouseMoveWindow(basicMouseEvent);
        expect(service.oldMousePos).toEqual(initialLastMousePos);
        expect(service.lastMousePos).toEqual(expectedPos);
    });

    it('should call drawPreview() if current state is OFF in onMouseMoveWindow()', () => {
        const drawPreviewSpy = spyOn<any>(service, 'drawPreview').and.callThrough();
        service.state = State.OFF;
        service.onMouseMoveWindow(basicMouseEvent);
        expect(drawPreviewSpy).toHaveBeenCalled();
    });

    it('should call moveSelection() if current state is MOVE, mouseDown is true and isMagnetActive is false in onMouseMoveWindow() ', () => {
        service.state = State.MOVE;
        service.mouseDown = true;
        service.lastMousePos = { x: 20, y: 20 };
        service.onMouseMoveWindow(basicMouseEvent);
        expect(service.moveSelection).toHaveBeenCalled();
    });

    it('should call moveSelectionMagnet() if current state is MOVE, mouseDown is true  and isMagnetActive is true in onMouseMoveWindow() ', () => {
        service.state = State.MOVE;
        service.mouseDown = true;
        service.isMagnetActive = true;
        const spy = spyOn(service, 'moveSelectionMagnet');
        service.onMouseMoveWindow(basicMouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should do nothing if current state is MOVE and mouseDown is false in onMouseMoveWindow()', () => {
        service.state = State.MOVE;
        service.mouseDown = false;
        service.onMouseMoveWindow(basicMouseEvent);
        expect(service.moveSelection).not.toHaveBeenCalled();
    });

    it('should set isEven to true if state is OFF on onKeyDownShift()', () => {
        service.isEven = false;
        service.state = State.OFF;
        service.onKeyDownShift();
        expect(service.isEven).toEqual(true);
    });

    it('should set isEven to false if state is OFF on onKeyUpShift()', () => {
        service.isEven = true;
        service.state = State.OFF;
        service.onKeyUpShift();
        expect(service.isEven).toEqual(false);
    });

    it('should call processShift() if state is OFF on onKeyDownShift() or onKeyupShift()', () => {
        service.state = State.OFF;
        service.onKeyDownShift();
        service.onKeyUpShift();
        expect(service.processShift).toHaveBeenCalled();
    });

    it('should not call processShift() if state is not OFF on onKeyDownShift() or onKeyupShift()', () => {
        service.state = State.IDLE;
        service.onKeyDownShift();
        service.onKeyUpShift();
        expect(service.processShift).not.toHaveBeenCalled();
    });

    it('should call processEscape() and resetSelection() on onKeyDownEscape if current state is OFF()', () => {
        const processEscapeSpy = spyOn<any>(service, 'processEscape').and.callThrough();
        service.state = State.OFF;
        service.onKeyDownEscape();
        expect(processEscapeSpy).toHaveBeenCalled();
        expect(service.resetSelection).toHaveBeenCalled();
    });

    it('should call applyToBase() on onKeyDownEscape if current state is not OFF()', () => {
        service.state = State.IDLE;
        service.onKeyDownEscape();
        expect(service.applyToBase).toHaveBeenCalled();
    });

    it('should call clearCanvas(), deleteShape(), resetSelection() and clearPath() if state is not OFF on onKeyDownDelete()', () => {
        const clearPathSpy = spyOn<any>(service, 'clearPath');
        const deleteShapeSpy = spyOn<any>(service, 'deleteShape');

        service.state = State.IDLE;
        service.onKeyDownDelete();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(deleteShapeSpy).toHaveBeenCalled();
        expect(service.resetSelection).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should set isActive and mouseDown to false if state is not OFF on onKeyDownDelete()', () => {
        service.state = State.IDLE;
        service.mouseDown = true;
        service.onKeyDownDelete();
        expect(service.isActive.value).toEqual(false);
        expect(service.mouseDown).toEqual(false);
    });

    it('should call clearCanvas(), deleteShape(), resetSelection() and clearPath() if state is not OFF on onKeyDownDelete()', () => {
        const clearPathSpy = spyOn<any>(service, 'clearPath');
        const deleteShapeSpy = spyOn<any>(service, 'deleteShape');

        service.state = State.IDLE;
        service.onKeyDownDelete();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(deleteShapeSpy).toHaveBeenCalled();
        expect(service.resetSelection).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should set isActive and mouseDown to false if state is not OFF on onKeyDownDelete()', () => {
        service.state = State.IDLE;
        service.mouseDown = true;
        service.onKeyDownDelete();
        expect(service.isActive.value).toEqual(false);
        expect(service.mouseDown).toEqual(false);
    });

    it('should do nothing if state is OFF on onKeyDownDelete()', () => {
        service.state = State.OFF;
        service.onKeyDownDelete();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should execute extracton sequence on extractImage())', () => {
        service.selectionPos = { x: 10, y: 10 };
        service.dimension = { x: 10, y: 10 };
        service.extractImage();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should return the correct value depending on the handle in changePositionReference ', () => {
        service.magnetHandle = MagnetGrabHandle.LowerCenter;
        service.selectionPos = { x: 50, y: 50 };
        service.dimension = { x: 10, y: 10 };
        expect(service.changePositionReference()).toEqual({ x: 55, y: 60 });
        service.magnetHandle = MagnetGrabHandle.MiddleRight;
        expect(service.changePositionReference()).toEqual({ x: 60, y: 55 });
    });

    it('move according to magnet should call move selection with the right value in moveSelectionAccordingToMagnet()', () => {
        const changePositionReferenceSpy = spyOn<any>(service, 'changePositionReference').and.callThrough();
        service.magnetHandle = MagnetGrabHandle.UpperLeft;
        service.lastMousePos = { x: 50, y: 50 };
        service.mouseDownCoord = { x: 25, y: 25 };
        service.selectionPosOnMouseDown = { x: 12, y: 12 };
        // tslint:disable-next-line: no-magic-numbers
        service.moveSelectionMagnet();
        expect(changePositionReferenceSpy).toHaveBeenCalled();
        expect(service.moveSelection).toHaveBeenCalled();
    });

    it('should set start to the coordinates of the corner that is currently clicked', () => {
        service.selectionPos = { x: 50, y: 50 };
        service.dimension = { x: 10, y: 10 };

        service.state = State.SE;
        service.onMouseDown(validMouseEvent);
        expect(service.start).toEqual({ x: service.selectionPos.x, y: service.selectionPos.y });

        service.state = State.SW;
        service.onMouseDown(validMouseEvent);
        expect(service.start).toEqual({ x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y });

        service.state = State.NE;
        service.onMouseDown(validMouseEvent);
        expect(service.start).toEqual({ x: service.selectionPos.x, y: service.selectionPos.y + service.dimension.y });

        service.state = State.NW;
        service.onMouseDown(validMouseEvent);
        expect(service.start).toEqual({ x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y + service.dimension.y });
    });

    it('should call moveN onMouseWindow if state is N', () => {
        service.anchors = { BR: { x: 0, y: 0 }, TL: { x: 0, y: 0 } };
        const moveNSpy = spyOn<any>(service, 'moveN').and.callThrough();
        service.state = State.N;
        service.onMouseMoveWindow(validMouseEvent);
        expect(moveNSpy).toHaveBeenCalled();
    });

    it('coverage test for pasteSelection of MockSelectionBehaviour (abstract method with no actual implementation)', () => {
        service.pasteSelection(previewCtxStub);
        expect(true).toEqual(true);
    });
});
