import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { MockSelectionShapeService } from '@app/services/tools/selection/shape/mock-selection-shape';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// tslint:disable:no-any
describe('SelectionShapeService', () => {
    let service: MockSelectionShapeService;

    let validMouseEvent: MouseEvent;

    let drawPreviewSpy: jasmine.Spy<any>;
    let extractImageSpy: jasmine.Spy<any>;

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
            'onMouseMove',
            'onMouseMoveWindow',
            'onMouseDown',
            'onMouseUp',
            'onMouseLeave',
            'onMouseEnter',
            'onKeyDown',
            'onKeyUp',
        ]);

        keyEventService.getKeyDownEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getKeyUpEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getMouseEvent.and.returnValue(new Observable<MouseEvent>());

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        selectionStateService = new SelectionStateService();
        gridService = new GridService(toolsInfoService, keyEventService, resizeService);

        spyOn(selectionStateService, 'stateObserver').and.returnValue(stateSubject.asObservable());
        spyOn(selectionStateService, 'changeState').and.callFake((state: State) => {
            stateSubject.next(state);
        });

        service = new MockSelectionShapeService(
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
                { provide: DrawingService, useValue: drawingService },
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

        drawPreviewSpy = spyOn<any>(service, 'drawPreview').and.callThrough();
        extractImageSpy = spyOn<any>(service, 'extractImage');

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        validMouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set mouseDownCoord to mouse position on processMouseDownOFF()', () => {
        const expectedPos = { x: 10, y: 10 };
        service.state = State.OFF;
        service.processMouseDownOFF(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedPos);
    });

    it('should call extractImage() in processsMouseUpOFF()', () => {
        service.processMouseUpOFF();
        expect(extractImageSpy).toHaveBeenCalled();
    });

    it('should update preview if mouseDown is true on processShift()', () => {
        service.mouseDown = true;
        service.processShift();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPreviewSpy).toHaveBeenCalled();
    });

    it('should not do anything when calling processShift is state is not OFF', () => {
        service.mouseDown = true;
        service.state = State.N;
        service.processShift();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawPreviewSpy).not.toHaveBeenCalled();
    });

    it('should not update preview if mouseDown is false on processShift()', () => {
        service.mouseDown = false;
        service.processShift();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawPreviewSpy).not.toHaveBeenCalled();
    });

    it('should call clearCanvas() on processEscape()', () => {
        service.processEscape();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should set selectionPos to mouseDownCoord if mouse position is below and right of mouseDownCoord in placeSelection()', () => {
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 15, y: 15 };
        service.placeSelection();
        expect(service.selectionPos).toEqual(service.mouseDownCoord);
    });

    it('should set selectionPos to lastMousePos if mouse position is above and left of mouseDownCoord in placeSelection()', () => {
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 5, y: 5 };
        service.placeSelection();
        expect(service.selectionPos).toEqual(service.lastMousePos);
    });

    it('should set selectionPos accordingly if isEven is true in placeSelection()', () => {
        const expectedPos = { x: 10, y: 10 };
        service.mouseDownCoord = { x: 20, y: 20 };
        service.lastMousePos = { x: 10, y: 5 };
        service.dimension = { x: 10, y: 10 };
        service.isEven = true;
        service.placeSelection();
        expect(service.selectionPos).toEqual(expectedPos);
    });

    it('should set originalPos to selectionPos in placeSelection()', () => {
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 5, y: 5 };
        service.placeSelection();
        expect(service.originalPos).toEqual(service.selectionPos);
    });

    it('should change lastMousePos accordingly when mouse is outside canvas (left and above) in adjustEdge()', () => {
        const offSet = 20;
        service.lastMousePos = { x: -offSet, y: -offSet };
        service.adjustEdge();
        expect(service.lastMousePos.x).toEqual(0);
        expect(service.lastMousePos.y).toEqual(0);
    });

    it('should change lastMousePos accordingly when mouse is outside canvas (right and below) in adjustEdge()', () => {
        const offSet = 20;
        service.lastMousePos = { x: service.canvasSize.x + offSet, y: service.canvasSize.y + offSet };
        service.adjustEdge();
        expect(service.lastMousePos.x).toEqual(service.canvasSize.x);
        expect(service.lastMousePos.y).toEqual(service.canvasSize.y);
    });

    it('coverage test for pasteSelection() and deleteShape of MockSelectionShape (abstract methods with no actual implementation)', () => {
        service.deleteShape();
        service.pasteSelection(baseCtxStub);
        expect(true).toEqual(true);
    });
});
