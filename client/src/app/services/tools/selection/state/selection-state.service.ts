import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export const enum State {
    MOVE = 0,
    NW = 1,
    N = 2,
    NE = 3,
    W = 4,
    E = 5,
    SW = 6,
    S = 7,
    SE = 8,
    OFF = 9,
    IDLE = 10,
}

@Injectable({
    providedIn: 'root',
})
export class SelectionStateService {
    state: BehaviorSubject<State> = new BehaviorSubject<State>(State.OFF);

    stateObserver(): Observable<State> {
        return this.state.asObservable();
    }

    changeState(state: State): void {
        this.state.next(state);
    }
}
