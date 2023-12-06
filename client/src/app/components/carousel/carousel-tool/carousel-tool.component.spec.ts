/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/modules/material.module';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';
import { CarouselToolComponent } from './carousel-tool.component';

describe('CarouselToolComponent', () => {
    let component: CarouselToolComponent;
    let fixture: ComponentFixture<CarouselToolComponent>;
    let carouselToolServiceSpy: jasmine.SpyObj<CarouselToolService>;
    beforeEach(async(() => {
        carouselToolServiceSpy = jasmine.createSpyObj('CarouselToolService', ['resetCarousel', 'openCarousel']);

        TestBed.configureTestingModule({
            declarations: [CarouselToolComponent],
            providers: [{ provide: CarouselToolService, useValue: carouselToolServiceSpy }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselToolComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call reset carousel on ngOnInit', () => {
        component.ngOnInit();
        expect(carouselToolServiceSpy.resetCarousel).toHaveBeenCalled();
    });
    it('should call open carousel on openCarousel', () => {
        component.openCarousel();
        expect(carouselToolServiceSpy.openCarousel).toHaveBeenCalled();
    });
});
