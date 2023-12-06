import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PipetteService } from './pipette.service';

describe('PipetteService', () => {
    let service: PipetteService;
    let colorService: ColorService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let resizeService: ResizeService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        colorService = new ColorService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ColorService, useValue: colorService },
                { provide: DrawingService, useValue: drawingService },
                { provide: ResizeService, useValue: resizeService },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
        });
        service = TestBed.inject(PipetteService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        // tslint:disable:no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should enable undo redo command', () => {
        const event = {
            button: 0,
        } as MouseEvent;
        service.onMouseUp(event);
        expect(undoRedoService.undoRedoDisable).toBeFalse();
    });

    it('should set the primary color when left clicking', () => {
        const spy = spyOnProperty(colorService, 'primaryColor', 'set').and.callThrough();
        const event = {
            button: 0,
        } as MouseEvent;
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should set the secondary color when right clicking', () => {
        const spy = spyOnProperty(colorService, 'secondaryColor', 'set').and.callThrough();
        const event = {
            button: 2,
        } as MouseEvent;
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should set the color to white when clicking on empty canvas', () => {
        // This is the default color of the canvas
        const blackTransparent = (service.currentColor = new Color(0, 0, 0, 0));
        const white = new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE, Color.MAX_ALPHA);
        const event = {
            button: 2,
        } as MouseEvent;
        service.onMouseDown(event);
        expect(service.currentColor).not.toEqual(blackTransparent);
        expect(service.currentColor).toEqual(white);
    });

    it('should not show the pipette preview if hovering over resize handles', () => {
        resizeService.overHandles = true;
        const event = {
            clientX: 0,
            clientY: 0,
        } as MouseEvent;
        service.onMouseMove(event);
        expect(service.shouldShowPreview.value).toEqual(false);
    });

    it('should show the pipette preview if hovering over canvas', () => {
        resizeService.overHandles = false;
        const event = {
            clientX: 0,
            clientY: 0,
        } as MouseEvent;
        service.onMouseMove(event);
        expect(service.shouldShowPreview.value).toEqual(true);
    });

    it('should disable pipette preview when the mouse leaves the canvas', () => {
        service.onMouseLeave();
        expect(service.shouldShowPreview.value).toEqual(false);
    });

    it('should enable pipette preview when the mouse enters the canvas', () => {
        service.onMouseEnter();
        expect(service.shouldShowPreview.value).toEqual(true);
    });
});
