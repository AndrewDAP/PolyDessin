import { Component, OnInit } from '@angular/core';
import { Color } from '@app/classes/color';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';

@Component({
    selector: 'app-pipette-preview',
    templateUrl: './pipette-preview.component.html',
    styleUrls: ['./pipette-preview.component.scss'],
})
export class PipettePreviewComponent implements OnInit {
    pixels: [Color, boolean][] = [];
    size: number;

    constructor(private pipetteService: PipetteService) {
        this.size = this.pipetteService.samplingSize;
    }

    ngOnInit(): void {
        this.pipetteService.colorObservable().subscribe((pixels) => {
            this.pixels = pixels;
        });
    }
}
