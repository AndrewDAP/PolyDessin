import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/tools/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class ColorHistoryService {
    private readonly HISTORY_MAX: number = 10;
    private history: Color[] = [];

    constructor(private colorService: ColorService) {
        this.addToHistory(this.colorService.primaryColor.copy(), this.colorService.secondaryColor.copy());
    }

    addToHistory(...selectedColors: Color[]): void {
        for (let color of selectedColors) {
            color = color.copy();
            color.a = Color.MAX_ALPHA;

            for (const swatch of this.history) if (color.equals(swatch)) return;

            if (this.history.length >= this.HISTORY_MAX) this.history.shift();
            this.history.push(color);
        }
    }

    clearHistory(): void {
        this.history = [];
        this.addToHistory(this.colorService.primaryColor.copy(), this.colorService.secondaryColor.copy());
    }

    get getHistory(): Color[] {
        return this.history;
    }
}
