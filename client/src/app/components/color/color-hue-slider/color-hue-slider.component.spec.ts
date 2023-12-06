import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { MaterialModule } from '@app/modules/material.module';
import { ColorService } from '@app/services/tools/color/color.service';
import { Subject } from 'rxjs';
import { ColorHueSliderComponent } from './color-hue-slider.component';

describe('ColorHueSliderComponent', () => {
    let component: ColorHueSliderComponent;
    let fixture: ComponentFixture<ColorHueSliderComponent>;
    const defaultWidth = 0;
    let canvasWidth: number;
    let colorService: ColorService;
    const subject: Subject<null> = new Subject<null>();

    beforeEach(async(() => {
        colorService = new ColorService();
        spyOn(colorService, 'selectedColorChangedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'colorClickedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'emitColorClicked').and.callFake(() => subject.next());
        spyOn(colorService, 'emitSelectedColorChanged').and.callFake(() => subject.next());

        TestBed.configureTestingModule({
            declarations: [ColorHueSliderComponent],
            providers: [{ provide: ColorService, useValue: colorService }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorHueSliderComponent);
        component = fixture.componentInstance;
        canvasWidth = component.canvasWidth;
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

        component.onMouseDown(mouseEventUpperClampSpy);
        component.onMouseMove(mouseEventLowerClampSpy);

        expect(component.selectedWidth).toEqual(defaultWidth);

        component.onMouseMove(mouseEventUpperClampSpy);

        expect(component.selectedWidth).toEqual(canvasWidth);
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

    it('should call colorservice change in selected color hue', () => {
        const division = 10;
        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            { preventDefault: () => null },
            {
                clientX: canvasWidth / division,
                button: 0,
            },
        );
        const mockHue = Color.MAX_HUE / division;
        const selectedColorHue = spyOnProperty(colorService, 'selectedColorHue', 'set').and.callThrough();

        component.onMouseDown(mouseEventSpy);

        expect(selectedColorHue).toHaveBeenCalledWith(mockHue);
    });

    it('should draw the hue slider', () => {
        const ctx: CanvasRenderingContext2D = fixture.debugElement.nativeElement.querySelector('canvas').getContext('2d') as CanvasRenderingContext2D;
        const imageData: ImageData = ctx.getImageData(0, 0, 1, 1);
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[0]).toEqual(255); // R
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[1]).toEqual(3); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('should show selected color hue value', () => {
        const mockHue = 180;
        colorService.selectedColorHue = mockHue;
        fixture.detectChanges();

        const hueText = (fixture.debugElement.nativeElement.querySelector('#hue-text') as HTMLSpanElement).textContent;

        expect(hueText).toEqual('180');
    });

    it('should show selected color hue value with 0 decimals', () => {
        const mockHue = 180.13;
        colorService.selectedColorHue = mockHue;
        fixture.detectChanges();

        const hueText = (fixture.debugElement.nativeElement.querySelector('#hue-text') as HTMLSpanElement).textContent;

        expect(hueText).toEqual('180');
    });
});
