import { TYPES } from '@app/types';
import { fail } from 'assert';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { DatabaseService } from './database.service';
import { ImageService, IMAGE_FILE_PATH } from './image.service';

describe('Image service', () => {
    let imageService: ImageService;
    let databaseService: Stubbed<DatabaseService>;
    let sandboxFs: any;

    beforeEach(async () => {
        sandboxFs = sinon.createSandbox();

        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            databaseOpened: sandbox.stub(),
            addImage: sandbox.stub().resolves(undefined),
            removeImage: sandbox.stub().resolves('yooo'),
            getImage: sandbox.stub().resolves({ title: 'yooo', tags: [] }),
            getImagesInfo: sandbox.stub().resolves([
                { title: 'yooo1', tags: [] },
                { title: 'yooo2', tags: [] },
            ]),
            start: sandbox.stub().callsFake(() => {
                databaseService.databaseOpened.value(true);
            }),
            close: sandbox.stub(),
        });

        databaseService = container.get(TYPES.DatabaseService);
        imageService = container.get<ImageService>(TYPES.ImageService);
    });

    afterEach(async () => {
        sandboxFs.restore();
        databaseService.close();
    });

    it('should write image file when saving an image', async () => {
        const writeFileStub: any = sandboxFs.stub(fs, 'writeFile').yields(false);

        const id = await imageService.saveImage({ title: 'yooo', tags: ['y', 'o', 'o', 'o'], data: '12345' });
        expect(writeFileStub.firstCall.args[0]).to.be.equal('images/yooo' + '-' + id + '.png');
        expect(writeFileStub.calledOnce).to.be.true;
    });

    it('should remove entry from database if there is a write file error when saving image', async () => {
        const writeFileStub: any = sandboxFs.stub(fs, 'writeFile').yields(true);

        const id = await imageService.saveImage({ title: 'yooo', tags: ['y', 'o', 'o', 'o'], data: '12345' });
        expect(writeFileStub.firstCall.args[0]).to.be.equal('images/yooo' + '-' + id + '.png');
        expect(databaseService.removeImage.calledOnce).to.be.true;
    });

    it('should not write image file when there is a database error when saving an image', async () => {
        const writeFileStub: any = sandboxFs.stub(fs, 'writeFile');
        databaseService.addImage.rejects();

        imageService
            .saveImage({ title: 'yooo', tags: ['y', 'o', 'o', 'o'], data: '12345' })
            .then(() => {
                fail();
            })
            .catch(() => {
                expect(writeFileStub.calledOnce).to.be.false;
            });
    });

    it('should not add an image if the title is empty', async () => {
        imageService
            .saveImage({ title: '', tags: ['y', 'o', 'o', 'o'], data: '12345' })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('title length error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if the title is too long', async () => {
        imageService
            .saveImage({
                title: 'cetitreesttellementlongetimpertinenttoutcommeplusieursdecestests',
                tags: ['y', 'o', 'o', 'o'],
                data: '12345',
            })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('title length error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if the title is in the wrong format', async () => {
        imageService
            .saveImage({ title: '!!!!!', tags: ['y', 'o', 'o', 'o'], data: '12345' })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('title format error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if there are too many tags', async () => {
        imageService
            .saveImage({
                title: '1',
                tags: ['y', 'o', 'o', 'o', 'y', 'o', 'o', 'o', 'y', 'o', 'o', 'o', 'y', 'o', 'o', 'o'],
                data: '12345',
            })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('too many tags');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if the tags is in the wrong format', async () => {
        imageService
            .saveImage({ title: 'dumdum', tags: ['y!', 'o!', 'o!', 'o!'], data: '12345' })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('tag format error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if a tag is empty', async () => {
        imageService
            .saveImage({ title: '1', tags: ['', 'o', 'o', 'o'], data: '12345' })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('tag length error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should not add an image if a tag is too long', async () => {
        imageService
            .saveImage({
                title: '1',
                tags: ['cetagesttellementlongquilnerentrepasdansladatabasede500mgb', 'o', 'o', 'o'],
                data: '12345',
            })
            .then(() => fail())
            .catch((error) => {
                expect((error as Error).message).to.contain('tag length error');
                expect(databaseService.addImage.calledOnce).to.be.false;
            });
    });

    it('should delete image from server and database when removing an image', async () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(true);
        const unlinkSyncStub: any = sandboxFs.stub(fs, 'unlinkSync');
        const title = 'yooo';
        const id = '12345';

        await imageService.removeImage(id, title);

        expect(existsSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(existsSyncStub.calledOnce).to.be.true;
        expect(unlinkSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(unlinkSyncStub.calledOnce).to.be.true;
    });

    it('should log an error if image to remove does not exist in server', async () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(false);
        const unlinkSyncStub: any = sandboxFs.stub(fs, 'unlinkSync');
        const title = 'yooo';
        const id = '12345';

        await imageService.removeImage(id, title);

        expect(existsSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(existsSyncStub.calledOnce).to.be.true;
        expect(unlinkSyncStub.called).to.be.false;
    });

    it('should log an error if image to remove does not exist in the database', async () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(false);
        const unlinkSyncStub: any = sandboxFs.stub(fs, 'unlinkSync');
        const title = 'yooo';
        const id = '12345';

        await imageService.removeImage(id, title);

        expect(existsSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(existsSyncStub.calledOnce).to.be.true;
        expect(unlinkSyncStub.called).to.be.false;
    });

    it('should still delete image if it does not exist in the database', async () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(false);

        const title = 'yooo';
        const id = '12345';
        await imageService.removeImage(id, title);

        expect(databaseService.removeImage.calledOnce).to.be.true;
        expect(existsSyncStub.calledOnce).to.be.true;
    });

    it('should throw error if there is a database error while removing entry', async () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(false);
        databaseService.removeImage.rejects();

        const title = 'yooo';
        const id = '12345';
        imageService
            .removeImage(id, title)
            .then(() => fail())
            .catch(() => {
                expect(databaseService.removeImage.calledOnce).to.be.true;
                expect(existsSyncStub.called).to.be.false;
            });
    });

    it('should get image data of an existing file', () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(true);
        const title = 'yooo';
        const id = '12345';

        const filepath = imageService.getImageData(id, title);

        expect(filepath).to.be.equal(IMAGE_FILE_PATH(id, title));

        expect(existsSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(existsSyncStub.calledOnce).to.be.true;
    });

    it('should get undefined when image does not exist', () => {
        const existsSyncStub: any = sandboxFs.stub(fs, 'existsSync').returns(false);
        const title = 'yooo';
        const id = '12345';

        const filepath = imageService.getImageData(id, title);

        expect(filepath).to.be.equal(undefined);

        expect(existsSyncStub.firstCall.args[0]).to.be.equal(IMAGE_FILE_PATH(id, title));
        expect(existsSyncStub.calledOnce).to.be.true;
    });

    it('should call and return getImagesInfo from databaseService', async () => {
        await imageService.getImagesInfo();

        expect(databaseService.getImagesInfo.calledOnce).to.be.true;
    });

    it('should call and return getImagesInfo from databaseService and handles error', async () => {
        databaseService.getImagesInfo.rejects(true);

        expect(await imageService.getImagesInfo()).to.be.undefined;

        expect(databaseService.getImagesInfo.calledOnce).to.be.true;
    });
});
