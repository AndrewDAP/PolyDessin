import { Component } from '@angular/core';
import { ANGLE_MAX_VALUE, ANGLE_MIN_VALUE } from '@app/const';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp',
    templateUrl: './stamp.component.html',
    styleUrls: ['./stamp.component.scss'],
})
export class StampComponent {
    angleMinValue: number = ANGLE_MIN_VALUE;
    angleMaxValue: number = ANGLE_MAX_VALUE;

    constructor(public stampService: StampService) {}

    onRatioChanged(ratio: number): void {
        this.stampService.ratio = ratio;
    }

    onAngleChanged(angle: number): void {
        this.stampService.angle = angle;
    }

    onStampChanged(stamp: number): void {
        this.stampService.stampChoice = stamp;
    }
}
