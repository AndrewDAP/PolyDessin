import { Component } from '@angular/core';
import {
    DEFAULT_DROPLET_SIZE,
    DEFAULT_DROPLET_SPEED,
    DEFAULT_OPACITY_CANVAS,
    DEFAULT_SQUARE_GRID_SIZE,
    DEFAULT_TOOL_SIZE,
    MAX_SIDES,
    MAX_SLIDER_SIZE_OPACITY,
    MAX_SLIDER_SQUARE_GRID_SIZE,
    MIN_SIDES,
    MIN_SLIDER_SIZE_OPACITY,
    // lint and prettier in opposition -> one want to add ",", the other want to remove it.
    // tslint:disable-next-line: prettier
    MIN_SLIDER_SQUARE_GRID_SIZE
} from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SaveDrawingService } from '@app/services/drawing/save-drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { PaintService } from '@app/services/tools/paint/paint.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { SelectionLogicService } from '@app/services/tools/selection/logic/selection-logic.service';
import { SelectionStateService, State } from '@app/services/tools/selection/state/selection-state.service';
import { ToolType } from '@app/tool-type';

const MIN_SLIDER_SIZE_ERASER = 5;
const MIN_SLIDER_SIZE = 1;
const MAX_SLIDER_SIZE = 40;
@Component({
    selector: 'app-sidebar-properties',
    templateUrl: './sidebar-properties.component.html',
    styleUrls: ['./sidebar-properties.component.scss'],
})
export class SidebarPropertiesComponent {
    currentTool: ToolType;

    showPipettePreview: boolean;

    showGridCanvas: boolean = false;
    opacityCanvas: number = DEFAULT_OPACITY_CANVAS;
    squareSizeCanvas: number = DEFAULT_SQUARE_GRID_SIZE;
    minSliderOpacity: number = MIN_SLIDER_SIZE_OPACITY;
    maxSliderOpacity: number = MAX_SLIDER_SIZE_OPACITY;
    minSliderSquareSize: number = MIN_SLIDER_SQUARE_GRID_SIZE;
    maxSliderSquareSize: number = MAX_SLIDER_SQUARE_GRID_SIZE;

    mode: Mode;
    minSliderSize: number = MIN_SLIDER_SIZE;
    maxSliderSize: number = MAX_SLIDER_SIZE;
    showLineJunction: boolean = false;

    currentToolSize: number = DEFAULT_TOOL_SIZE;
    junctionSize: number = DEFAULT_TOOL_SIZE;
    dropletSize: number = DEFAULT_DROPLET_SIZE;
    dropletSpeed: number = DEFAULT_DROPLET_SPEED;
    sides: number = MIN_SIDES;
    minSidesSlider: number = MIN_SIDES;
    maxSidesSlider: number = MAX_SIDES;
    withFill: boolean = true;
    withStroke: boolean = false;

    clipboardHasData: boolean = false;
    validTool: boolean = false;
    selectionIdle: boolean = false;

    constructor(
        private changingToolsService: ChangingToolsService,
        public toolsInfoService: ToolsInfoService,
        public saveDrawingService: SaveDrawingService,
        private pipetteService: PipetteService,
        private changeSelectionService: ChangeSelectionService,
        public paintService: PaintService,
        private clipboardService: ClipboardService,
        private selectionStateService: SelectionStateService,
    ) {
        this.changingToolsService.getTool().subscribe((tool) => {
            this.currentTool = tool;
            this.minSliderSize = this.currentTool === ToolType.eraser ? MIN_SLIDER_SIZE_ERASER : MIN_SLIDER_SIZE;
            this.currentToolSize = this.toolsInfoService.toolSize.get(this.currentTool) as number;
            this.toolsInfoService.getSizeOf(this.currentTool).subscribe((size) => {
                this.currentToolSize = size;
            });
            this.pipetteService.previewObservable().subscribe((value) => {
                this.showPipettePreview = value;
            });
            this.validTool = tool === ToolType.rectangleSelection || tool === ToolType.ellipseSelection || tool === ToolType.lassoPolygonal;
        });
        this.changeSelectionService.modeObserver().subscribe((mode: Mode) => {
            this.mode = mode;
        });

        this.clipboardService.contentObserver().subscribe((hasData) => {
            this.clipboardHasData = hasData !== undefined;
        });

        this.selectionStateService.stateObserver().subscribe((state: State) => {
            this.selectionIdle = this.validTool && state === State.IDLE;
        });

        this.toolsInfoService.getShowGridCanvas().subscribe((showCanvas: boolean) => {
            this.showGridCanvas = showCanvas;
        });

        this.toolsInfoService.getSizeSquareCanvas().subscribe((size: number) => {
            this.squareSizeCanvas = size;
        });

        this.currentTool = ToolType.pencil;
    }

    get tooltype(): typeof ToolType {
        return ToolType;
    }

    onToolChanged(tool: ToolType): void {
        this.changingToolsService.setTool(tool);
    }

    onSizeChanged(size: number): void {
        this.toolsInfoService.setSizeOf(this.currentTool, size);
    }

    onSizeChangedOfJunction(size: number): void {
        this.toolsInfoService.setSizeOfJunction(size);
        this.junctionSize = size;
    }

    onSizeChangedOfDroplet(size: number): void {
        this.dropletSize = size;
        this.toolsInfoService.setSizeOfDroplet(size);
    }

    onChangedOfDropletSpeed(speed: number): void {
        this.dropletSpeed = speed;
        this.toolsInfoService.setSpeedOfDroplet(speed);
    }

    onJunctionToggle(): void {
        this.showLineJunction = !this.showLineJunction;
        this.toolsInfoService.setShouldDrawJunction(this.showLineJunction);
    }

    selectAll(): void {
        this.changingToolsService.setTool(ToolType.rectangleSelection);
        (this.changeSelectionService.selectionMap.get(this.mode) as SelectionLogicService).selectAll();
    }

    paste(): void {
        this.clipboardService.pasteSelection();
    }

    copy(): void {
        this.clipboardService.copySelection();
    }

    cut(): void {
        this.clipboardService.cutSelection();
    }

    delete(): void {
        const selection = this.changeSelectionService.selectionMap.get(this.mode) as SelectionLogicService;
        if (this.selectionIdle) {
            selection.onKeyDownDelete();
        }
    }

    setSides(sides: number): void {
        this.sides = sides;
        this.toolsInfoService.setSides(sides);
    }

    setFillStyle(fill: boolean, stroke: boolean): void {
        this.withFill = fill;
        this.withStroke = stroke;
        this.toolsInfoService.setWithFill(this.withFill);
        this.toolsInfoService.setWithStroke(this.withStroke);
    }

    onJunctionToogleShowCanvas(): void {
        this.toolsInfoService.setShowGridCanvas(!this.showGridCanvas);
    }

    onChangedOfOpacity(opacity: number): void {
        this.opacityCanvas = opacity;
        this.toolsInfoService.setOpacityCanvas(opacity);
    }

    onChangedOfSquareSize(squareSize: number): void {
        this.toolsInfoService.setSizeSquareCanvas(squareSize);
    }
}
