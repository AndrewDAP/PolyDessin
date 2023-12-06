/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Color } from '@app/classes/color';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { MaterialModule } from '@app/modules/material.module';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { Subject } from 'rxjs';
import { ColorHexComponent } from './color-hex.component';

describe('ColorHexComponent', () => {
    let component: ColorHexComponent;
    let fixture: ComponentFixture<ColorHexComponent>;
    let colorService: ColorService;
    let keyEventService: KeyEventService;
    const subject: Subject<null> = new Subject<null>();

    beforeEach(async(() => {
        keyEventService = new KeyEventService();
        colorService = new ColorService();
        spyOn(colorService, 'selectedColorChangedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'colorClickedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'emitColorClicked').and.callFake(() => subject.next());
        spyOn(colorService, 'emitSelectedColorChanged').and.callFake(() => subject.next());
        TestBed.configureTestingModule({
            declarations: [ColorHexComponent],
            providers: [
                { provide: ColorService, useValue: colorService },
                { provide: KeyEventService, useValue: keyEventService },
            ],
            imports: [BrowserAnimationsModule, MaterialModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorHexComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not change selected color if the hexcode is invalid', () => {
        const invalidHex1 = '123';
        const invalidHex2 = '123456767768896989789789789789789';
        const invalidHex3 = 'je suis invalid';
        const selectedColor = spyOnProperty(colorService, 'selectedColor', 'set').and.callThrough();
        const onColorChanged = spyOn(component, 'onColorChanged');

        component.hexColorFormControl.setValue(invalidHex1);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();
        expect(selectedColor).not.toHaveBeenCalled();

        component.hexColorFormControl.setValue(invalidHex2);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();

        expect(selectedColor).not.toHaveBeenCalled();

        component.hexColorFormControl.setValue(invalidHex3);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();
        expect(selectedColor).not.toHaveBeenCalled();
    });

    it('should change selected color if the hexcode is valid', () => {
        const validHex1 = '00FF00';
        const validHex2 = 'FF0000';
        const selectedColor = spyOnProperty(colorService, 'selectedColor', 'set').and.callThrough();
        spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(Color.BLUE);
        const onColorChanged = spyOn(component, 'onColorChanged').and.callThrough();

        component.hexColorFormControl.setValue(validHex1);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();
        expect(selectedColor).toHaveBeenCalledWith(Color.GREEN);

        component.hexColorFormControl.setValue(validHex2);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();
        expect(selectedColor).toHaveBeenCalledWith(Color.RED);
    });

    it('should return before changing color if hexColorFormControl invalid', () => {
        const invalidHex = 'je suis invalid';
        const onColorChanged = spyOn(component, 'onColorChanged').and.callThrough();

        component.hexColorFormControl.setValue(invalidHex);
        fixture.detectChanges();
        component.onColorChanged();
        expect(onColorChanged).toHaveBeenCalled();
    });

    it('should change hex text to current selectedColor on init', () => {
        const redHex = 'FF0000';
        const selectedColor = spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(Color.RED);

        expect(component.hexColorFormControl.value).toBe('');

        component.changeHexColor();

        expect(selectedColor).toHaveBeenCalled();
        expect(component.hexColorFormControl.value).toEqual(redHex);
    });

    it('should put DefaultKeyEventMask on focus', () => {
        keyEventService.keyMask = new DefaultKeyEventMask();

        component.onFocus();

        expect(keyEventService.keyMask).toBeInstanceOf(ColorKeyEventMask);
        keyEventService.keyMask = new ColorKeyEventMask();
    });

    it('should put DefaultKeyEventMask on blur', () => {
        keyEventService.keyMask = new ColorKeyEventMask();

        component.onBlur();

        expect(keyEventService.keyMask).toBeInstanceOf(DefaultKeyEventMask);
        keyEventService.keyMask = new DefaultKeyEventMask();
    });
});
