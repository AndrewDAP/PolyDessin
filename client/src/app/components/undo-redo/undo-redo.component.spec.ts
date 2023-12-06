import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Command } from '@app/classes/commands/command';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { UndoRedoComponent } from './undo-redo.component';

class MockCommand implements Command {
    // tslint:disable-next-line: no-empty
    do(): void {}
}

describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;
    let undoRedoService: UndoRedoService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        const drawingService = new DrawingService();
        const resizeService = new ResizeService(drawingService);
        const localStorageService = new LocalStorageService(drawingService);
        // tslint:disable:no-string-literal

        const keyEventService = new KeyEventService();

        undoRedoService = new UndoRedoService(keyEventService, drawingService, resizeService, localStorageService);
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
            providers: [{ provide: UndoRedoService, useValue: undoRedoService }],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UndoRedoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should undo if button is enabled', () => {
        undoRedoService.clearAllCommand();
        const mockCommand1 = new MockCommand();
        const mockCommand2 = new MockCommand();
        undoRedoService.addCommand(mockCommand1);
        undoRedoService.addCommand(mockCommand2);
        undoRedoService.undoRedoDisable = false;

        fixture.detectChanges();
        const undo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#undo');
        const doFunc = spyOn(mockCommand1, 'do');

        expect(undo.disabled).toBeFalse();
        undo.click();
        expect(doFunc).toHaveBeenCalled();
    });

    it('should not undo if button is disabled', () => {
        undoRedoService.clearAllCommand();
        const mockCommand1 = new MockCommand();
        const mockCommand2 = new MockCommand();
        undoRedoService.addCommand(mockCommand1);
        undoRedoService.addCommand(mockCommand2);
        undoRedoService.undoRedoDisable = true;

        fixture.detectChanges();
        const undo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#undo');
        const doFunc = spyOn(mockCommand1, 'do');

        expect(undo.disabled).toBeTrue();
        undo.click();
        expect(doFunc).not.toHaveBeenCalled();
    });

    it('should redo if button is enabled', () => {
        undoRedoService.clearAllCommand();
        const mockCommand1 = new MockCommand();
        const mockCommand2 = new MockCommand();
        undoRedoService.addCommand(mockCommand1);
        undoRedoService.addCommand(mockCommand2);

        undoRedoService.undoRedoDisable = false;
        undoRedoService.undo();
        undoRedoService.undo();

        fixture.detectChanges();
        const redo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#redo');
        const doFunc = spyOn(mockCommand1, 'do');

        expect(redo.disabled).toBeFalse();
        redo.click();
        expect(doFunc).toHaveBeenCalled();
    });

    it('should not redo if button is disabled', () => {
        undoRedoService.clearAllCommand();
        const mockCommand1 = new MockCommand();
        const mockCommand2 = new MockCommand();
        undoRedoService.addCommand(mockCommand1);
        undoRedoService.addCommand(mockCommand2);
        undoRedoService.undoRedoDisable = true;
        undoRedoService.undo();
        undoRedoService.undo();

        fixture.detectChanges();
        const redo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#redo');
        const doFunc = spyOn(mockCommand1, 'do');

        expect(redo.disabled).toBeTrue();
        redo.click();
        expect(doFunc).not.toHaveBeenCalled();
    });
});
