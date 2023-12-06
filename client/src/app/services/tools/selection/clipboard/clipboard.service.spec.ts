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
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject } from 'rxjs';

const IMAGE_ARRAY_SIZE = 64;

// tslint:disable: no-any
describe('ClipboardService', () => {
    let service: ClipboardService;

    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorService: ColorService;
    let resizeService: ResizeService;
    let toolsInfoService: ToolsInfoService;
    let keyEventService: KeyEventService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let changeSelectionService: ChangeSelectionService;
    let changingToolsService: ChangingToolsService;
    let lineLogicService: LineLogicService;

    let rectangleSelectionSpy: jasmine.SpyObj<RectangleSelectionService>;
    let ellipseSelectionSpy: jasmine.SpyObj<EllipseSelectionService>;
    let polygonalLassoSpy: jasmine.SpyObj<PolygonalLassoService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const array = Array(IMAGE_ARRAY_SIZE).fill(0);

    const imageDataSpy = jasmine.createSpyObj('ImageData', [''], {
        data: Uint8ClampedArray.from(array),
        height: 4,
        width: 4,
    });

    const validPath: Vec2[] = [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
        { x: 20, y: 20 },
        { x: 10, y: 20 },
        { x: 10, y: 10 },
    ];

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        colorService = new ColorService();
        resizeService = new ResizeService(drawServiceSpy);
        toolsInfoService = new ToolsInfoService();
        keyEventService = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolsService = new ChangingToolsService(keyEventService, undoRedoService);
        lineLogicService = new LineLogicService(drawServiceSpy, colorService, resizeService, toolsInfoService, changingToolsService);
        rectangleSelectionSpy = jasmine.createSpyObj(
            'RectangleSelectionService',
            ['resetSelection', 'pasteSelection', 'deleteShape', 'changeState'],
            {
                dimension: { x: 10, y: 10 } as Vec2,
                ratioDimension: { x: 10, y: 10 } as Vec2,
                selectionPos: { x: 10, y: 10 } as Vec2,
                originalPos: { x: 10, y: 10 } as Vec2,
                originalDimension: { x: 10, y: 10 } as Vec2,
                state: State.IDLE,
                isActive: new BehaviorSubject<boolean>(false),
                hasFlipped: { vertical: false, horizontal: false },
                content: undefined,
            },
        );
        ellipseSelectionSpy = jasmine.createSpyObj('EllipseSelectionSpy', ['resetSelection', 'pasteSelection', 'deleteShape', 'changeState'], {
            isActive: new BehaviorSubject<boolean>(false),
            dimension: { x: 10, y: 10 } as Vec2,
            ratioDimension: { x: 10, y: 10 } as Vec2,
            selectionPos: { x: 10, y: 10 } as Vec2,
            originalPos: { x: 10, y: 10 } as Vec2,
            originalDimension: { x: 10, y: 10 } as Vec2,
            state: State.IDLE,
            hasFlipped: { vertical: false, horizontal: false },
            content: imageDataSpy,
        });
        polygonalLassoSpy = jasmine.createSpyObj('PolygonalLassoService', ['resetSelection', 'pasteSelection', 'deleteShape', 'changeState'], {
            lineLogicService: new LineLogicService(drawServiceSpy, colorService, resizeService, toolsInfoService, changingToolsService),
            isActive: new BehaviorSubject<boolean>(false),
            dimension: { x: 10, y: 10 } as Vec2,
            ratioDimension: { x: 10, y: 10 } as Vec2,
            selectionPos: { x: 10, y: 10 } as Vec2,
            originalPos: { x: 10, y: 10 } as Vec2,
            originalDimension: { x: 10, y: 10 } as Vec2,
            pathData: validPath,
            state: State.IDLE,
            hasFlipped: { vertical: false, horizontal: false },
            content: imageDataSpy,
        });
        changeSelectionService = new ChangeSelectionService(changingToolsService, rectangleSelectionSpy, ellipseSelectionSpy, polygonalLassoSpy);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ChangeSelectionService, useValue: changeSelectionService },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: ChangingToolsService, useValue: changingToolsService },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: LineLogicService, useValue: lineLogicService },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(ClipboardService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        changeSelectionService.selectionMap = new Map();
        changeSelectionService.selectionMap.set(Mode.Rectangle, rectangleSelectionSpy);
        changeSelectionService.selectionMap.set(Mode.Ellipse, ellipseSelectionSpy);
        changeSelectionService.selectionMap.set(Mode.PolygonalLasso, polygonalLassoSpy);

        service.dimension = { x: 10, y: 10 };
        service.originalDimension = { x: 10, y: 10 };
        service.extractPos = { x: 10, y: 10 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change mode when mode of ChangeSelectionService is changed', async () => {
        changeSelectionService.mode.next(Mode.Rectangle);
        expect(service.mode).toEqual(Mode.Rectangle);
    });

    it('should change currentTool and validTool when setTool() of ChangingToolService is called', async () => {
        changingToolsService.setTool(ToolType.pencil);
        expect(service.currentTool).toEqual(ToolType.pencil);
        expect(service.validTool).toEqual(false);
    });

    it('should call copySelection() when Ctrl-c is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'c', ctrlKey: true });
        const copySelectionSpy = spyOn(service, 'copySelection');
        keyEventService.onKeyDown(event);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('should do nothing when only c is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'c', ctrlKey: false });
        const copySelectionSpy = spyOn(service, 'copySelection');
        keyEventService.onKeyDown(event);
        expect(copySelectionSpy).not.toHaveBeenCalled();
    });

    it('should call pasteSelection() when Ctrl-v is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'v', ctrlKey: true });
        const pasteSelectionSpy = spyOn(service, 'pasteSelection');
        keyEventService.onKeyDown(event);
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('should do nothing when only v is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'v', ctrlKey: false });
        const pasteSelectionSpy = spyOn(service, 'pasteSelection');
        keyEventService.onKeyDown(event);
        expect(pasteSelectionSpy).not.toHaveBeenCalled();
    });

    it('should call cutSelection() when Ctrl-x is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'x', ctrlKey: true });
        const cutSelectionSpy = spyOn(service, 'cutSelection');
        keyEventService.onKeyDown(event);
        expect(cutSelectionSpy).toHaveBeenCalled();
    });

    it('should do nothing when only x is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'x', ctrlKey: false });
        const cutSelectionSpy = spyOn(service, 'cutSelection');
        keyEventService.onKeyDown(event);
        expect(cutSelectionSpy).not.toHaveBeenCalled();
    });

    it('should call extractProperties if validTool is true, selection is IDLE and if content is undefined in copySelection()', () => {
        const extractPropertiesSpy = spyOn<any>(service, 'extractProperties');
        service.validTool = true;
        service.mode = Mode.Rectangle;
        service.content = undefined;
        service.copySelection();
        expect(extractPropertiesSpy).toHaveBeenCalled();
    });

    it('should call extractProperties if validTool is true, selection is IDLE and if content is different in copySelection()', () => {
        const extractPropertiesSpy = spyOn<any>(service, 'extractProperties');
        service.validTool = true;
        service.mode = Mode.Rectangle;
        service.content = {} as ImageData;
        service.copySelection();
        expect(extractPropertiesSpy).toHaveBeenCalled();
    });

    it('should not call extractProperties if validTool is false or selection is not IDLE if content the same in copySelection()', () => {
        const extractPropertiesSpy = spyOn<any>(service, 'extractProperties');
        service.validTool = false;
        service.copySelection();
        expect(extractPropertiesSpy).not.toHaveBeenCalled();
    });

    it('should call resetSelection(), setProperties() and pasteSelection() if content is not undefined in pasteSelection()', () => {
        const setPropertiesSpy = spyOn<any>(service, 'setProperties');
        service.mode = Mode.Rectangle;
        service.content = {} as ImageData;
        service.pasteSelection();
        expect(rectangleSelectionSpy.resetSelection).toHaveBeenCalled();
        expect(rectangleSelectionSpy.pasteSelection).toHaveBeenCalledWith(previewCtxStub);
        expect(setPropertiesSpy).toHaveBeenCalled();
    });

    it('should call pasteSelection() on the baseCtx if a selection is currently active in pasteSelection()', () => {
        service.mode = Mode.Rectangle;
        service.lastMode = Mode.Rectangle;
        service.validTool = true;
        service.content = {} as ImageData;
        service.pasteSelection();
        expect(rectangleSelectionSpy.pasteSelection).toHaveBeenCalledWith(baseCtxStub);
    });

    it('should change tool rectangleSelection if lastMode is Rectangle and a selection is not active in pasteSelection()', () => {
        service.mode = Mode.Rectangle;
        service.lastMode = Mode.Rectangle;
        service.content = {} as ImageData;
        service.pasteSelection();
        expect(service.currentTool).toEqual(ToolType.rectangleSelection);
    });

    it('should change tool ellipseSelection if lastMode is Ellipse and a selection is not active in pasteSelection()', () => {
        service.mode = Mode.Ellipse;
        service.lastMode = Mode.Ellipse;
        service.content = {} as ImageData;
        service.pasteSelection();
        expect(service.currentTool).toEqual(ToolType.ellipseSelection);
    });

    it('should change tool polygonalLasso if lastMode is PolygonalLasso and a selection is not active in pasteSelection()', () => {
        service.mode = Mode.PolygonalLasso;
        service.lastMode = Mode.PolygonalLasso;
        service.content = {} as ImageData;
        service.pasteSelection();
        expect(service.currentTool).toEqual(ToolType.lassoPolygonal);
    });

    it('should do nothing if content is undefined in pasteSelection()', () => {
        service.mode = Mode.Rectangle;
        service.lastMode = Mode.Rectangle;
        service.content = undefined;
        service.pasteSelection();
        expect(rectangleSelectionSpy.pasteSelection).not.toHaveBeenCalledWith(baseCtxStub);
    });

    it('should call extractProperties(), deleteShape(), resetSelection() and clearCanvas() if a selection is active in cutSelection()', () => {
        const extractPropertiesSpy = spyOn<any>(service, 'extractProperties');
        service.mode = Mode.Rectangle;
        service.validTool = true;
        service.cutSelection();
        expect(extractPropertiesSpy).toHaveBeenCalled();
        expect(rectangleSelectionSpy.deleteShape).toHaveBeenCalled();
        expect(rectangleSelectionSpy.resetSelection).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should do nothing if a selection is not active in cutSelection()', () => {
        const extractPropertiesSpy = spyOn<any>(service, 'extractProperties');
        service.mode = Mode.Rectangle;
        service.cutSelection();
        expect(extractPropertiesSpy).not.toHaveBeenCalled();
        expect(rectangleSelectionSpy.deleteShape).not.toHaveBeenCalled();
        expect(rectangleSelectionSpy.resetSelection).not.toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should call changeState() in setProperties()', () => {
        service.mode = Mode.Rectangle;
        service.setProperties();
        expect(rectangleSelectionSpy.changeState).toHaveBeenCalled();
    });

    it('should create a copy of the content when calling setProperties()', () => {
        service.mode = Mode.Ellipse;
        service.content = imageDataSpy;
        service.setProperties();
        expect(ellipseSelectionSpy.content).toEqual(imageDataSpy);
    });

    it('should call changeHasData() and changeState() in extractProperties()', () => {
        const changeHasDataSpy = spyOn<any>(service, 'changeHasData');
        service.mode = Mode.Rectangle;
        service.currentTool = ToolType.rectangleSelection;
        service.extractProperties();
        expect(changeHasDataSpy).toHaveBeenCalled();
        expect(rectangleSelectionSpy.changeState).toHaveBeenCalled();
    });

    it('should call adjustPath() if currentTool is lasso and saved content is different in extractProperties()', () => {
        const copyPathSpy = spyOn<any>(service, 'copyPath');
        service.mode = Mode.PolygonalLasso;
        service.content = {} as ImageData;
        service.currentTool = ToolType.lassoPolygonal;
        service.extractProperties();
        expect(copyPathSpy).toHaveBeenCalled();
    });

    it('should create a copy of the content when calling extractProperties()', () => {
        service.mode = Mode.Ellipse;
        service.content = imageDataSpy;
        service.extractProperties();
        expect(ellipseSelectionSpy.content).toEqual(imageDataSpy);
    });

    it('should haave undefined content if the selections content is undefined when calling extractProperties', () => {
        service.mode = Mode.Rectangle;
        service.extractProperties();
        expect(service.content).toEqual(undefined);
    });

    it('should copy the set originalPath to the path of the selection', () => {
        service.copyPath(validPath);
        expect(service.originalPath).toEqual(validPath);
    });
});
