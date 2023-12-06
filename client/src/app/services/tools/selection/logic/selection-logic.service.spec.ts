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
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockSelectionLogicService } from './mock-selection-logic';
import { TRANSLATION_VALUE } from './selection-logic.service';

// tslint:disable:no-any
describe('SelectionLogicService', () => {
    let service: MockSelectionLogicService;

    let resetSelectionSpy: jasmine.Spy<any>;
    let pasteSelectionSpy: jasmine.Spy<any>;
    let onArrowDownSpy: jasmine.Spy<any>;
    let switchKeysSpy: jasmine.Spy<any>;
    let moveSelectionSpy: jasmine.Spy<any>;
    let movePreviewSpy: jasmine.Spy<any>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let changingToolService: ChangingToolsService;
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let resizeService: ResizeService;
    let selectionStateService: SelectionStateService;
    let gridService: GridService;
    const stateSubject: BehaviorSubject<State> = new BehaviorSubject<State>(State.OFF);
    beforeEach(() => {
        toolsInfoService = new ToolsInfoService();
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
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
        changingToolService = new ChangingToolsService(keyEventService, undoRedoService);
        selectionStateService = new SelectionStateService();
        spyOn(selectionStateService, 'stateObserver').and.returnValue(stateSubject.asObservable());
        spyOn(selectionStateService, 'changeState').and.callFake((state: State) => {
            stateSubject.next(state);
        });
        gridService = new GridService(toolsInfoService, keyEventService, resizeService);
        service = new MockSelectionLogicService(
            drawServiceSpy,
            colorServiceSpyObj,
            toolsInfoService,
            changingToolService,
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
                { provide: ChangingToolsService, useValue: changingToolService },
                { provide: DrawingService, useValue: drawingService },
                { provide: ResizeService, useValue: resizeService },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: SelectionStateService, useValue: selectionStateService },
                { provide: GridService, useValue: gridService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        resetSelectionSpy = spyOn(service, 'resetSelection').and.callThrough();
        pasteSelectionSpy = spyOn(service, 'pasteSelection').and.callThrough();
        onArrowDownSpy = spyOn(service, 'onArrowDown').and.callThrough();
        switchKeysSpy = spyOn(service, 'switchKeys').and.callThrough();
        moveSelectionSpy = spyOn(service, 'moveSelection').and.callThrough();
        movePreviewSpy = spyOn(service, 'movePreview').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set activeTool properly', () => {
        changingToolService.setTool(ToolType.line);
        expect(service.activeTool).toEqual(ToolType.line);
    });

    it('should set state properly', () => {
        selectionStateService.changeState(State.IDLE);
        expect(service.state).toEqual(State.IDLE);
    });

    it('should set isMagnetActive properly', () => {
        toolsInfoService.setMagnetActive(true);
        expect(service.isMagnetActive).toEqual(true);
    });

    it('should set magnetHandle properly', () => {
        toolsInfoService.setMagnetHandle(MagnetGrabHandle.LowerCenter);
        expect(service.magnetHandle).toEqual(MagnetGrabHandle.LowerCenter);
    });

    it('should update selectionPos according parameter passed in movePreview()', () => {
        const offSet = { x: 10, y: 10 };
        const expectedPos = { x: 20, y: 20 };
        service.selectionPos = { x: 10, y: 10 };
        service.movePreview(offSet);
        expect(service.selectionPos).toEqual(expectedPos);
    });

    it('should return true if mouse in inside the selection in insidePreview()', () => {
        service.selectionPos = { x: 5, y: 5 };
        service.lastMousePos = { x: 10, y: 10 };
        service.dimension = { x: 10, y: 10 };
        const inside = service.insidePreview();
        expect(inside).toEqual(true);
    });

    it('should return false if mouse in outside the selection in insidePreview()', () => {
        service.selectionPos = { x: 5, y: 5 };
        service.lastMousePos = { x: 0, y: 0 };
        service.dimension = { x: 10, y: 10 };
        const inside = service.insidePreview();
        expect(inside).toEqual(false);
    });

    it('should reset selectionPos, originalPos and dimension in resetSelection()', () => {
        const expectedValue = { x: 0, y: 0 };
        service.resetSelection();
        expect(service.selectionPos).toEqual(expectedValue);
        expect(service.originalPos).toEqual(expectedValue);
        expect(service.dimension).toEqual(expectedValue);
    });

    it('should set mouseDown, isActive and undoRedoDisable to false in resetSelection()', () => {
        service.resetSelection();
        expect(service.mouseDown).toEqual(false);
        expect(undoRedoService.undoRedoDisable).toEqual(false);
        expect(service.isActive.value).toEqual(false);
    });

    it('should call resetKeys() of SelectionMoveService in resetSelection()', () => {
        const resetKeysSpy: jasmine.Spy = spyOn(service.selectionMoveService, 'resetKeys').and.callThrough();
        service.resetSelection();
        expect(resetKeysSpy).toHaveBeenCalled();
    });

    it('should call resetSelection() and set dimension to canvasSize in selectAll()', () => {
        const expectedDimension = service.canvasSize;
        service.selectAll();
        expect(resetSelectionSpy).toHaveBeenCalled();
        expect(service.dimension).toEqual(expectedDimension);
    });

    it('should set isActive to true and state to IDLE in selectAll()', () => {
        service.selectAll();
        expect(service.state).toEqual(State.IDLE);
        expect(service.isActive.value).toEqual(true);
    });

    it('should call getImageData() and pasteSelection() with previewCtx in selectAll()', () => {
        const getImageDataSpy: jasmine.Spy = spyOn(baseCtxStub, 'getImageData');
        const expectedPos = { x: 0, y: 0 };
        const expectDimension = { x: 1000, y: 800 };
        service.selectAll();
        expect(getImageDataSpy).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectDimension.x, expectDimension.y);
        expect(pasteSelectionSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('should call movePreview(), clearCanvas() and pasteSelection() with previewCtx in moveSelection()', () => {
        const offSet = { x: 10, y: 10 };
        service.movePreview(offSet);
        service.moveSelection();
        expect(movePreviewSpy).toHaveBeenCalledWith(offSet);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(pasteSelectionSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('should call changeState of stateSelectionService in changeState()', () => {
        service.changeState(State.IDLE);
        expect(selectionStateService.changeState).toHaveBeenCalledWith(State.IDLE);
    });

    it('should call onArrowDown() with correction direction in onKeyDown*Direction*Arrow', () => {
        service.onKeyDownUpArrow();
        expect(onArrowDownSpy).toHaveBeenCalledWith('up');
        service.onKeyDownDownArrow();
        expect(onArrowDownSpy).toHaveBeenCalledWith('down');
        service.onKeyDownLeftArrow();
        expect(onArrowDownSpy).toHaveBeenCalledWith('left');
        service.onKeyDownRightArrow();
        expect(onArrowDownSpy).toHaveBeenCalledWith('right');
    });

    it('should call onArrowUp() of SelectionMoveService with correction direction if state is IDLE in onKeyUp*Direction*Arrow', () => {
        const onArrowUpSpy = spyOn(service.selectionMoveService, 'onArrowUp');
        service.state = State.IDLE;
        service.onKeyUpUpArrow();
        expect(onArrowUpSpy).toHaveBeenCalledWith('up');
        service.onKeyUpDownArrow();
        expect(onArrowUpSpy).toHaveBeenCalledWith('down');
        service.onKeyUpLeftArrow();
        expect(onArrowUpSpy).toHaveBeenCalledWith('left');
        service.onKeyUpRightArrow();
        expect(onArrowUpSpy).toHaveBeenCalledWith('right');
    });

    it('should not call onArrowUp() of SelectionMoveService if state is not IDLE in onKeyUp*Direction*Arrow', () => {
        const onArrowUpSpy = spyOn(service.selectionMoveService, 'onArrowUp');
        service.state = State.OFF;
        service.onKeyUpUpArrow();
        service.onKeyUpDownArrow();
        service.onKeyUpLeftArrow();
        service.onKeyUpRightArrow();
        expect(onArrowUpSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if State is not IDLE in onArrowDown() ', () => {
        service.state = State.OFF;
        service.onArrowDown('up');
        expect(switchKeysSpy).not.toHaveBeenCalled();
    });

    it('should call switchKeys() with correct direction if state is IDLE and key is not currently pressed in onArrowDown() ', () => {
        service.state = State.IDLE;
        service.onArrowDown('up');
        expect(switchKeysSpy).toHaveBeenCalledWith('up');
    });

    it('should not call switchKeys() if state is IDLE and key is already pressed in onArrowDown() ', () => {
        service.state = State.IDLE;
        service.selectionMoveService.keysPressed.up = true;
        service.onArrowDown('up');
        expect(switchKeysSpy).not.toHaveBeenCalled();
    });

    it('should call setTimeout() if no other key is already pressed in onArrowDown() ', () => {
        const setTimeoutSpy = spyOn(window, 'setTimeout');
        service.state = State.IDLE;
        service.onArrowDown('up');
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('should not call setInterval() if another key is already pressed in onArrowDown() ', () => {
        const setIntervalSpy = spyOn(window, 'setInterval');
        service.state = State.IDLE;
        service.selectionMoveService.keysPressed.down = true;
        service.onArrowDown('up');
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it('should call switchKeys() with correct direction in moveWithKeys() ', () => {
        service.selectionMoveService.keysPressed.up = true;
        service.moveWithKeys();
        expect(switchKeysSpy).toHaveBeenCalledWith('up');
    });

    it('should not call switchKeys() if no keys are pressed in onArrowDown() ', () => {
        service.moveWithKeys();
        expect(switchKeysSpy).not.toHaveBeenCalled();
    });

    it('should call moveSelection with correction parameters in switchKeys() ', () => {
        service.switchKeys('up');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: 0, y: -TRANSLATION_VALUE });
        service.switchKeys('down');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: 0, y: TRANSLATION_VALUE });
        service.switchKeys('left');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: -TRANSLATION_VALUE, y: 0 });
        service.switchKeys('right');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: +TRANSLATION_VALUE, y: 0 });
    });

    it('should not call moveSelection() when calling switchKeys and it has already moved once', () => {
        service.switchKeys('up');
        expect(moveSelectionSpy).not.toHaveBeenCalled();
    });

    it('should call moveSelection with correction parameters in switchKeys() with magnet active ', () => {
        service.isMagnetActive = true;
        service.magnetHandle = MagnetGrabHandle.UpperLeft;
        // tslint:disable: no-magic-numbers
        gridService.canvasSquareSize = 50;
        service.selectionPos = { x: 52, y: 52 };
        service.switchKeys('up');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: 0, y: -2 });
        service.selectionPos = { x: 52, y: 52 };
        service.switchKeys('down');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: 0, y: 48 });
        service.selectionPos = { x: 52, y: 52 };
        service.switchKeys('left');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: -2, y: 0 });
        service.selectionPos = { x: 52, y: 52 };
        service.switchKeys('right');
        expect(movePreviewSpy).toHaveBeenCalledWith({ x: 48, y: 0 });
    });

    it('should call clearCanvas, addCommand and resetSelection when calling applyToBase()', () => {
        service.applyToBase();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoService.addCommand).toHaveBeenCalled();
        expect(resetSelectionSpy).toHaveBeenCalled();
    });
});
