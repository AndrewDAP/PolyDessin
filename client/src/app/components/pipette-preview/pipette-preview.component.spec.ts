import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PipettePreviewComponent } from './pipette-preview.component';

describe('PipettePreviewComponent', () => {
    let component: PipettePreviewComponent;
    let fixture: ComponentFixture<PipettePreviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PipettePreviewComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PipettePreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
