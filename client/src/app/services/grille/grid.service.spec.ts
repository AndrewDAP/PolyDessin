import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { BehaviorSubject } from 'rxjs';
import { GridService } from './grid.service';
// tslint:disable: no-magic-numbers

describe('GrilleService', () => {
    let service: GridService;
    let toolsInfoService: ToolsInfoService;
    let keyEventService: KeyEventService;
    let resizeService: jasmine.SpyObj<ResizeService>;
    let subject: BehaviorSubject<Vec2>;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        subject = new BehaviorSubject<Vec2>({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT } as Vec2);
        toolsInfoService = new ToolsInfoService();
        keyEventService = new KeyEventService();
        resizeService = jasmine.createSpyObj('ResizeService', ['setCanvasSize', 'setPreviewCanvasSize', 'getCanvasSize']);
        resizeService.getCanvasSize.and.returnValue(subject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: ResizeService, useValue: resizeService },
            ],
        });

        service = TestBed.inject(GridService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.gridCanvas = canvasTestHelper.canvas;
        service.gridCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('g without ctrl should call toolsinfoservice', () => {
        const spy = spyOn(toolsInfoService, 'setShowGridCanvas');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'g', ctrlKey: false });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('set show grid to true should call update grid', () => {
        const spy = spyOn(service, 'updateGrid');
        toolsInfoService.setShowGridCanvas(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('set show grid to false should call remove grid', () => {
        const spy = spyOn(service, 'removeGrid');
        toolsInfoService.setShowGridCanvas(false);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('g with ctrl should not call toolsinfoservice', () => {
        const spy = spyOn(toolsInfoService, 'setShowGridCanvas');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'g', ctrlKey: true });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('+ should call increase size', () => {
        const spy = spyOn(service, 'increaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '+', ctrlKey: false });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('= should call increase size', () => {
        const spy = spyOn(service, 'increaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '=', ctrlKey: false });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('- should call decrease size', () => {
        const spy = spyOn(service, 'decreaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '-', ctrlKey: false });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('+ and ctrl should not call increase size', () => {
        const spy = spyOn(service, 'increaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '+', ctrlKey: true });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('= and ctrl should not call increase size', () => {
        const spy = spyOn(service, 'increaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '=', ctrlKey: true });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('- and ctrl should not call decrease size', () => {
        const spy = spyOn(service, 'decreaseSquareSize');
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '-', ctrlKey: true });
        keyEventService.onKeyDown(event);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('setting squareCanvasSize should call updateGRid', () => {
        const spy = spyOn(service, 'updateGrid');
        toolsInfoService.setSizeSquareCanvas(50);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('get opacityStyle should return the right hsla', () => {
        service.gridOpacity = 50;
        expect(service.opacityStyle()).toEqual('hsla(0, 0%, 0%, ' + service.gridOpacity / 100 + ')');
    });

    it('setting opacity should call updateGrid', () => {
        const spy = spyOn(service, 'updateGrid');
        toolsInfoService.setOpacityCanvas(50);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('setting show grid should adjust show grid', () => {
        toolsInfoService.setShowGridCanvas(true);
        expect(service.showGridCanvas).toEqual(true);
    });

    it('increase square size should call tools info service accordingly', () => {
        const spy = spyOn(toolsInfoService, 'setSizeSquareCanvas');
        service.canvasSquareSize = 74;
        service.increaseSquareSize();
        expect(spy).toHaveBeenCalledWith(75);
    });

    it('increase square size should call tools info service accordingly', () => {
        const spy = spyOn(toolsInfoService, 'setSizeSquareCanvas');
        service.canvasSquareSize = 75;
        service.increaseSquareSize();
        expect(spy).toHaveBeenCalledWith(80);
    });

    it('increase square size should call tools info service accordingly', () => {
        const spy = spyOn(toolsInfoService, 'setSizeSquareCanvas');
        service.canvasSquareSize = 74;
        service.decreaseSquareSize();
        expect(spy).toHaveBeenCalledWith(70);
    });

    it('increase square size should call tools info service accordingly', () => {
        const spy = spyOn(toolsInfoService, 'setSizeSquareCanvas');
        service.canvasSquareSize = 75;
        service.decreaseSquareSize();
        expect(spy).toHaveBeenCalledWith(70);
    });

    it('calling updategrid should call drawgrid if show canvas is true', () => {
        const spy = spyOn(service, 'drawGrid');
        service.showGridCanvas = true;
        service.updateGrid();
        expect(spy).toHaveBeenCalled();
    });

    it('find nearest col and row should give the good value', () => {
        service.canvasSquareSize = 50;
        const result = service.findNearestColAndRow({ x: 51, y: 51 });
        expect(result.x).toEqual(50);
        expect(result.y).toEqual(50);
    });
});
