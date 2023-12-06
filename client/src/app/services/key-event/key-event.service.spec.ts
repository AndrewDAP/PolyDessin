import { async, TestBed } from '@angular/core/testing';
import { UndoRedoService } from '@app/services//undo-redo/undo-redo.service';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SaveDrawingService } from '@app/services/drawing/save-drawing.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { ResizeService, Status } from '@app/services/resize/resize.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { TextService } from '@app/services/text/text.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { PaintService } from '@app/services/tools/paint/paint.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService } from '@app/services/tools/selection/change/change-selection.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolType } from '@app/tool-type';
import { Subject } from 'rxjs';

describe('KeyEventService', () => {
    let service: KeyEventService;
    let changingToolService: ChangingToolsService;
    let pencilService: PencilService;
    let newDrawingService: NewDrawingService;
    let saveDrawingService: SaveDrawingService;
    let toolBox: ToolsBoxService;
    let toolsInfoService: ToolsInfoService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let selectionBehaviourServiceSpy: jasmine.SpyObj<SelectionBehaviourService>;
    let event: MouseEvent;

    const isActiveSubject: Subject<boolean> = new Subject();
    beforeEach(async(() => {
        service = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);

        selectionBehaviourServiceSpy = jasmine.createSpyObj('SelectionBehaviourService', [''], {
            isActive: isActiveSubject,
        });
        changingToolService = new ChangingToolsService(service, undoRedoService);

        toolsInfoService = new ToolsInfoService();
        pencilService = new PencilService(
            {} as DrawingService,
            toolsInfoService,
            {} as ColorService,
            changingToolService,
            {} as ResizeService,
            undoRedoService,
        );
        toolBox = new ToolsBoxService(
            changingToolService,
            pencilService,
            {} as LineService,
            {} as EraserService,
            {} as RectangleService,
            {} as EllipseService,
            {} as PipetteService,
            {} as PolygonService,
            selectionBehaviourServiceSpy,
            {} as RectangleSelectionService,
            {} as EllipseSelectionService,
            service,
            {} as ResizeService,
            {} as ChangeSelectionService,
            {} as AerosolService,
            {} as PolygonalLassoService,
            {} as PaintService,
            {} as TextService,
            {} as StampService,
        );

        newDrawingService = new NewDrawingService(
            {} as DrawingService,
            {} as DialogService,
            {} as ResizeService,
            service,
            toolsInfoService,
            undoRedoService,
            {} as LocalStorageService,
            {} as SnackBarService,
        );

        saveDrawingService = new SaveDrawingService(
            {} as DrawingService,
            {} as HttpService,
            service,
            {} as DialogService,
            {} as SnackBarService,
            {} as ToolsInfoService,
        );

        TestBed.configureTestingModule({
            providers: [
                { provide: NewDrawingService, useValue: newDrawingService },
                { provide: SaveDrawingService, useValue: saveDrawingService },
                { provide: ChangingToolsService, useValue: changingToolService },
                { provide: PencilService, useValue: pencilService },
                { provide: ToolsBoxService, useValue: toolBox },
            ],
        }).compileComponents();
        toolBox.currentTool = pencilService;
        service.status = Status.OFF;
        event = {
            clientX: 200,
            clientY: 200,
        } as MouseEvent;

        spyOn(saveDrawingService, 'saveDrawing').and.stub();
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('on wheel event should call next on the subject', () => {
        const spy = spyOn(service.subjectWheelEvent, 'next');
        service.onWheelEvent({} as WheelEvent);
        expect(spy).toHaveBeenCalledWith({} as WheelEvent);
    });

    it(" should call the tool's mouseDown if status is off when receiving a mouseDown event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseDown');
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouseDown if status is not off when receiving a mouseDown event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseDown');
        service.status = Status.HORIZONTAL;
        service.onMouseDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(" should only call the tool's mouseUp() if status is off when receiving a mouseUp event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseUp');
        service.onMouseUp(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onWheelEvent when receiveing a wheel event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onWheelEvent');
        service.onWheelEvent({} as WheelEvent);
        expect(spy).toHaveBeenCalledWith({} as WheelEvent);
    });

    it(" should not call the tool's mouseUp() if status is not off when receiving a mouseUp event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseUp');
        service.status = Status.HORIZONTAL;
        service.onMouseUp(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouseMove() if status is off when receiving a mouseMove event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseMove');
        service.onMouseMove(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouseMove() if status is not off when receiving a mouseMove event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseMove');
        service.status = Status.HORIZONTAL;
        service.onMouseMove(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(" should only call the tool's mouseMoveWindow() if status is off when receiving a mouseMoveWindow event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseMoveWindow');
        service.onMouseMoveWindow(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouseMoveWindow() if status is not off when receiving a mouseMoveWindow event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseMoveWindow');
        service.status = Status.HORIZONTAL;
        service.onMouseMoveWindow(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouseLeave() when receiving a mouseLeave event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseLeave');
        service.onMouseLeave(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouseEnter() when receiving a mouseEnter event", () => {
        const spy: jasmine.Spy = spyOn(pencilService, 'onMouseEnter');
        service.onMouseEnter(event);
        expect(spy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onKeyDownShift() when receiving a KeyDown event with shift key", () => {
        testKey('Shift', 'onKeyDownShift', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownDownArrow() when receiving a KeyDown event with arrow down", () => {
        testKey('ArrowDown', 'onKeyDownDownArrow', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownUpArrow() when receiving a KeyDown event with arrow up", () => {
        testKey('ArrowUp', 'onKeyDownUpArrow', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownLeftArrow() when receiving a KeyDown event with arrow left", () => {
        testKey('ArrowLeft', 'onKeyDownLeftArrow', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownRightArrow() when receiving a KeyDown event with arrow right", () => {
        testKey('ArrowRight', 'onKeyDownRightArrow', service, pencilService, true);
    });

    it(" should call the tool's onKeyUpDownArrow() when receiving a KeyUp event with arrow down", () => {
        testKey('ArrowDown', 'onKeyUpDownArrow', service, pencilService, false);
    });

    it(" should call the tool's onKeyUpUpArrow() when receiving a KeyUp event with arrow up", () => {
        testKey('ArrowUp', 'onKeyUpUpArrow', service, pencilService, false);
    });

    it(" should call the tool's onKeyUpLeftArrow() when receiving a KeyUp event with arrow left", () => {
        testKey('ArrowLeft', 'onKeyUpLeftArrow', service, pencilService, false);
    });

    it(" should call the tool's onKeyUpRightArrow() when receiving a KeyUp event with arrow right", () => {
        testKey('ArrowRight', 'onKeyUpRightArrow', service, pencilService, false);
    });

    it(" should call the tool's onKeyDownEscape() when receiving a KeyDown event with escape key", () => {
        testKey('Escape', 'onKeyDownEscape', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownBackSpace() when receiving a KeyDown event with backspace key", () => {
        testKey('Backspace', 'onKeyDownBackSpace', service, pencilService, true);
    });

    it(" should call the tool's onKeyDownDelete() when receiving a KeyDown event with delete key", () => {
        testKey('Delete', 'onKeyDownDelete', service, pencilService, true);
    });

    it(' should change the tool to pencil when receiving a KeyDown event with c key', () => {
        testChangingTool('c', ToolType.pencil, service, changingToolService);
    });

    it(' should change the tool to rectangle when receiving a KeyDown event with key 1', () => {
        testChangingTool('1', ToolType.rectangle, service, changingToolService);
    });

    it(' should not change the tool to rectangle when receiving a KeyDown event with ctrl+1', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '1', ctrlKey: true });
        service.onKeyDown(keyEvent);
        const changingToolSpy = spyOn(changingToolService, 'setTool');

        expect(changingToolSpy).toHaveBeenCalledTimes(0);
    });

    it(' should change the tool to ellipse when receiving a KeyDown event with key 2', () => {
        testChangingTool('2', ToolType.ellipse, service, changingToolService);
    });

    it(' should change the tool to polygon when receiving a KeyDown event with key 3', () => {
        testChangingTool('3', ToolType.polygon, service, changingToolService);
    });

    it(' should change the tool to line when receiving a KeyDown event with l key', () => {
        testChangingTool('l', ToolType.line, service, changingToolService);
    });

    it(' should change the tool to eraser when receiving a KeyDown event with e key ', () => {
        testChangingTool('e', ToolType.eraser, service, changingToolService);
    });

    it(' should not process a keyDown() when receiving a KeyDown event with an untreated key value ', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '~' });
        service.onKeyDown(keyEvent);
        const changingToolSpy = spyOn(changingToolService, 'setTool');

        expect(changingToolSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's onKeyUpShift() when receiving a keyUp event", () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'Shift' });
        const spy: jasmine.Spy = spyOn(pencilService, 'onKeyUpShift');
        service.onKeyUp(keyEvent);
        expect(spy).toHaveBeenCalled();
    });

    it(' should not process a onKeyUp() when receiving aa onKeyUp() with an untreated key value', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: '~' });
        const spy: jasmine.Spy = spyOn(pencilService, 'onKeyUpShift');
        service.onKeyUp(keyEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should create a new drawing when receiving a keyUp event (ctrl + o)', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'o', ctrlKey: true });
        const spy = spyOn(newDrawingService, 'createNewDrawing');
        service.onKeyDown(keyEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should not create a new drawing when receiving a keyUp event (only o)', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'o', ctrlKey: false });
        const spy = spyOn(newDrawingService, 'createNewDrawing');
        service.onKeyDown(keyEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('getMouseEvent should throw an error if the key is not valid', () => {
        service.getMouseEvent('g').subscribe(
            () => {
                fail('expected error');
            },
            (error) => {
                expect(error).toBe("Key doesn't exist");
            },
        );
    });
});
const testKey = (keyPress: string, eventToCall: string, service: KeyEventService, pencilService: PencilService, isKeyDown: boolean): void => {
    const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: keyPress });
    const spy: jasmine.Spy = spyOn(pencilService, eventToCall as never);
    isKeyDown ? service.onKeyDown(keyEvent) : service.onKeyUp(keyEvent);
    expect(spy).toHaveBeenCalled();
};

const testChangingTool = (keyPress: string, expectedTool: ToolType, service: KeyEventService, changingToolService: ChangingToolsService): void => {
    const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: keyPress });
    const changingToolSpy = spyOn(changingToolService, 'setTool');
    service.onKeyDown(keyEvent);
    expect(changingToolSpy).toHaveBeenCalledWith(expectedTool);
};
