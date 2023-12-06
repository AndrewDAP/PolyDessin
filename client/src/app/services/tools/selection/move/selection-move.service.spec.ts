import { TestBed } from '@angular/core/testing';
import { SelectionMoveService } from './selection-move.service';

describe('SelectionMoveService', () => {
    let service: SelectionMoveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionMoveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call clearInterval() in onKeyUp*Direction*Arrow()', () => {
        const clearIntervalSpy: jasmine.Spy = spyOn(window, 'clearInterval');
        service.onArrowUp('up');
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should not call clearTimeout if no keys are held', () => {
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        const numKeyHeld = 1;
        spyOn(service, 'verifyIfKeyHeld').and.returnValue(numKeyHeld);
        service.onArrowUp('up');
        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });
});
