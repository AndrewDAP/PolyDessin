import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorHelper } from '@app/classes/color-helper';
import { Util } from '@app/classes/util';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/tools/color/color.service';

// This componenent was inspiered by:
// Author: L. Marx, “Creating a Color Picker Component with Angular,” malcoded, 18-Sep-2018. [Online].
// Available: https://malcoded.com/posts/angular-color-picker/. [Accessed: 01-Feb-2021].
@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnInit {
    readonly canvasWidth: number = 250;
    readonly canvasHeight: number = 250;

    @ViewChild('canvas')
    private canvas: ElementRef<HTMLCanvasElement>;
    private canvasRenderingContext: CanvasRenderingContext2D;

    private mouseDown: boolean = false;

    private selectedPositionProp: Vec2 = { x: 0, y: 0 };
    get selectedPosition(): Vec2 {
        return this.selectedPositionProp;
    }
    set selectedPosition(selectedPosition: Vec2) {
        this.selectedPositionProp = {
            x: Util.clamp(selectedPosition.x, 0, this.canvasWidth),
            y: Util.clamp(selectedPosition.y, 0, this.canvasHeight),
        };
    }

    private readonly selectionRadius: number = 5;

    constructor(private colorService: ColorService) {}

    ngOnInit(): void {
        this.colorService.selectedColorChangedListener().subscribe(() => this.changeSelectedPosition());
        this.colorService.colorClickedListener().subscribe(() => this.changeSelectedPosition());
    }
    ngAfterViewInit(): void {
        this.setCanvasRenderingContext();
        this.drawColorPalette();
        setTimeout(() => {
            this.changeSelectedPosition();
        });
    }

    private changeSelectedPosition(): void {
        const selectedColor = this.colorService.selectedColor;
        const sv = ColorHelper.hsl2hsv(selectedColor.s / Color.MAX_SATURATION, selectedColor.l / Color.MAX_LUMINANCE);
        this.selectedPosition = { x: sv[0] * this.canvasWidth, y: (1 - sv[1]) * this.canvasHeight };
        this.drawColorPalette();
    }

    private setCanvasRenderingContext(): void {
        this.canvasRenderingContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    private drawColorPalette(): void {
        const selectedColor = this.colorService.selectedColor;

        this.canvasRenderingContext.fillStyle = `hsl(${selectedColor.h}, 100%, 50%)`;
        this.canvasRenderingContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        const whiteGradient = this.canvasRenderingContext.createLinearGradient(0, 0, this.canvasWidth, 0);
        whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');

        this.canvasRenderingContext.fillStyle = whiteGradient;
        this.canvasRenderingContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        const blackGradient = this.canvasRenderingContext.createLinearGradient(0, 0, 0, this.canvasHeight);
        blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
        blackGradient.addColorStop(1, 'rgba(0,0,0,1)');

        this.canvasRenderingContext.fillStyle = blackGradient;
        this.canvasRenderingContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.canvasRenderingContext.strokeStyle =
            this.selectedPosition.x < this.canvasWidth / 2 && this.selectedPosition.y < this.canvasHeight / 2 ? 'black' : 'white';
        this.canvasRenderingContext.beginPath();
        this.canvasRenderingContext.arc(this.selectedPosition.x, this.selectedPosition.y, this.selectionRadius, 0, 2 * Math.PI);
        this.canvasRenderingContext.lineWidth = 2;

        this.canvasRenderingContext.stroke();
    }

    @HostListener('window:mouseup')
    onMouseUp(): void {
        this.mouseDown = false;
    }

    onMouseDown(mouseEvent: MouseEvent): void {
        this.mouseDown = true;
        this.changeSelectedColorSaturationAndLuminance(this.getSelectedPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY }));
        this.drawColorPalette();
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.mouseDown) return;
        this.changeSelectedColorSaturationAndLuminance(this.getSelectedPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY }));
        this.drawColorPalette();
    }

    private getSelectedPosition(clientPos: Vec2): Vec2 {
        const canvasPosition = this.canvas.nativeElement.getBoundingClientRect();
        return { x: clientPos.x - canvasPosition.left, y: clientPos.y - canvasPosition.top };
    }

    private changeSelectedColorSaturationAndLuminance(selectedPosition: Vec2): void {
        this.selectedPosition = selectedPosition;

        const saturation = this.selectedPosition.x / this.canvasWidth;
        const value = 1 - this.selectedPosition.y / this.canvasHeight;

        const hslColor = ColorHelper.hsv2hsl(saturation, value);

        this.colorService.selectedColorSaturation = hslColor[0] * Color.MAX_SATURATION;
        this.colorService.selectedColorLuminance = hslColor[1] * Color.MAX_LUMINANCE;

        this.adjustSelectedPosition();
    }

    private adjustSelectedPosition(): void {
        // If the selected position is y=250, the color will be black and go to the bottom left corner, so we visualy put the cursor at 249.
        if (this.selectedPosition.y === this.canvasHeight) this.selectedPosition = { x: this.selectedPosition.x, y: this.selectedPosition.y - 1 };
    }
}
