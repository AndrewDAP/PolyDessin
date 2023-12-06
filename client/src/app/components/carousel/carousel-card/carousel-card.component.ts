import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { IMAGE_NOT_FOUND_PATH } from '@app/const';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { Image } from '@common/communication/image';
@Component({
    selector: 'app-carousel-card',
    animations: [
        trigger('fade', [
            state('true', style({ opacity: 1 })),
            state('false', style({ opacity: 0 })),
            transition('false => true', animate('50ms')),
            transition('true => false', animate('50ms')),
        ]),
    ],
    templateUrl: './carousel-card.component.html',
    styleUrls: ['./carousel-card.component.scss'],
})
export class CarouselCardComponent {
    enabled: boolean = true;
    imageIsLoading: boolean = false;

    imageInfo: Image;

    readonly IMAGE_NOT_FOUND_PATH: string = IMAGE_NOT_FOUND_PATH;

    constructor(public carouselService: CarouselService) {}

    async setImageInfo(image: Image): Promise<void> {
        if (image === undefined) return;
        await new Promise((resolve) => {
            setTimeout(async () => {
                this.imageInfo = image;
                resolve(await this.updateImage());
            });
        });
    }

    async updateImage(): Promise<void> {
        this.imageInfo.data = '';

        this.imageIsLoading = true;
        await this.carouselService.getImage(this.imageInfo.id, this.imageInfo.title).then((url) => (this.imageInfo.data = url));
        this.imageIsLoading = false;
    }

    async onDelete(event: MouseEvent): Promise<void> {
        event.stopPropagation();
        await this.carouselService.removeEntry(this.imageInfo);
    }

    onClick(): void {
        this.carouselService.load(this.imageInfo.data);
    }
}
