/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSwatchComponent } from '@app/components/color/color-swatch/color-swatch.component';
import { ColorHistoryComponent } from './color-history.component';

describe('ColorHistoryComponent', () => {
    let component: ColorHistoryComponent;
    let fixture: ComponentFixture<ColorHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorHistoryComponent, ColorSwatchComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
