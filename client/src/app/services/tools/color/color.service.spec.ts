import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorService } from './color.service';

describe('ColorService', () => {
    let service: ColorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit a change in selected color when selected color is primary', () => {
        service.selectedColorIsPrimary = true;
        let selectedColor: Color = Color.BLACK;
        service.selectedColorChangedListener().subscribe(() => (selectedColor = service.selectedColor));

        expect(selectedColor).toEqual(Color.BLACK);
        service.selectedColor = Color.WHITE;
        expect(selectedColor).toEqual(Color.WHITE);
    });

    it('should emit a change in selected color when when selected color is secondary', () => {
        service.selectedColorIsPrimary = false;
        let selectedColor: Color = Color.BLACK;
        service.selectedColorChangedListener().subscribe(() => (selectedColor = service.selectedColor));

        expect(selectedColor).toEqual(Color.BLACK);
        service.selectedColor = Color.WHITE;
        expect(selectedColor).toEqual(Color.WHITE);
    });

    it('should emit a change in color when when color change', () => {
        service.selectedColorIsPrimary = true;
        let color: Color = Color.BLACK;
        service.colorChangedListener().subscribe(() => (color = service.primaryColor));

        expect(color).toEqual(Color.BLACK);
        service.primaryColor = Color.WHITE;
        expect(color).toEqual(Color.WHITE);
    });

    it('should not emit a change in selected color when setting primary color and selected color is secondary', () => {
        service.selectedColorIsPrimary = false;
        const emitSelectedColorChanged = spyOn(service, 'emitSelectedColorChanged').and.callThrough();
        service.primaryColor = Color.WHITE;
        expect(emitSelectedColorChanged).not.toHaveBeenCalled();
    });

    it('should not emit a change in selected color when setting secondary color and selected color is primary', () => {
        service.selectedColorIsPrimary = true;
        const emitSelectedColorChanged = spyOn(service, 'emitSelectedColorChanged').and.callThrough();
        service.secondaryColor = Color.WHITE;
        expect(emitSelectedColorChanged).not.toHaveBeenCalled();
    });

    it('should swap colors', () => {
        expect(service.primaryColor).toEqual(Color.BLACK);
        expect(service.secondaryColor).toEqual(Color.WHITE);
        service.swapPrimaryAndSecondaryColors();
        expect(service.primaryColor).toEqual(Color.WHITE);
        expect(service.secondaryColor).toEqual(Color.BLACK);
    });

    it('should emit a color clicked event', () => {
        service.selectedColorIsPrimary = true;
        let colorWasClicked = false;
        service.colorClickedListener().subscribe(() => (colorWasClicked = true));

        expect(colorWasClicked).toBeFalse();
        service.emitColorClicked();
        expect(colorWasClicked).toBeTrue();
    });

    it('should emit a color clicked event with primary color clicked', () => {
        service.selectedColorIsPrimary = false;
        let colorWasClicked = false;
        service.colorClickedListener().subscribe(() => (colorWasClicked = true));

        expect(colorWasClicked).toBeFalse();
        service.primaryColorClicked();
        expect(colorWasClicked).toBeTrue();
    });

    it('should emit a color clicked event with secondary color clicked', () => {
        service.selectedColorIsPrimary = true;
        let colorWasClicked = false;
        service.colorClickedListener().subscribe(() => (colorWasClicked = true));

        expect(colorWasClicked).toBeFalse();
        service.secondaryColorClicked();
        expect(colorWasClicked).toBeTrue();
    });
});
