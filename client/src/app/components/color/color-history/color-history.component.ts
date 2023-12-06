import { Component } from '@angular/core';
import { ColorHistoryService } from '@app/services/tools/color-history/color-history.service';

@Component({
    selector: 'app-color-history',
    templateUrl: './color-history.component.html',
    styleUrls: ['./color-history.component.scss'],
})
export class ColorHistoryComponent {
    constructor(public colorHistory: ColorHistoryService) {}
}
