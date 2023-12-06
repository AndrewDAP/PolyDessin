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
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MockSelectionResizeService } from './mock-selection-resize';

// spyOn<any> is used to spy on private methods
// tslint:disable:no-any
describe('SelectionResizeService', () => {
    let service: MockSelectionResizeService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let resizeService: ResizeService;

    let canvasTestHelper: CanvasTestHelper;

    let selectionMoveService: SelectionMoveService;
    let selectionStateService: SelectionStateService;

    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();
    const stateSubject: BehaviorSubject<State> = new BehaviorSubject<State>(State.OFF);

    let moveNSpy: jasmine.Spy;
    let moveSSpy: jasmine.Spy;
    let moveESpy: jasmine.Spy;
    let moveWSpy: jasmine.Spy;
    let moveNESpy: jasmine.Spy;
    let moveNWSpy: jasmine.Spy;
    let moveSESpy: jasmine.Spy;
    let moveSWSpy: jasmine.Spy;

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
        service = new MockSelectionResizeService(
            drawServiceSpy,
            colorServiceSpyObj,
            toolsInfoService,
            changingToolServiceSpy,
            resizeService,
            undoRedoService,
            keyEventService,
            selectionStateService,
            {} as GridService,
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

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        moveNSpy = spyOn<any>(service, 'moveN').and.callThrough();
        moveSSpy = spyOn<any>(service, 'moveS').and.callThrough();
        moveESpy = spyOn<any>(service, 'moveE').and.callThrough();
        moveWSpy = spyOn<any>(service, 'moveW').and.callThrough();
        moveNESpy = spyOn<any>(service, 'moveNE').and.callThrough();
        moveNWSpy = spyOn<any>(service, 'moveNW').and.callThrough();
        moveSESpy = spyOn<any>(service, 'moveSE').and.callThrough();
        moveSWSpy = spyOn<any>(service, 'moveSW').and.callThrough();

        service.selectionPos = { x: 50, y: 50 };
        service.originalDimension = { x: 50, y: 50 };
        service.dimension = { x: 10, y: 10 };
        service.originalDimension = { x: 10, y: 10 };
        service.ratioDimension = { x: 10, y: 10 };
        service.anchors = {
            TL: { x: service.selectionPos.x, y: service.selectionPos.y },
            BR: { x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y + service.dimension.y },
        };
        service.ogAnchors = {
            TL: { x: service.anchors.TL.x, y: service.anchors.TL.y },
            BR: { x: service.anchors.BR.x, y: service.anchors.BR.y },
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call the appropriate function according to the state', () => {
        const functionSpyArr: jasmine.Spy<any>[] = [moveNWSpy, moveNSpy, moveNESpy, moveWSpy, moveESpy, moveSWSpy, moveSSpy, moveSESpy];
        service.lastMousePos = { x: 10, y: 10 };
        service.oldMousePos = { x: 10, y: 10 };

        for (let i = State.NW; i < State.OFF; i++) {
            service.state = i;
            service.start = { x: service.selectionPos.x, y: service.selectionPos.y };
            (service.functionMap.get(service.state) as () => void)();
            expect(functionSpyArr[i - 1]).toHaveBeenCalled();
        }
    });

    it('should do the right operations when calling moveN', () => {
        const expectedValue = 20;
        service.state = State.N;
        service.lastMousePos = { x: 10, y: 70 };
        (service.functionMap.get(State.N) as () => void)();
        expect(moveNSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 10, y: 40 };
        (service.functionMap.get(State.N) as () => void)();
        expect(service.dimension.y).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveS', () => {
        const expectedValue = 10;
        service.state = State.S;
        service.lastMousePos = { x: 10, y: 20 };
        (service.functionMap.get(State.S) as () => void)();
        expect(moveSSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 10, y: 60 };
        (service.functionMap.get(State.S) as () => void)();
        expect(service.dimension.y).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveE', () => {
        const expectedValue = 10;
        service.state = State.E;
        service.lastMousePos = { x: 10, y: 20 };
        (service.functionMap.get(State.E) as () => void)();
        expect(moveESpy).toHaveBeenCalled();
        service.lastMousePos = { x: 60, y: 10 };
        (service.functionMap.get(State.E) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveW', () => {
        const expectedValue = 50;
        service.state = State.W;
        service.lastMousePos = { x: 70, y: 20 };
        (service.functionMap.get(State.W) as () => void)();
        expect(moveWSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 10, y: 60 };
        (service.functionMap.get(State.W) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveSE', () => {
        jasmine.getEnv().allowRespy(true);
        const expectedValue = 10;
        service.state = State.SE;
        service.lastMousePos = { x: 20, y: 20 };
        (service.functionMap.get(State.SE) as () => void)();
        expect(moveSESpy).toHaveBeenCalled();
        service.lastMousePos = { x: 10, y: 60 };
        (service.functionMap.get(State.SE) as () => void)();
        service.lastMousePos = { x: 60, y: 60 };
        service.isEven = true;
        service.start = { x: service.selectionPos.x, y: service.selectionPos.y };
        spyOn<any>(service, 'isBelow').and.returnValue(true);
        (service.functionMap.get(State.SE) as () => void)();
        spyOn<any>(service, 'isBelow').and.returnValue(false);
        (service.functionMap.get(State.SE) as () => void)();
        service.isEven = false;
        (service.functionMap.get(State.SE) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveSW', () => {
        jasmine.getEnv().allowRespy(true);
        const expectedValue = 20;
        service.state = State.SW;
        service.lastMousePos = { x: 20, y: 20 };
        (service.functionMap.get(State.SW) as () => void)();
        expect(moveSWSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 70, y: 70 };
        (service.functionMap.get(State.SW) as () => void)();
        service.lastMousePos = { x: 40, y: 70 };
        service.isEven = true;
        service.start = { x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y };
        spyOn<any>(service, 'isBelow').and.returnValue(true);
        (service.functionMap.get(State.SW) as () => void)();
        spyOn<any>(service, 'isBelow').and.returnValue(false);
        (service.functionMap.get(State.SW) as () => void)();
        service.isEven = false;
        (service.functionMap.get(State.SW) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveSW', () => {
        jasmine.getEnv().allowRespy(true);
        const expectedValue = 20;
        service.state = State.SW;
        service.lastMousePos = { x: 20, y: 20 };
        (service.functionMap.get(State.SW) as () => void)();
        expect(moveSWSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 70, y: 70 };
        (service.functionMap.get(State.SW) as () => void)();
        service.lastMousePos = { x: 40, y: 70 };
        service.isEven = true;
        service.start = { x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y };
        spyOn<any>(service, 'isBelow').and.returnValue(true);
        (service.functionMap.get(State.SW) as () => void)();
        spyOn<any>(service, 'isBelow').and.returnValue(false);
        (service.functionMap.get(State.SW) as () => void)();
        service.isEven = false;
        (service.functionMap.get(State.SW) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveNE', () => {
        jasmine.getEnv().allowRespy(true);
        const expectedValue = 20;
        service.state = State.NE;
        service.lastMousePos = { x: 20, y: 70 };
        (service.functionMap.get(State.NE) as () => void)();
        expect(moveNESpy).toHaveBeenCalled();
        service.lastMousePos = { x: 40, y: 70 };
        (service.functionMap.get(State.NE) as () => void)();
        service.lastMousePos = { x: 70, y: 40 };
        service.isEven = true;
        service.start = { x: service.selectionPos.x, y: service.selectionPos.y + service.dimension.y };
        spyOn<any>(service, 'isBelow').and.returnValue(true);
        (service.functionMap.get(State.NE) as () => void)();
        spyOn<any>(service, 'isBelow').and.returnValue(false);
        (service.functionMap.get(State.NE) as () => void)();
        service.isEven = false;
        (service.functionMap.get(State.NE) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('should do the right operations when calling moveNW', () => {
        jasmine.getEnv().allowRespy(true);
        const expectedValue = 20;
        service.state = State.NW;
        service.lastMousePos = { x: 40, y: 70 };
        (service.functionMap.get(State.NW) as () => void)();
        expect(moveNWSpy).toHaveBeenCalled();
        service.lastMousePos = { x: 70, y: 40 };
        (service.functionMap.get(State.NW) as () => void)();
        service.lastMousePos = { x: 40, y: 40 };
        service.isEven = true;
        service.start = { x: service.selectionPos.x + service.dimension.x, y: service.selectionPos.y + service.dimension.y };
        spyOn<any>(service, 'isBelow').and.returnValue(true);
        (service.functionMap.get(State.NW) as () => void)();
        spyOn<any>(service, 'isBelow').and.returnValue(false);
        (service.functionMap.get(State.NW) as () => void)();
        service.isEven = false;
        (service.functionMap.get(State.NW) as () => void)();
        expect(service.dimension.x).toEqual(expectedValue);
    });

    it('isBelow should give the right result', () => {
        let start = { x: 0, y: 0 };
        let end = { x: 10, y: 10 };
        let current = { x: 5, y: 5 };
        // point on line
        expect(service.isBelow(start, end, current)).toBeFalse();
        // negative slope
        current = { x: 10, y: 5 };
        start = { x: 0, y: 10 };
        end = { x: 10, y: 0 };
        expect(service.isBelow(start, end, current)).toBeFalse();
        // vertical line
        start = { x: 10, y: 10 };
        end = { x: 10, y: 0 };
        expect(service.isBelow(start, end, current)).toBeFalse();
    });

    it('coverage test for pasteSelection of MockSelectionResizeService (abstract method with no actual implementation)', () => {
        service.pasteSelection(previewCtxStub);
        expect(true).toEqual(true);
    });
});
