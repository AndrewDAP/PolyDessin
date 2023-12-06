import { TestBed } from '@angular/core/testing';
import { ToolType } from '@app/tool-type';
import { ChangingToolsService } from './changing-tools.service';

describe('ChangingToolsService', () => {
    let service: ChangingToolsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChangingToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return tool when settool is call', (done: DoneFn) => {
        service.getTool().subscribe((value) => {
            expect(value).toEqual(ToolType.line);
        });
        service.setTool(ToolType.line);
        done();
    });
});
