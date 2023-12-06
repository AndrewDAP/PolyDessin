import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MagnetGrabHandle } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { MagnetComponent } from './magnet.component';

describe('MagnetComponent', () => {
    let component: MagnetComponent;
    let fixture: ComponentFixture<MagnetComponent>;
    let keyEventService: KeyEventService;
    let toolsInfoService: ToolsInfoService;

    beforeEach(async(() => {
        keyEventService = new KeyEventService();
        toolsInfoService = new ToolsInfoService();
        TestBed.configureTestingModule({
            declarations: [MagnetComponent],
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: ToolsInfoService, useValue: toolsInfoService },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('pressing m should active the magnet', () => {
        component.magnetActive = false;
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'm', ctrlKey: false });
        keyEventService.onKeyDown(event);
        expect(component.magnetActive).toEqual(true);
    });

    it('pressing m+ctrl should not active the magnet', () => {
        component.magnetActive = false;
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'm', ctrlKey: true });
        keyEventService.onKeyDown(event);
        expect(component.magnetActive).toEqual(false);
    });

    it('on magnet handle change should change current handle', () => {
        const spy = spyOn(toolsInfoService, 'setMagnetHandle');
        component.onMagnetHandleChange(MagnetGrabHandle.LowerCenter);
        expect(component.currentChoosenMagnetHandle).toEqual(MagnetGrabHandle.LowerCenter);
        expect(spy).toHaveBeenCalledWith(MagnetGrabHandle.LowerCenter);
    });
});
