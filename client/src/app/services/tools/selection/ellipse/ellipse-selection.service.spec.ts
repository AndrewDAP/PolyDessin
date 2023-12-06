import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FLIPPED } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EllipseSelectionService } from './ellipse-selection.service';

// tslint:disable:no-any
describe('EllipseSelectionService', () => {
    let service: EllipseSelectionService;

    let canvasTestHelper: CanvasTestHelper;

    let adjustEdgeSpy: jasmine.Spy<any>;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let keyEventService: KeyEventService;
    let localStorageService: jasmine.SpyObj<LocalStorageService>;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;

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
                'translate',
                'scale',
            ],
            {
                fillStyle: '',
                lineWidth: '',
            },
        );

        context.scale.and.callThrough();

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: context,
        });
        keyEventService = new KeyEventService();
        localStorageService = jasmine.createSpyObj('LocalStorageService', ['setDrawing']);
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);

        TestBed.configureTestingModule({
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: LocalStorageService, useValue: localStorageService },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseSelectionService);

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

    it('should call clearCanvas() adjustEdge() and strokeRect() if mouseDown is true in drawPreview()', () => {
        drawServiceSpy.previewCtx = context;
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

    it('should call ellipse() and stroke() if mouseDown is true in drawPreview()', () => {
        drawServiceSpy.previewCtx = context;
        const expectedCenter = { x: 10, y: 15 };
        const expectedRadius = expectedCenter;

        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 20, y: 30 };
        service.drawPreview();
        expect(context.ellipse).toHaveBeenCalledWith(expectedCenter.x, expectedCenter.y, expectedRadius.x, expectedRadius.y, 0, 0, 2 * Math.PI);
        expect(context.stroke).toHaveBeenCalled();
    });

    it('should call strokeRect() and ellipse() with equal sides if isEven and mouseDown are true in drawPreview()', () => {
        drawServiceSpy.previewCtx = context;
        const expectedPos = { x: 0, y: 0 };
        const expectedCenter = { x: 10, y: 10 };
        const expectedRadius = expectedCenter;
        const expectedDimension = { x: 20, y: 20 };

        service.mouseDown = true;
        service.isEven = true;
        service.mouseDownCoord = expectedPos;
        service.lastMousePos = { x: 20, y: 30 };
        service.drawPreview();
        expect(context.ellipse).toHaveBeenCalledWith(expectedCenter.x, expectedCenter.y, expectedRadius.x, expectedRadius.y, 0, 0, 2 * Math.PI);
        expect(context.strokeRect).toHaveBeenCalledWith(expectedPos.x, expectedPos.y, expectedDimension.x, expectedDimension.y);
    });

    it('should set context parameters if mouseDown is true in drawPreview()', () => {
        drawServiceSpy.previewCtx = context;
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

    it('should not draw preview ellipse when drawing on baseCtx in pasteCanvas()', () => {
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
                'translate',
                'scale',
            ],
            {
                fillStyle: '',
                lineWidth: '',
            },
        );

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            previewCtx: previewCtxStub,
        });

        service.pasteSelection(context);
        expect(context.stroke).not.toHaveBeenCalled();
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
