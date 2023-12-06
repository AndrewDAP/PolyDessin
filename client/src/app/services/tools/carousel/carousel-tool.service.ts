import { Injectable } from '@angular/core';
import { CarouselKeyEventMask } from '@app/classes/key-event-masks/carousel-key-event-mask';
import { CarouselComponent } from '@app/components/carousel/carousel/carousel.component';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { FilterService } from '@app/services/filter/filter.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';

@Injectable({
    providedIn: 'root',
})
export class CarouselToolService {
    constructor(
        public keyEventService: KeyEventService,
        public carouselService: CarouselService,
        private filterService: FilterService,
        private dialogService: DialogService,
        private toolsInfoService: ToolsInfoService,
    ) {
        keyEventService.getKeyDownEvent('g').subscribe((event) => {
            if (event.ctrlKey) {
                this.openCarousel();
            }
        });
    }

    async openCarousel(): Promise<void> {
        this.toolsInfoService.carouselLoading = true;
        await this.dialogService.openDialog<CarouselComponent, void>(CarouselComponent, new CarouselKeyEventMask(), this.condition);
        this.toolsInfoService.carouselLoading = false;
        this.filterService.clearFilters();
    }

    condition = async (): Promise<boolean> => await this.carouselService.canOpenDialog();

    resetCarousel(): void {
        this.carouselService.getCardsInfo(false);
    }
}
