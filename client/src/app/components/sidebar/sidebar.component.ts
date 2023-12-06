import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ExportDrawingService } from '@app/services/drawing/export-drawing.service';
import { SaveDrawingService } from '@app/services/drawing/save-drawing.service';
import { LocationService } from '@app/services/location/location.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { PaintService } from '@app/services/tools/paint/paint.service';
import { ToolType } from '@app/tool-type';

export interface SidebarInformation {
    tooltype: ToolType;
    src: string;
    alt: string;
    matTooltip: string;
    hidden: boolean;
}

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    newDrawingInformation: string = 'Nouveau dessin [ CTRL + O ]';
    exportDrawingInformation: string = 'Exporter le dessin [CTRL + E]';
    saveDrawingInformation: string = 'Sauvegarder un dessin [ CTRL + S ]';

    currentTool: ToolType;

    leftColumnInformation: SidebarInformation[] = [
        { tooltype: ToolType.pencil, src: 'assets/tools/pencil.svg', alt: 'Crayon', matTooltip: 'Crayon [ C ]', hidden: false },

        { tooltype: ToolType.eraser, src: 'assets/tools/eraser.svg', alt: 'Efface', matTooltip: 'Efface [ E ]', hidden: false },
        { tooltype: ToolType.line, src: 'assets/tools/line.svg', alt: 'Ligne', matTooltip: 'Ligne [ L ]', hidden: false },

        {
            tooltype: ToolType.rectangle,
            src: 'assets/tools/rectangle.svg',
            alt: 'Rectangle',
            matTooltip: 'Rectangle [ 1 ]',
            hidden: false,
        },
        { tooltype: ToolType.ellipse, src: 'assets/tools/ellipse.svg', alt: 'Ellipse', matTooltip: 'Ellipse [ 2 ]', hidden: false },
        { tooltype: ToolType.polygon, src: 'assets/tools/polygon.svg', alt: 'Polygone', matTooltip: 'Polygone [ 3 ]', hidden: false },
    ];
    rightColumnInformation: SidebarInformation[] = [
        { tooltype: ToolType.paint, src: 'assets/tools/paint.svg', alt: 'Peinture', matTooltip: 'Sceau de peinture [ B ]', hidden: false },
        { tooltype: ToolType.aerosol, src: 'assets/tools/spray.svg', alt: 'Aerosol', matTooltip: 'Aérosol [ A ]', hidden: false },
        {
            tooltype: ToolType.text,
            src: 'assets/tools/text.svg',
            alt: 'Text',
            matTooltip: 'Dessiner une boîte de texte [ T ]',
            hidden: false,
        },
        { tooltype: ToolType.stamp, src: 'assets/tools/stamp.png', alt: 'Etampe', matTooltip: 'Étampe [ D ]', hidden: false },
        { tooltype: ToolType.pipette, src: 'assets/tools/pipette.png', alt: 'Pipette', matTooltip: 'Pipette [ I ]', hidden: false },
    ];

    constructor(
        private changingToolsService: ChangingToolsService,
        private newDrawingService: NewDrawingService,
        private exportDrawingService: ExportDrawingService,
        public saveDrawingService: SaveDrawingService,
        private location: Location,
        public locationService: LocationService,
        public paintService: PaintService,
        public toolsInfoService: ToolsInfoService,
    ) {
        this.changingToolsService.getTool().subscribe((tool) => {
            this.currentTool = tool;
        });

        this.currentTool = ToolType.pencil;
    }

    get tooltype(): typeof ToolType {
        return ToolType;
    }

    onToolChanged(tool: ToolType): void {
        this.changingToolsService.setTool(tool);
    }

    onNewDrawing(): void {
        this.newDrawingService.createNewDrawing();
    }

    onSaveDrawing(): void {
        this.saveDrawingService.saveDrawing();
    }

    onExportDrawing(): void {
        this.exportDrawingService.exportDrawing();
    }

    back(): void {
        if (this.locationService.openEditorFromMainPage) {
            this.location.back();
            this.locationService.openEditorFromMainPage = false;
        }
    }
}
