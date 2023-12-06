import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@app/modules/material.module';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { LocationService } from '@app/services/location/location.service';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';
import { BehaviorSubject } from 'rxjs';
import { MainPageComponent } from './main-page.component';

import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let locationServiceSpy: SpyObj<LocationService>;
    let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

    const afterClosed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: afterClosed.asObservable(), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };

    let carouselToolServiceSpy: jasmine.SpyObj<CarouselToolService>;

    beforeEach(async(() => {
        locationServiceSpy = jasmine.createSpyObj('LocationService', ['openEditorFromMainpage']);
        carouselToolServiceSpy = jasmine.createSpyObj('CarouselToolService', ['resetCarousel', 'openCarousel']);
        localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['hasDrawing', 'newDrawing', 'getDrawing']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MaterialModule, BrowserAnimationsModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: LocationService, useValue: locationServiceSpy },
                { provide: CarouselToolService, useValue: carouselToolServiceSpy },
                { provide: LocalStorageService, useValue: localStorageServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
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

    it("should have as title 'POLYDESSIN'", () => {
        expect(component.title).toEqual('POLYDESSIN');
    });

    it('should set openEditorFromMainpage to true when editor is opened', () => {
        locationServiceSpy.openEditorFromMainPage = false;
        component.openEditor();
        expect(locationServiceSpy.openEditorFromMainPage).toBeTrue();
    });

    it('should load drawing when continue', () => {
        spyOn(component.newDrawingService, 'loadFromLocalStorage');
        component.continueDrawing();
        expect(component.newDrawingService.loadFromLocalStorage).toHaveBeenCalled();
    });
});
