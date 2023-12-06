import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselToolComponent } from '@app/components/carousel/carousel-tool/carousel-tool.component';
import { ColorComponent } from '@app/components/color/color/color.component';
import { SidebarPropertiesComponent } from '@app/components/sidebar-properties/sidebar-properties.component';
import { UndoRedoComponent } from '@app/components/undo-redo/undo-redo.component';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ExportDrawingService } from '@app/services/drawing/export-drawing.service';
import { SaveDrawingService } from '@app/services/drawing/save-drawing.service';
import { LocationService } from '@app/services/location/location.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { ChangeSelectionService } from '@app/services/tools/selection/change/change-selection.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { ToolType } from '@app/tool-type';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let changingTool: ChangingToolsService;
    let toolsInfoService: ToolsInfoService;
    let newDrawingService: NewDrawingService;
    let saveDrawingService: SaveDrawingService;
    let locationService: LocationService;
    let location: Location;
    let exportDrawingService: ExportDrawingService;
    let changeSelectionService: ChangeSelectionService;
    let clipboardService: ClipboardService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarComponent, ColorComponent, UndoRedoComponent, CarouselToolComponent, SidebarPropertiesComponent],
            providers: [
                { ChangingToolsService, useValue: changingTool },
                { ToolsInfoService, useValue: toolsInfoService },
                { NewDrawingService, useValue: newDrawingService },
                { ExportDrawingService, useValue: exportDrawingService },
                { ChangeSelectionService, useValue: changeSelectionService },
                { Location, useValue: Location },
                { LocationService, useValue: LocationService },
                { ClipboardService, useValue: clipboardService },
            ],
            imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        toolsInfoService = TestBed.inject(ToolsInfoService);
        changingTool = TestBed.inject(ChangingToolsService);
        newDrawingService = TestBed.inject(NewDrawingService);
        saveDrawingService = TestBed.inject(SaveDrawingService);
        exportDrawingService = TestBed.inject(ExportDrawingService);
        location = TestBed.inject(Location);
        locationService = TestBed.inject(LocationService);
        changeSelectionService = TestBed.inject(ChangeSelectionService);
        clipboardService = TestBed.inject(ClipboardService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changing tool should change currentTool', () => {
        component.onToolChanged(ToolType.eraser);
        expect(component.currentTool).toEqual(ToolType.eraser);
    });

    it('creating a new drawing should call createNewDrawing of service', () => {
        const spyNewDrawing: jasmine.Spy = spyOn(newDrawingService, 'createNewDrawing');
        component.onNewDrawing();
        expect(spyNewDrawing).toHaveBeenCalled();
    });

    it('should call openDialog of saveDrawingService when saving a drawing', () => {
        const spySaveDrawing: jasmine.Spy = spyOn(saveDrawingService, 'saveDrawing');
        component.onSaveDrawing();
        expect(spySaveDrawing).toHaveBeenCalled();
    });

    it('should call openDialog of exportDrawingService when exporting a drawing', () => {
        const spyExportDrawing: jasmine.Spy = spyOn(exportDrawingService, 'exportDrawing');
        component.onExportDrawing();
        expect(spyExportDrawing).toHaveBeenCalled();
    });

    it('should go back to mainpage if editor was opened from mainpage', () => {
        const spyLocation: jasmine.Spy = spyOn(location, 'back');
        locationService.openEditorFromMainPage = true;
        component.back();
        expect(spyLocation).toHaveBeenCalled();
    });

    it('should not go back to mainpage if editor was not opened from mainpage', () => {
        const spyLocation: jasmine.Spy = spyOn(location, 'back');
        locationService.openEditorFromMainPage = false;
        component.back();
        expect(spyLocation).not.toHaveBeenCalled();
    });
});
