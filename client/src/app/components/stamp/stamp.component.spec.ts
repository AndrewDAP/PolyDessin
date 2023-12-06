import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { StampComponent } from './stamp.component';

describe('StampComponent', () => {
    let component: StampComponent;
    let fixture: ComponentFixture<StampComponent>;
    let stampService: StampService;
    let changingToolService: ChangingToolsService;
    let keyEventService: KeyEventService;
    let toolInfoService: ToolsInfoService;

    beforeEach(async(() => {
        keyEventService = new KeyEventService();
        toolInfoService = new ToolsInfoService();
        changingToolService = new ChangingToolsService(keyEventService, {} as UndoRedoService);
        stampService = new StampService(
            {} as DrawingService,
            toolInfoService,
            changingToolService,
            {} as ResizeService,
            {} as UndoRedoService,
            keyEventService,
        );

        TestBed.configureTestingModule({
            declarations: [StampComponent],
            providers: [{ StampService, useValue: stampService }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampComponent);
        stampService = TestBed.inject(StampService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('on ratio change should give the good value to the ratio', async () => {
        await fixture.whenStable();
        component.onRatioChanged(2);
        expect(stampService.ratio).toEqual(2);
    });

    it('on angle change should give the good value to the angle', async () => {
        await fixture.whenStable();
        component.onAngleChanged(2);
        expect(stampService.angle).toEqual(2);
    });

    it('on stampChoice change should give the good value to the stampChoice', async () => {
        await fixture.whenStable();
        component.onStampChanged(2);
        expect(stampService.stampChoice).toEqual(2);
    });
});
