import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CarouselKeyEventMask } from '@app/classes/key-event-masks/carousel-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { CarouselCardComponent } from '@app/components/carousel/carousel-card/carousel-card.component';
import { ANIMATION_TIME } from '@app/const';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { FilterService } from '@app/services/filter/filter.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { MAX_NUMBER_TAGS } from '@common/const';

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        private keyEventService: KeyEventService,
        public carouselService: CarouselService,
        public filterService: FilterService,
        private changeDetector: ChangeDetectorRef,
        private toolsInfoService: ToolsInfoService,
    ) {
        this.keyEventService.keyMask = new CarouselKeyEventMask();
    }

    private cardComponents: CarouselCardComponent[];
    @ViewChildren('card') cards: QueryList<CarouselCardComponent>;

    cardsOrder: number[] = [0, 1, 2];

    private readonly MAX_CARDS: number = 3;

    canAnimate: boolean = true;
    leftIsAnimating: boolean = false;
    rightIsAnimating: boolean = false;

    MAX_NUMBER_TAGS: number = MAX_NUMBER_TAGS;

    get isAnimating(): boolean {
        return this.leftIsAnimating || this.rightIsAnimating || !this.canAnimate;
    }
    get canSlide(): boolean {
        return !this.isAnimating && this.carouselService.filteredCardsInfoLength > this.MAX_CARDS;
    }

    separatorKeysCodes: number[] = [ENTER, COMMA];

    ngOnInit(): void {
        this.toolsInfoService.carouselLoading = false;
        this.keyEventService.getKeyDownEvent('ArrowRight').subscribe(() => {
            this.onRight();
        });
        this.keyEventService.getKeyDownEvent('ArrowLeft').subscribe(() => {
            this.onLeft();
        });

        this.carouselService.filteredCardsChangedListener().subscribe(() => this.initalizeCards());
    }

    ngOnDestroy(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }

    ngAfterViewInit(): void {
        this.initalizeCards();
    }

    private initalizeCards(): void {
        this.changeDetector.detectChanges();
        this.cardComponents = this.cards.toArray();
        this.cardsOrder = [0, 1, 2];
        for (const i of this.numberOfCardsToShow()) this.cardComponents[i].setImageInfo(this.carouselService.filteredCardsInfo[i]);
    }

    async onRight(): Promise<void> {
        if (!this.canSlide) return;
        this.canAnimate = false;
        this.rightIsAnimating = true;
        const disabledComponent = this.cardComponents[0];
        disabledComponent.enabled = false;
        await new Promise((resolve) => {
            setTimeout(() => {
                this.rotateOrderRight();
                disabledComponent.setImageInfo(this.carouselService.nextCardInfo);
                this.cardComponents.push(this.cardComponents.shift() as CarouselCardComponent);

                disabledComponent.enabled = true;

                this.rightIsAnimating = false;

                setTimeout(() => {
                    this.canAnimate = true;
                    resolve(null);
                }, ANIMATION_TIME);
            }, ANIMATION_TIME);
        });
    }

    private rotateOrderRight(): void {
        for (let i = 0; i < this.cardsOrder.length; i++) if (--this.cardsOrder[i] < 0) this.cardsOrder[i] = this.MAX_CARDS - 1;
    }

    async onLeft(): Promise<void> {
        if (!this.canSlide) return;
        this.canAnimate = false;
        this.leftIsAnimating = true;
        const disabledComponent = this.cardComponents[this.MAX_CARDS - 1];
        disabledComponent.enabled = false;

        await new Promise((resolve) => {
            setTimeout(() => {
                this.rotateOrderLeft();
                disabledComponent.setImageInfo(this.carouselService.previousCardInfo);
                this.cardComponents.unshift(this.cardComponents.pop() as CarouselCardComponent);

                disabledComponent.enabled = true;

                this.leftIsAnimating = false;

                setTimeout(() => {
                    this.canAnimate = true;
                    resolve(null);
                }, ANIMATION_TIME);
            }, ANIMATION_TIME);
        });
    }

    private rotateOrderLeft(): void {
        for (let i = 0; i < this.cardsOrder.length; i++) if (++this.cardsOrder[i] > this.MAX_CARDS - 1) this.cardsOrder[i] = 0;
    }

    numberOfCardsToShow(): number[] {
        return Array(Math.min(this.carouselService.filteredCardsInfoLength, this.MAX_CARDS))
            .fill(0)
            .map((x, i) => i);
    }
}
