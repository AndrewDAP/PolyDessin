import { TestBed } from '@angular/core/testing';
import { ToolType } from '@app/tool-type';
import { ToolsInfoService } from './tools-info.service';

describe('ToolsInfoService', () => {
    let service: ToolsInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolsInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return size when setSize is called with pencil', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.pencil).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.pencil, TEST_VALUE);
        done();
    });
    it('should return size when setSize is called with line', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.line).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.line, TEST_VALUE);

        done();
    });

    it('should return size when setSize is called with eraser', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.eraser).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.eraser, TEST_VALUE);

        done();
    });

    it('should return size when setSize is called with rectangle', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.rectangle).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.rectangle, TEST_VALUE);

        done();
    });

    it('should return size when setSize is called with ellipse', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.ellipse).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.ellipse, TEST_VALUE);

        done();
    });

    it('should return size when setSize is called with ellipse', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOf(ToolType.polygon).subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOf(ToolType.polygon, TEST_VALUE);
        done();
    });

    it('should throw error when setSize is called with an unknowtool', () => {
        const notATool = 25;
        const value = 10;
        expect(() => {
            service.setSizeOf(notATool as ToolType, value);
        }).toThrowError();
    });

    it('should throw error when getSizeOf is called with an unknowtool', () => {
        const notATool = 25;
        service.getSizeOf(notATool as ToolType).subscribe(
            () => {
                fail('expected error');
            },
            (error) => {
                expect(error).toBe('Unknow tooltype');
            },
        );
    });

    it('should return size of junction when setSizeJunction is called', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOfJunction().subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOfJunction(TEST_VALUE);

        done();
    });

    it('should return size of droplet when setSizeOfDroplet is called', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSizeOfDroplet().subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSizeOfDroplet(TEST_VALUE);

        done();
    });

    it('should return speed of droplet when setSpeedOfDroplet is called', (done: DoneFn) => {
        const TEST_VALUE = 25;
        service.getSpeedOfDroplet().subscribe((value) => {
            expect(value).toEqual(TEST_VALUE);
        });
        service.setSpeedOfDroplet(TEST_VALUE);

        done();
    });

    it('should return if line should draw junction when setShouldDrawJunction is called', (done: DoneFn) => {
        service.getShouldDrawJunction().subscribe((value) => {
            expect(value).toEqual(true);
        });
        service.setShouldDrawJunction(true);

        done();
    });

    it('should return if withFill when getWithFill is called', (done: DoneFn) => {
        service.getWithFill().subscribe((value) => {
            expect(value).toEqual(true);
        });
        service.setWithFill(true);

        done();
    });

    it('should return if wihStroke when getWithStroke is called', (done: DoneFn) => {
        service.getWithStroke().subscribe((value) => {
            expect(value).toEqual(true);
        });
        service.setWithStroke(true);
        done();
    });

    it('should return if sides when getsides is called', (done: DoneFn) => {
        const sides = 5;
        service.getSides().subscribe((value) => {
            expect(value).toEqual(sides);
        });
        service.setSides(sides);
        done();
    });

    it('should return if we should show grid', (done: DoneFn) => {
        const test = true;
        service.getShowGridCanvas().subscribe((value) => {
            expect(value).toEqual(test);
        });
        service.setShowGridCanvas(test);
        done();
    });

    it('should return the value of the opacity', (done: DoneFn) => {
        const test = 50;
        service.getOpacityCanvas().subscribe((value) => {
            expect(value).toEqual(test);
        });
        service.setOpacityCanvas(test);
        done();
    });

    it('should return the size of the square', (done: DoneFn) => {
        const test = 50;
        service.getSizeSquareCanvas().subscribe((value) => {
            expect(value).toEqual(test);
        });
        service.setSizeSquareCanvas(test);
        done();
    });
});
