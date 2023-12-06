import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Tool } from '@app/classes/tool';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SelectionComponent } from '@app/components/selection/selection.component';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { TextService } from '@app/services/text/text.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { PaintService } from '@app/services/tools/paint/paint.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService } from '@app/services/tools/selection/change/change-selection.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';
import { DrawingComponent } from './drawing.component';

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let drawingService: DrawingService;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let newDrawingServiceSpy: jasmine.SpyObj<NewDrawingService>;
    let changingToolServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    let canvasTestHelper: CanvasTestHelper;
    let toolsBoxService: ToolsBoxService;
    let resizeService: ResizeService;
    let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

    let pencilService: jasmine.SpyObj<PencilService>;
    let lineService: jasmine.SpyObj<LineService>;
    let eraserService: jasmine.SpyObj<EraserService>;
    let rectangleService: jasmine.SpyObj<RectangleService>;
    let ellipseService: jasmine.SpyObj<EllipseService>;
    let pipetteService: jasmine.SpyObj<PipetteService>;
    let polygonService: jasmine.SpyObj<PolygonService>;
    let selectionService: jasmine.SpyObj<SelectionBehaviourService>;
    let rectangleSelection: jasmine.SpyObj<RectangleSelectionService>;
    let ellipseSelection: jasmine.SpyObj<EllipseSelectionService>;
    let aerosolService: jasmine.SpyObj<AerosolService>;
    let polygonalLassoService: jasmine.SpyObj<PolygonalLassoService>;
    let textService: jasmine.SpyObj<TextService>;
    let paintService: jasmine.SpyObj<PaintService>;
    let stampService: jasmine.SpyObj<StampService>;

    const toolTypeSubject: Subject<ToolType> = new Subject<ToolType>();
    const isActiveSubject: Subject<boolean> = new Subject();

    const TIMEOUT_TIME = 100;

    beforeEach(() => {
        pencilService = jasmine.createSpyObj('PencilService', ['setLeftAndTopOffsets']);
        lineService = jasmine.createSpyObj('LineService', ['setLeftAndTopOffsets']);
        eraserService = jasmine.createSpyObj('EraserService', ['setLeftAndTopOffsets']);
        rectangleService = jasmine.createSpyObj('RectangleService', ['setLeftAndTopOffsets']);
        ellipseService = jasmine.createSpyObj('EllipseService', ['setLeftAndTopOffsets']);
        pipetteService = jasmine.createSpyObj('PipetteService', ['setLeftAndTopOffsets']);
        polygonService = jasmine.createSpyObj('PolygonService', ['setLeftAndTopOffsets']);
        stampService = jasmine.createSpyObj('StampService', ['setLeftAndTopOffsets']);

        selectionService = jasmine.createSpyObj('SelectionService', ['setLeftAndTopOffsets'], {
            isActive: isActiveSubject,
        });
        rectangleSelection = jasmine.createSpyObj('RectangleSelectionService', ['setLeftAndTopOffsets'], {
            isActive: isActiveSubject,
        });
        ellipseSelection = jasmine.createSpyObj('EllipseSelectionService', ['setLeftAndTopOffsets'], {
            isActive: isActiveSubject,
        });
        aerosolService = jasmine.createSpyObj('AerosolService', ['setLeftAndTopOffsets']);
        polygonalLassoService = jasmine.createSpyObj('PolygonalLassoService', ['setLeftAndTopOffsets']);
        textService = jasmine.createSpyObj('TextService', ['setLeftAndTopOffsets']);
        paintService = jasmine.createSpyObj('PaintService', ['setLeftAndTopOffsets']);

        drawingService = new DrawingService();
        newDrawingServiceSpy = jasmine.createSpyObj('NewDrawingService', ['createNewCanvas', 'loadFromLocalStorage']);
        changingToolServiceSpy = jasmine.createSpyObj('ChangingToolService', {
            getTool: toolTypeSubject.asObservable(),
            setTool: '',
        });

        resizeService = new ResizeService(drawingService);

        keyEventService = jasmine.createSpyObj('KeyEventService', [
            'getKeyDownEvent',
            'getKeyUpEvent',
            'getMouseEvent',
            'getWheelEvent',
            'onMouseMove',
            'onMouseMoveWindow',
            'onMouseDown',
            'onMouseUp',
            'onMouseLeave',
            'onMouseEnter',
            'onKeyDown',
            'onKeyUp',
            'onWheelEvent',
        ]);

        keyEventService.getKeyDownEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getKeyUpEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getMouseEvent.and.returnValue(new Observable<MouseEvent>());
        keyEventService.getWheelEvent.and.returnValue(new Observable<WheelEvent>());

        toolsBoxService = new ToolsBoxService(
            changingToolServiceSpy,
            pencilService,
            lineService,
            eraserService,
            rectangleService,
            ellipseService,
            pipetteService,
            polygonService,
            selectionService,
            rectangleSelection,
            ellipseSelection,
            keyEventService,
            resizeService,
            {} as ChangeSelectionService,
            aerosolService,
            polygonalLassoService,
            paintService,
            textService,
            stampService,
        );

        colorServiceSpyObj = jasmine.createSpyObj('ColorService', ['clearCanvas']);
        localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['setDrawing', 'newDrawing']);
        TestBed.configureTestingModule({
            declarations: [DrawingComponent, ResizableComponent, SelectionComponent],
            providers: [
                { provide: DrawingService, useValue: drawingService },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: NewDrawingService, useValue: newDrawingServiceSpy },
                { provide: ChangingToolsService, useValue: changingToolServiceSpy },
                { provide: ToolsBoxService, useValue: toolsBoxService },
                { provide: LocalStorageService, useValue: localStorageServiceSpy },
            ],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        // tslint:disable:no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        spyOn(drawingService, 'clearCanvas').and.callThrough();
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });

    it('should clear previewContext on tool change', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();

        toolTypeSubject.next(ToolType.pencil);
        expect(drawingService.clearCanvas).toHaveBeenCalled();
    });

    it('should clear previewContext on tool change', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();

        toolTypeSubject.next(ToolType.pencil);
        expect(drawingService.clearCanvas).toHaveBeenCalled();
    });

    it('should reset wasLoaded if it was loaded', async () => {
        newDrawingServiceSpy.wasLoaded = true;

        component.ngAfterViewInit();
        fixture.detectChanges();

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(newDrawingServiceSpy.wasLoaded).toBeFalse();

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should set left and top offsets for all of the tools in toolsBoxService', () => {
        toolsBoxService.tools = new Map();
        toolsBoxService.tools.set(ToolType.pencil, pencilService);
        toolsBoxService.tools.set(ToolType.eraser, pencilService);
        toolsBoxService.tools.set(ToolType.line, pencilService);
        toolsBoxService.tools.set(ToolType.rectangle, pencilService);
        toolsBoxService.tools.set(ToolType.ellipse, pencilService);

        component.ngAfterViewInit();
        fixture.detectChanges();

        for (const key of Array.from(toolsBoxService.tools.keys())) {
            expect((toolsBoxService.tools.get(key) as Tool).setLeftAndTopOffsets).toHaveBeenCalled();
        }
    });

    it('should set the right drawing', () => {
        const clock = jasmine.clock();
        clock.install();

        newDrawingServiceSpy.wasLoaded = false;
        localStorageServiceSpy.newDrawing = true;
        component.ngAfterViewInit();
        fixture.detectChanges();
        clock.tick(TIMEOUT_TIME);
        expect(newDrawingServiceSpy.createNewCanvas).toHaveBeenCalled();

        localStorageServiceSpy.newDrawing = false;
        component.ngAfterViewInit();
        fixture.detectChanges();
        clock.tick(TIMEOUT_TIME);
        expect(newDrawingServiceSpy.loadFromLocalStorage).toHaveBeenCalled();

        newDrawingServiceSpy.wasLoaded = true;
        component.ngAfterViewInit();
        fixture.detectChanges();
        clock.tick(TIMEOUT_TIME);
        expect(localStorageServiceSpy.setDrawing).toHaveBeenCalled();
        expect(newDrawingServiceSpy.wasLoaded).toBeFalse();

        clock.uninstall();
    });

    it(' should call the event beforeunload when receiving a beforeunload event', () => {
        component.onUnload();
        expect(localStorageServiceSpy.setDrawing).toHaveBeenCalled();
        expect(localStorageServiceSpy.newDrawing).toBeFalse();
    });

    it(' should call the key event mouse move when receiving a mouse move event', () => {
        const event = {} as MouseEvent;
        component.onMouseMove(event);
        expect(keyEventService.onMouseMove).toHaveBeenCalledWith(event);
    });

    it(' should call the key event mouse down when receiving a mouse down event', () => {
        const event = {} as MouseEvent;
        component.onMouseDown(event);
        expect(keyEventService.onMouseDown).toHaveBeenCalledWith(event);
    });

    it(' should call key event mouse up when receiving a mouse up event', () => {
        const event = {} as MouseEvent;
        component.onMouseUp(event);
        expect(keyEventService.onMouseUp).toHaveBeenCalledWith(event);
    });

    it(' should call key event mouse leave when receiving a mouse leave event', () => {
        const event = {} as MouseEvent;
        component.onMouseLeave(event);
        expect(keyEventService.onMouseLeave).toHaveBeenCalledWith(event);
    });

    it(' should call key event mouse enter when receiving a mouse enter event', () => {
        const event = {} as MouseEvent;
        component.onMouseEnter(event);
        expect(keyEventService.onMouseEnter).toHaveBeenCalledWith(event);
    });

    it(' should call key event mouse move window when receiving a mouse move window event', () => {
        const event = {} as MouseEvent;
        component.onMouseMoveWindow(event);
        expect(keyEventService.onMouseMoveWindow).toHaveBeenCalledWith(event);
    });

    it(' should call key event wheel event when there is a wheel event', () => {
        const event = {} as WheelEvent;
        component.onWhellEvent(event);
        expect(keyEventService.onWheelEvent).toHaveBeenCalledWith(event);
    });

    it(' should call key event onKeyUpS when receiving a KeyBoardEvent', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Shift' });
        component.onKeyUp(event);
        expect(keyEventService.onKeyUp).toHaveBeenCalledWith(event);
    });

    it('should set wasLoaded to false when popstate is called', () => {
        newDrawingServiceSpy.wasLoaded = true;
        component.onPopState();
        expect(newDrawingServiceSpy.wasLoaded).toBeFalse();
    });
});
