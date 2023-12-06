import { Command, MockCommand } from '@app/classes/commands/command';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionMoveService } from '@app/services/tools/selection/move/selection-move.service';
import { SelectionShapeService } from '@app/services/tools/selection/shape/selection-shape.service';
import { SelectionStateService } from '@app/services/tools/selection/state/selection-state.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export class MockSelectionShapeService extends SelectionShapeService {
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        resizeService: ResizeService,
        undoRedoService: jasmine.SpyObj<UndoRedoService>,
        keyEventService: KeyEventService,
        selectionStateService: SelectionStateService,
        gridService: GridService,
    ) {
        super(
            drawingService,
            colorService,
            toolsInfoService,
            changingToolsService,
            resizeService,
            undoRedoService,
            keyEventService,
            selectionStateService,
            gridService,
        );
        this.selectionMoveService = new SelectionMoveService();
    }

    // tslint:disable-next-line: no-empty
    deleteShape(): void {}

    // tslint:disable-next-line: no-empty
    drawPreview(): void {}

    pasteSelection(ctx: CanvasRenderingContext2D): Command {
        return new MockCommand();
    }
}
