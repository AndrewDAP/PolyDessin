import { ImageService } from '@app/services/image.service';
import { TYPES } from '@app/types';
import { Image } from '@common/communication/image';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_SERVER_ERROR = 500;
const HTTP_STATUS_NOT_FOUND = 404;

@injectable()
export class ImageController {
    router: Router;

    constructor(@inject(TYPES.ImageService) private imageService: ImageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * definitions:
         *   Image:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       tags:
         *         type: string
         *       data?:
         *         type: string
         *       id?:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Image
         *     description: Image endpoints
         */

        /**
         * @swagger
         *
         * /api/images/save-image:
         *   post:
         *     description: Save an image to server (no id required)
         *     tags:
         *       - Image
         *     requestBody:
         *         description: image object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Image'
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Ok
         *       500:
         *         description: Server error
         *
         */
        this.router.post('/save-image', async (req: Request, res: Response, next: NextFunction) => {
            const title: string = req.body.title;
            const tags: string[] = req.body.tags;
            const data: string = req.body.data;
            await this.imageService
                .saveImage({ title, tags, data })
                .then(() => {
                    res.status(HTTP_STATUS_OK).send();
                })
                .catch(() => {
                    res.status(HTTP_STATUS_SERVER_ERROR).send();
                });
        });

        /**
         * @swagger
         *
         * /api/images/remove-image:
         *   post:
         *     description: Remove an image to server (id required)
         *     tags:
         *       - Image
         *     requestBody:
         *         description: image object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Image'
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Ok
         *       500:
         *         description: Server error
         *
         */
        this.router.post('/remove-image', async (req: Request, res: Response, next: NextFunction) => {
            const id: string = req.body.id;
            const title: string = req.body.title;
            await this.imageService
                .removeImage(id, title)
                .then(() => {
                    res.status(HTTP_STATUS_OK).send();
                })
                .catch((error: Error) => {
                    console.log(error);
                    res.status(HTTP_STATUS_SERVER_ERROR).send();
                });
        });

        /**
         * @swagger
         *
         * /api/images/get-images-info:
         *   get:
         *     description: Get all images in database and server
         *     tags:
         *       - Image
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Image array
         *         schema:
         *           $ref: '#/definitions/Image'
         *       404:
         *         description: Status not found
         *       500:
         *         description: Server error
         *
         */
        this.router.get('/get-images-info', async (req: Request, res: Response) => {
            await this.imageService
                .getImagesInfo()
                .then((images: Image[]) => {
                    images ? res.status(HTTP_STATUS_OK).send(images) : res.status(HTTP_STATUS_NOT_FOUND).send();
                })
                .catch(() => {
                    res.status(HTTP_STATUS_SERVER_ERROR).send();
                });
        });

        /**
         * @swagger
         *
         * /api/images/get-image-data/:id/:name:
         *   get:
         *     description: Get one image's data
         *     tags:
         *       - Image
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Image
         *         schema:
         *           $ref: '#/definitions/Image'
         *       404:
         *         description: Status not found
         *
         */
        this.router.get('/get-image-data/:id/:title', async (req: Request, res: Response) => {
            const data = this.imageService.getImageData(req.params.id, req.params.title);

            data ? res.status(HTTP_STATUS_OK).sendFile(data) : res.status(HTTP_STATUS_NOT_FOUND).send();
        });
    }
}
