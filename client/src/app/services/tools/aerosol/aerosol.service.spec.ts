import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AerosolService } from './aerosol.service';

describe('AerosolService', () => {
    let service: AerosolService;
    let toolsInfoService: ToolsInfoService;
    let validMouseEvent: MouseEvent;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let invalidMouseEvent: MouseEvent;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        toolsInfoService = new ToolsInfoService();
        drawingService = new DrawingService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: DrawingService, useValue: drawingService },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
            imports: [MaterialModule],
        });
        service = TestBed.inject(AerosolService);
        toolsInfoService = TestBed.inject(ToolsInfoService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line: no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        // tslint:disable-next-line: no-string-literal
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        validMouseEvent = {
            clientX: 445,
            clientY: 450,
            button: 0,
        } as MouseEvent;

        invalidMouseEvent = {
            clientX: 445,
            clientY: 450,
            button: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changing the size of the droplet should change dropletSize', () => {
        const test = 30;
        toolsInfoService.setSizeOfDroplet(test);
        expect(service.dropletSize).toEqual(test);
    });

    it('changing the speed of the droplet should change dropletSpeed', () => {
        const test = 30;
        toolsInfoService.setSpeedOfDroplet(test);
        expect(service.dropletSpeed).toEqual(test);
    });

    it('should call draw when on mouse down', (done: DoneFn) => {
        const testSpeed = 30;
        service.dropletSpeed = testSpeed;
        // tslint:disable-next-line: no-any
        const drawSpy = spyOn<any>(service, 'draw');
        service.onMouseDown(validMouseEvent);
        setTimeout(() => {
            service.onMouseUp(validMouseEvent);
            expect(drawSpy).toHaveBeenCalled();
            done();
            // tslint:disable-next-line: no-magic-numbers
        }, 1000);
    });

    it('should not call draw if its not a validMouseEvent', () => {
        // tslint:disable-next-line: no-any
        const drawSpy = spyOn<any>(service, 'draw');
        service.onMouseDown(invalidMouseEvent);
        expect(drawSpy).toHaveBeenCalledTimes(0);
    });

    it('should add command if its a validMouseEvent', () => {
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.mouseDown = true;
        service.onMouseUp(validMouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalledTimes(1);
    });

    it('should call drawPath if its a validMouseEvent', () => {
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.mouseDown = true;
        const spyDrawPath = spyOn(service, 'drawPath');
        service.onMouseUp(validMouseEvent);
        expect(spyDrawPath).toHaveBeenCalledTimes(1);
    });

    it('should not add command if its not a validMouseEvent', () => {
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.onMouseUp(invalidMouseEvent);
        expect(undoRedoService.addCommand).toHaveBeenCalledTimes(0);
    });

    it('should clear dropletPosition on drawPath', () => {
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.onMouseDown(validMouseEvent);
        service.onMouseUp(validMouseEvent);
        service.drawPath();
        expect(service.dropletPosition.length).toEqual(0);
    });

    it('calling draw should push the mousedowncoord to the droplet position', () => {
        service.dropletPosition = [];
        service.mouseDownCoord = { x: 0, y: 0 } as Vec2;
        service.draw();
        expect(service.dropletPosition.length).toEqual(1);
    });

    it('drawAerosolCommand should draw a circle for every dropletPosition', () => {
        service.dropletPosition = [{ x: 10, y: 10 } as Vec2, { x: 10, y: 10 } as Vec2, { x: 10, y: 10 } as Vec2];
        const size = service.dropletPosition.length;
        const spyDrawArc = spyOn(drawingService.baseCtx, 'arc');
        service.drawPath();
        expect(spyDrawArc).toHaveBeenCalledTimes(size);
    });

    it('on mouse move window should set service mouseDownCoord if mouse down', () => {
        service.mouseDown = true;
        service.onMouseMoveWindow(validMouseEvent);
        expect(service.mouseDownCoord).toEqual({ x: 445, y: 450 } as Vec2);
    });

    it('on mouse move window should not set service mouseDownCoord if mouse is not down', () => {
        service.mouseDown = false;
        const test = { x: 0, y: 0 } as Vec2;
        service.mouseDownCoord = test;
        service.onMouseMoveWindow(validMouseEvent);
        expect(service.mouseDownCoord).toEqual(test);
    });
});
