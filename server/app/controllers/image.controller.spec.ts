import { Application } from '@app/app';
import { ImageService } from '@app/services/image.service';
import { TYPES } from '@app/types';
import { Image } from '@common/communication/image';
import { Container } from 'inversify';
import 'reflect-metadata';
import { SinonSandbox } from 'sinon';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_SERVER_ERROR = 500;

describe('ImageController', () => {
    let imageService: Stubbed<ImageService>;
    let app: Express.Application;
    let container: Container;
    let sandbox: SinonSandbox;

    beforeEach(async () => {
        [container, sandbox] = await testingContainer();
        container.rebind(TYPES.ImageService).toConstantValue({
            saveImage: sandbox.stub().resolves(true),
            removeImage: sandbox.stub().resolves(true),
            getImagesInfo: sandbox.stub().resolves(true),
            getImageData: sandbox.stub().returns('data'),
        });
        imageService = container.get(TYPES.ImageService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should add an image to the server and database', async () => {
        const image: Image = { title: 'Hello', tags: ['World'], data: '12345' };
        await supertest(app).post('/api/images/save-image').send(image).set('Accept', 'application/json').expect(HTTP_STATUS_OK);
    });

    it('should not add an image to the server and database', async () => {
        imageService.saveImage.rejects(true);

        const image: Image = { title: 'Hello', tags: ['World'], data: '12345' };
        await supertest(app).post('/api/images/save-image').send(image).expect(HTTP_STATUS_SERVER_ERROR);
    });

    it('should remove an image from the server and database', async () => {
        await supertest(app).post('/api/images/remove-image').send({ id: '1245' }).set('Accept', 'application/json').expect(HTTP_STATUS_OK);
    });

    it('should not remove an image from the server and database', async () => {
        imageService.removeImage.rejects(true);

        await supertest(app).post('/api/images/remove-image').send({ id: '1245' }).expect(HTTP_STATUS_SERVER_ERROR);
    });

    it('should get images info', async () => {
        await supertest(app).get('/api/images/get-images-info').send().expect(HTTP_STATUS_OK);
    });

    it('should send HTTP_STATUS_NOT_FOUND if images info is undefined', async () => {
        imageService.getImagesInfo.resolves(undefined);
        await supertest(app).get('/api/images/get-images-info').send().expect(HTTP_STATUS_NOT_FOUND);
    });

    it('should not get images info', async () => {
        imageService.getImagesInfo.rejects(true);

        await supertest(app).get('/api/images/get-images-info').send().expect(HTTP_STATUS_SERVER_ERROR);
    });

    it('should get Image Data', async () => {
        imageService.getImageData.returns(__dirname + '/image.controller.ts');

        const id = 'id';
        const title = 'title';

        await supertest(app).get(`/api/images/get-image-data/${id}/${title}`).send().expect(HTTP_STATUS_OK);
    });

    it('should not get Image Data', async () => {
        imageService.getImageData.returns(undefined);
        const id = 'id';
        const title = 'title';
        await supertest(app).get(`/api/images/get-image-data/${id}/${title}`).send().expect(HTTP_STATUS_NOT_FOUND);
    });
});
