import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('grid', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    DEFAULT_WIDTH: number = DEFAULT_WIDTH;
    DEFAULT_HEIGHT: number = DEFAULT_HEIGHT;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    previewCanvasSize: Vec2;
    canvasSize: Vec2;
    isResizeSelected: boolean;
    status: Status = Status.OFF;

    constructor(
        private drawingService: DrawingService,
        private changingToolsService: ChangingToolsService,
        private resizeService: ResizeService,
        private keyEventService: KeyEventService,
        private newDrawingService: NewDrawingService,
        private toolsBoxService: ToolsBoxService,
        public gridService: GridService,
        private localStorageService: LocalStorageService,
    ) {
        this.keyEventService.status = this.status;
    }

    ngOnInit(): void {
        this.resizeService.getStatusSubject().subscribe((status) => {
            this.status = status;
            this.keyEventService.status = status;
        });
        this.resizeService.getCanvasSize().subscribe((size) => {
            this.canvasSize = size;
        });
        this.resizeService.getPreviewCanvasSize().subscribe((size) => {
            this.previewCanvasSize = size;
        });
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.gridService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.gridService.gridCanvas = this.gridCanvas.nativeElement;

        this.changingToolsService.getTool().subscribe(() => {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        });

        const { left, top } = this.baseCanvas.nativeElement.getBoundingClientRect();

        for (const key of Array.from(this.toolsBoxService.tools.keys())) {
            (this.toolsBoxService.tools.get(key) as Tool).setLeftAndTopOffsets(left, top);
        }

        setTimeout(() => {
            this.newDrawingService.left = left;
            this.newDrawingService.top = top;

            if (this.localStorageService.newDrawing) this.newDrawingService.createNewCanvas();
            else if (!this.newDrawingService.wasLoaded) this.newDrawingService.loadFromLocalStorage();

            if (this.newDrawingService.wasLoaded) {
                this.newDrawingService.wasLoaded = false;
            }

            this.localStorageService.setDrawing();
        });

        this.changingToolsService.setTool(ToolType.pencil);
    }

    @HostListener('window:popstate', [])
    onPopState(): void {
        this.newDrawingService.wasLoaded = false;
    }

    @HostListener('window:beforeunload', ['$event'])
    onUnload(): void {
        this.localStorageService.setDrawing();
        this.localStorageService.newDrawing = false;
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.keyEventService.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.keyEventService.onMouseUp(event);
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.keyEventService.onMouseMove(event);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMoveWindow(event: MouseEvent): void {
        this.keyEventService.onMouseMoveWindow(event);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.keyEventService.onMouseLeave(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.keyEventService.onMouseEnter(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.keyEventService.onKeyUp(event);
    }

    @HostListener('window:wheel', ['$event'])
    onWhellEvent(event: WheelEvent): void {
        this.keyEventService.onWheelEvent(event);
    }

    get height(): number {
        return this.resizeService.canvasSizeSubject.value.y;
    }

    get width(): number {
        return this.resizeService.canvasSizeSubject.value.x;
    }
}
