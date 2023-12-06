import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/modules/material.module';
import { ShowUrlComponent } from './show-url.component';

describe('ShowUrlComponent', () => {
    let component: ShowUrlComponent;
    let fixture: ComponentFixture<ShowUrlComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ShowUrlComponent],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShowUrlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
