import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { StampService } from './stamp.service';

describe('StampService', () => {
    let service: StampService;
    let toolsInfoService: ToolsInfoService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let keyEventService: KeyEventService;

    beforeEach(() => {
        toolsInfoService = new ToolsInfoService();
        drawingService = new DrawingService();
        keyEventService = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: DrawingService, useValue: drawingService },
                { provide: UndoRedoService, useValue: undoRedoService },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [MaterialModule],
        });
        service = TestBed.inject(StampService);
        toolsInfoService = TestBed.inject(ToolsInfoService);
        drawingService = TestBed.inject(DrawingService);
        keyEventService = TestBed.inject(KeyEventService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line: no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        // tslint:disable-next-line: no-string-literal
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });
    // tslint:disable: no-magic-numbers

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('alt down event should set alt accordingly', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Alt' });
        keyEventService.onKeyDown(keyEvent);
        expect(service.altIsDown).toEqual(true);
    });

    it('alt up event should set alt accordingly', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Alt' });
        keyEventService.onKeyUp(keyEvent);
        expect(service.altIsDown).toEqual(false);
    });

    it('on mouse down should add a command tu undo redo', () => {
        service.onMouseDown({ clientX: 445, clientY: 450, button: 0 } as MouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalledTimes(1);
    });

    it('on mouse down should not add a command tu undo redo if not valid mouuse event', () => {
        service.onMouseDown({ clientX: 445, clientY: 450, button: 1 } as MouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalledTimes(0);
    });

    it('on mouse move should call drawstamp if inside canvas', () => {
        const spy = spyOn(service, 'drawStamp');
        drawingService.canvas.width = 1000;
        drawingService.canvas.height = 1000;
        service.onMouseMoveWindow({ clientX: 445, clientY: 450, button: 0 } as MouseEvent);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('on mouse move should not call drawstamp if outside canvas', () => {
        const spy = spyOn(service, 'drawStamp');
        drawingService.canvas.width = 200;
        drawingService.canvas.height = 200;
        service.onMouseMoveWindow({ clientX: 445, clientY: 450, button: 0 } as MouseEvent);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('on wheel event should set the angle accordingly', () => {
        service.angle = 15;
        service.altIsDown = false;
        service.onWheelEvent({ deltaY: 222 } as WheelEvent);
        expect(service.angle).toEqual(30);
        service.angle = 15;
        service.altIsDown = true;
        service.onWheelEvent({ deltaY: 222 } as WheelEvent);
        expect(service.angle).toEqual(16);
        service.angle = 15;
        service.altIsDown = true;
        service.onWheelEvent({ deltaY: -222 } as WheelEvent);
        expect(service.angle).toEqual(14);
        service.angle = 15;
        service.altIsDown = false;
        service.onWheelEvent({ deltaY: -222 } as WheelEvent);
        expect(service.angle).toEqual(0);
        service.angle = 5;
        service.altIsDown = false;
        service.onWheelEvent({ deltaY: -222 } as WheelEvent);
        expect(service.angle).toEqual(345);
    });
});
