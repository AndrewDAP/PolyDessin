import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IMAGE_TEST_PATH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Image } from '@common/communication/image';
import { environment } from 'src/environments/environment';
import { CarouselService } from './carousel.service';

describe('CarouselService http tests and error handling with getImageData', () => {
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

    it('should request and get image if it exists', async () => {
        const requestImage = spyOn(service, 'requestImage').and.callThrough();
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };
        const blob = new Blob([IMAGE_TEST_PATH], { type: 'image/png' });

        expect(service.imagesById.size).toBe(0);
        service.getImage(image.id as string, image.title);

        const req = httpMock.expectOne(environment.SERVER_URL + `/get-image-data/${image.id}/${image.title}`);
        expect(req.request.method).toBe('GET');
        req.flush(blob);

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(1);

                expect(requestImage).toHaveBeenCalled();
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should request and get image if it exists and should return an image when asked for the image again', async () => {
        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };
        const blobValue = 'data:image/png;base64,QGFwcC8uLi9hc3NldHMvaW1hZ2Utbm90LWZvdW5kL2ltYWdlLW5vdC1mb3VuZC5zdmc=';
        const blob = new Blob([IMAGE_TEST_PATH], { type: 'image/png' });

        expect(service.imagesById.size).toBe(0);

        service.getImage(image.id as string, image.title);

        const req = httpMock.expectOne(environment.SERVER_URL + `/get-image-data/${image.id}/${image.title}`);
        expect(req.request.method).toBe('GET');
        req.flush(blob);

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(1);
                const returnedImage = await service.getImage(image.id as string, image.title);
                expect(returnedImage).toBe(blobValue);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should request and get undefined if id is not valid', async () => {
        const image: Image = { title: 'test', id: undefined, tags: [] };

        const returnValue = await service.getImage(image.id, image.title);

        httpMock.expectNone(environment.SERVER_URL + `/get-image-data/${image.id}/${image.title}`);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(returnValue).toBeUndefined();
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should resetImagesInfo and show database error on getImage', async () => {
        const requestImage = spyOn(service, 'requestImage').and.callThrough();

        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };
        const blob = new Blob([IMAGE_TEST_PATH], { type: 'image/png' });

        expect(service.imagesById.size).toBe(0);
        service.getImage(image.id as string, image.title);

        const req = httpMock.expectOne(environment.SERVER_URL + `/get-image-data/${image.id}/${image.title}`);
        expect(req.request.method).toBe('GET');
        req.flush(blob, { status: 404, statusText: 'database error' });

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(0);
                expect(requestImage).toHaveBeenCalled();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("L'image n'a pas été trouvée, car elle n'existe pas sur le serveur.");
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should resetImagesInfo and show server error on getImage', async () => {
        const requestImage = spyOn(service, 'requestImage').and.callThrough();

        const image: Image = { title: 'test', id: '605399a1b5732e388423aecf', tags: [] };
        const blob = new Blob([IMAGE_TEST_PATH], { type: 'image/png' });

        expect(service.imagesById.size).toBe(0);
        service.getImage(image.id as string, image.title);

        const req = httpMock.expectOne(environment.SERVER_URL + `/get-image-data/${image.id}/${image.title}`);
        expect(req.request.method).toBe('GET');
        req.flush(blob, { status: 0, statusText: 'server error' });

        await new Promise((resolve) => {
            setTimeout(async () => {
                expect(service.imagesById.size).toBe(0);
                expect(requestImage).toHaveBeenCalled();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("L'image n'a pas été trouvée, car le serveur est déconnecté.");
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });
});
