import { TestBed } from '@angular/core/testing';
import { SelectionStateService, State } from './selection-state.service';

describe('SelectionStateService', () => {
    let service: SelectionStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set state parameter in changeState()', () => {
        const expectedState = State.IDLE;
        service.changeState(expectedState);
        expect(service.state.value).toEqual(expectedState);
    });
});
