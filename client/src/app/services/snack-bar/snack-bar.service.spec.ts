/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '@app/modules/material.module';
import { SnackBarService } from './snack-bar.service';

describe('Service: SnackBar', () => {
    let service: SnackBarService;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        matSnackBarSpy = jasmine.createSpyObj(['open']);

        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: matSnackBarSpy }],
            imports: [MaterialModule],
        });

        service = TestBed.inject(SnackBarService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should open snackbar', () => {
        service.openSnackBar('test');
        expect(matSnackBarSpy.open).toHaveBeenCalled();
    });
});
