import { Component, OnInit } from '@angular/core';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { CarouselToolService } from '@app/services/tools/carousel/carousel-tool.service';

@Component({
    selector: 'app-carousel-tool',
    templateUrl: './carousel-tool.component.html',
    styleUrls: ['./carousel-tool.component.scss'],
})
export class CarouselToolComponent implements OnInit {
    constructor(public carouselToolService: CarouselToolService, public toolsInfoService: ToolsInfoService) {}

    ngOnInit(): void {
        this.carouselToolService.resetCarousel();
    }

    openCarousel(): void {
        this.carouselToolService.openCarousel();
    }
}
