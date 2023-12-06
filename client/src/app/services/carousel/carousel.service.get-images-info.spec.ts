import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@app/modules/material.module';
import { FilterService } from '@app/services/filter/filter.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Image } from '@common/communication/image';
import { environment } from 'src/environments/environment';
import { CarouselService } from './carousel.service';

describe('CarouselService http tests and error handling with getImagesInfo', () => {
    let service: CarouselService;
    let httpMock: HttpTestingController;

    const FILTERS = ['tag1', 'tag2', 'tag3'];

    const TIMEOUT_TIME = 100;
    let snackbarService: jasmine.SpyObj<SnackBarService>;
    let filterService: FilterService;

    beforeEach(() => {
        filterService = new FilterService();
        snackbarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        TestBed.configureTestingModule({
            providers: [
                { provide: FilterService, useValue: filterService },
                { provide: SnackBarService, useValue: snackbarService },
            ],
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
    it('should get cards info', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeTruthy();
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not get cards info if there is a server disconnected error', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages, { status: 0, statusText: 'server error' });

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeFalsy();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith(
                    "Erreur de la requête de l'information des images. Le serveur est déconnecté.",
                );

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not get cards info if there is a database disconnected error', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages, { status: 404, statusText: 'database error' });

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeFalsy();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith(
                    "Erreur de la requête de l'information des images. La base de donnée est déconnectée.",
                );

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not get cards info if there is a server error', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages, { status: 500, statusText: 'server error' });

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeFalsy();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("Erreur de la requête de l'information des images. Erreur du serveur.");

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not get cards info if there is another error', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages, { status: 502, statusText: 'other error' });

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeFalsy();
                expect(snackbarService.openSnackBar).toHaveBeenCalledWith("Erreur de la requête de l'information des images. Erreur inconnue.");

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should filter out the first image because it dosent have any of the filtered tags', async () => {
        filterService.filters = FILTERS;
        const notExpectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: ['notAFilteredTag'] };
        const expectedFilteredImage = { title: 'test2', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedImages: Image[] = [notExpectedFilteredImage1, expectedFilteredImage];

        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeTruthy();
                expect(service.filteredCardsInfo).toEqual([expectedFilteredImage]);
                expect(service.filteredCardsInfo).not.toContain(notExpectedFilteredImage1);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not filter out images containing the same tags as the filtered tags', async () => {
        filterService.filters = FILTERS;
        const notExpectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: ['notAFilteredTag'] };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage3 = { title: 'test3', id: '603983cf66f6df6558b6f798', tags: [FILTERS[1], 'notAFilteredTag'] };
        const expectedFilteredImage4 = {
            title: 'test4',
            id: '603983cf66f6df6558b6f798',
            tags: [FILTERS[1], FILTERS[2], 'notAFilteredTag'],
        };
        const expectedImages: Image[] = [notExpectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4];

        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeTruthy();
                expect(service.filteredCardsInfo).toEqual([expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4]);
                expect(service.filteredCardsInfo).not.toContain(notExpectedFilteredImage1);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not show snackbar', async () => {
        const expectedImages: Image[] = [
            { title: 'test', id: '603983cf66f6df6558b6f797', tags: [] },
            { title: 'test2', id: '603983cf66f6df6558b6f798', tags: [] },
        ];
        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(false);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages, { status: 502, statusText: 'other error' });

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeFalsy();
                expect(snackbarService.openSnackBar).not.toHaveBeenCalledWith("Erreur de la requête de l'information des images. Erreur inconnue.");

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should not filter out images if there is no filtered tags', async () => {
        filterService.filters = [];
        const expectedFilteredImage1 = { title: 'test1', id: '603983cf66f6df6558b6f798', tags: ['notAFilteredTag'] };
        const expectedFilteredImage2 = { title: 'test2', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedFilteredImage3 = { title: 'test3', id: '603983cf66f6df6558b6f798', tags: [FILTERS[1], 'notAFilteredTag'] };
        const expectedFilteredImage4 = {
            title: 'test4',
            id: '603983cf66f6df6558b6f798',
            tags: [FILTERS[1], FILTERS[2], 'notAFilteredTag'],
        };
        const expectedImages: Image[] = [expectedFilteredImage1, expectedFilteredImage2, expectedFilteredImage3, expectedFilteredImage4];

        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeTruthy();
                expect(service.filteredCardsInfo).toEqual([
                    expectedFilteredImage1,
                    expectedFilteredImage2,
                    expectedFilteredImage3,
                    expectedFilteredImage4,
                ]);
                resolve(null);
            }, TIMEOUT_TIME);
        });
    });

    it('should reset ImagesInfo', async () => {
        filterService.filters = FILTERS;
        const expectedFilteredImage = { title: 'test2', id: '603983cf66f6df6558b6f798', tags: FILTERS };
        const expectedImages: Image[] = [expectedFilteredImage];

        let filteredCards = false;
        service.filteredCardsChangedListener().subscribe(() => {
            filteredCards = true;
        });

        service.getCardsInfo(true);

        const req = httpMock.expectOne(environment.SERVER_URL + '/get-images-info');
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBe(null);
        req.flush(expectedImages);

        await new Promise((resolve) => {
            setTimeout(() => {
                expect(filteredCards).toBeTruthy();
                expect(service.filteredCardsInfo).toEqual([expectedFilteredImage]);

                expect(service.filteredCardsInfo.length).toBe(1);
                expect(service.tags.size).toBe(FILTERS.length);
                service.resetImagesInfo();
                expect(service.filteredCardsInfo.length).toBe(0);
                expect(service.tags.size).toBe(0);

                resolve(null);
            }, TIMEOUT_TIME);
        });
    });
});
