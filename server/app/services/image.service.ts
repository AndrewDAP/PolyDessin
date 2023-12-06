import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { Image } from '@common/communication/image';
import { MAX_NUMBER_TAGS, MAX_TAG_SIZE, MAX_TITLE_SIZE } from '@common/const';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as path from 'path';

export const IMAGE_FILE_PATH = (id: string, title: string): string => path.join(__dirname + '/../../images/' + title + '-' + id + '.png');

@injectable()
export class ImageService {
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

    // echo {"title":"allo", "tags":["allo"], "data":"$(cat test4.jpg | base64 | tr -d '\n')"} > output.dat
    // curl --data @output.dat -H "Content-Type: application/json" http://127.0.0.1:3000/api/images/save-image
    async saveImage(image: Image): Promise<void | string> {
        if (image.title.length < 1 || image.title.length > MAX_TITLE_SIZE) {
            throw Error('title length error');
        }

        const titleValid = image.title.match(/[a-zA-Z0-9-_ ]*/);
        if (titleValid === null || titleValid[0].length !== image.title.length) {
            throw Error('title format error');
        }

        if (image.tags.length > MAX_NUMBER_TAGS) {
            throw Error('too many tags');
        }

        for (const tag of image.tags) {
            if (tag.length < 1 || tag.length > MAX_TAG_SIZE) {
                throw Error('tag length error');
            }

            const tagsValid = tag.match(/[a-zA-Z0-9-_ ]*/);
            if (tagsValid === null || tagsValid[0].length !== tag.length) {
                throw Error('tag format error');
            }
        }

        return this.databaseService
            .addImage(image)
            .then(async (id: string) => {
                fs.writeFile('images/' + image.title + '-' + id + '.png', image.data, { encoding: 'base64' }, async (err: NodeJS.ErrnoException) => {
                    if (err) {
                        await this.databaseService.removeImage(id);
                        return console.error('Error while writing the image file', err);
                    }
                });
                return id;
            })
            .catch((error: unknown) => {
                console.error('Error while adding the image to database', error);
                throw error;
            });
    }

    async removeImage(id: string, title: string): Promise<void> {
        return this.databaseService
            .removeImage(id)
            .then(() => {
                const filePath: string = IMAGE_FILE_PATH(id, title);
                fs.existsSync(filePath) ? fs.unlinkSync(filePath) : console.error('Image does not exist in server');
            })
            .catch((error: unknown) => {
                console.error('Error while removing the image from database', error);
                throw error;
            });
    }

    getImageData(id: string, title: string): string | undefined {
        const filePath: string = IMAGE_FILE_PATH(id, title);
        return fs.existsSync(filePath) ? filePath : undefined;
    }

    async getImagesInfo(): Promise<Image[] | undefined> {
        return await this.databaseService.getImagesInfo().catch((error: unknown) => {
            console.error('Error while getting images data', error);
            return undefined;
        });
    }
}
