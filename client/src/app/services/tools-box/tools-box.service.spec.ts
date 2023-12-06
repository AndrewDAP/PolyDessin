import { TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ToolType } from '@app/tool-type';
import { Subject } from 'rxjs';

describe('ToolsBoxService', () => {
    let service: ToolsBoxService;
    let toolsInfoService: ToolsInfoService;
    let subject: Subject<ToolType>;

    let changingToolsService: jasmine.SpyObj<ChangingToolsService>;

    beforeEach(() => {
        subject = new Subject<ToolType>();
        toolsInfoService = new ToolsInfoService();
        changingToolsService = jasmine.createSpyObj('ChangingToolsService', ['setTool', 'getTool']);
        changingToolsService.getTool.and.returnValue(subject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                { provide: ToolsInfoService, useValue: toolsInfoService },
                { provide: ChangingToolsService, useValue: changingToolsService },
            ],
            imports: [MaterialModule],
        });
        service = TestBed.inject(ToolsBoxService);
        toolsInfoService = TestBed.inject(ToolsInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Changing the size of a tool should change the value of tool.Size', () => {
        const test = 5;
        for (const key of Array.from(service.tools.keys())) {
            toolsInfoService.setSizeOf(key, test);
        }
        for (const key of Array.from(service.tools.keys())) {
            expect(service.tools.get(key)?.size).toEqual(test);
        }
    });

    it('Changing the tool to rectangle selection should call onSelection(true)', (done: DoneFn) => {
        const test = spyOn(service, 'onSelection');
        changingToolsService.getTool().subscribe((tool: ToolType) => {
            expect(test).toHaveBeenCalledWith(true);
            done();
        });
        subject.next(ToolType.rectangleSelection);
    });

    it('Changing the tool to ellipse selection should call onSelection(true)', (done: DoneFn) => {
        const test = spyOn(service, 'onSelection');
        changingToolsService.getTool().subscribe((tool: ToolType) => {
            expect(test).toHaveBeenCalledWith(true);
            done();
        });
        subject.next(ToolType.ellipseSelection);
    });

    it('Changing the tool to polygonalLasso selection should call onSelection(true)', (done: DoneFn) => {
        const test = spyOn(service, 'onSelection');
        changingToolsService.getTool().subscribe((tool: ToolType) => {
            expect(test).toHaveBeenCalledWith(true);
            done();
        });
        subject.next(ToolType.lassoPolygonal);
    });
});
