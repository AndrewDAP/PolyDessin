import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ResizeCanvasCommand } from '@app/classes/commands/resize-canvas-command';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, MARGIN, MIN_WIDTH_HEIGHT } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-resizable',
    templateUrl: './resizable.component.html',
    styleUrls: ['./resizable.component.scss'],
})
export class ResizableComponent implements OnInit, AfterViewInit {
    @ViewChild('resizeContainer') resizeContainer: ElementRef;
    canvasSize: Vec2;
    previewCanvasSize: Vec2;
    mouse: Vec2;
    status: Status;
    width: number = DEFAULT_WIDTH;
    height: number = DEFAULT_HEIGHT;
    boxPosition: { left: number; top: number };

    constructor(private resizeService: ResizeService, private drawingService: DrawingService, protected undoRedoService: UndoRedoService) {}

    ngOnInit(): void {
        this.resizeService.getStatusSubject().subscribe((status) => {
            this.status = status;
        });
        this.resizeService.getCanvasSize().subscribe((size) => {
            this.canvasSize = size;
            this.width = size.x;
            this.height = size.y;
        });
        this.resizeService.getPreviewCanvasSize().subscribe((size) => {
            this.previewCanvasSize = size;
            this.width = size.x;
            this.height = size.y;
        });
    }

    onMouseEnter(): void {
        this.resizeService.overHandles = true;
    }

    onMouseLeave(): void {
        this.resizeService.overHandles = false;
    }

    ngAfterViewInit(): void {
        this.loadBox();
    }

    loadBox(): void {
        const { left, top } = this.resizeContainer.nativeElement.getBoundingClientRect();
        this.boxPosition = { left, top };
    }

    setStatus(status: Status | number, event: MouseEvent): void {
        event.preventDefault();
        this.resizeService.changeStatus(status);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.status !== Status.OFF) {
            // Resize canvas, toggle selected to off, set status to OFF

            this.setStatus(0, event);
            const command = new ResizeCanvasCommand(this.drawingService, this.resizeService, {
                x: this.width,
                y: this.height,
            } as Vec2);

            this.undoRedoService.addCommand(command);
            command.do();
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.status !== Status.OFF) {
            this.mouse = { x: event.clientX, y: event.clientY };
            this.resize();
        }
    }

    resize(): void {
        switch (this.status) {
            case Status.FREE_RESIZE: {
                this.width = this.calculateWidth();
                this.height = this.calculateHeight();
                break;
            }
            case Status.HORIZONTAL: {
                this.width = this.calculateWidth();
                break;
            }
            case Status.VERTICAL: {
                this.height = this.calculateHeight();
                break;
            }
            default: {
                break;
            }
        }
    }

    calculateWidth(): number {
        const width = this.mouse.x - this.boxPosition.left;
        if (width < MIN_WIDTH_HEIGHT) {
            return MIN_WIDTH_HEIGHT;
        } else if (width > window.innerWidth - MARGIN - this.boxPosition.left) {
            return window.innerWidth - MARGIN - this.boxPosition.left;
        }
        return width;
    }

    calculateHeight(): number {
        const height = this.mouse.y - this.boxPosition.top;
        if (height < MIN_WIDTH_HEIGHT) {
            return MIN_WIDTH_HEIGHT;
        } else if (height > window.innerHeight - MARGIN - this.boxPosition.top) {
            return window.innerHeight - MARGIN - this.boxPosition.top;
        }
        return height;
    }

    get isActive(): boolean {
        return this.resizeService.isActive;
    }
}
