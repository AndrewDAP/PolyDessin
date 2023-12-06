import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CarouselKeyEventMask } from '@app/classes/key-event-masks/carousel-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { AppComponent } from '@app/components/app/app.component';
import { MaterialModule } from '@app/modules/material.module';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { of } from 'rxjs';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
    let service: DialogService;

    let keyEventService: KeyEventService;

    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        keyEventService = new KeyEventService();

        matDialogSpy = jasmine.createSpyObj('MatDialog', {
            open: {
                afterOpened: () => of(true),
                afterClosed: () => of(true),
            },
            closeAll: jasmine.createSpy(),
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
            imports: [MaterialModule],
        });
        service = TestBed.inject(DialogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('canOpen should return true if no dialog is open', () => {
        service.dialogIsOpen = false;
        expect(service.canOpen(new DefaultKeyEventMask())).toBeTruthy();
    });

    it('canOpen should return false if a dialog is open', () => {
        service.dialogIsOpen = true;
        expect(service.canOpen(new DefaultKeyEventMask())).toBeFalsy();
    });

    it('exit should unblock key event', () => {
        keyEventService.keyMask = new CarouselKeyEventMask();

        expect(keyEventService.keyMask).toBeInstanceOf(CarouselKeyEventMask);
        service.exit();
        expect(keyEventService.keyMask).toBeInstanceOf(DefaultKeyEventMask);
    });

    it('should openDialog and return undefined if the condition is false', async (done: DoneFn) => {
        const exit = spyOn(service, 'exit');
        await service
            .openDialog<AppComponent, boolean>(AppComponent, new DefaultKeyEventMask(), async () => Promise.resolve(false))
            .then((res) => {
                expect(res).toBeUndefined();
                expect(exit).toHaveBeenCalled();
                done();
            })
            .catch(() => fail());
    });

    it('should openDialog and have a return value other than undefined if the condition is true', async (done: DoneFn) => {
        const exit = spyOn(service, 'exit');
        service
            .openDialog<AppComponent, boolean>(AppComponent)
            .then((res) => {
                expect(res).toBeTrue();
                expect(exit).toHaveBeenCalled();
                done();
            })
            .catch(() => fail());

        matDialogSpy.closeAll();
    });

    it('should not openDialog and if cant open dialog', async (done: DoneFn) => {
        const exit = spyOn(service, 'exit');
        spyOn(service, 'canOpen').and.returnValue(false);
        service
            .openDialog<AppComponent, boolean>(AppComponent)
            .then((res) => {
                expect(res).toBeUndefined();
                expect(exit).not.toHaveBeenCalled();
                done();
            })
            .catch(() => fail());

        matDialogSpy.closeAll();
    });
});
