import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { State } from '@app/services/tools/selection/state/selection-state.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Subject } from 'rxjs';
import { SelectionComponent } from './selection.component';

describe('SelectionComponent', () => {
    let component: SelectionComponent;
    let fixture: ComponentFixture<SelectionComponent>;

    let selectionBehaviourServiceSpy: jasmine.SpyObj<SelectionBehaviourService>;
    let changeSelectionService: ChangeSelectionService;
    let rectangleSelectionSpy: jasmine.SpyObj<RectangleSelectionService>;
    let ellipseSelectionSpy: jasmine.SpyObj<EllipseSelectionService>;
    let polygonalLassoSpy: jasmine.SpyObj<PolygonalLassoService>;
    let changingToolsService: jasmine.SpyObj<ChangingToolsService>;

    const toolTypeSubject: Subject<ToolType> = new Subject();
    const modeSubject: BehaviorSubject<Mode> = new BehaviorSubject(Mode.Rectangle);
    beforeEach(async(() => {
        rectangleSelectionSpy = jasmine.createSpyObj('RectangleSelectionService', ['changeState', 'onKeyDownEscape'], {
            dimension: { x: 0, y: 0 } as Vec2,
            selectionPos: { x: 0, y: 0 } as Vec2,
            state: State.OFF,
        });
        ellipseSelectionSpy = jasmine.createSpyObj('EllipseSelectionService', ['changeState', 'onKeyDownEscape'], {
            dimension: { x: 0, y: 0 } as Vec2,
            selectionPos: { x: 0, y: 0 } as Vec2,
            state: State.OFF,
        });
        polygonalLassoSpy = jasmine.createSpyObj('PolygonalLassoService', ['changeState', 'onKeyDownEscape'], {
            dimension: { x: 0, y: 0 } as Vec2,
            selectionPos: { x: 0, y: 0 } as Vec2,
            state: State.OFF,
        });

        changingToolsService = jasmine.createSpyObj('ChangingToolsService', ['setTool', 'getTool']);
        changingToolsService.getTool.and.returnValue(toolTypeSubject.asObservable());

        changeSelectionService = new ChangeSelectionService(changingToolsService, rectangleSelectionSpy, ellipseSelectionSpy, polygonalLassoSpy);

        selectionBehaviourServiceSpy = jasmine.createSpyObj('SelectionService', ['changeState']);
        TestBed.configureTestingModule({
            declarations: [SelectionComponent],
            providers: [
                { provide: SelectionBehaviourService, useValue: selectionBehaviourServiceSpy },
                { provide: ChangeSelectionService, useValue: changeSelectionService },
                { provide: RectangleSelectionService, useValue: rectangleSelectionSpy },
                { provide: ChangingToolsService, useValue: changingToolsService },
            ],
        }).compileComponents();

        spyOn(changeSelectionService, 'modeObserver').and.returnValue(modeSubject.asObservable());

        changeSelectionService.selectionMap = new Map();
        changeSelectionService.selectionMap.set(Mode.Rectangle, rectangleSelectionSpy);
        changeSelectionService.selectionMap.set(Mode.Ellipse, ellipseSelectionSpy);
        changeSelectionService.selectionMap.set(Mode.PolygonalLasso, polygonalLassoSpy);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to the mode after calling ngOnInit', async () => {
        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        modeSubject.next(Mode.Ellipse);
        expect(changeSelectionService.modeObserver).toHaveBeenCalled();
        expect(component.mode).toEqual(modeSubject.value);
    });

    it('should call Rectangles onKeyDownEscape when switching tool and rectangle is active', async () => {
        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        modeSubject.next(Mode.Rectangle);
        toolTypeSubject.next(ToolType.pencil);
        expect(rectangleSelectionSpy.onKeyDownEscape).toHaveBeenCalled();
    });

    it('should call Ellipse onKeyDownEscape when switching tool and ellipse is active', async () => {
        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        modeSubject.next(Mode.Rectangle);
        toolTypeSubject.next(ToolType.pencil);
        expect(rectangleSelectionSpy.onKeyDownEscape).toHaveBeenCalled();
    });

    it('should call the current tools changeState when calling the components setState', async () => {
        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        modeSubject.next(Mode.Rectangle);
        component.setState(1);
        expect(rectangleSelectionSpy.changeState).toHaveBeenCalled();

        modeSubject.next(Mode.Ellipse);
        component.setState(1);
        expect(ellipseSelectionSpy.changeState).toHaveBeenCalled();
    });
});
