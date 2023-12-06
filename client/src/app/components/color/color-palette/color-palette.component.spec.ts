import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { Util } from '@app/classes/util';
import { MaterialModule } from '@app/modules/material.module';
import { ColorService } from '@app/services/tools/color/color.service';
import { Subject } from 'rxjs';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    const defaultPos = { x: 0, y: 0 };
    let colorService: ColorService;
    const subject: Subject<null> = new Subject<null>();

    beforeEach(async(() => {
        colorService = new ColorService();

        spyOn(colorService, 'selectedColorChangedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'colorClickedListener').and.returnValue(subject.asObservable());
        spyOn(colorService, 'emitColorClicked').and.callFake(() => subject.next());
        spyOn(colorService, 'emitSelectedColorChanged').and.callFake(() => subject.next());

        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
            providers: [{ provide: ColorService, useValue: colorService }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change selectedPosition when mousedown is true and mouse is moving', () => {
        const canvas: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('canvas');
        const mouseEvent: MouseEvent = {
            offsetX: 50,
            offsetY: 50,
            clientX: 60,
            clientY: 60,
            button: 0,
        } as MouseEvent;
        expect(component.selectedPosition).toEqual(defaultPos);
        component.onMouseDown(mouseEvent);
        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).toEqual({
            x: mouseEvent.clientX - canvas.getBoundingClientRect().left,
            // tslint:disable-next-line:no-magic-numbers
            y: Util.clamp(mouseEvent.clientY - canvas.getBoundingClientRect().top, 0, 10),
        });
    });

    it('should change selectedPosition on init', () => {
        component.ngAfterViewInit();
        expect(component.selectedPosition).toEqual(defaultPos);
    });

    it('should clamp selectedPosition to the max width and height', () => {
        const selectedPositionUpperClamp = {
            x: 2000,
            y: 2000,
        };
        const selectedPositionLowerClamp = {
            x: -2000,
            y: -2000,
        };
        expect(component.selectedPosition).toEqual(defaultPos);
        component.selectedPosition = selectedPositionLowerClamp;
        expect(component.selectedPosition).toEqual(defaultPos);
        component.selectedPosition = selectedPositionUpperClamp;
        expect(component.selectedPosition).toEqual({
            x: 250,
            y: 250,
        });
    });

    it('should not change selectedPosition when mouseup is true and mouse is moving', () => {
        const mouseEvent: MouseEvent = {
            clientX: 60,
            clientY: 70,
            button: 0,
        } as MouseEvent;

        expect(component.selectedPosition).toEqual(defaultPos);
        component.onMouseUp();
        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).toEqual(defaultPos);
    });

    it('should change luminance and saturation of the selected color after move', () => {
        const mouseEvent: MouseEvent = {
            clientX: 0,
            clientY: 0,
            button: 0,
        } as MouseEvent;

        const selectedColorLuminance = spyOnProperty(colorService, 'selectedColorLuminance', 'set');
        const selectedColorSaturation = spyOnProperty(colorService, 'selectedColorSaturation', 'set');

        component.onMouseDown(mouseEvent);

        expect(selectedColorLuminance).toHaveBeenCalledWith(Color.MAX_LUMINANCE);
        expect(selectedColorSaturation).toHaveBeenCalledWith(0);
    });

    it('should change selected position when selected color is changed', () => {
        const blackPos = { x: 0, y: 250 };
        const whitePos = { x: 0, y: 0 };
        const selectedColorGetter = spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(new Color(0, 0, 0));

        colorService.emitColorClicked();
        expect(component.selectedPosition).toEqual(blackPos);

        selectedColorGetter.and.returnValue(new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE));

        colorService.emitColorClicked();
        colorService.emitColorClicked();
        expect(component.selectedPosition).toEqual(whitePos);
    });

    it('should call onMouseMove functions when mousedown is set to true', () => {
        const mouseEvent: MouseEvent = {
            button: 0,
        } as MouseEvent;
        const selectedColorLuminance = spyOnProperty(colorService, 'selectedColorLuminance', 'set');
        const selectedColorSaturation = spyOnProperty(colorService, 'selectedColorSaturation', 'set');

        component.onMouseDown(mouseEvent);
        component.onMouseMove(mouseEvent);

        expect(selectedColorLuminance).toHaveBeenCalled();
        expect(selectedColorSaturation).toHaveBeenCalled();
    });

    it('should not call onMouseMove functions when mousedown is set to false', () => {
        const mouseEvent: MouseEvent = {
            button: 0,
        } as MouseEvent;
        const selectedColorLuminance = spyOnProperty(colorService, 'selectedColorLuminance', 'set');
        const selectedColorSaturation = spyOnProperty(colorService, 'selectedColorSaturation', 'set');

        component.onMouseUp();
        component.onMouseMove(mouseEvent);

        expect(selectedColorLuminance).not.toHaveBeenCalled();
        expect(selectedColorSaturation).not.toHaveBeenCalled();
    });

    it('should set the cursor to y=249 if the selectedPosition has y=250', () => {
        const mouseEventUpperClamp = {
            clientX: 2000,
            clientY: 2000,
        } as MouseEvent;

        component.onMouseDown(mouseEventUpperClamp);
        component.onMouseMove(mouseEventUpperClamp);

        expect(component.selectedPosition).toEqual({ x: 0, y: 249 });
    });

    it('should draw the component and be black in the bottom left corner after timeout finishes', () => {
        spyOnProperty(colorService, 'selectedColor', 'get').and.returnValue(Color.RED);
        component.ngAfterViewInit();
        fixture.detectChanges();

        const canvas: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
        const imageData: ImageData = ctx.getImageData(0, canvas.height - 1, 1, canvas.height);
        expect(imageData.data[0]).toEqual(1); // R
        expect(imageData.data[1]).toEqual(1); // G
        expect(imageData.data[2]).toEqual(1); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
    });
});
