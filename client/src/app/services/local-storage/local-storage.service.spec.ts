import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
    let service: LocalStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LocalStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have drawing', () => {
        spyOn(service, 'getDrawing');
        service.hasDrawing();
        expect(service.getDrawing).toHaveBeenCalled();
    });
});
