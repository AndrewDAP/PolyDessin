import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    get selectedColorIsPrimary(): boolean {
        return this.selectedColorIsPrimaryProp;
    }

    set selectedColorIsPrimary(selectedColorIsPrimary: boolean) {
        this.selectedColorIsPrimaryProp = selectedColorIsPrimary;
    }
    get primaryColor(): Color {
        return this.primaryColorProp;
    }
    set primaryColor(color: Color) {
        this.primaryColorProp = color;
        this.colorChanged.next();
        if (this.selectedColorIsPrimary) this.emitSelectedColorChanged();
    }
    get secondaryColor(): Color {
        return this.secondaryColorProp;
    }
    set secondaryColor(color: Color) {
        this.secondaryColorProp = color;
        this.colorChanged.next();
        if (!this.selectedColorIsPrimary) this.emitSelectedColorChanged();
    }

    // Selected Color
    get selectedColor(): Color {
        return this.selectedColorIsPrimary ? this.primaryColor : this.secondaryColor;
    }
    set selectedColor(color: Color) {
        this.selectedColorIsPrimary ? (this.primaryColor = color) : (this.secondaryColor = color);
    }

    // Selected Color Hue
    set selectedColorHue(hue: number) {
        this.selectedColor.h = hue;
        this.emitSelectedColorChanged();
    }

    // Selected Color Saturation
    set selectedColorSaturation(saturation: number) {
        this.selectedColor.s = saturation;
        this.emitSelectedColorChanged();
    }

    // Selected Color Luminance
    set selectedColorLuminance(luminance: number) {
        this.selectedColor.l = luminance;
        this.emitSelectedColorChanged();
    }

    // Selected Color Alpha
    set selectedColorAlpha(alpha: number) {
        this.selectedColor.a = alpha;
        this.emitSelectedColorChanged();
    }
    private selectedColorIsPrimaryProp: boolean = true;
    // Primary Color
    private primaryColorProp: Color = Color.BLACK;

    // Secondary Color
    private secondaryColorProp: Color = Color.WHITE;
    private selectedColorChanged: Subject<null> = new Subject<null>();
    private colorChanged: Subject<null> = new Subject<null>();
    private colorClicked: Subject<null> = new Subject<null>();
    emitSelectedColorChanged(): void {
        this.selectedColorChanged.next();
    }
    selectedColorChangedListener(): Observable<null> {
        return this.selectedColorChanged.asObservable();
    }

    colorChangedListener(): Observable<null> {
        return this.colorChanged.asObservable();
    }

    swapPrimaryAndSecondaryColors(): void {
        const temporaryColor: Color = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temporaryColor;
    }

    emitColorClicked(): void {
        this.colorClicked.next();
    }
    colorClickedListener(): Observable<null> {
        return this.colorClicked.asObservable();
    }

    primaryColorClicked(): void {
        this.selectedColorIsPrimary = true;
        this.emitColorClicked();
    }

    secondaryColorClicked(): void {
        this.selectedColorIsPrimary = false;
        this.emitColorClicked();
    }
}
