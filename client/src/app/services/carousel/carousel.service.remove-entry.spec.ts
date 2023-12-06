import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@app/modules/material.module';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Image } from '@common/communication/image';
import { environment } from 'src/environments/environment';
import { CarouselService } from './carousel.service';

describe('CarouselService http tests and error handling with removeEntry', () => {
    let service: CarouselService;
    let httpMock: HttpTestingController;

    const TIMEOUT_TIME = 100;
    let snackbarService: jasmine.SpyObj<SnackBarService>;

    beforeEach(() => {
        snackbarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        TestBed.configureTestingModule({
            providers: [{ provide: SnackBarService, useValue: snackbarService }],
            imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
        });

        service = TestBed.inject(CarouselService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should remove entry with a valid image', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };

        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        service.removeEntry(image);

        const req = httpMock.expectOne(environment.SERVER_URL + '/remove-image');
        expect(req.request.method).toBe('POST');

        req.flush(image.id as string);

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(0);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not remove entry if id is undefined', async () => {
        const image: Image = { title: 'test', id: undefined, tags: [] };

        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        service.removeEntry(image);

        httpMock.expectNone(environment.SERVER_URL + '/remove-image');
    });

    it('should remove entry from cards info with a valid image', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };
        service.cardsInfo = [image];
        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        expect(service.cardsInfo.length).toBe(1);
        service.removeEntry(image);

        const req = httpMock.expectOne(environment.SERVER_URL + '/remove-image');
        expect(req.request.method).toBe('POST');

        req.flush(image.id as string);

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(0);
                expect(service.cardsInfo.length).toBe(0);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not remove entry when there is an error on the server', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };

        service.cardsInfo = [image];
        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        expect(service.cardsInfo.length).toBe(1);
        service.removeEntry(image);

        const req = httpMock.expectOne(environment.SERVER_URL + '/remove-image');
        expect(req.request.method).toBe('POST');

        req.flush({ foo: 'bar' }, { status: 0, statusText: 'server error' });

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(1);
                expect(service.cardsInfo.length).toBe(1);
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("L'image n'a pas pu être supprimée, car le serveur est déconnecté.");
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not remove entry when there is an error on the database', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };

        service.cardsInfo = [image];
        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        expect(service.cardsInfo.length).toBe(1);
        service.removeEntry(image);

        const req = httpMock.expectOne(environment.SERVER_URL + '/remove-image');
        expect(req.request.method).toBe('POST');

        req.flush({ foo: 'bar' }, { status: 500, statusText: 'server error' });

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(1);
                expect(service.cardsInfo.length).toBe(1);
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("L'image n'a pas pu être supprimée, car la base de donnée est déconnecté.");
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not remove entry when there is an error', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };

        service.cardsInfo = [image];
        service.imagesById = new Map([[image.id as string, 'data_url']]);

        expect(service.imagesById.size).toBe(1);
        expect(service.cardsInfo.length).toBe(1);
        service.removeEntry(image);

        const req = httpMock.expectOne(environment.SERVER_URL + '/remove-image');
        expect(req.request.method).toBe('POST');

        req.flush({ foo: 'bar' }, { status: 111, statusText: 'random error' });

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(1);
                expect(service.cardsInfo.length).toBe(1);
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("L'image n'a pas pu être supprimée, pour une raison inconnue.");

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });
});
