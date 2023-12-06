import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorHexComponent } from '@app/components/color/color-hex/color-hex.component';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ColorHistoryService } from '@app/services/tools/color-history/color-history.service';
import { ColorService } from '@app/services/tools/color/color.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    @ViewChild('container') private container: ElementRef;
    isHidden: boolean = true;

    @ViewChild('colorHex') colorHex: ColorHexComponent;
    previousColor: Color;

    constructor(
        public colorService: ColorService,
        private colorHistory: ColorHistoryService,
        private keyEventService: KeyEventService,
        private snackBarService: SnackBarService,
    ) {}

    ngOnInit(): void {
        this.colorService.colorClickedListener().subscribe(() => this.showColorPicker());
        this.keyEventService.getKeyDownEvent('Escape').subscribe(() => this.cancelSelectedColor());
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: Event): void {
        this.detectOutsideClick(event);
    }

    private detectOutsideClick(event: Event): void {
        // We want to accept the selected color if there was a click outside.
        if (this.clickWasOutside(event)) {
            this.acceptSelectedColor();
        }
    }

    private clickWasOutside(event: Event): boolean {
        return event.target !== this.container?.nativeElement;
    }

    private showColorPicker(): void {
        this.isHidden = false;
        this.previousColor = this.colorService.selectedColor.copy();
    }

    cancelSelectedColor(): void {
        if (this.isHidden) return;
        this.colorService.selectedColor = this.previousColor.copy();

        this.isHidden = true;
    }

    acceptSelectedColor(): void {
        if (this.isHidden) return;
        if (this.colorHex.hexColorFormControl.invalid) return this.snackBarService.openSnackBar('La couleur choisie est invalide');

        this.colorHistory.addToHistory(this.colorService.selectedColor.copy());

        this.isHidden = true;
    }

    getSelectedColor(): string {
        return this.colorService.selectedColorIsPrimary ? 'Principale' : 'Secondaire';
    }

    onPrimaryColorClicked(): void {
        // We don't want to accept the color if the selected color is already primary
        if (this.colorService.selectedColorIsPrimary) return;
        this.acceptSelectedColor();
        this.colorService.primaryColorClicked();
    }

    onSecondaryColorClicked(): void {
        // We don't want to accept the color if the selected color is already secondary
        if (!this.colorService.selectedColorIsPrimary) return;
        this.acceptSelectedColor();
        this.colorService.secondaryColorClicked();
    }
}
