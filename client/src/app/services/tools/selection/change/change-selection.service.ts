import { Injectable } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';

export const enum Mode {
    Rectangle = 0,
    Ellipse = 1,
    PolygonalLasso = 2,
}

@Injectable({
    providedIn: 'root',
})
export class ChangeSelectionService {
    mode: Subject<Mode> = new Subject<Mode>();
    selectionMap: Map<Mode, SelectionBehaviourService> = new Map();

    constructor(
        private changingToolsService: ChangingToolsService,
        private rectangleSelectionService: RectangleSelectionService,
        private ellipseSelectionService: EllipseSelectionService,
        private polygonalLassoService: PolygonalLassoService,
    ) {
        this.changingToolsService.getTool().subscribe((tool) => {
            switch (tool) {
                case ToolType.rectangleSelection: {
                    this.ellipseSelectionService.resetSelection();
                    this.rectangleSelectionService.resetSelection();
                    this.polygonalLassoService.resetSelection();
                    this.mode.next(Mode.Rectangle);
                    break;
                }
                case ToolType.ellipseSelection: {
                    this.rectangleSelectionService.resetSelection();
                    this.ellipseSelectionService.resetSelection();
                    this.polygonalLassoService.resetSelection();
                    this.mode.next(Mode.Ellipse);
                    break;
                }
                case ToolType.lassoPolygonal: {
                    this.rectangleSelectionService.resetSelection();
                    this.ellipseSelectionService.resetSelection();
                    this.polygonalLassoService.resetSelection();
                    this.mode.next(Mode.PolygonalLasso);
                    break;
                }
                default: {
                    this.rectangleSelectionService.clipCommand = false;
                    this.ellipseSelectionService.clipCommand = false;
                    this.polygonalLassoService.clipCommand = false;
                    break;
                }
            }
        });
        this.selectionMap.set(Mode.Rectangle, this.rectangleSelectionService);
        this.selectionMap.set(Mode.Ellipse, this.ellipseSelectionService);
        this.selectionMap.set(Mode.PolygonalLasso, this.polygonalLassoService);
    }

    modeObserver(): Observable<Mode> {
        return this.mode.asObservable();
    }
}
