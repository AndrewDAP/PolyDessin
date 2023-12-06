import { Component } from '@angular/core';
import { ResizeService } from '@app/services/resize/resize.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
    constructor(private resizeService: ResizeService) {}

    onScroll(event: Event): void {
        const element = event.currentTarget as Element;
        this.resizeService.setOffsets(element.scrollLeft, element.scrollTop);
    }
}
