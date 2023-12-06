/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { MaterialModule } from '@app/modules/material.module';
import { ColorService } from '@app/services/tools/color/color.service';
import { ColorSwatchComponent } from './color-swatch.component';

describe('ColorSwatchComponent', () => {
    let component: ColorSwatchComponent;
    let fixture: ComponentFixture<ColorSwatchComponent>;

    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    beforeEach(async(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', ['emitSelectedColorChanged', 'selectedColor']);
        TestBed.configureTestingModule({
            declarations: [ColorSwatchComponent],
            providers: [{ provide: ColorService, useValue: colorServiceSpyObj }],
            imports: [MaterialModule],
        }).compileComponents();
        component = TestBed.createComponent(ColorSwatchComponent).componentInstance;
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSwatchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set primary color to the swatch color', () => {
        colorServiceSpyObj.primaryColor = Color.BLACK;

        component.swatchColor = Color.WHITE;

        expect(colorServiceSpyObj.primaryColor).toEqual(Color.BLACK);
        component.onLeftClick();
        expect(colorServiceSpyObj.primaryColor).toEqual(component.swatchColor);
    });

    it('should set secondary color to the swatch color', () => {
        const e = jasmine.createSpyObj('e', ['preventDefault']);
        colorServiceSpyObj.secondaryColor = Color.BLACK;

        component.swatchColor = Color.WHITE;

        expect(colorServiceSpyObj.secondaryColor).toEqual(Color.BLACK);
        component.onRightClick(e);
        expect(colorServiceSpyObj.secondaryColor).toEqual(component.swatchColor);
    });
});
