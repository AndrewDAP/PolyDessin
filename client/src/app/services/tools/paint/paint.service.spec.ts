import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_TOLERANCE, MouseButton } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PaintService } from './paint.service';

describe('PaintService', () => {
    let service: PaintService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let drawServiceSpy: DrawingService;

    beforeEach(() => {
        drawServiceSpy = new DrawingService();

        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
        });
        service = TestBed.inject(PaintService);
        const canvasTestHelper = TestBed.inject(CanvasTestHelper);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get tolerance between 0 and 100', () => {
        service.tolerance = MAX_TOLERANCE * 2;
        expect(service.paintTolerance).toBe(MAX_TOLERANCE);

        service.tolerance = MAX_TOLERANCE / 2;
        expect(service.paintTolerance).toBe(MAX_TOLERANCE / 2);

        service.tolerance = -MAX_TOLERANCE;
        expect(service.paintTolerance).toBe(0);
    });

    it('should set tolerance between 0 and 100', () => {
        service.tolerance = MAX_TOLERANCE * 2;
        expect(service.tolerance).toBe(MAX_TOLERANCE);

        service.tolerance = MAX_TOLERANCE / 2;
        expect(service.tolerance).toBe(MAX_TOLERANCE / 2);

        service.tolerance = -MAX_TOLERANCE;
        expect(service.tolerance).toBe(0);
    });

    it('should make and execute a paint command when painting contiguous', () => {
        const mouseEvent = { button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalled();
    });

    it('should make and execute a paint command when painting non contiguous', () => {
        const mouseEvent = { button: MouseButton.Right } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalled();
    });

    it('should not make and execute a paint command when invalid mouse event', () => {
        const mouseEvent = { button: MouseButton.Middle } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(undoRedoService.addCommand).not.toHaveBeenCalled();
    });
});
