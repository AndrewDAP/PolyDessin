import { Component, Input } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/tools/color/color.service';

@Component({
    selector: 'app-color-swatch',
    templateUrl: './color-swatch.component.html',
    styleUrls: ['./color-swatch.component.scss'],
})
export class ColorSwatchComponent {
    @Input() swatchColor: Color;

    constructor(private colorService: ColorService) {}

    onLeftClick(): void {
        this.colorService.primaryColor = this.swatchColor.copy();
    }

    onRightClick(event: MouseEvent): void {
        event.preventDefault();
        this.colorService.secondaryColor = this.swatchColor.copy();
    }
}
