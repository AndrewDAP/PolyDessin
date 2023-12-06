import { Injectable } from '@angular/core';

export type ArrowDirection = 'left' | 'right' | 'down' | 'up';
export const TIME_INITIAL = 500;

@Injectable({
    providedIn: 'any',
})
export class SelectionMoveService {
    keysPressed: Record<ArrowDirection, boolean> = {
        up: false,
        down: false,
        left: false,
        right: false,
    };
    interval: ReturnType<typeof setInterval> | number = 0;
    timeout: ReturnType<typeof setTimeout> | number = 0;

    verifyIfKeyHeld(): number {
        return (Object.keys(this.keysPressed) as ArrowDirection[]).filter((value: ArrowDirection) => this.keysPressed[value]).length;
    }

    resetKeys(): void {
        (Object.keys(this.keysPressed) as ArrowDirection[]).forEach((value: ArrowDirection) => {
            this.keysPressed[value] = false;
        });
        clearInterval(this.interval as ReturnType<typeof setInterval>);
        clearTimeout(this.timeout as ReturnType<typeof setTimeout>);
    }

    onArrowUp(key: ArrowDirection): void {
        this.keysPressed[key] = false;
        if (this.verifyIfKeyHeld() === 0) {
            clearInterval(this.interval as ReturnType<typeof setInterval>);
            clearTimeout(this.timeout as ReturnType<typeof setTimeout>);
        }
    }
}
