import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Color } from '@app/classes/color';
import { ColorAlphaSliderComponent } from '@app/components/color/color-alpha-slider/color-alpha-slider.component';
import { ColorHexComponent } from '@app/components/color/color-hex/color-hex.component';
import { ColorHistoryComponent } from '@app/components/color/color-history/color-history.component';
import { ColorHueSliderComponent } from '@app/components/color/color-hue-slider/color-hue-slider.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorSwatchComponent } from '@app/components/color/color-swatch/color-swatch.component';
import { MaterialModule } from '@app/modules/material.module';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { Subject } from 'rxjs';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let colorService: ColorService;
    let keyEventService: KeyEventService;
    const colorClicked: Subject<null> = new Subject<null>();
    const keyboardEvent: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();

    beforeEach(async(() => {
        colorService = new ColorService();
        keyEventService = new KeyEventService();
        spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(Color.RED);

        spyOn(colorService, 'colorClickedListener').and.returnValue(colorClicked.asObservable());
        spyOn(keyEventService, 'getKeyDownEvent').and.returnValue(keyboardEvent.asObservable());

        TestBed.configureTestingModule({
            declarations: [
                ColorPickerComponent,
                ColorAlphaSliderComponent,
                ColorHueSliderComponent,
                ColorPaletteComponent,
                ColorHexComponent,
                ColorHistoryComponent,
                ColorSwatchComponent,
            ],
            providers: [
                { provide: ColorService, useValue: colorService },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [MaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        component.previousColor = Color.GREEN;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retore previous color when cancelling color change', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();
        component.previousColor = Color.BLUE;

        const selectedColorSetter = spyOnProperty(colorService, 'selectedColor', 'set').and.callThrough();
        expect(colorService.selectedColor).toEqual(Color.RED);
        component.cancelSelectedColor();
        expect(selectedColorSetter).toHaveBeenCalledWith(component.previousColor);
    });

    it('should not restore previous color when cancelling color change if component is hidden', async () => {
        component.isHidden = true;
        fixture.detectChanges();
        await fixture.whenStable();

        component.previousColor = Color.BLUE;
        const selectedColorSetter = spyOnProperty(colorService, 'selectedColor', 'set').and.callThrough();
        expect(colorService.selectedColor).toEqual(Color.RED);
        component.cancelSelectedColor();
        expect(selectedColorSetter).not.toHaveBeenCalled();
        expect(colorService.selectedColor).toEqual(Color.RED);
    });

    it('should set the previousColor to the current selected color and set the attribute isHidden to false when showing component', () => {
        component.isHidden = true;
        component.previousColor = Color.BLUE;
        spyOn(colorService, 'emitColorClicked').and.callFake(() => colorClicked.next());
        component.ngOnInit();

        expect(component.isHidden).toBeTruthy();
        expect(component.previousColor).toEqual(Color.BLUE);

        colorService.emitColorClicked();

        expect(component.isHidden).not.toBeTruthy();
        expect(component.previousColor).toEqual(Color.RED);
    });

    it('should change the selected button toggle depending on the current selected color', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        colorService.selectedColorIsPrimary = false;
        expect(component.getSelectedColor()).toEqual('Secondaire');

        colorService.selectedColorIsPrimary = true;
        expect(component.getSelectedColor()).toEqual('Principale');
    });

    it('should accept the primary color when changing to secondary color', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        colorService.selectedColorIsPrimary = false;
        const acceptColorChange = spyOn(component, 'acceptSelectedColor');
        const primaryColorClicked = spyOn(colorService, 'primaryColorClicked');

        component.onPrimaryColorClicked();

        expect(acceptColorChange).toHaveBeenCalled();
        expect(primaryColorClicked).toHaveBeenCalled();
    });

    it('should not accept the primary color when color was already primary', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        colorService.selectedColorIsPrimary = true;
        const acceptColorChange = spyOn(component, 'acceptSelectedColor');
        const primaryColorClicked = spyOn(colorService, 'primaryColorClicked');

        component.onPrimaryColorClicked();

        expect(acceptColorChange).not.toHaveBeenCalled();
        expect(primaryColorClicked).not.toHaveBeenCalled();
    });

    it('should accept the secondary color when changing to secondary color', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        colorService.selectedColorIsPrimary = true;
        const acceptColorChange = spyOn(component, 'acceptSelectedColor');
        const secondaryColorClicked = spyOn(colorService, 'secondaryColorClicked');

        component.onSecondaryColorClicked();

        expect(acceptColorChange).toHaveBeenCalled();
        expect(secondaryColorClicked).toHaveBeenCalled();
    });

    it('should not accept the primary color when color was already secondary', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        colorService.selectedColorIsPrimary = false;
        const acceptColorChange = spyOn(component, 'acceptSelectedColor');
        const secondaryColorClicked = spyOn(colorService, 'secondaryColorClicked');

        component.onSecondaryColorClicked();

        expect(acceptColorChange).not.toHaveBeenCalled();
        expect(secondaryColorClicked).not.toHaveBeenCalled();
    });

    it('should hide the component when clicking outside the color picker', async () => {
        component.previousColor = Color.RED;
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();
        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            {},
            {
                target: null,
            },
        ) as Event;

        component.onMouseDown(mouseEventSpy);

        expect(component.isHidden).toBeTruthy();
    });

    it('should not accept the color if color hex is invalid', () => {
        component.isHidden = false;
        const invalidHex = 'LOL';
        const colorHex = TestBed.createComponent(ColorHexComponent).componentInstance;
        component.colorHex = colorHex;
        component.colorHex.hexColorFormControl.setValue(invalidHex);
        component.acceptSelectedColor();

        expect(component.isHidden).toBeFalsy();
    });

    it('should not hide the component when clicking inside the color picker', async () => {
        component.previousColor = Color.RED;
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            {},
            {
                target: fixture.debugElement.nativeElement.querySelector('.container'),
            },
        ) as Event;

        component.onMouseDown(mouseEventSpy);

        expect(component.isHidden).toBeFalsy();
    });

    it('should not hide the component if component is already hidden', async () => {
        component.previousColor = Color.RED;
        component.isHidden = true;
        fixture.detectChanges();
        await fixture.whenStable();

        const mouseEventSpy = jasmine.createSpyObj(
            'e',
            {},
            {
                target: null,
            },
        ) as Event;

        component.onMouseDown(mouseEventSpy);

        expect(component.isHidden).toBeTruthy();
    });

    it('should emit color clicked when primary color is clicked', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        const primaryColor = fixture.debugElement.nativeElement.querySelector('#primary');

        const primaryColorClicked = spyOn(component, 'onPrimaryColorClicked');
        primaryColor.dispatchEvent(new Event('click'));
        expect(primaryColorClicked).toHaveBeenCalled();
    });

    it('should emit color clicked when secondary color is clicked', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        const secondaryColor = fixture.debugElement.nativeElement.querySelector('#secondary');

        const sencondaryColorClicked = spyOn(component, 'onSecondaryColorClicked');
        secondaryColor.dispatchEvent(new Event('click'));
        expect(sencondaryColorClicked).toHaveBeenCalled();
    });

    it('should cancel color change if escape is pressed', async () => {
        component.isHidden = false;
        fixture.detectChanges();
        await fixture.whenStable();

        const event = new KeyboardEvent('keypress', {
            key: 'Escape',
        });
        const cancel = spyOn(component, 'cancelSelectedColor');

        keyboardEvent.next(event);

        expect(cancel).toHaveBeenCalled();
    });
});
