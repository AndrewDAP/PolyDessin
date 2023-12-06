import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IMAGE_NOT_FOUND_PATH, IMAGE_TEST_PATH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { FilterService } from '@app/services/filter/filter.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';
import { Image } from '@common/communication/image';
import { CarouselCardComponent } from './carousel-card.component';

describe('CarouselCardComponent', () => {
    let component: CarouselCardComponent;
    let fixture: ComponentFixture<CarouselCardComponent>;

    let filterService: FilterService;
    let carouselToolService: CarouselToolService;
    let keyEventService: KeyEventService;
    let carouselServiceSpy: jasmine.SpyObj<CarouselService>;

    const MOCK_IMAGE: Image = { id: 'id', title: 'title', data: IMAGE_NOT_FOUND_PATH, tags: ['tag1', 'tag2', 'tag3'] };
    beforeEach(async(() => {
        filterService = new FilterService();
        keyEventService = new KeyEventService();

        const dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);

        carouselServiceSpy = jasmine.createSpyObj('CarouselService', ['getImage', 'removeEntry', 'canOpenDialog', 'load']);
        carouselServiceSpy.getImage.and.returnValue(Promise.resolve(IMAGE_TEST_PATH));
        carouselServiceSpy.removeEntry.and.returnValue(Promise.resolve());

        carouselToolService = new CarouselToolService(keyEventService, carouselServiceSpy, filterService, dialogService, {} as ToolsInfoService);
        carouselToolService.openCarousel();

        TestBed.configureTestingModule({
            declarations: [CarouselCardComponent],
            providers: [{ provide: CarouselService, useValue: carouselServiceSpy }],
            imports: [MaterialModule, RouterTestingModule, BrowserAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselCardComponent);
        component = fixture.componentInstance;
        component.imageInfo = MOCK_IMAGE;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load drawing when clicked on image', () => {
        fixture.detectChanges();
        (fixture.debugElement.nativeElement.querySelector('.container') as HTMLElement).dispatchEvent(new Event('click'));

        expect(carouselServiceSpy.load).toHaveBeenCalled();
    });

    it('should call delete when deleting', () => {
        fixture.detectChanges();
        (fixture.debugElement.nativeElement.querySelector('#delete') as HTMLButtonElement).click();

        expect(carouselServiceSpy.removeEntry).toHaveBeenCalled();
    });

    it('should update image', async () => {
        expect(component.imageInfo.data).toEqual(IMAGE_NOT_FOUND_PATH);

        await component.updateImage();
        expect(carouselServiceSpy.getImage).toHaveBeenCalled();

        expect(component.imageInfo.data).toBe(IMAGE_TEST_PATH);
    });

    it('should set image information', async () => {
        const TEST_IMAGE: Image = { id: 'Test', title: 'Test', tags: [], data: 'data' };

        expect(component.imageInfo).toEqual(MOCK_IMAGE);

        const updateImage = spyOn(component, 'updateImage');

        await component.setImageInfo(TEST_IMAGE);

        expect(updateImage).toHaveBeenCalled();
        expect(component.imageInfo).toEqual(TEST_IMAGE);
    });
});
