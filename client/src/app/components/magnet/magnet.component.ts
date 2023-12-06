import { Component, OnDestroy } from '@angular/core';
import { MagnetGrabHandle } from '@app/const';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-magnet',
    templateUrl: './magnet.component.html',
    styleUrls: ['./magnet.component.scss'],
})
export class MagnetComponent implements OnDestroy {
    magnetActive: boolean = false;
    subscriptionMagnet: Subscription;
    currentChoosenMagnetHandle: MagnetGrabHandle = MagnetGrabHandle.MiddleCenter;

    constructor(private toolsInfoService: ToolsInfoService, private keyEventService: KeyEventService) {
        this.subscriptionMagnet = this.keyEventService.getKeyDownEvent('m').subscribe((event: KeyboardEvent) => {
            if (!event.ctrlKey) this.toggleMagnet();
        });
    }

    toggleMagnet(): void {
        this.toolsInfoService.setMagnetActive((this.magnetActive = !this.magnetActive));
    }

    onMagnetHandleChange(magnetHandle: MagnetGrabHandle): void {
        this.currentChoosenMagnetHandle = magnetHandle;
        this.toolsInfoService.setMagnetHandle(this.currentChoosenMagnetHandle);
    }

    ngOnDestroy(): void {
        this.toolsInfoService.setMagnetActive(false);
        this.toolsInfoService.setMagnetHandle(MagnetGrabHandle.MiddleCenter);
        this.subscriptionMagnet.unsubscribe();
    }
}
