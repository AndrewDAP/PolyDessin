import { Injectable } from '@angular/core';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { KeyEventMask } from '@app/classes/key-event-masks/key-event-mask';
import { NO_MATCH } from '@app/const';
import { Status } from '@app/services/resize/resize.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject, throwError } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class KeyEventService {
    keyMask: KeyEventMask = new DefaultKeyEventMask();

    status: Status;
    mouseEvent: string[] = ['onMouseMove', 'onMouseMoveWindow', 'onMouseDown', 'onMouseUp', 'onMouseLeave', 'onMouseEnter'];
    bindingKeyDown: Map<string, Subject<KeyboardEvent>> = new Map();
    bindingKeyUp: Map<string, Subject<KeyboardEvent>> = new Map();
    bindingMouseEvent: Map<string, Subject<MouseEvent>> = new Map();
    noPreventDefault: Set<string> = new Set<string>(['Escape', 'Enter', 'Backspace', 'c', '1', '2', 'r']);
    subjectWheelEvent: Subject<WheelEvent> = new Subject<WheelEvent>();

    currentTool: ToolType;

    constructor() {
        for (const key of this.mouseEvent) {
            this.bindingMouseEvent.set(key, new Subject<MouseEvent>());
        }
    }

    getKeyDownEvent(key: string): Observable<KeyboardEvent> {
        if (this.bindingKeyDown.has(key)) {
            return (this.bindingKeyDown.get(key) as Subject<KeyboardEvent>).asObservable() as Observable<KeyboardEvent>;
        }
        this.bindingKeyDown.set(key, new Subject<KeyboardEvent>());
        return this.getKeyDownEvent(key);
    }

    getKeyUpEvent(key: string): Observable<KeyboardEvent> {
        if (this.bindingKeyUp.has(key)) {
            return (this.bindingKeyUp.get(key) as Subject<KeyboardEvent>).asObservable() as Observable<KeyboardEvent>;
        }
        this.bindingKeyUp.set(key, new Subject<KeyboardEvent>());
        return this.getKeyUpEvent(key);
    }

    getMouseEvent(event: string): Observable<MouseEvent> {
        if (this.bindingMouseEvent.has(event)) {
            return (this.bindingMouseEvent.get(event) as Subject<MouseEvent>).asObservable() as Observable<MouseEvent>;
        }
        return throwError("Key doesn't exist");
    }

    getWheelEvent(): Observable<WheelEvent> {
        return this.subjectWheelEvent.asObservable();
    }

    onMouseDown(event: MouseEvent): void {
        if (this.status === Status.OFF) (this.bindingMouseEvent.get('onMouseDown') as Subject<MouseEvent>).next(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.status === Status.OFF) (this.bindingMouseEvent.get('onMouseUp') as Subject<MouseEvent>).next(event);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.status === Status.OFF) (this.bindingMouseEvent.get('onMouseMove') as Subject<MouseEvent>).next(event);
    }

    onMouseMoveWindow(event: MouseEvent): void {
        if (this.status === Status.OFF) (this.bindingMouseEvent.get('onMouseMoveWindow') as Subject<MouseEvent>).next(event);
    }

    onMouseLeave(event: MouseEvent): void {
        (this.bindingMouseEvent.get('onMouseLeave') as Subject<MouseEvent>).next(event);
    }

    onMouseEnter(event: MouseEvent): void {
        (this.bindingMouseEvent.get('onMouseEnter') as Subject<MouseEvent>).next(event);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.keyMask.downMask.indexOf(event.key) !== NO_MATCH && this.bindingKeyDown.has(event.key)) {
            (this.bindingKeyDown.get(event.key) as Subject<KeyboardEvent>).next(event);
            if (!this.noPreventDefault.has(event.key)) event.preventDefault();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.keyMask.upMask.indexOf(event.key) !== NO_MATCH && this.bindingKeyUp.has(event.key)) {
            (this.bindingKeyUp.get(event.key) as Subject<KeyboardEvent>).next(event);
        }
    }

    onWheelEvent(event: WheelEvent): void {
        this.subjectWheelEvent.next(event);
    }
}
