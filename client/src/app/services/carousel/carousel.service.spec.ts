import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IMAGE_TEST_PATH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { LocationService } from '@app/services/location/location.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { Subject } from 'rxjs';
import { CarouselService } from './carousel.service';

describe('CarouselService', () => {
    let service: CarouselService;

    const FILTERS = ['tag1', 'tag2', 'tag3'];
    const filtersChangedMock: Subject<void> = new Subject<void>();

    let routerSpy: jasmine.SpyObj<Router>;
    let drawingService: jasmine.SpyObj<DrawingService>;
    let snackbarService: jasmine.SpyObj<SnackBarService>;
    let newDrawingServiceSpy: jasmine.SpyObj<NewDrawingService>;
    let filterService: FilterService;

    beforeEach(() => {
        filterService = new FilterService();
        spyOn(filterService, 'filterChangedListener').and.returnValue(filtersChangedMock.asObservable());

        snackbarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

        drawingService = jasmine.createSpyObj('DrawingService', { isCanvasBlank: false });

        newDrawingServiceSpy = jasmine.createSpyObj('NewDrawingService', { loadDrawing: null });

        const locationServiceSpy = jasmine.createSpyObj('LocationService', [''], ['openEditorFromMainpage']);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: FilterService, useValue: filterService },
                { provide: NewDrawingService, useValue: newDrawingServiceSpy },
                { provide: DrawingService, useValue: drawingService },
                { provide: LocationService, useValue: locationServiceSpy },
                { provide: SnackBarService, useValue: snackbarService },
                { provide: Router, useValue: routerSpy },
            ],
            imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
        });

        service = TestBed.inject(CarouselService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call updateFilteredCardsInfo if filterChanged has sent an event', () => {
        const updateFilteredCardsInfo = spyOn(service, 'updateFilteredCardsInfo');

        filtersChangedMock.next();

        expect(updateFilteredCardsInfo).toHaveBeenCalled();
    });

    it('should give the next card info if there is more that 3 cards', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f799', tags: FILTERS };
        const expectedFilteredImage3 = {
            title: 'test3',
            id: '603983cf66f6df6558b6f999',
            tags: FILTERS,
        };
        const expectedFilteredImage4 = { title: 'test4', id: '603983cf66f6df6558b69999', tags: FILTERS };
        const filteredImages = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4];
        service.filteredCardsInfo = filteredImages;

        expect(service.filteredCardsInfo).toEqual(filteredImages);

        expect(service.nextCardInfo).toEqual(expectedFilteredImage4);

        expect(service.filteredCardsInfo[0]).toEqual(expectedFilteredImage2);
        expect(service.filteredCardsInfo[1]).toEqual(expectedFilteredImage3);
        expect(service.filteredCardsInfo[2]).toEqual(expectedFilteredImage4);
        // tslint:disable-next-line: no-magic-numbers
        expect(service.filteredCardsInfo[3]).toEqual(expectedFilteredImage1);
    });

    it('should not give the next card info if there is less that 3 cards', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f799', tags: FILTERS };
        const expectedFilteredImage3 = {
            title: 'test3',
            id: '603983cf66f6df6558b6f999',
            tags: FILTERS,
        };

        const filteredImages = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3];

        const ERROR_IMAGE = { title: 'error', tags: [''] };
        service.filteredCardsInfo = filteredImages;

        expect(service.filteredCardsInfo).toEqual(filteredImages);

        expect(service.nextCardInfo).toEqual(ERROR_IMAGE);
    });

    it('should give the previous card info if there is more that 3 cards', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f799', tags: FILTERS };
        const expectedFilteredImage3 = {
            title: 'test3',
            id: '603983cf66f6df6558b6f999',
            tags: FILTERS,
        };
        const expectedFilteredImage4 = { title: 'test4', id: '603983cf66f6df6558b69999', tags: FILTERS };
        const filteredImages = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4];
        service.filteredCardsInfo = filteredImages;

        expect(service.filteredCardsInfo).toEqual(filteredImages);

        expect(service.previousCardInfo).toEqual(expectedFilteredImage4);

        expect(service.filteredCardsInfo[0]).toEqual(expectedFilteredImage4);
        expect(service.filteredCardsInfo[1]).toEqual(expectedFilteredImage1);
        expect(service.filteredCardsInfo[2]).toEqual(expectedFilteredImage2);
        // tslint:disable-next-line: no-magic-numbers
        expect(service.filteredCardsInfo[3]).toEqual(expectedFilteredImage3);
    });

    it('should not give the previous card info if there is less that 3 cards', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f799', tags: FILTERS };
        const expectedFilteredImage3 = {
            title: 'test3',
            id: '603983cf66f6df6558b6f999',
            tags: FILTERS,
        };

        const filteredImages = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3];

        const ERROR_IMAGE = { title: 'error', tags: [''] };
        service.filteredCardsInfo = filteredImages;

        expect(service.filteredCardsInfo).toEqual(filteredImages);

        expect(service.previousCardInfo).toEqual(ERROR_IMAGE);
    });

    it('should not load image if url is undefined', () => {
        const snackBarError = 'Le dessin ne peut pas être chargé, veuillez en choisir un autre.';
        service.load(undefined);

        expect(snackbarService.openSnackBar).toHaveBeenCalledWith(snackBarError);
    });

    it('should load image from mainpage if router.url is /home', () => {
        const loadFromMainPage = spyOn(service, 'loadFromMainPage');
        // @ts-ignore: for testing purposes
        routerSpy.url = '/home';
        service.load(IMAGE_TEST_PATH);
        expect(loadFromMainPage).toHaveBeenCalled();
    });

    it('should load image from editor if router.url is /editor', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const loadFromEditor = spyOn(service, 'loadFromEditor').and.returnValue(true);
        // @ts-ignore: for testing purposes
        routerSpy.url = '/editor';
        service.load(IMAGE_TEST_PATH);
        expect(loadFromEditor).toHaveBeenCalled();
    });

    it('load from main page should call navigate to editor', () => {
        service.loadFromMainPage();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/editor']);
    });

    it('load from editor should check if canvas is blank', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        service.loadFromEditor();
        expect(drawingService.isCanvasBlank).toHaveBeenCalledTimes(1);
    });

    it('load from editor should check if canvas is not blank and confirm that the user wants the changed', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        service.loadFromEditor();

        expect(drawingService.isCanvasBlank).toHaveBeenCalledTimes(1);
        expect(window.confirm).toHaveBeenCalledWith('Voulez-vous abandonner les changements du dessin en cours?');
    });

    it('should open dialog if filteredCardsInfo.length is not 0', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f799', tags: FILTERS };
        const expectedFilteredImage3 = {
            title: 'test3',
            id: '603983cf66f6df6558b6f999',
            tags: FILTERS,
        };
        const expectedFilteredImage4 = { title: 'test4', id: '603983cf66f6df6558b69999', tags: FILTERS };
        const filteredImages = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4];
        service.filteredCardsInfo = filteredImages;

        spyOn(service, 'getCardsInfo').and.returnValue(Promise.resolve());

        expect(await service.canOpenDialog()).toBeTruthy();
    });

    it('should open dialog if filteredCardsInfo.length is not 0', async () => {
        service.filteredCardsInfo = [];

        spyOn(service, 'getCardsInfo').and.returnValue(Promise.resolve());

        expect(await service.canOpenDialog()).toBeFalsy();
    });
});
