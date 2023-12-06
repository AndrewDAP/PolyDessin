import { Component, OnInit } from '@angular/core';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { LocationService } from '@app/services/location/location.service';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    readonly title: string = 'POLYDESSIN';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private locationService: LocationService,
        public carouselService: CarouselService,
        public keyEventService: KeyEventService,
        private carouselToolService: CarouselToolService,
        public newDrawingService: NewDrawingService,
        private localStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        this.carouselToolService.resetCarousel();
    }

    openCarousel(): void {
        this.localStorageService.newDrawing = false;
        this.carouselToolService.openCarousel();
    }

    openEditor(): void {
        this.localStorageService.newDrawing = true;
        this.locationService.openEditorFromMainPage = true;
    }

    checkContinuedDrawing(): boolean {
        return this.localStorageService.hasDrawing();
    }

    continueDrawing(): void {
        this.locationService.openEditorFromMainPage = true;
        this.localStorageService.newDrawing = false;
        this.newDrawingService.loadFromLocalStorage();
    }
}
