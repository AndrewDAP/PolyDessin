/* tslint:disable:no-unused-variable */

import { HttpClient, HttpHandler } from '@angular/common/http';
import { async, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CarouselToolComponent } from '@app/components/carousel/carousel-tool/carousel-tool.component';
import { MaterialModule } from '@app/modules/material.module';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocationService } from '@app/services/location/location.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { Subject } from 'rxjs';
import { CarouselToolService } from './carousel-tool.service';

describe('CarouselToolService', () => {
    let service: CarouselToolService;

    let filterService: FilterService;
    let keyEventService: KeyEventService;
    let carouselService: CarouselService;
    let httpService: HttpService;

    const keyboardEvent: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();

    const TIMEOUT_TIME = 100;

    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(async(() => {
        filterService = new FilterService();
        keyEventService = new KeyEventService();
        spyOn(keyEventService, 'getKeyDownEvent').and.returnValue(keyboardEvent.asObservable());

        const snackbarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

        httpService = new HttpService(new HttpClient({} as HttpHandler));

        carouselService = new CarouselService(
            httpService,
            snackbarService,
            {} as Router,
            filterService,
            {} as NewDrawingService,
            {} as LocationService,
            {} as MatDialog,
            {} as DrawingService,
        );
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);

        TestBed.configureTestingModule({
            declarations: [CarouselToolComponent],
            providers: [
                { provide: CarouselService, useValue: carouselService },
                { provide: FilterService, useValue: filterService },
                { provide: KeyEventService, useValue: keyEventService },
                { provide: DialogService, useValue: dialogService },
            ],
            imports: [MaterialModule],
        }).compileComponents();

        service = TestBed.inject(CarouselToolService);
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call openCarousel when CTRL+G is clicked', () => {
        const onLeft = spyOn(service, 'openCarousel');
        const event = new KeyboardEvent('keypress', {
            key: 'g',
            ctrlKey: true,
        });
        keyboardEvent.next(event);

        expect(onLeft).toHaveBeenCalled();
    });

    it('should not call openCarousel when G is clicked', () => {
        const onLeft = spyOn(service, 'openCarousel');
        const event = new KeyboardEvent('keypress', {
            key: 'g',
            ctrlKey: false,
        });
        keyboardEvent.next(event);

        expect(onLeft).not.toHaveBeenCalled();
    });

    it('should open the dialog', async () => {
        await service.openCarousel();
        expect(dialogService.openDialog).toHaveBeenCalled();
    });

    it('condition should return true if can open', async () => {
        spyOn(carouselService, 'canOpenDialog').and.returnValue(Promise.resolve(true));
        expect(await service.condition()).toBeTrue();
    });

    it('condition should return false if cant open', async () => {
        spyOn(carouselService, 'canOpenDialog').and.returnValue(Promise.resolve(false));
        expect(await service.condition()).toBeFalse();
    });

    it('should clear the filters after dialog is closed', async () => {
        spyOn(carouselService, 'canOpenDialog').and.returnValue(Promise.resolve(true));
        const clearFilters = spyOn(filterService, 'clearFilters');

        await service.openCarousel();
        expect(dialogService.openDialog).toHaveBeenCalled();

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(clearFilters).toHaveBeenCalled();

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should be call getCardsInfo when reseting carousel', () => {
        const getCardsInfo = spyOn(carouselService, 'getCardsInfo');

        service.resetCarousel();

        expect(getCardsInfo).toHaveBeenCalled();
    });
});
