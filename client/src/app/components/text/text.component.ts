import { Component } from '@angular/core';
import { TextService } from '@app/services/text/text.service';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss'],
})
export class TextComponent {
    polices: string[] = ['serif', 'monospace', 'Arial', 'fantasy', 'Times New Roman'];
    // tslint:disable:no-magic-numbers
    sizes: number[] = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 30, 36, 42, 48];
    textAlign: string = 'left';

    constructor(public textService: TextService) {}

    bold(): void {
        this.textService.bold = !this.textService.bold;
        this.textService.drawPreview();
    }

    italic(): void {
        this.textService.italic = !this.textService.italic;
        this.textService.drawPreview();
    }

    changeAlignment(): void {
        this.textService.textAlign = this.textAlign;

        if (this.textService.writing) {
            this.textService.drawPreview();
        }
    }
}
