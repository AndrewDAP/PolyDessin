import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Command } from '@app/classes/commands/command';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

class MockCommand implements Command {
    // tslint:disable-next-line: no-empty
    do(): void {}
}

describe('UndoRedoService', () => {
    let service: UndoRedoService;

    let keyEventService: KeyEventService;

    let canvasTestHelper: CanvasTestHelper;

    let drawingService: DrawingService;
    let resizeService: ResizeService;
    let localStorageService: jasmine.SpyObj<LocalStorageService>;

    let validMouseEvent: MouseEvent;

    let invalidMouseEvent: MouseEvent;

    beforeEach(() => {
        keyEventService = new KeyEventService();
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        localStorageService = jasmine.createSpyObj('LocalStorageService', ['setDrawing']);
        // tslint:disable:no-string-literal
        TestBed.configureTestingModule({
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: DrawingService, useValue: drawingService },
                { provide: ResizeService, useValue: resizeService },
                { provide: LocalStorageService, useValue: localStorageService },
            ],
        });
        service = TestBed.inject(UndoRedoService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        validMouseEvent = {
            clientX: 25,
            clientY: 25,
            button: 0,
        } as MouseEvent;

        invalidMouseEvent = {
            clientX: 25,
            clientY: 25,
            button: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should undo with ctrl-z', () => {
        service.clearAllCommand();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'z', ctrlKey: true });

        const undo = spyOn(service, 'undo');

        keyEventService.onKeyDown(event);

        expect(undo).toHaveBeenCalled();
    });

    it('should redo with ctrl-shift-z', () => {
        service.clearAllCommand();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Z', ctrlKey: true, shiftKey: true });

        const redo = spyOn(service, 'redo');

        keyEventService.onKeyDown(event);
        expect(redo).toHaveBeenCalled();
    });

    it('should not undo with z with no ctrl', () => {
        service.clearAllCommand();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'z', ctrlKey: false });

        const undo = spyOn(service, 'undo');

        keyEventService.onKeyDown(event);

        expect(undo).not.toHaveBeenCalled();
    });

    it('should not redo with z without ctrl and shift', () => {
        service.clearAllCommand();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Z', ctrlKey: false, shiftKey: false });

        const redo = spyOn(service, 'redo');

        keyEventService.onKeyDown(event);
        expect(redo).not.toHaveBeenCalled();
    });

    it('should not push something to redo if undo as no command', () => {
        service.clearAllCommand();
        service.undo();
        expect(service.redoCommandSize).toEqual(0);
    });

    it('should not push something to pastCommand if redo as no command', () => {
        service.clearAllCommand();
        service.redo();
        expect(service.pastCommandSize).toEqual(0);
    });

    it('should not push something to redoCommand when undo is call if undoRedo is disable', () => {
        service.clearAllCommand();
        service.undoRedoDisable = false;
        const command1 = new MockCommand();
        service.addCommand(command1);
        service.undoRedoDisable = true;
        service.undo();
        expect(service.redoCommandSize).toEqual(0);
        expect(service.pastCommandSize).toEqual(1);
    });

    it('should not push something to pastCommand when redo is call if undoRedo is disable', () => {
        service.clearAllCommand();
        service.undoRedoDisable = false;
        const command1 = new MockCommand();
        service.addCommand(command1);
        service.undo();
        service.undoRedoDisable = true;
        service.redo();
        expect(service.pastCommandSize).toEqual(0);
        expect(service.redoCommandSize).toEqual(1);
    });

    it('should disable undo-redo on mouse down until next command', () => {
        const command1 = new MockCommand();
        service.undoRedoDisable = false;
        keyEventService.status = Status.OFF;
        keyEventService.onMouseDown(validMouseEvent);
        expect(service.undoRedoDisable).toBeTrue();
        service.addCommand(command1);
        expect(service.undoRedoDisable).toBeFalse();
    });

    it('should not disable undo-redo on mouse down not left', () => {
        service.undoRedoDisable = false;
        keyEventService.status = Status.OFF;
        keyEventService.onMouseDown(invalidMouseEvent);
        expect(service.undoRedoDisable).toBeFalse();
    });
});
