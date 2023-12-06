import { Component, HostListener } from '@angular/core';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { TextService } from '@app/services/text/text.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private keyEventService: KeyEventService, private textService: TextService) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.keyEventService.currentTool === ToolType.text && this.textService.writing) {
            this.textService.onKeyDown(event);
        } else {
            this.keyEventService.onKeyDown(event);
        }
    }
}
