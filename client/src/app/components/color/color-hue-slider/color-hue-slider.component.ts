import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { Util } from '@app/classes/util';
import { ColorService } from '@app/services/tools/color/color.service';

// This componenent was inspiered by:
// Author: L. Marx, “Creating a Color Picker Component with Angular,” malcoded, 18-Sep-2018. [Online].
// Available: https://malcoded.com/posts/angular-color-picker/. [Accessed: 01-Feb-2021].
@Component({
    selector: 'app-color-hue-slider',
    templateUrl: './color-hue-slider.component.html',
    styleUrls: ['./color-hue-slider.component.scss'],
})
export class ColorHueSliderComponent implements AfterViewInit, OnInit {
    readonly canvasWidth: number = 220;
    readonly canvasHeight: number = 10;

    @ViewChild('canvas')
    private canvas: ElementRef<HTMLCanvasElement>;
    private canvasRenderingContext: CanvasRenderingContext2D;

    private mouseDown: boolean = false;

    private selectedWidthProp: number = 0;
    get selectedWidth(): number {
        return this.selectedWidthProp;
    }
    set selectedWidth(selectedWidth: number) {
        this.selectedWidthProp = Util.clamp(selectedWidth, 0, this.canvasWidth);
    }

    constructor(public colorService: ColorService) {}

    ngOnInit(): void {
        this.colorService.selectedColorChangedListener().subscribe(() => this.updateHueSlider());
        this.colorService.colorClickedListener().subscribe(() => this.updateHueSlider());
    }
    ngAfterViewInit(): void {
        this.setCanvasRenderingContext();
        this.drawHueSlider();
        setTimeout(() => {
            this.updateHueSlider();
        });
    }

    private updateHueSlider(): void {
        this.selectedWidth = (this.colorService.selectedColor.h / Color.MAX_HUE) * this.canvasWidth;
        this.drawHueSlider();
    }

    private setCanvasRenderingContext(): void {
        this.canvasRenderingContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    private drawHueSlider(): void {
        this.canvasRenderingContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        const canvasGradient = this.canvasRenderingContext.createLinearGradient(0, 0, this.canvasWidth, 0);
        const hueChange0 = 0;
        const hueChange1 = 0.17;
        const hueChange2 = 0.34;
        const hueChange3 = 0.51;
        const hueChange4 = 0.68;
        const hueChange5 = 0.85;
        const hueChange6 = 1;

        canvasGradient.addColorStop(hueChange0, 'rgba(255, 0, 0, 1)');
        canvasGradient.addColorStop(hueChange1, 'rgba(255, 255, 0, 1)');
        canvasGradient.addColorStop(hueChange2, 'rgba(0, 255, 0, 1)');
        canvasGradient.addColorStop(hueChange3, 'rgba(0, 255, 255, 1)');
        canvasGradient.addColorStop(hueChange4, 'rgba(0, 0, 255, 1)');
        canvasGradient.addColorStop(hueChange5, 'rgba(255, 0, 255, 1)');
        canvasGradient.addColorStop(hueChange6, 'rgba(255, 0, 0, 1)');

        this.canvasRenderingContext.fillStyle = canvasGradient;
        this.canvasRenderingContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    @HostListener('window:mouseup')
    onMouseUp(): void {
        this.mouseDown = false;
    }

    onMouseDown(mouseEvent: MouseEvent): void {
        mouseEvent.preventDefault();
        this.mouseDown = true;
        this.changeSelectedColorHue(this.getSelectedWidthFromClientPosition(mouseEvent.clientX));
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.mouseDown) return;
        mouseEvent.preventDefault();
        this.changeSelectedColorHue(this.getSelectedWidthFromClientPosition(mouseEvent.clientX));
    }

    private getSelectedWidthFromClientPosition = (clientX: number): number => clientX - this.canvas.nativeElement.getBoundingClientRect().left;

    private changeSelectedColorHue(selectedWidth: number): void {
        this.selectedWidth = selectedWidth;
        this.colorService.selectedColorHue = (this.selectedWidth / this.canvasWidth) * Color.MAX_HUE;
    }
}
