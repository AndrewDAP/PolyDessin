import { Image } from '@common/communication/image';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { IMAGE_FILE_PATH } from './image.service';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface IImage extends Document {
    title: string;
    tags: string[];
}

const IMAGE_SCHEMA: mongoose.Schema = new mongoose.Schema({
    title: { type: String, required: true, unique: false },
    tags: { type: [String], required: false },
});

export const IMAGE_MODEL = mongoose.model('Image', IMAGE_SCHEMA);

@injectable()
export class DatabaseService {
    databaseUrl: string = process.env.DATABASE_URL as string;
    databaseOpened: boolean = false;

    constructor() {
        this.start();
    }

    async start(url: string = this.databaseUrl): Promise<void> {
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);

        return mongoose
            .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                this.databaseOpened = true;
            })
            .catch(() => {
                this.databaseOpened = false;
                throw new Error('Database connection error');
            });
    }

    async close(): Promise<void> {
        this.databaseOpened = false;
        return mongoose.disconnect();
    }

    async addImage(image: Image): Promise<string> {
        if (!this.databaseOpened) {
            await this.start().catch((error) => {
                throw error;
            });
        }

        const newImage = new IMAGE_MODEL({ title: image.title, tags: image.tags });
        return newImage.save().then((imageDocument: mongoose.Document) => imageDocument._id);
    }

    async removeImage(id: string): Promise<void> {
        if (!this.databaseOpened) {
            await this.start().catch((error) => {
                throw error;
            });
        }

        return IMAGE_MODEL.deleteOne({ _id: id }).then(() => Promise.resolve());
    }

    async getImage(id: string): Promise<Image | undefined> {
        if (!this.databaseOpened) {
            await this.start().catch((error) => {
                throw error;
            });
        }

        return IMAGE_MODEL.findOne({ _id: id })
            .exec()
            .then(
                (result: mongoose.Document<IImage>): Image => {
                    return { title: result.get('title'), tags: result.get('tags'), id: result.get('_id') };
                },
            )
            .catch(() => {
                console.error('image not found');
                return undefined;
            });
    }

    async getImagesInfo(): Promise<Image[] | undefined> {
        if (!this.databaseOpened) {
            await this.start().catch((error) => {
                throw error;
            });
        }

        return IMAGE_MODEL.find().then((result: mongoose.Document<IImage>[]): Image[] => {
            return result
                .map((document: mongoose.Document) => {
                    return { title: document.get('title'), tags: document.get('tags'), id: document._id };
                })
                .filter((image) => fs.existsSync(IMAGE_FILE_PATH(image.id, image.title)));
        });
    }
}
