// tslint:disable: max-file-line-count
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PolyLassoSelectionCommand } from '@app/classes/commands/poly-lasso-selection-command';
import { Segments } from '@app/classes/segments';
import { Vec2 } from '@app/classes/vec2';
import { FLIPPED } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { LineLogicService } from '@app/services/tools/line/line-logic.service';
import { State } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonalLassoService } from './polygonal-lasso.service';

// tslint:disable: no-any
// tslint:disable: max-file-line-count
describe('PolygonalLassoService', () => {
    let service: PolygonalLassoService;

    let validMouseEvent: MouseEvent;
    let pathDataMock: Vec2[];
    let completedPathMock: Vec2[];

    let clearPathSpy: jasmine.Spy<any>;
    let processClickSpy: jasmine.Spy<any>;
    let extractImageSpy: jasmine.Spy<any>;
    let alignTo45DegreeAngleSpy: jasmine.Spy<any>;

    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let keyEventService: KeyEventService;
    let colorService: ColorService;
    let resizeService: ResizeService;
    let toolsInfoService: ToolsInfoService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let changingToolsService: ChangingToolsService;
    let lineLogicService: LineLogicService;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let context: jasmine.SpyObj<CanvasRenderingContext2D>;
    let imageBitmap: jasmine.SpyObj<ImageBitmap>;

    beforeEach(() => {
        context = jasmine.createSpyObj(
            'CanvasRenderingContext2D',
            [
                'beginPath',
                'save',
                'moveTo',
                'lineTo',
                'clip',
                'fillRect',
                'restore',
                'drawImage',
                'stroke',
                'setLineDash',
                'clearRect',
                'scale',
                'translate',
            ],
            {},
        );

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: context,
        });

        colorService = new ColorService();
        resizeService = new ResizeService(drawServiceSpy);
        keyEventService = new KeyEventService();
        toolsInfoService = new ToolsInfoService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolsService = new ChangingToolsService(keyEventService, undoRedoService);
        lineLogicService = new LineLogicService(drawServiceSpy, colorService, resizeService, toolsInfoService, changingToolsService);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: LineLogicService, useValue: lineLogicService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PolygonalLassoService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        imageBitmap = jasmine.createSpyObj('ImageBitmap', ['close']);
        spyOn(self, 'createImageBitmap').and.resolveTo(imageBitmap);

        clearPathSpy = spyOn(lineLogicService, 'clearPath');
        processClickSpy = spyOn(lineLogicService, 'processClick');
        extractImageSpy = spyOn(service, 'extractImage');
        alignTo45DegreeAngleSpy = spyOn(lineLogicService, 'alignTo45DegreeAngle').and.callThrough();

        validMouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 0,
        } as MouseEvent;

        pathDataMock = [
            { x: 10, y: 10 },
            { x: 15, y: 15 },
            { x: 20, y: 10 },
        ];

        completedPathMock = [
            { x: 10, y: 10 },
            { x: 15, y: 15 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set mouseDownCoord to mouse position if doing a valid click in processMouseDownOFF()', () => {
        const expectedPos = { x: 10, y: 10 };
        lineLogicService.pathData = [];
        service.processMouseDownOFF(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedPos);
    });

    it('should set closed to true and push mousePos if closing the shape processMouseDownOFF()', () => {
        const expectedPos = { x: 10, y: 10 };
        service.lastMousePos = expectedPos;
        lineLogicService.pathData = pathDataMock;
        service.intersectsOthers = false;
        service.closed = false;
        service.processMouseDownOFF(validMouseEvent);
        expect(service.intersectsOthers).toEqual(false);
        expect(service.closed).toEqual(true);
        expect(lineLogicService.pathData[lineLogicService.pathData.length - 1]).toEqual(expectedPos);
    });

    it('should call extractImage() when closing the shape in processMouseDownOFF()', () => {
        service.lastMousePos = { x: 10, y: 20 };
        lineLogicService.pathData = pathDataMock;
        service.intersectsOthers = false;
        service.processMouseDownOFF(validMouseEvent);
        expect(extractImageSpy).toHaveBeenCalled();
    });

    it('should call processClick() of LineLogicService if intersectsOthers is false and not closing the shape processMouseDownOFF()', () => {
        lineLogicService.pathData = [];
        service.intersectsOthers = false;
        service.processMouseDownOFF(validMouseEvent);
        expect(processClickSpy).toHaveBeenCalled();
    });

    it('should do nothing if intersects is true and pathData is empty in processMouseDownOFF()', () => {
        service.intersectsOthers = true;
        lineLogicService.pathData = [];
        service.processMouseDownOFF(validMouseEvent);
        expect(extractImageSpy).not.toHaveBeenCalled();
        expect(processClickSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when clicking at the last downCoord (double clicking) in processMouseDownOFF()', () => {
        service.lastMousePos = { x: 20, y: 10 };
        lineLogicService.pathData = pathDataMock;
        service.processMouseDownOFF({ clientX: 20, clientY: 10, button: 0 } as MouseEvent);
        expect(extractImageSpy).not.toHaveBeenCalled();
        expect(processClickSpy).not.toHaveBeenCalled();
    });

    it('should set state to IDLE, set both intersects to false and set isActive and undoRedoDisable to true in processMouseUpOFF()', () => {
        service.state = State.OFF;
        service.intersectsFirst = true;
        service.intersectsOthers = true;
        undoRedoService.undoRedoDisable = false;
        service.processMouseUpOFF();
        expect(service.intersectsFirst).toEqual(false);
        expect(service.intersectsOthers).toEqual(false);
        expect(service.state.valueOf()).toEqual(State.IDLE);
        expect(service.isActive.value).toEqual(true);
        expect(undoRedoService.undoRedoDisable).toEqual(true);
    });

    it('should call alignTo45DegreeAngle() of lineLogicService if isEven is true in processMouseDownOFF()', () => {
        service.lastMousePos = { x: 20, y: 10 };
        service.isEven = true;
        lineLogicService.pathData = pathDataMock;
        service.processMouseDownOFF({ clientX: 20, clientY: 10, button: 0 } as MouseEvent);
        expect(alignTo45DegreeAngleSpy).toHaveBeenCalled();
    });

    it('should call processShift() of LineLogicService in processShift()', () => {
        const processShiftSpy: jasmine.Spy = spyOn(lineLogicService, 'processShift');
        service.processShift();
        expect(processShiftSpy).toHaveBeenCalled();
    });

    it('should call clearCanvas() and clearPath() of LineLogicService in processEscape()', () => {
        service.processEscape();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should call processBackspace() of LineLogicService if state is OFF in onKeyDownBackSpace()', () => {
        const processBackSpaceSpy: jasmine.Spy = spyOn(lineLogicService, 'processBackSpace');
        service.state = State.OFF;
        service.onKeyDownBackSpace();
        expect(processBackSpaceSpy).toHaveBeenCalled();
    });

    it('should do nothing if state is not OFF in onKeyDownBackSpace()', () => {
        const processBackSpaceSpy: jasmine.Spy = spyOn(lineLogicService, 'processBackSpace');
        service.state = State.IDLE;
        service.onKeyDownBackSpace();
        expect(processBackSpaceSpy).not.toHaveBeenCalled();
    });

    it('should set selectionPos, originalPos and dimension to correct values in placeSelection()', () => {
        const expectedPos = { x: 5, y: 1 };
        const expectedDimension = { x: 10, y: 29 };
        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 5, y: 1 },
            { x: 15, y: 1 },
            { x: 10, y: 30 },
        ];
        service.placeSelection();
        expect(service.selectionPos).toEqual(expectedPos);
        expect(service.originalPos).toEqual(expectedPos);
        expect(service.dimension).toEqual(expectedDimension);
    });

    it('should call clearCanvas() if clipCommand is true in deleteShape()', () => {
        service.clipCommand = true;
        service.deleteShape();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should call addCommand of undoRedoService if clipCommand is false in deleteShape()', () => {
        service.clipCommand = false;
        service.dimension = { x: 10, y: 10 };
        service.selectionPos = { x: 20, y: 20 };
        service.originalPos = { x: 40, y: 40 };
        service.pathData = pathDataMock;
        service.deleteShape();
        expect(undoRedoService.addCommand).toHaveBeenCalled();
    });

    it('should call clearPath() of LineLogicService in clearPath()', () => {
        lineLogicService.pathData = completedPathMock;
        service.clearPath();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should call updatePreview() of LineLogicService if pathData is not empty and closed is false in drawPreview()', () => {
        const updatePreviewSpy: jasmine.Spy = spyOn(lineLogicService, 'updatePreview');
        lineLogicService.pathData = pathDataMock;
        service.lastMousePos = { x: 10, y: 10 };
        service.drawPreview();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('should call intersectsPath() if pathData lenth > 1 in drawPreview()', () => {
        const intersectsPathSpy: jasmine.Spy = spyOn(service, 'intersectsPath');
        lineLogicService.pathData = pathDataMock;
        service.lastMousePos = { x: 10, y: 10 };
        service.drawPreview();
        expect(intersectsPathSpy).toHaveBeenCalled();
    });

    it('should call drawInvalidCursor() if it intersects segments and can not connect to the start in drawPreview()', () => {
        const drawInvalidCursorSpy: jasmine.Spy = spyOn(service, 'drawInvalidCursor');
        lineLogicService.pathData = [{ x: 10, y: 10 }];
        service.lastMousePos = { x: 25, y: 25 };
        service.intersectsOthers = true;
        service.drawPreview();
        expect(drawInvalidCursorSpy).toHaveBeenCalled();
    });

    it('should do nothing if pathData is empty or closed is true in drawPreview()', () => {
        const updatePreviewSpy: jasmine.Spy = spyOn(lineLogicService, 'updatePreview');
        lineLogicService.pathData = [];
        service.closed = true;
        service.drawPreview();
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('should call alignTo45DegreeAngle() of lineLogicService if isEven is true in drawPreview()', () => {
        service.lastMousePos = { x: 20, y: 10 };
        service.isEven = true;
        lineLogicService.pathData = pathDataMock;
        service.drawPreview();
        expect(alignTo45DegreeAngleSpy).toHaveBeenCalled();
    });

    it('should call fillRect() at originalPos if drawOg is true in pasteSelection()', () => {
        const expectedWidth = 10;
        const expectedHeight = 5;
        service.drawOG = true;
        service.pathData = completedPathMock;
        service.dimension = { x: 10, y: 5 };
        service.originalDimension = { x: 10, y: 5 };
        service.selectionPos = { x: 20, y: 20 };
        service.originalPos = { x: 5, y: 5 };
        lineLogicService.pathData = completedPathMock;
        service.pasteSelection(context);
        expect(context.fillRect).toHaveBeenCalledWith(expectedHeight, expectedHeight, expectedWidth, expectedHeight);
    });

    it('should call clearRect() at selectionPos in pasteSelection()', () => {
        const expectedPos = 20;
        const expectedWidth = 10;
        const expectedHeight = 5;
        context = jasmine.createSpyObj(
            'CanvasRenderingContext2D',
            ['beginPath', 'save', 'ellipse', 'clip', 'fillRect', 'restore', 'drawImage', 'stroke', 'setLineDash', 'clearRect'],
            {},
        );
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: previewCtxStub,
        });
        service.drawOG = false;
        service.dimension = { x: 10, y: 5 };
        service.selectionPos = { x: 20, y: 20 };
        service.originalPos = { x: 5, y: 5 };
        lineLogicService.pathData = completedPathMock;
        service.pasteSelection(context);
        expect(context.clearRect).toHaveBeenCalledWith(expectedPos, expectedPos, expectedWidth, expectedHeight);
    });

    it('should draw an X at mousePos in drawInvalidCursor()', () => {
        service.lastMousePos = { x: 10, y: 10 };
        service.drawInvalidCursor();
        expect(context.lineTo).toHaveBeenCalledTimes(2);
        expect(context.moveTo).toHaveBeenCalledTimes(2);
    });

    it('should call onLastSegment() of Segments and return true if lastMousePos is on the last segment in intersectsPath()', () => {
        const onLastSegmentSpy: jasmine.Spy = spyOn(Segments, 'intersectsLast').and.callThrough();
        service.lastMousePos = { x: 17, y: 13 };
        lineLogicService.pathData = pathDataMock;
        const intersects = service.intersectsPath();
        expect(onLastSegmentSpy).toHaveBeenCalled();
        expect(intersects).toEqual(true);
    });

    it('should call segmentsIntersect() of Segments if lastMousePos intersects a segment in intersectsPath()', () => {
        const segmentsIntersectSpy: jasmine.Spy = spyOn(Segments, 'segmentsIntersect').and.callThrough();
        service.lastMousePos = { x: 25, y: 15 };
        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 15, y: 15 },
        ];
        const intersects = service.intersectsPath();
        expect(segmentsIntersectSpy).toHaveBeenCalled();
        expect(intersects).toEqual(true);
    });

    it('should return false if lastMousePos does not intersect a segment in intersectsPath()', () => {
        service.lastMousePos = { x: 10, y: 40 };
        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 10, y: 20 },
        ];
        const intersects = service.intersectsPath();
        expect(intersects).toEqual(false);
    });

    it('should not draw the preview dotted line when drawing on baseCtx in pasteCanvas', () => {
        lineLogicService.pathData = pathDataMock;
        context = jasmine.createSpyObj(
            'CanvasRenderingContext2D',
            [
                'beginPath',
                'save',
                'ellipse',
                'clip',
                'fillRect',
                'clearRect',
                'restore',
                'drawImage',
                'stroke',
                'setLineDash',
                'strokeRect',
                'getLineDash',
                'scale',
                'translate',
            ],
            {
                fillStyle: '',
                lineWidth: '',
            },
        );

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: previewCtxStub,
        });

        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 10, y: 20 },
        ];

        service.pasteSelection(context);
        expect(context.stroke).not.toHaveBeenCalled();
    });

    it('should scale accordingly depending if the canvas has not been flipped', () => {
        service.hasFlipped = {
            horizontal: false,
            vertical: false,
        };

        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 10, y: 20 },
        ];
        service.pasteSelection(context);
        expect(context.scale).toHaveBeenCalledWith(1, 1);
    });

    it('should scale accordingly depending if the canvas has been flipped', () => {
        service.hasFlipped = {
            horizontal: true,
            vertical: true,
        };

        lineLogicService.pathData = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 10, y: 20 },
        ];
        service.pasteSelection(context);
        expect(context.scale).toHaveBeenCalledWith(FLIPPED, FLIPPED);
    });

    it('should not execute the command if the provided pathData is somehow empty or undefined', () => {
        service.hasFlipped = {
            horizontal: false,
            vertical: false,
        };
        lineLogicService.pathData = [];
        service.pasteSelection(context);
        expect(context.clip).not.toHaveBeenCalled();
    });

    it('should return without drawing at the selectionPosition if calling the LassoCommand from deleteShape()', async (done: DoneFn) => {
        service.clipCommand = false;
        service.dimension = { x: 10, y: 10 };
        service.originalDimension = { x: 10, y: 10 };
        service.selectionPos = { x: 20, y: 20 };
        service.originalPos = { x: 40, y: 40 };
        service.pathData = pathDataMock;

        context = jasmine.createSpyObj(
            'CanvasRenderingContext2D',
            ['beginPath', 'save', 'ellipse', 'clip', 'fillRect', 'restore', 'drawImage', 'stroke', 'setLineDash', 'clearRect'],
            {},
        );
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            baseCtx: context,
        });
        const command = new PolyLassoSelectionCommand(
            drawServiceSpy.baseCtx,
            {} as PolygonalLassoService,
            service.dimension,
            service.originalDimension,
            service.selectionPos,
            service.originalPos,
            false,
            completedPathMock,
            { vertical: false, horizontal: false },
            true,
        );
        expect(await command.do()).toBe(undefined);
        done();
    });

    it('should use the previousPathData when the path is cleared on deleteShape()', () => {
        service.clipCommand = false;
        service.dimension = { x: 10, y: 10 };
        service.selectionPos = { x: 20, y: 20 };
        service.originalPos = { x: 40, y: 40 };
        lineLogicService.pathData = pathDataMock;
        service.pathData = [];
        service.deleteShape();
        expect(service.previousPathData).toEqual(pathDataMock);
    });

    it('should call alignTo45DegreeAngle() of lineLogicService if isEven is true in intersectsPath()', () => {
        service.isEven = true;
        service.lastMousePos = { x: 30, y: 30 };
        lineLogicService.pathData = pathDataMock;
        service.intersectsPath();
        expect(alignTo45DegreeAngleSpy).toHaveBeenCalled();
    });

    it('should return true when trying to close the shape when isEven is true and new segment would intersect in intersectsPath()', () => {
        service.isEven = true;
        service.lastMousePos = { x: 20, y: 20 };
        lineLogicService.pathData = [
            { x: 20, y: 20 },
            { x: 25, y: 15 },
            { x: 25, y: 30 },
            { x: 5, y: 10 },
            { x: 20, y: 5 },
            { x: 30, y: 13 },
        ];
        const intersects = service.intersectsPath();
        expect(intersects).toEqual(true);
    });

    it('should return false when trying to close the shape when isEven is true and new segment wont intersect in intersectsPath()', () => {
        service.isEven = true;
        service.lastMousePos = { x: 20, y: 19 };
        lineLogicService.pathData = [
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 15 },
            { x: 20, y: 15 },
        ];
        const intersects = service.intersectsPath();
        expect(intersects).toEqual(false);
    });
});
