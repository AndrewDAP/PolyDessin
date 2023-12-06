import { Injectable } from '@angular/core';
import { DEFAULT_TOOL_SIZE, MagnetGrabHandle } from '@app/const';
import { ToolType } from '@app/tool-type';
import { Observable, Subject, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolsInfoService {
    showGridProperties: boolean = false;
    showClipboardProperties: boolean = true;

    saveButtonDisabled: boolean = false;

    private carouselLoadingProp: boolean = false;
    get carouselLoading(): boolean {
        return this.carouselLoadingProp;
    }
    set carouselLoading(value: boolean) {
        // To prevent ngCangedAfterChecked error
        setTimeout(() => (this.carouselLoadingProp = value));
    }

    private subjectSizeOfJunction: Subject<number> = new Subject<number>();
    private subjectSizeOfDroplet: Subject<number> = new Subject<number>();
    private subjectSpeedOfDroplet: Subject<number> = new Subject<number>();

    private subjectShowGridCanvas: Subject<boolean> = new Subject<boolean>();
    private subjectOpacityCanvas: Subject<number> = new Subject<number>();
    private subjectSizeSquareCanvas: Subject<number> = new Subject<number>();

    private subjectMagnetActive: Subject<boolean> = new Subject<boolean>();
    private subjectMagnetHandle: Subject<MagnetGrabHandle> = new Subject<MagnetGrabHandle>();

    private subjectShouldDrawJunction: Subject<boolean> = new Subject<boolean>();
    private subjectWithFill: Subject<boolean> = new Subject<boolean>();
    private subjectWithStroke: Subject<boolean> = new Subject<boolean>();
    private subjectPolySides: Subject<number> = new Subject<number>();
    private subjectNewDrawing: Subject<null> = new Subject<null>();

    private subjectBinding: Map<ToolType, Subject<number>> = new Map();
    toolSize: Map<ToolType, number> = new Map<ToolType, number>();

    constructor() {
        Object.values(ToolType).forEach((tool: ToolType) => {
            this.toolSize.set(tool, DEFAULT_TOOL_SIZE);
            this.subjectBinding.set(tool, new Subject<number>());
        });
    }

    getSizeOf(tool: ToolType): Observable<number> {
        if (this.subjectBinding.has(tool)) {
            return (this.subjectBinding.get(tool) as Subject<number>).asObservable();
        } else {
            return throwError('Unknow tooltype');
        }
    }

    setSizeOf(tool: ToolType, size: number): void {
        if (this.subjectBinding.has(tool)) {
            (this.subjectBinding.get(tool) as Subject<number>).next(size);
            this.toolSize.set(tool, size);
        } else {
            throw new Error('Unknown tooltype');
        }
    }

    getSizeOfJunction(): Observable<number> {
        return this.subjectSizeOfJunction.asObservable();
    }

    setSizeOfJunction(size: number): void {
        this.subjectSizeOfJunction.next(size);
    }

    getShouldDrawJunction(): Observable<boolean> {
        return this.subjectShouldDrawJunction.asObservable();
    }

    setShouldDrawJunction(shouldDraw: boolean): void {
        this.subjectShouldDrawJunction.next(shouldDraw);
    }

    getSizeOfDroplet(): Observable<number> {
        return this.subjectSizeOfDroplet.asObservable();
    }

    setSizeOfDroplet(size: number): void {
        this.subjectSizeOfDroplet.next(size);
    }

    getSpeedOfDroplet(): Observable<number> {
        return this.subjectSpeedOfDroplet.asObservable();
    }

    setSpeedOfDroplet(speed: number): void {
        this.subjectSpeedOfDroplet.next(speed);
    }

    getWithFill(): Observable<boolean> {
        return this.subjectWithFill;
    }

    setWithFill(withFill: boolean): void {
        this.subjectWithFill.next(withFill);
    }

    getWithStroke(): Observable<boolean> {
        return this.subjectWithStroke;
    }

    setWithStroke(withStroke: boolean): void {
        this.subjectWithStroke.next(withStroke);
    }

    setNewDrawing(): void {
        this.subjectNewDrawing.next();
    }

    getNewDrawing(): Observable<null> {
        return this.subjectNewDrawing.asObservable();
    }

    getSides(): Observable<number> {
        return this.subjectPolySides;
    }

    setSides(sides: number): void {
        this.subjectPolySides.next(sides);
    }

    getShowGridCanvas(): Observable<boolean> {
        return this.subjectShowGridCanvas.asObservable();
    }

    setShowGridCanvas(shouldShow: boolean): void {
        this.subjectShowGridCanvas.next(shouldShow);
    }

    getOpacityCanvas(): Observable<number> {
        return this.subjectOpacityCanvas.asObservable();
    }

    setOpacityCanvas(opacity: number): void {
        this.subjectOpacityCanvas.next(opacity);
    }

    getSizeSquareCanvas(): Observable<number> {
        return this.subjectSizeSquareCanvas.asObservable();
    }

    setSizeSquareCanvas(sizeOfSquare: number): void {
        this.subjectSizeSquareCanvas.next(sizeOfSquare);
    }

    getMagnetActive(): Observable<boolean> {
        return this.subjectMagnetActive.asObservable();
    }

    setMagnetActive(isMagnetActive: boolean): void {
        this.subjectMagnetActive.next(isMagnetActive);
    }

    getMagnetHandle(): Observable<MagnetGrabHandle> {
        return this.subjectMagnetHandle.asObservable();
    }

    setMagnetHandle(magnetHandle: MagnetGrabHandle): void {
        this.subjectMagnetHandle.next(magnetHandle);
    }
}
