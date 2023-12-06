/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { FilterService } from './filter.service';

describe('Service: Filter', () => {
    let service: FilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add filter', () => {
        const eventValue = 'a filter';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);
    });

    it('should not add filter it is empty', () => {
        const eventValue = '';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(0);
    });

    it('should not reset input it is empty', () => {
        const eventValue = 'a filter';
        const event = { value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);
    });

    it('should send notification when adding a filter', () => {
        const eventValue = 'a filter';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        let filterChanged = false;
        service.filterChangedListener().subscribe(() => {
            filterChanged = true;
        });
        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);

        expect(filterChanged).toBeTruthy();
    });

    it('should not add filter if it exists', () => {
        const eventValue = 'a filter';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);

        service.addFilter(event);

        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);

        service.addFilter(event);

        expect(service.filters.length).toBe(1);
    });

    it('should not add an invalid tag (invalid pattern) in input in tags', () => {
        const invalidTag = 'invalid!-tag';
        const event = { input: { value: invalidTag } as HTMLInputElement, value: invalidTag } as MatChipInputEvent;

        service.tagsFormControl.setValue(invalidTag);

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(0);
    });

    it('should not add an invalid tag (too long) in input in tags', () => {
        const invalidTag = 'invalidtaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag';
        const event = { input: { value: invalidTag } as HTMLInputElement, value: invalidTag } as MatChipInputEvent;

        service.tagsFormControl.setValue(invalidTag);

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(0);
    });

    it('should clear all filters', () => {
        const eventValue = 'a filter';
        const eventValue2 = 'a filter2';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;
        const event2 = { input: { value: eventValue2 } as HTMLInputElement, value: eventValue2 } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        service.addFilter(event2);
        expect(service.filters.length).toBe(2);
        expect(service.filters[0]).toEqual(eventValue);
        expect(service.filters[1]).toEqual(eventValue2);

        service.clearFilters();

        expect(service.filters.length).toBe(0);
    });

    it('should remove an existing filter', () => {
        const eventValue = 'a filter';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);

        service.removeFilter(eventValue);

        expect(service.filters.length).toBe(0);
    });

    it('should not remove a non existing filter', () => {
        const eventValue = 'a filter';
        const eventValueNotExisting = 'lol';
        const event = { input: { value: eventValue } as HTMLInputElement, value: eventValue } as MatChipInputEvent;

        expect(service.filters.length).toBe(0);
        service.addFilter(event);
        expect(service.filters.length).toBe(1);
        expect(service.filters[0]).toEqual(eventValue);

        service.removeFilter(eventValueNotExisting);

        expect(service.filters.length).toBe(1);
    });
});
