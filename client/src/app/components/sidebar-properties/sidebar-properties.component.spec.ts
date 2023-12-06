import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselToolComponent } from '@app/components/carousel/carousel-tool/carousel-tool.component';
import { ColorComponent } from '@app/components/color/color/color.component';
import { UndoRedoComponent } from '@app/components/undo-redo/undo-redo.component';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ExportDrawingService } from '@app/services/drawing/export-drawing.service';
import { LocationService } from '@app/services/location/location.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolType } from '@app/tool-type';
import { SidebarPropertiesComponent } from './sidebar-properties.component';

describe('SidebarComponentProperties', () => {
    let component: SidebarPropertiesComponent;
    let fixture: ComponentFixture<SidebarPropertiesComponent>;
    let changingTool: ChangingToolsService;
    let toolsInfoService: ToolsInfoService;
    let newDrawingService: NewDrawingService;
    let exportDrawingService: ExportDrawingService;
    let changeSelectionService: ChangeSelectionService;
    let clipboardService: ClipboardService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarPropertiesComponent, ColorComponent, UndoRedoComponent, CarouselToolComponent],
            providers: [
                { ChangingToolsService, useValue: changingTool },
                { ToolsInfoService, useValue: toolsInfoService },
                { NewDrawingService, useValue: newDrawingService },
                { ExportDrawingService, useValue: exportDrawingService },
                { ChangeSelectionService, useValue: changeSelectionService },
                { ClipboardService, useValue: clipboardService },
                { Location, useValue: Location },
                { LocationService, useValue: LocationService },
            ],
            imports: [MaterialModule, HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarPropertiesComponent);
        toolsInfoService = TestBed.inject(ToolsInfoService);
        changingTool = TestBed.inject(ChangingToolsService);
        newDrawingService = TestBed.inject(NewDrawingService);
        exportDrawingService = TestBed.inject(ExportDrawingService);
        changeSelectionService = TestBed.inject(ChangeSelectionService);
        clipboardService = TestBed.inject(ClipboardService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('toggle of line junction should change the bool showLineJunction', () => {
        const bool = component.showLineJunction;
        component.onJunctionToggle();
        expect(component.showLineJunction).not.toEqual(bool);
    });

    it('changing tool should change currentTool', () => {
        component.onToolChanged(ToolType.eraser);
        expect(component.currentTool).toEqual(ToolType.eraser);
    });

    it('changing size of tool should call setSizeOf of toolsInfoService', () => {
        const test = 10;
        const testTool: ToolType = component.currentTool;
        const spySetSize: jasmine.Spy = spyOn(toolsInfoService, 'setSizeOf');
        component.onSizeChanged(test);
        expect(spySetSize).toHaveBeenCalled();
        expect(spySetSize).toHaveBeenCalledWith(testTool, test);
    });

    it('changing size of junction should call setSizeOfJunction of toolsInfoService', () => {
        const test = 10;
        const spySetSize: jasmine.Spy = spyOn(toolsInfoService, 'setSizeOfJunction');
        component.onSizeChangedOfJunction(test);
        expect(spySetSize).toHaveBeenCalled();
        expect(spySetSize).toHaveBeenCalledWith(test);
    });

    it('changing size of droplet should call setSizeOfDroplet of toolsInfoService', () => {
        const test = 10;
        const spySetSize: jasmine.Spy = spyOn(toolsInfoService, 'setSizeOfDroplet');
        component.onSizeChangedOfDroplet(test);
        expect(spySetSize).toHaveBeenCalled();
        expect(spySetSize).toHaveBeenCalledWith(test);
    });

    it('changing speed of droplet should call setSpeedOfDroplet of toolsInfoService', () => {
        const test = 10;
        const spySetSize: jasmine.Spy = spyOn(toolsInfoService, 'setSpeedOfDroplet');
        component.onChangedOfDropletSpeed(test);
        expect(spySetSize).toHaveBeenCalled();
        expect(spySetSize).toHaveBeenCalledWith(test);
    });

    it('changing tool should call getSizeOf on the new tool we changed', () => {
        const test = 25;
        const spyGetSize: jasmine.Spy = spyOn(toolsInfoService, 'getSizeOf').and.callThrough();
        component.onToolChanged(ToolType.eraser);
        expect(component.currentTool).toEqual(ToolType.eraser);
        toolsInfoService.setSizeOf(ToolType.eraser, test);
        expect(spyGetSize).toHaveBeenCalled();
        expect(component.currentToolSize).toEqual(test);
    });

    it('should change the mode from changeSelectionservice', () => {
        const test = Mode.Ellipse;
        changingTool.setTool(ToolType.ellipseSelection);
        expect(component.mode).toEqual(test);
    });

    it('should set currrentTool to rectangleSelection in selectAll()', () => {
        component.mode = Mode.Ellipse;
        changingTool.setTool(ToolType.ellipseSelection);
        const spy = spyOn(changeSelectionService.selectionMap.get(Mode.Rectangle) as RectangleSelectionService, 'selectAll');
        component.selectAll();
        expect(component.currentTool).toEqual(ToolType.rectangleSelection);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call selectAll() of rectangleSelection in selectAll()', () => {
        component.mode = Mode.Rectangle;
        changingTool.setTool(ToolType.rectangleSelection);
        const spy = spyOn(changeSelectionService.selectionMap.get(Mode.Rectangle) as RectangleSelectionService, 'selectAll');
        component.selectAll();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call setWithFill() from toolInfoService when onCheckFill() ', () => {
        const setSidesSpy: jasmine.Spy = spyOn(toolsInfoService, 'setSides').and.callThrough();
        const sides = 5;
        component.setSides(sides);
        expect(component.sides).toEqual(sides);
        expect(setSidesSpy).toHaveBeenCalledWith(sides);
    });

    it('should call setWithFill() from toolInfoService when onCheckFill() ', () => {
        const setWithFillSpy: jasmine.Spy = spyOn(toolsInfoService, 'setWithFill').and.callThrough();
        const setWithStrokeSpy: jasmine.Spy = spyOn(toolsInfoService, 'setWithStroke').and.callThrough();
        component.setFillStyle(true, true);
        expect(component.withFill).toEqual(true);
        expect(component.withStroke).toEqual(true);
        expect(setWithFillSpy).toHaveBeenCalled();
        expect(setWithStrokeSpy).toHaveBeenCalled();
    });

    it('setting if we should show the grid should change showGrid accordingly ', () => {
        const test = true;
        toolsInfoService.setShowGridCanvas(test);
        expect(component.showGridCanvas).toEqual(test);
    });

    it('setting the size of the square should change showGrid accordingly ', () => {
        const test = 50;
        toolsInfoService.setSizeSquareCanvas(test);
        expect(component.squareSizeCanvas).toEqual(test);
    });

    it('when toggling should show grid should call toolsInfoService', () => {
        const spyShowGrid: jasmine.Spy = spyOn(toolsInfoService, 'setShowGridCanvas');
        component.onJunctionToogleShowCanvas();
        expect(spyShowGrid).toHaveBeenCalled();
    });

    it('when changing square size should call toolsInfoService', () => {
        const test = 20;
        const spySetSquare: jasmine.Spy = spyOn(toolsInfoService, 'setSizeSquareCanvas');
        component.onChangedOfSquareSize(test);
        expect(spySetSquare).toHaveBeenCalledWith(test);
    });

    it('when changing opacity should call toolsInfoService', () => {
        const test = 20;
        const spySetOpacity: jasmine.Spy = spyOn(toolsInfoService, 'setOpacityCanvas');
        component.onChangedOfOpacity(test);
        expect(spySetOpacity).toHaveBeenCalledWith(test);
    });

    it('should set clipboardHasData to true if clipboard has an ImageData', () => {
        clipboardService.changeHasData();
        expect(component.clipboardHasData).toEqual(true);
    });

    it('should call pasteSelection() of ClipboardService in paste()', () => {
        const pasteSelectionSpy: jasmine.Spy = spyOn(clipboardService, 'pasteSelection');
        component.paste();
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('should call copySelection() of ClipboardService in copy()', () => {
        const copySelectionSpy: jasmine.Spy = spyOn(clipboardService, 'copySelection');
        component.copy();
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('should call cutSelection() of ClipboardService in cut()', () => {
        const cutSelectionSpy: jasmine.Spy = spyOn(clipboardService, 'cutSelection');
        component.cut();
        expect(cutSelectionSpy).toHaveBeenCalled();
    });

    it('should call onKeyDownDelete() of active selection if selectionIdle is true in delete()', () => {
        component.mode = Mode.Rectangle;
        changingTool.setTool(ToolType.rectangleSelection);
        const onKeyDownDeleteSpy = spyOn(changeSelectionService.selectionMap.get(Mode.Rectangle) as RectangleSelectionService, 'onKeyDownDelete');
        component.selectionIdle = true;
        component.delete();
        expect(onKeyDownDeleteSpy).toHaveBeenCalled();
    });

    it('should do nothing if selectionIdle is false in delete()', () => {
        const onKeyDownDeleteSpy = spyOn(changeSelectionService.selectionMap.get(Mode.Rectangle) as RectangleSelectionService, 'onKeyDownDelete');
        component.selectionIdle = false;
        component.delete();
        expect(onKeyDownDeleteSpy).not.toHaveBeenCalled();
    });
});
