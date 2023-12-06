import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { NO_MATCH } from '@app/const';
import { MAX_TAG_SIZE } from '@common/const';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    tagsFormControl: FormControl = new FormControl('', [Validators.pattern('[a-zA-Z0-9-_ ]*'), Validators.maxLength(MAX_TAG_SIZE)]);
    filters: string[] = [];

    private filterChanged: Subject<void> = new Subject<void>();

    filterChangedListener(): Observable<void> {
        return this.filterChanged.asObservable();
    }

    clearFilters(): void {
        this.filters = [];
        this.filterChanged.next();
    }

    addFilter(event: MatChipInputEvent): void {
        if (this.tagsFormControl.hasError('pattern') || this.tagsFormControl.hasError('maxlength')) {
            return;
        }

        const input = event.input;
        const value = event.value;

        if (this.filters.indexOf(value) === NO_MATCH) {
            if ((value || '').trim()) {
                this.filters.push(value.trim());
                this.filterChanged.next();
            }
        }

        if (input) {
            input.value = '';
        }

        this.tagsFormControl.setValue(null);
    }

    removeFilter(tag: string): void {
        const index = this.filters.indexOf(tag);

        if (index !== NO_MATCH) {
            this.filters.splice(index, 1);
            this.filterChanged.next();
        }
    }
}
