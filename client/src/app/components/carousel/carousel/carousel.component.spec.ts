/* tslint:disable:no-unused-variable */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselCardComponent } from '@app/components/carousel/carousel-card/carousel-card.component';
import { IMAGE_NOT_FOUND_PATH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocationService } from '@app/services/location/location.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { Image } from '@common/communication/image';
import { Subject } from 'rxjs';
import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;

    let carouselService: CarouselService;
    let httpService: HttpService;

    const keyboardEvent: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
    const filteredCardsChangedMock: Subject<void> = new Subject<void>();
    const MOCK_IMAGE: Image = { id: 'id', title: 'title', data: IMAGE_NOT_FOUND_PATH, tags: ['tag1', 'tag2', 'tag3'] };
    const CAN_ROTATE = 4;

    beforeEach(async(() => {
        const filterService = new FilterService();
        const keyEventService = new KeyEventService();
        const snackbar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        const dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);

        httpService = new HttpService(new HttpClient({} as HttpHandler));

        carouselService = new CarouselService(
            httpService,
            snackbar,
            {} as Router,
            filterService,
            {} as NewDrawingService,
            {} as LocationService,
            {} as MatDialog,
            {} as DrawingService,
        );
        spyOn(keyEventService, 'getKeyDownEvent').and.returnValue(keyboardEvent.asObservable());
        spyOn(carouselService, 'canOpenDialog').and.callThrough();

        spyOn(carouselService, 'filteredCardsChangedListener').and.returnValue(filteredCardsChangedMock.asObservable());

        const carouselToolService = new CarouselToolService(keyEventService, carouselService, filterService, dialogService, {} as ToolsInfoService);
        carouselToolService.openCarousel();

        TestBed.configureTestingModule({
            declarations: [CarouselComponent, CarouselCardComponent],
            providers: [
                { provide: CarouselService, useValue: carouselService },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [MaterialModule, RouterTestingModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;

        jasmine.createSpyObj('CarouselCardComponent', ['setImageInfo']);

        fixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize cards if filters are changed', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);
        component.ngAfterViewInit();

        spyOnProperty(carouselService, 'previousCardInfo', 'get').and.returnValue(MOCK_IMAGE);

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(1);
        expect(component.cardsOrder[1]).toBe(2);
        expect(component.cardsOrder[2]).toBe(0);

        filteredCardsChangedMock.next();

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);
    });

    it('should initialize cards and skip undefined cards', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);

        component.ngAfterViewInit();

        spyOnProperty(carouselService, 'previousCardInfo', 'get').and.returnValue(MOCK_IMAGE);

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(1);
        expect(component.cardsOrder[1]).toBe(2);
        expect(component.cardsOrder[2]).toBe(0);

        filteredCardsChangedMock.next();

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);
    });

    it('should call onRight when right arrow is clicked', () => {
        const onRight = spyOn(component, 'onRight');
        const event = new KeyboardEvent('keypress', {
            key: 'ArrowRight',
        });
        keyboardEvent.next(event);

        expect(onRight).toHaveBeenCalled();
    });

    it('should call onLeft when right arrow is clicked', () => {
        const onLeft = spyOn(component, 'onLeft');
        const event = new KeyboardEvent('keypress', {
            key: 'ArrowLeft',
        });
        keyboardEvent.next(event);

        expect(onLeft).toHaveBeenCalled();
    });

    it('should call onRight when right arrow button is clicked', () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);

        fixture.detectChanges();

        const onRight = spyOn(component, 'onRight');
        (fixture.debugElement.nativeElement.querySelector('#right') as HTMLButtonElement).click();
        expect(onRight).toHaveBeenCalled();
    });

    it('should call onLeft when right arrow button is clicked', () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);

        fixture.detectChanges();

        const onLeft = spyOn(component, 'onLeft');
        (fixture.debugElement.nativeElement.querySelector('#left') as HTMLButtonElement).click();
        expect(onLeft).toHaveBeenCalled();
    });

    it('should rotate the card order left', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);
        component.ngAfterViewInit();

        spyOnProperty(carouselService, 'previousCardInfo', 'get').and.returnValue(MOCK_IMAGE);

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(1);
        expect(component.cardsOrder[1]).toBe(2);
        expect(component.cardsOrder[2]).toBe(0);
    });

    it('should rotate the card order right', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);
        component.ngAfterViewInit();

        spyOnProperty(carouselService, 'nextCardInfo', 'get').and.returnValue(MOCK_IMAGE);

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);

        await component.onRight();

        expect(component.cardsOrder[0]).toBe(2);
        expect(component.cardsOrder[1]).toBe(0);
        expect(component.cardsOrder[2]).toBe(1);

        await component.onRight();

        expect(component.cardsOrder[0]).toBe(1);
        expect(component.cardsOrder[1]).toBe(2);
        expect(component.cardsOrder[2]).toBe(0);

        await component.onRight();

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);
    });

    it('should rotate the cardComponents left', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);
        component.ngAfterViewInit();

        spyOnProperty(carouselService, 'previousCardInfo', 'get').and.returnValue(MOCK_IMAGE);

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(1);
        expect(component.cardsOrder[1]).toBe(2);
        expect(component.cardsOrder[2]).toBe(0);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(2);
        expect(component.cardsOrder[1]).toBe(0);
        expect(component.cardsOrder[2]).toBe(1);

        await component.onLeft();

        expect(component.cardsOrder[0]).toBe(0);
        expect(component.cardsOrder[1]).toBe(1);
        expect(component.cardsOrder[2]).toBe(2);
    });

    it('should show that the carousel is empty id there are no cards to show', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(0);
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('#no-cards')).not.toBeNull();
        expect(fixture.debugElement.nativeElement.querySelector('#cards-available')).toBeNull();
    });

    it('should not show that the carousel is empty id there are cards to show', async () => {
        spyOnProperty(carouselService, 'filteredCardsInfoLength', 'get').and.returnValue(CAN_ROTATE);
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('#no-cards')).toBeNull();
        expect(fixture.debugElement.nativeElement.querySelector('#cards-available')).not.toBeNull();
    });
});
