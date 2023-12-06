import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ColorHelper } from '@app/classes/color-helper';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ColorService } from '@app/services/tools/color/color.service';

@Component({
    selector: 'app-color-hex',
    templateUrl: './color-hex.component.html',
    styleUrls: ['./color-hex.component.scss'],
})
export class ColorHexComponent implements AfterViewInit, OnInit, OnDestroy {
    constructor(private colorService: ColorService, private keyEventService: KeyEventService) {}
    hexColorFormControl: FormControl = new FormControl('', [Validators.pattern(/^([a-fA-F0-9]{6})$/)]);
    hexColor: string;

    ngOnInit(): void {
        this.colorService.colorClickedListener().subscribe(() => this.changeHexColor());
        this.colorService.selectedColorChangedListener().subscribe(() => this.changeHexColor());
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.changeHexColor();
        });
    }

    ngOnDestroy(): void {
        this.onColorChanged();
    }

    onColorChanged(): void {
        if (this.hexColorFormControl.invalid) return;
        this.colorService.selectedColor = ColorHelper.hex2hsl(this.hexColorFormControl.value, this.colorService.selectedColor.a);
    }

    changeHexColor(): void {
        this.hexColor = ColorHelper.hsl2hex(this.colorService.selectedColor);
        this.hexColorFormControl.setValue(this.hexColor);
    }

    onFocus(): void {
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
        this.onColorChanged();
    }
}
