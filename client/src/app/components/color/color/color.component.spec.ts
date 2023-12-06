/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/tools/color/color.service';
import { ColorComponent } from './color.component';

describe('ColorComponent', () => {
    let component: ColorComponent;
    let fixture: ComponentFixture<ColorComponent>;
    let colorService: ColorService;

    beforeEach(async(() => {
        colorService = new ColorService();
        TestBed.configureTestingModule({
            declarations: [ColorComponent],
            providers: [{ provide: ColorService, useValue: colorService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should switch colors when the switch button is clicked', () => {
        const colorSwitchButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#switch-colors');
        const basePrimaryColor = Color.BLACK;
        const baseSecondaryColor = Color.WHITE;

        expect(colorService.primaryColor).toEqual(basePrimaryColor);
        expect(colorService.secondaryColor).toEqual(baseSecondaryColor);
        colorSwitchButton.click();
        expect(colorService.primaryColor).toEqual(baseSecondaryColor);
        expect(colorService.secondaryColor).toEqual(basePrimaryColor);
    });

    it('should switch colors when the switch button is clicked and selected color is secondary', () => {
        colorService.selectedColorIsPrimary = false;
        const colorSwitchButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#switch-colors');
        const basePrimaryColor = Color.BLACK;
        const baseSecondaryColor = Color.WHITE;

        expect(colorService.primaryColor).toEqual(basePrimaryColor);
        expect(colorService.secondaryColor).toEqual(baseSecondaryColor);
        colorSwitchButton.click();
        expect(colorService.primaryColor).toEqual(baseSecondaryColor);
        expect(colorService.secondaryColor).toEqual(basePrimaryColor);
    });

    it('should emit color clicked when primary color is clicked', () => {
        const primaryColor: SVGElement = fixture.debugElement.nativeElement.querySelector('#primary-color');

        const colorClicked = spyOn(colorService, 'primaryColorClicked');
        primaryColor.dispatchEvent(new Event('click'));
        expect(colorClicked).toHaveBeenCalled();
    });

    it('should emit color clicked when secondary color is clicked', () => {
        const secondaryColor: SVGElement = fixture.debugElement.nativeElement.querySelector('#secondary-color');

        const colorClicked = spyOn(colorService, 'secondaryColorClicked');
        secondaryColor.dispatchEvent(new Event('click'));
        expect(colorClicked).toHaveBeenCalled();
    });
});
