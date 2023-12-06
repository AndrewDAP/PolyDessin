import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { TextService } from '@app/services/text/text.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PaintService } from '@app/services/tools/paint/paint.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class ToolsBoxService {
    tools: Map<ToolType, Tool> = new Map();
    currentTool: Tool;

    constructor(
        private changingToolsService: ChangingToolsService,
        private pencilService: PencilService,
        private lineService: LineService,
        private eraserService: EraserService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private pipetteService: PipetteService,
        private polygonService: PolygonService,
        private selectionBehaviourService: SelectionBehaviourService,
        private rectangleSelectionService: RectangleSelectionService,
        private ellipseSelectionService: EllipseSelectionService,
        private keyEventService: KeyEventService,
        private resizeService: ResizeService,
        private changeSelectionService: ChangeSelectionService,
        private aerosolService: AerosolService,
        private polygonalLassoService: PolygonalLassoService,
        private paintService: PaintService,
        private textService: TextService,
        private stampService: StampService,
    ) {
        this.tools.set(ToolType.pencil, this.pencilService);
        this.tools.set(ToolType.eraser, this.eraserService);
        this.tools.set(ToolType.line, this.lineService);
        this.tools.set(ToolType.rectangle, this.rectangleService);
        this.tools.set(ToolType.ellipse, this.ellipseService);
        this.tools.set(ToolType.pipette, this.pipetteService);
        this.tools.set(ToolType.polygon, this.polygonService);
        this.tools.set(ToolType.rectangleSelection, this.rectangleSelectionService);
        this.tools.set(ToolType.ellipseSelection, this.ellipseSelectionService);
        this.tools.set(ToolType.aerosol, this.aerosolService);
        this.tools.set(ToolType.lassoPolygonal, this.polygonalLassoService);
        this.tools.set(ToolType.paint, this.paintService);
        this.tools.set(ToolType.text, this.textService);
        this.tools.set(ToolType.stamp, this.stampService);

        this.changingToolsService.getTool().subscribe((tool) => {
            switch (tool) {
                case ToolType.rectangleSelection: {
                    this.onSelection(true);
                    this.changeSelectionService.mode.next(Mode.Rectangle);
                    break;
                }
                case ToolType.ellipseSelection: {
                    this.onSelection(true);
                    this.changeSelectionService.mode.next(Mode.Ellipse);
                    break;
                }
                case ToolType.lassoPolygonal: {
                    this.onSelection(true);
                    this.changeSelectionService.mode.next(Mode.PolygonalLasso);
                    break;
                }
                default: {
                    this.onSelection(false);
                }
            }
            this.currentTool = this.tools.get(tool) as Tool;
            keyEventService.currentTool = tool;
        });
        this.keyEventService.getMouseEvent('onMouseMove').subscribe((mouseEvent) => {
            this.currentTool.onMouseMove(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseMoveWindow').subscribe((mouseEvent) => {
            this.currentTool.onMouseMoveWindow(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseDown').subscribe((mouseEvent) => {
            this.currentTool.onMouseDown(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseUp').subscribe((mouseEvent) => {
            this.currentTool.onMouseUp(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseLeave').subscribe((mouseEvent) => {
            this.currentTool.onMouseLeave(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseEnter').subscribe((mouseEvent) => {
            this.currentTool.onMouseEnter(mouseEvent);
        });
        this.keyEventService.getKeyDownEvent('Backspace').subscribe(() => {
            this.currentTool.onKeyDownBackSpace();
        });
        this.keyEventService.getKeyDownEvent('Escape').subscribe(() => {
            this.currentTool.onKeyDownEscape();
        });
        this.keyEventService.getKeyDownEvent('Shift').subscribe(() => {
            this.currentTool.onKeyDownShift();
        });
        this.keyEventService.getKeyUpEvent('Shift').subscribe(() => {
            this.currentTool.onKeyUpShift();
        });
        this.keyEventService.getKeyDownEvent('Delete').subscribe(() => {
            this.currentTool.onKeyDownDelete();
        });
        this.keyEventService.getKeyDownEvent('ArrowUp').subscribe(() => {
            this.currentTool.onKeyDownUpArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowDown').subscribe(() => {
            this.currentTool.onKeyDownDownArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowLeft').subscribe(() => {
            this.currentTool.onKeyDownLeftArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowRight').subscribe(() => {
            this.currentTool.onKeyDownRightArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowUp').subscribe(() => {
            this.currentTool.onKeyUpUpArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowDown').subscribe(() => {
            this.currentTool.onKeyUpDownArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowLeft').subscribe(() => {
            this.currentTool.onKeyUpLeftArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowRight').subscribe(() => {
            this.currentTool.onKeyUpRightArrow();
        });

        this.keyEventService.getWheelEvent().subscribe((wheelEvent: WheelEvent) => {
            this.currentTool.onWheelEvent(wheelEvent);
        });
    }

    onSelection(isSelection: boolean): void {
        // Disable the resizeService
        this.resizeService.isActive = !isSelection;
        // Enable the selectionService
        this.selectionBehaviourService.isActive.next(isSelection);
    }
}
