import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CarouselToolComponent } from '@app/components/carousel/carousel-tool/carousel-tool.component';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { ColorComponent } from '@app/components/color/color/color.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SelectionComponent } from '@app/components/selection/selection.component';
import { SidebarPropertiesComponent } from '@app/components/sidebar-properties/sidebar-properties.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { UndoRedoComponent } from '@app/components/undo-redo/undo-redo.component';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeService } from '@app/services/resize/resize.service';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let resizeService: ResizeService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingService = new DrawingService();
        resizeService = new ResizeService(drawingService);
        TestBed.configureTestingModule({
            declarations: [
                EditorComponent,
                DrawingComponent,
                SidebarComponent,
                ColorPickerComponent,
                ResizableComponent,
                ColorComponent,
                UndoRedoComponent,
                SelectionComponent,
                CarouselToolComponent,
                SidebarPropertiesComponent,
            ],
            providers: [{ provide: ResizeService, useValue: resizeService }],
            imports: [MaterialModule, HttpClientTestingModule, RouterModule, RouterTestingModule, BrowserAnimationsModule],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        // tslint:disable:no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should give scrollLeft and scrollTop to resizeService onScroll', () => {
        const scrollValue = 20;
        const obj = {
            currentTarget: { scrollLeft: scrollValue, scrollTop: scrollValue },
        };

        component.onScroll((obj as unknown) as Event);
        expect(resizeService.offsetLeft).toEqual(scrollValue);
        expect(resizeService.offsetTop).toEqual(scrollValue);
    });
});
