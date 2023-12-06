import { Image } from '@common/communication/image';
import { fail } from 'assert';
import { expect } from 'chai';
import * as fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NativeError } from 'mongoose';
import * as sinon from 'sinon';
import { DatabaseService, IImage, IMAGE_MODEL } from './database.service';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let sandboxFs: any;
    let sandboxDb: any;

    beforeEach(async () => {
        sandboxFs = sinon.createSandbox();
        sandboxDb = sinon.createSandbox();

        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();

        databaseService = new DatabaseService();
        databaseService.databaseUrl = mongoUri;
        await databaseService.close();
        await databaseService.start();
    });

    afterEach(async () => {
        await databaseService.close();
        sandboxDb.restore();
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        expect(databaseService.databaseOpened).to.be.true;
        await databaseService.close();
        expect(databaseService.databaseOpened).to.be.false;

        try {
            await databaseService.start('NOT THE DATABASE URL');
            fail();
        } catch {
            expect(databaseService.databaseOpened).to.be.false;
        }
    });

    it('should insert a new image', async () => {
        const image: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4', '5'], data: '' };
        await databaseService.close();
        await databaseService.addImage(image);

        await IMAGE_MODEL.findOne((err: NativeError, result: IImage) => {
            expect(result.title).to.equal(image.title);
            for (var i = 0; i < image.tags.length; i++) {
                expect(result.tags[i]).to.equal(image.tags[i]);
            }
        });
    });

    it('should have an error if not connected to database', async () => {
        const image: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4', '5'], data: '', id: '12345' };
        await databaseService.close();
        sandboxDb.stub(databaseService, 'start').rejects(Error('database connection error'));
        databaseService
            .addImage(image)
            .then(() => fail())
            .catch(() => {});

        databaseService
            .removeImage(image.id as string)
            .then(() => fail())
            .catch(() => {});

        databaseService
            .getImage(image.id as string)
            .then(() => fail())
            .catch(() => {});

        databaseService
            .getImagesInfo()
            .then(() => fail())
            .catch(() => {});
    });

    it('should delete the right image', async () => {
        const image: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4', '5'], data: '' };
        const id = await databaseService.addImage(image);

        const imageToKeep: Image = { title: 'Les si naiment pas les rais', tags: ['1', '2', '3', '4', '5'], data: '' };
        await databaseService.addImage(imageToKeep);

        await databaseService.removeImage(id);

        await IMAGE_MODEL.findOne({ title: image.title }, (err: NativeError, result: IImage) => {
            expect(result).to.be.null;
        });
    });

    it('should get the right image', async () => {
        const image: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4', '5'], data: '' };
        const id = await databaseService.addImage(image);

        const image2: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4'], data: '' };
        await databaseService.addImage(image2);

        const imageGotten = await databaseService.getImage(id);

        expect(imageGotten?.title).not.to.be.undefined;
        expect(image.title).to.equal(imageGotten?.title);
        for (let i = 0; i < image.tags.length; i++) {
            expect(imageGotten?.tags[i]).not.to.be.undefined;
            expect(image.tags[i]).to.equal(imageGotten?.tags[i]);
        }
    });

    it('should get undefined if image dosent exist', async () => {
        const image: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4', '5'], data: '' };
        const id = await databaseService.addImage(image);

        const image2: Image = { title: 'Si jaurais', tags: ['1', '2', '3', '4'], data: '' };
        await databaseService.addImage(image2);

        await databaseService.removeImage(id);

        const imageGotten = await databaseService.getImage(id);

        expect(imageGotten).to.be.undefined;
    });

    it('should get all the images, even if title and tags are the same', async () => {
        sandboxFs.stub(fs, 'existsSync').returns(true);

        for (var i = 0; i < 5; i++) {
            var image = new IMAGE_MODEL({ title: 'image' + i, tags: 'tag' + i });
            await image.save();
        }
        for (var i = 0; i < 5; i++) {
            var image = new IMAGE_MODEL({ title: 'image' + i, tags: 'tag' + i });
            await image.save();
        }

        const imagesGotten = await databaseService.getImagesInfo();

        expect(imagesGotten).to.not.be.null;
        if (imagesGotten) {
            expect(imagesGotten.length).to.equal(10);
        }

        sandboxFs.restore();
    });
});
