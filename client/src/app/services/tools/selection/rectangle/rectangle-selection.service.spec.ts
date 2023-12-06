import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FLIPPED } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { Subject } from 'rxjs';
import { RectangleSelectionService } from './rectangle-selection.service';

// tslint:disable:no-any
describe('RectangleSelectionService', () => {
    let service: RectangleSelectionService;

    let canvasTestHelper: CanvasTestHelper;

    let adjustEdgeSpy: jasmine.Spy<any>;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let keyEventService: KeyEventService;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    let localStorageService: jasmine.SpyObj<LocalStorageService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let context: jasmine.SpyObj<CanvasRenderingContext2D>;
    let imageBitmap: jasmine.SpyObj<ImageBitmap>;

    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();

    beforeEach(() => {
        context = jasmine.createSpyObj(
            'CanvasRenderingContext2D',
            [
                'beginPath',
                'save',
                'ellipse',
                'clip',
                'fillRect',
                'restore',
                'drawImage',
                'stroke',
                'setLineDash',
                'strokeRect',
                'getLineDash',
                'clearRect',
                'scale',
                'translate',
            ],
            {
                fillStyle: '',
                lineWidth: '',
            },
        );

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: context,
        });
        keyEventService = new KeyEventService();
        changingToolServiceSpy = jasmine.createSpyObj('ChangingToolService', {
            getTool: toolTypeSubject.asObservable(),
            setTool: '',
        });
        localStorageService = jasmine.createSpyObj('LocalStorageService', ['setDrawing']);
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: ChangingToolsService, useValue: changingToolServiceSpy },
                { provide: LocalStorageService, useValue: localStorageService },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleSelectionService);

        adjustEdgeSpy = spyOn<any>(service, 'adjustEdge').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        imageBitmap = jasmine.createSpyObj('ImageBitmap', ['close']);
        spyOn(self, 'createImageBitmap').and.resolveTo(imageBitmap);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call selectAll() when Ctrl-a is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'a', ctrlKey: true });
        const selectAllSpy = spyOn(service, 'selectAll');
        service.activeTool = ToolType.rectangleSelection;
        keyEventService.onKeyDown(event);
        expect(selectAllSpy).toHaveBeenCalled();
    });

    it('should set current tool to RectangleSelection if current tool is not a selection when Ctrl-a is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'a', ctrlKey: true });
        service.activeTool = ToolType.rectangle;
        keyEventService.onKeyDown(event);
        expect(changingToolServiceSpy.setTool).toHaveBeenCalled();
    });

    it('should do nothing if only a is pressed', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'a', ctrlKey: false });
        const selectAllSpy = spyOn(service, 'selectAll');
        keyEventService.onKeyDown(event);
        expect(changingToolServiceSpy.setTool).not.toHaveBeenCalled();
        expect(selectAllSpy).not.toHaveBeenCalled();
    });

    it('should call clearCanvas() if clipCommand is true in deleteShape()', () => {
        service.clipCommand = true;
        service.deleteShape();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should call addCommand of undoRedoService if clipCommand is false in deleteShape()', () => {
        service.clipCommand = false;
        service.deleteShape();
        expect(undoRedoService.addCommand).toHaveBeenCalled();
    });

    it('should call clearCanvas(), adjustEdge() and strokeRect() if mouseDown is true in drawPreview()', () => {
        const expectedPos = { x: 10, y: 10 };
        const expectedDimension = { x: 10, y: 20 };
        service.mouseDown = true;
        service.mouseDownCoord = expectedPos;
        service.lastMousePos = { x: 20, y: 30 };
        service.drawPreview();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(adjustEdgeSpy).toHaveBeenCalled();
        expect(context.strokeRect).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectedDimension.x, expectedDimension.y);
    });

    it('should call strokeRect() with identical values for width and height if isEven and mouseDown are true in drawPreview()', () => {
        const expectedPos = { x: 10, y: 10 };
        const expectedDimension = { x: 20, y: 20 };
        service.mouseDown = true;
        service.mouseDownCoord = expectedPos;
        service.lastMousePos = { x: 30, y: 40 };
        service.isEven = true;
        service.drawPreview();
        expect(context.strokeRect).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectedDimension.x, expectedDimension.y);
    });

    it('should set context parameters if mouseDown is true in drawPreview()', () => {
        const expectedStyle = 'white';
        service.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 20, y: 30 };
        service.drawPreview();
        expect(context.strokeStyle.valueOf()).toEqual(expectedStyle);
        expect(context.setLineDash).toHaveBeenCalled();
    });

    it('should do nothing if mouseDown is false in drawPreview()', () => {
        service.mouseDown = false;
        service.drawPreview();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should call fillrect() at originalPos and selectionPos if drawOG is true in pasteSelection()', () => {
        const expectedOriginalPos = 20;
        const expectedSelectionPos = 30;
        const expectedDim = 5;
        service.drawOG = true;
        service.originalPos = { x: 20, y: 20 };
        service.selectionPos = { x: 30, y: 30 };
        service.dimension = { x: 5, y: 5 };
        service.originalDimension = { x: 5, y: 5 };
        service.pasteSelection(context);
        expect(context.fillRect).toHaveBeenCalledWith(expectedOriginalPos, expectedOriginalPos, expectedDim, expectedDim);
        expect(context.fillRect).toHaveBeenCalledWith(expectedSelectionPos, expectedSelectionPos, expectedDim, expectedDim);
    });

    it('should not call fillrect() at originalPos if drawOG is false in pasteSelection()', () => {
        const expectedPos = 20;
        const expectedDim = 5;
        service.drawOG = false;
        service.originalPos = { x: 20, y: 20 };
        service.selectionPos = { x: 30, y: 30 };
        service.dimension = { x: 5, y: 5 };
        service.pasteSelection(context);
        expect(context.fillRect).not.toHaveBeenCalledWith(expectedPos, expectedPos, expectedDim, expectedDim);
    });

    it('should call clearRect() in pasteCanvas() if we are drawing on the baseCtx', () => {
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
        const expectedSLCTPos = { x: 50, y: 50 };
        const expectedOGPos = { x: 10, y: 10 };
        const expectedDimension = { x: 20, y: 20 };
        service.selectionPos = expectedSLCTPos;
        service.originalPos = expectedOGPos;
        service.dimension = expectedDimension;
        service.pasteSelection(context);
        expect(context.clearRect).toHaveBeenCalled();
        expect(context.fillRect).not.toHaveBeenCalled();
    });

    it('should scale accordingly depending if the canvas has not been flipped', () => {
        service.hasFlipped = {
            horizontal: false,
            vertical: false,
        };
        service.pasteSelection(context);
        expect(context.scale).toHaveBeenCalledWith(1, 1);
    });

    it('should scale accordingly depending if the canvas has been flipped', () => {
        service.hasFlipped = {
            horizontal: true,
            vertical: true,
        };
        service.pasteSelection(context);
        expect(context.scale).toHaveBeenCalledWith(FLIPPED, FLIPPED);
    });
});
