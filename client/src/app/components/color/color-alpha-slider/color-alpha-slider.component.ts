import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { Util } from '@app/classes/util';
import { ColorService } from '@app/services/tools/color/color.service';

// This componenent was inspiered by:
// Author: L. Marx, “Creating a Color Picker Component with Angular,” malcoded, 18-Sep-2018. [Online].
// Available: https://malcoded.com/posts/angular-color-picker/. [Accessed: 01-Feb-2021].
@Component({
    selector: 'app-color-alpha-slider',
    templateUrl: './color-alpha-slider.component.html',
    styleUrls: ['./color-alpha-slider.component.scss'],
})
export class ColorAlphaSliderComponent implements AfterViewInit, OnInit {
    readonly canvasWidth: number = 220;
    readonly canvasHeight: number = 10;

    @ViewChild('canvas')
    private canvas: ElementRef<HTMLCanvasElement>;

    private canvasRenderingContext: CanvasRenderingContext2D;
    private mouseDown: boolean = false;

    private selectedWidthProp: number = this.canvasWidth;
    get selectedWidth(): number {
        return this.selectedWidthProp;
    }
    set selectedWidth(selectedWidth: number) {
        this.selectedWidthProp = Util.clamp(selectedWidth, 0, this.canvasWidth);
    }

    constructor(public colorService: ColorService) {}

    ngOnInit(): void {
        this.colorService.selectedColorChangedListener().subscribe(() => this.updateAlphaSlider());
        this.colorService.colorClickedListener().subscribe(() => this.updateAlphaSlider());
    }

    ngAfterViewInit(): void {
        this.setCanvasRenderingContext();
        this.drawAlphaSlider();
        setTimeout(() => {
            this.updateAlphaSlider();
        });
    }

    private setCanvasRenderingContext(): void {
        this.canvasRenderingContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    private updateAlphaSlider(): void {
        this.selectedWidth = (this.colorService.selectedColor.a / Color.MAX_ALPHA) * this.canvasWidth;
        this.drawAlphaSlider();
    }

    private drawAlphaSlider(): void {
        this.canvasRenderingContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        const selectedColor = this.colorService.selectedColor;

        const canvasGradient = this.canvasRenderingContext.createLinearGradient(0, 0, this.canvasWidth, 0);
        const startQuickAlphaChange = 0.05;
        const stopQuickAlphaChange = 0.7;
        canvasGradient.addColorStop(0, `hsla(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%, 0)`);
        canvasGradient.addColorStop(startQuickAlphaChange, `hsla(${selectedColor.h},${selectedColor.s}%, ${selectedColor.l}%, 0.1)`);
        canvasGradient.addColorStop(stopQuickAlphaChange, `hsla(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%, 0.9)`);
        canvasGradient.addColorStop(1, `hsla(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%, 1)`);
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
        this.updateSelectedColorAlpha(this.getSelectedWidthFromClientPosition(mouseEvent.clientX));
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.mouseDown) return;
        mouseEvent.preventDefault();

        this.updateSelectedColorAlpha(this.getSelectedWidthFromClientPosition(mouseEvent.clientX));
    }

    private getSelectedWidthFromClientPosition = (clientX: number): number => clientX - this.canvas.nativeElement.getBoundingClientRect().left;

    private updateSelectedColorAlpha(selectedWidth: number): void {
        this.selectedWidth = selectedWidth;
        this.colorService.selectedColorAlpha = (this.selectedWidth / this.canvasWidth) * Color.MAX_ALPHA;
    }
}
