import { Component } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/tools/color/color.service';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.scss'],
})
export class ColorComponent {
    constructor(public colorService: ColorService) {
        this.colorService.colorChangedListener().subscribe(() =>
            setTimeout(() => {
                this.primaryColor = this.colorService.primaryColor;
                this.secondaryColor = this.colorService.secondaryColor;
            }),
        );

        this.primaryColor = this.colorService.primaryColor;
        this.secondaryColor = this.colorService.secondaryColor;
    }

    primaryColor: Color;
    secondaryColor: Color;
}
