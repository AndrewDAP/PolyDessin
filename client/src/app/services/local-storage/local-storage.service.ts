import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

const KEY = 'polydessin2';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    newDrawing: boolean = false;

    constructor(private drawingService: DrawingService) {}

    setDrawing(): void {
        localStorage.setItem(KEY, this.drawingService.canvas.toDataURL());
    }

    getDrawing(): string | null {
        return localStorage.getItem(KEY);
    }

    hasDrawing(): boolean {
        return this.getDrawing() === null;
    }
}
