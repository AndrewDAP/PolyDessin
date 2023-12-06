import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { Image } from '@common/communication/image';
import { MAX_NUMBER_TAGS, MAX_TAG_SIZE, MAX_TITLE_SIZE } from '@common/const';

@Component({
    selector: 'app-save-drawing',
    templateUrl: './save-drawing.component.html',
    styleUrls: ['./save-drawing.component.scss'],
})
export class SaveDrawingComponent {
    constructor(public toolsInfoService: ToolsInfoService) {}
    MAX_NUMBER_TAGS: number = MAX_NUMBER_TAGS;

    titleFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(MAX_TITLE_SIZE),
    ]);
    tagsFormControl: FormControl = new FormControl('', [Validators.pattern('[a-zA-Z0-9-_ ]*'), Validators.maxLength(MAX_TAG_SIZE)]);
    tags: string[] = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (this.tagsFormControl.hasError('pattern') || this.tagsFormControl.hasError('maxlength')) {
            return;
        }

        if ((value || '').trim()) {
            if (!this.tags.includes(value)) this.tags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    accept(): Image {
        return { title: this.titleFormControl.value, tags: this.tags };
    }
}
