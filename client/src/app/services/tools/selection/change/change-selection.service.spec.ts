import { TestBed } from '@angular/core/testing';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { ChangeSelectionService, Mode } from './change-selection.service';

describe('ChangeSelectionService', () => {
    let service: ChangeSelectionService;
    let undoRedoService: jasmine.SpyObj<UndoRedoService>;
    let keyEventService: KeyEventService;
    let changingToolService: ChangingToolsService;

    beforeEach(() => {
        keyEventService = new KeyEventService();
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolService = new ChangingToolsService(keyEventService, undoRedoService);
        TestBed.configureTestingModule({
            providers: [{ provide: ChangingToolsService, useValue: changingToolService }],
        });
        service = TestBed.inject(ChangeSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change mode to Rectangle when tool is changed to rectangle selection', (done: DoneFn) => {
        service.mode.subscribe((value) => {
            expect(value).toEqual(Mode.Rectangle);
        });
        changingToolService.setTool(ToolType.rectangleSelection);
        done();
    });

    it('should change mode to Ellipse when tool is changed to ellipse selection', (done: DoneFn) => {
        service.mode.subscribe((value) => {
            expect(value).toEqual(Mode.Ellipse);
        });
        changingToolService.setTool(ToolType.ellipseSelection);
        done();
    });

    it('should change mode to PolygonalLasso when tool is changed to polygonal lasso selection', (done: DoneFn) => {
        service.mode.subscribe((value) => {
            expect(value).toEqual(Mode.PolygonalLasso);
        });
        changingToolService.setTool(ToolType.lassoPolygonal);
        done();
    });
});
