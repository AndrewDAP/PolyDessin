import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, MARGIN, MIN_WIDTH_HEIGHT } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { BehaviorSubject } from 'rxjs';
import { ResizableComponent } from './resizable.component';

describe('ResizableComponent', () => {
    let component: ResizableComponent;
    let fixture: ComponentFixture<ResizableComponent>;
    let resizeService: ResizeService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    const canvasSize: BehaviorSubject<Vec2> = new BehaviorSubject<Vec2>({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT } as Vec2);
    const previewCanvasSize: BehaviorSubject<Vec2> = new BehaviorSubject<Vec2>({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT } as Vec2);
    const status: BehaviorSubject<Status> = new BehaviorSubject<Status>(Status.OFF);

    const mouseEvent = {
        clientX: 500,
        clientY: 500,
        button: 0,
        // tslint:disable-next-line:no-empty
        preventDefault(): void {},
    } as MouseEvent;

    beforeEach(async(() => {
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        TestBed.configureTestingModule({
            declarations: [ResizableComponent],
            providers: [
                { provide: ResizeService, useValue: resizeService },
                { provide: DrawingService, useValue: drawingService },
            ],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        // tslint:disable:no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        spyOn(resizeService, 'getCanvasSize').and.returnValue(canvasSize.asObservable());
        spyOn(resizeService, 'getPreviewCanvasSize').and.returnValue(previewCanvasSize.asObservable());
        spyOn(resizeService, 'setPreviewCanvasSize').and.callThrough();
        spyOn(resizeService, 'setCanvasSize').and.callThrough();
        spyOn(resizeService, 'changeStatus').and.callThrough();
        spyOn(resizeService, 'getStatusSubject').and.returnValue(status.asObservable());
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResizableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to status of resizeService on ngOnInit', () => {
        component.ngOnInit();
        fixture.detectChanges();

        expect(resizeService.getStatusSubject).toHaveBeenCalled();
        expect(component.status).toEqual(status.value);
    });

    it('should subscribe to canvasSize of resizeService on ngOnInit', () => {
        component.ngOnInit();
        fixture.detectChanges();

        expect(resizeService.getCanvasSize).toHaveBeenCalled();
        expect(component.canvasSize).toEqual(canvasSize.value);
    });

    it('should subscribe to previewCanvasSize of resizeService on ngOnInit', () => {
        component.ngOnInit();
        fixture.detectChanges();

        expect(resizeService.getStatusSubject).toHaveBeenCalled();
        expect(component.previewCanvasSize).toEqual(previewCanvasSize.value);
    });

    it('should define top and left offsets of the resize box when ngAfterViewInit is called', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();

        expect(component.boxPosition).toBeDefined();
    });

    it('should set serviceStatus when setStatus is called', () => {
        status.next(Status.FREE_RESIZE);
        component.setStatus(status.value, mouseEvent);

        expect(resizeService.changeStatus).toHaveBeenCalled();
        expect(component.status).toEqual(status.value);
    });

    it('should not resize onMouseUp if status is OFF', () => {
        status.next(Status.OFF);
        component.setStatus(status.value, mouseEvent);
        component.onMouseUp(mouseEvent);

        expect(resizeService.setCanvasSize).not.toHaveBeenCalled();
        expect(resizeService.setPreviewCanvasSize).not.toHaveBeenCalled();
    });

    it('should resizeCanvas onMouseUp if status is not OFF', () => {
        status.next(Status.FREE_RESIZE);
        component.setStatus(status.value, mouseEvent);
        component.onMouseUp(mouseEvent);

        expect(resizeService.setCanvasSize).toHaveBeenCalled();
        expect(resizeService.setPreviewCanvasSize).toHaveBeenCalled();
        expect(resizeService.changeStatus).toHaveBeenCalled();
        expect(resizeService.statusSubject.value).toEqual(Status.OFF);
    });

    it('should resize onMouseMove is the status is not OFF', () => {
        status.next(Status.FREE_RESIZE);
        component.setStatus(status.value, mouseEvent);
        component.onMouseMove(mouseEvent);

        expect(component.mouse.x).toEqual(mouseEvent.clientX);
        expect(component.mouse.y).toEqual(mouseEvent.clientY);
    });

    it('should resize onMouseMove is the status is not OFF', () => {
        spyOn(component, 'resize');

        status.next(Status.OFF);
        component.setStatus(status.value, mouseEvent);
        component.onMouseMove(mouseEvent);

        expect(component.resize).not.toHaveBeenCalled();
    });

    it('resize should only change width if status is HORIZONTAL', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();
        spyOn(component, 'calculateWidth');
        spyOn(component, 'calculateHeight');

        status.next(Status.HORIZONTAL);
        component.setStatus(status.value, mouseEvent);
        component.width = DEFAULT_WIDTH / 2;
        component.height = DEFAULT_HEIGHT / 2;

        component.resize();

        expect(component.calculateWidth).toHaveBeenCalled();
        expect(component.calculateHeight).not.toHaveBeenCalled();
    });

    it('resize should only change height if status is VERTICAL', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();
        spyOn(component, 'calculateWidth');
        spyOn(component, 'calculateHeight');

        status.next(Status.VERTICAL);
        component.setStatus(status.value, mouseEvent);
        component.width = DEFAULT_WIDTH / 2;
        component.height = DEFAULT_HEIGHT / 2;

        component.resize();

        expect(component.calculateWidth).not.toHaveBeenCalled();
        expect(component.calculateHeight).toHaveBeenCalled();
    });

    it('resize should change width and height if status is FREE_RESIZE', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();
        spyOn(component, 'calculateWidth');
        spyOn(component, 'calculateHeight');

        status.next(Status.FREE_RESIZE);
        component.setStatus(status.value, mouseEvent);
        component.width = DEFAULT_WIDTH / 2;
        component.height = DEFAULT_HEIGHT / 2;

        component.resize();

        expect(component.calculateWidth).toHaveBeenCalled();
        expect(component.calculateHeight).toHaveBeenCalled();
    });

    it('resize should not change anything if status is OFF', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();
        spyOn(component, 'calculateWidth');
        spyOn(component, 'calculateHeight');

        status.next(Status.OFF);
        component.setStatus(status.value, mouseEvent);
        component.width = DEFAULT_WIDTH / 2;
        component.height = DEFAULT_HEIGHT / 2;

        component.resize();

        expect(component.calculateWidth).not.toHaveBeenCalled();
        expect(component.calculateHeight).not.toHaveBeenCalled();
    });

    it('should lock to 250 if mouse position is smaller than 250', async () => {
        component.ngAfterViewInit();
        fixture.detectChanges();
        await fixture.whenStable();
        component.mouse = {
            x: 200,
            y: 200,
        };

        const width = component.calculateWidth();
        const height = component.calculateHeight();

        expect(width).toEqual(MIN_WIDTH_HEIGHT);
        expect(height).toEqual(MIN_WIDTH_HEIGHT);
    });

    it('should lock to window size - margin if mouse position is bigger than window', () => {
        component.ngAfterViewInit();
        fixture.detectChanges();

        component.mouse = {
            x: window.innerWidth + MARGIN,
            y: window.innerHeight + MARGIN,
        };

        const width = component.calculateWidth();
        const height = component.calculateHeight();

        expect(width).toEqual(window.innerWidth - MARGIN - component.boxPosition.left);
        expect(height).toEqual(window.innerHeight - MARGIN - component.boxPosition.top);
    });

    it('should detect when hovering over the resize handles', () => {
        component.onMouseEnter();
        expect(resizeService.overHandles).toEqual(true);

        component.onMouseLeave();
        expect(resizeService.overHandles).toEqual(false);
    });
});
