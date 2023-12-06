import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/modules/material.module';
import { DialogService } from '@app/services/dialog/dialog.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ExportDrawingService } from './export-drawing.service';

describe('ExportDrawingService', () => {
    let service: ExportDrawingService;
    let dialogServiceSpy: jasmine.SpyObj<DialogService>;
    // tslint:disable-next-line: no-any

    let keyEventService: KeyEventService;

    beforeEach(() => {
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
        keyEventService = new KeyEventService();

        TestBed.configureTestingModule({
            providers: [
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [MaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        });
        service = TestBed.inject(ExportDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ctrl+e should call openDialog', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'e', ctrlKey: true });

        keyEventService.onKeyDown(keyEvent);
        expect(dialogServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });
    it('e should not call openDialog', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'e', ctrlKey: false });

        keyEventService.onKeyDown(keyEvent);
        expect(dialogServiceSpy.openDialog).toHaveBeenCalledTimes(0);
    });
});
