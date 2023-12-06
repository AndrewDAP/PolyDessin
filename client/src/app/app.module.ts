import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/components/app/app.component';
import { CarouselCardComponent } from '@app/components/carousel/carousel-card/carousel-card.component';
import { CarouselToolComponent } from '@app/components/carousel/carousel-tool/carousel-tool.component';
import { CarouselComponent } from '@app/components/carousel/carousel/carousel.component';
import { ColorAlphaSliderComponent } from '@app/components/color/color-alpha-slider/color-alpha-slider.component';
import { ColorHexComponent } from '@app/components/color/color-hex/color-hex.component';
import { ColorHistoryComponent } from '@app/components/color/color-history/color-history.component';
import { ColorHueSliderComponent } from '@app/components/color/color-hue-slider/color-hue-slider.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { ColorSwatchComponent } from '@app/components/color/color-swatch/color-swatch.component';
import { ColorComponent } from '@app/components/color/color/color.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { PipettePreviewComponent } from '@app/components/pipette-preview/pipette-preview.component';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SelectionComponent } from '@app/components/selection/selection.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { UndoRedoComponent } from '@app/components/undo-redo/undo-redo.component';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ExportDrawingService } from '@app/services/drawing/export-drawing.service';
import { GridService } from '@app/services/grille/grid.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { LocationService } from '@app/services/location/location.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { TextService } from '@app/services/text/text.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ExportDrawingComponent } from './components/export-drawing/export-drawing.component';
import { ShowUrlComponent } from './components/export-drawing/show-url/show-url.component';
import { MagnetComponent } from './components/magnet/magnet.component';
import { SaveDrawingComponent } from './components/save-drawing/save-drawing.component';
import { SidebarPropertiesComponent } from './components/sidebar-properties/sidebar-properties.component';
import { StampComponent } from './components/stamp/stamp.component';
import { TextComponent } from './components/text/text.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        ColorComponent,
        ColorHueSliderComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorHexComponent,
        ColorSwatchComponent,
        ColorAlphaSliderComponent,
        ResizableComponent,
        ColorHistoryComponent,
        ConfirmationDialogComponent,
        CarouselComponent,
        CarouselCardComponent,
        UndoRedoComponent,
        CarouselToolComponent,
        PipettePreviewComponent,
        UndoRedoComponent,
        SaveDrawingComponent,
        SelectionComponent,
        ExportDrawingComponent,
        MagnetComponent,
        TextComponent,
        StampComponent,
        SidebarPropertiesComponent,
        ShowUrlComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        OverlayModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatDialogModule,
        HttpClientModule,
    ],
    providers: [
        ResizeService,
        ToolsInfoService,
        ChangingToolsService,
        KeyEventService,
        LocationService,
        ToolsBoxService,
        UndoRedoService,
        ExportDrawingService,
        SnackBarService,
        GridService,
        LocalStorageService,
        TextService,
        HttpService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
