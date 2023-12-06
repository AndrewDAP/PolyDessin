import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { MaterialModule } from '@app/modules/material.module';
import { ColorService } from '@app/services/tools/color/color.service';
import { Subject } from 'rxjs';
import { ColorAlphaSliderComponent } from './color-alpha-slider.component';

describe('ColorAlphaSliderComponent', () => {
    let component: ColorAlphaSliderComponent;
    let fixture: ComponentFixture<ColorAlphaSliderComponent>;
    const defaultWidth = 220;
    let colorService: ColorService;
    const subject: Subject<null> = new Subject<null>();

    beforeEach(async(() => {
        colorService = new ColorService();
        spyOn(colorService, 'selectedColorChangedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'colorClickedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'emitColorClicked').and.callFake(() => subject.next());
        spyOn(colorService, 'emitSelectedColorChanged').and.callFake(() => subject.next());

        colorService.primaryColor = Color.BLACK;
        colorService.secondaryColor = Color.WHITE;

        TestBed.configureTestingModule({
            declarations: [ColorAlphaSliderComponent],
            providers: [{ provide: ColorService, useValue: colorService }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorAlphaSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change selectedWidth when mousedown is true and mouse is moving', () => {
        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: 60,
                button: 0,
            },
        );
        expect(component.selectedWidth).toEqual(defaultWidth);
        component.onMouseDown(mouseEventSpy);
        component.onMouseMove(mouseEventSpy);
        expect(component.selectedWidth).toBeCloseTo(mouseEventSpy.clientX);
    });

    it('should clamp selectedWidth to the width when mousedown is true and mouse is moving', () => {
        const mouseEventUpperClampSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: 2000,
                button: 0,
            },
        );

        const mouseEventLowerClampSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: -2000,
                button: 0,
            },
        );

        expect(component.selectedWidth).toEqual(defaultWidth);

        component.onMouseDown(mouseEventLowerClampSpy);
        component.onMouseMove(mouseEventLowerClampSpy);

        expect(component.selectedWidth).toEqual(0);

        component.onMouseMove(mouseEventUpperClampSpy);

        expect(component.selectedWidth).toEqual(defaultWidth);
    });

    it('should not change selectedWidth when mouseup is true and mouse is moving', () => {
        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: 60,
                button: 0,
            },
        );

        expect(component.selectedWidth).toEqual(defaultWidth);

        component.onMouseUp();
        component.onMouseMove(mouseEventSpy);

        expect(component.selectedWidth).toEqual(defaultWidth);
    });

    it('should call colorservice change in selected color alpha', () => {
        const division = 10;
        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: defaultWidth / division,
                button: 0,
            },
        );
        const mockAlpha = Color.MAX_ALPHA / division;
        const selectedColorAlpha = spyOnProperty(colorService, 'selectedColorAlpha', 'set').and.callThrough();

        component.onMouseDown(mouseEventSpy);

        expect(selectedColorAlpha).toHaveBeenCalledWith(mockAlpha);
    });

    it('should drawComponent and be red', () => {
        spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(Color.RED);
        component.ngAfterViewInit();
        fixture.detectChanges();
        const MAX_RGB = 255;
        const ctx: CanvasRenderingContext2D = fixture.debugElement.nativeElement.querySelector('canvas').getContext('2d') as CanvasRenderingContext2D;
        const imageData: ImageData = ctx.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(MAX_RGB); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should show selected color alpha value with 2 decimals', () => {
        const mockAlpha = 0.5;
        colorService.selectedColorAlpha = mockAlpha;
        fixture.detectChanges();

        const alphaText = (fixture.debugElement.nativeElement.querySelector('#alpha-text') as HTMLSpanElement).textContent;

        expect(alphaText).toEqual('0.50');
    });
});
