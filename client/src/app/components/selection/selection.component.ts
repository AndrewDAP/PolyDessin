import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SelectionBehaviourService } from '@app/services/tools/selection/behaviour/selection-behaviour.service';
import { ChangeSelectionService, Mode } from '@app/services/tools/selection/change/change-selection.service';
import { State } from '@app/services/tools/selection/state/selection-state.service';
@Component({
    selector: 'app-selection',
    templateUrl: './selection.component.html',
    styleUrls: ['./selection.component.scss'],
})
export class SelectionComponent implements OnInit, OnDestroy {
    mode: Mode = Mode.Rectangle;

    constructor(private changeSelectionService: ChangeSelectionService, private changingToolsService: ChangingToolsService) {}

    ngOnInit(): void {
        this.changeSelectionService.modeObserver().subscribe((mode) => {
            this.mode = mode;
        });

        this.changingToolsService.getTool().subscribe(() => {
            (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).onKeyDownEscape();
        });
    }

    ngOnDestroy(): void {
        (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).onKeyDownEscape();
    }

    setState(state: number): void {
        (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).changeState(state);
    }

    get width(): number {
        return (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).dimension.x;
    }

    get height(): number {
        return (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).dimension.y;
    }

    get left(): number {
        return (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).selectionPos.x;
    }

    get top(): number {
        return (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).selectionPos.y;
    }

    get isActive(): boolean {
        return (this.changeSelectionService.selectionMap.get(this.mode) as SelectionBehaviourService).state !== State.OFF;
    }
}
