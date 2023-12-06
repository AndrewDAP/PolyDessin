import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-show-url',
    templateUrl: './show-url.component.html',
    styleUrls: ['./show-url.component.scss'],
})
export class ShowUrlComponent {
    @Input() url: string;
}
