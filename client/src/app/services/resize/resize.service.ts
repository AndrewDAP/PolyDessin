import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BehaviorSubject, Observable } from 'rxjs';

export const enum Status {
    OFF = 0,
    HORIZONTAL = 1,
    VERTICAL = 2,
    FREE_RESIZE = 3,
}

@Injectable({
    providedIn: 'root',
})
export class ResizeService {
    isActive: boolean = true;
    statusSubject: BehaviorSubject<Status> = new BehaviorSubject<Status>(Status.OFF);
    canvasSizeSubject: BehaviorSubject<Vec2> = new BehaviorSubject<Vec2>({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT } as Vec2);
    previewCanvasSizeSubject: BehaviorSubject<Vec2> = new BehaviorSubject<Vec2>({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT } as Vec2);
    offsetLeft: number = 0;
    offsetTop: number = 0;
    overHandles: boolean = false;

    constructor(private drawingService: DrawingService) {}

    setOffsets(left: number, top: number): void {
        this.offsetLeft = left;
        this.offsetTop = top;
    }

    getCanvasSize(): Observable<Vec2> {
        return this.canvasSizeSubject.asObservable();
    }

    getPreviewCanvasSize(): Observable<Vec2> {
        return this.previewCanvasSizeSubject.asObservable();
    }

    getStatusSubject(): Observable<Status> {
        return this.statusSubject.asObservable();
    }

    setPreviewCanvasSize(size: Vec2): void {
        this.previewCanvasSizeSubject.next(size);
        this.drawingService.previewCanvas.width = size.x;
        this.drawingService.previewCanvas.height = size.y;
    }

    setCanvasSize(size: Vec2): void {
        this.canvasSizeSubject.next(size);
        this.drawingService.canvas.width = size.x;
        this.drawingService.canvas.height = size.y;
    }

    changeStatus(status: Status | number): void {
        this.statusSubject.next(status);
    }
}
