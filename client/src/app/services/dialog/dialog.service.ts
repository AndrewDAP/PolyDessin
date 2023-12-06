import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { DialogKeyEventMask } from '@app/classes/key-event-masks/dialog-key-event-mask';
import { KeyEventMask } from '@app/classes/key-event-masks/key-event-mask';
import { KeyEventService } from '@app/services/key-event/key-event.service';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog, private keyEventService: KeyEventService) {}
    dialogIsOpen: boolean = false;

    async openDialog<T, R>(
        component: ComponentType<T>,
        mask: KeyEventMask = new DialogKeyEventMask(),
        openCondition: () => Promise<boolean> = async () => Promise.resolve(true),
    ): Promise<R | undefined> {
        if (!this.canOpen(mask)) return undefined;

        if (!(await openCondition())) {
            this.exit();
            return undefined;
        }

        const dialogRef = this.dialog.open(component);
        return await dialogRef
            .afterClosed()
            .toPromise()
            .then((result) => {
                return result as R;
            })
            .finally(() => this.exit());
    }

    canOpen(mask: KeyEventMask): boolean {
        if (this.dialogIsOpen) return false;
        this.keyEventService.keyMask = mask;
        return (this.dialogIsOpen = true);
    }

    exit(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
        this.dialogIsOpen = false;
    }
}
