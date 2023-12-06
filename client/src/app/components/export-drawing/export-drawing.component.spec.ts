import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, FileChoice, FilterChoice, nameOfFilter, SaveChoice } from '@app/const';
import { MaterialModule } from '@app/modules/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ExportDrawingComponent } from './export-drawing.component';

describe('ExportDrawingComponent', () => {
    let component: ExportDrawingComponent;
    let fixture: ComponentFixture<ExportDrawingComponent>;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let loader: HarnessLoader;
    let spyObjAccept: jasmine.Spy<() => {}>;
    let matDialogSpyObj: jasmine.SpyObj<MatDialog>;
    let snackBarService: SnackBarService;
    // tslint:disable: no-empty
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        drawingService = new DrawingService();
        matDialogSpyObj = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        matSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
        snackBarService = new SnackBarService(matSnackBar);
        TestBed.configureTestingModule({
            declarations: [ExportDrawingComponent],
            providers: [
                { provide: DrawingService, useValue: drawingService },
                { provide: MatDialog, useValue: matDialogSpyObj },
                { provide: SnackBarService, useValue: snackBarService },
            ],
            imports: [MaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        drawingService.canvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.previewCanvas = canvasTestHelper['createCanvas'](DEFAULT_WIDTH, DEFAULT_HEIGHT);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        fixture = TestBed.createComponent(ExportDrawingComponent);
        snackBarService = TestBed.inject(SnackBarService);

        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        // in order to prevent the test suit to download
        spyObjAccept = spyOn(component, 'accept').and.callFake(() => {});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('accept should call saveImage', () => {
        spyObjAccept.and.callThrough();
        const spyObj = spyOn(component, 'saveImage').and.callFake(async () => {});
        component.accept();
        expect(spyObj).toHaveBeenCalledTimes(1);
    });

    it('filter change should set filterChoice', () => {
        component.filterChange(FilterChoice.Invert);
        expect(component.filterChoice).toEqual(FilterChoice.Invert);
    });

    it('save change should change saveChoice', () => {
        component.saveChange(SaveChoice.Imgur);
        expect(component.saveChoice).toEqual(SaveChoice.Imgur);
        expect(component.acceptButton).toEqual('Téléverser');
    });

    it('save change should change saveChoice', () => {
        component.saveChange(SaveChoice.Local);
        expect(component.saveChoice).toEqual(SaveChoice.Local);
        expect(component.acceptButton).toEqual('Ok');
    });

    it('filter change with no filter should set showslider to false', () => {
        component.filterChange(FilterChoice.NoFilter);
        expect(component.showSlider).toEqual(false);
    });

    it('filter change should call applyFilter', () => {
        const spyObj = spyOn(component, 'applyFilter');
        component.filterChange(FilterChoice.Invert);
        expect(spyObj).toHaveBeenCalledTimes(1);
    });

    it('file change should set fileChoice', () => {
        component.fileChange(FileChoice.Jpg);
        expect(component.fileChoice).toEqual(FileChoice.Jpg);
    });

    it('apply filter with filterChoice.hue should set the filter properly', () => {
        const testValue = 15;
        const filterHue = nameOfFilter.get(FilterChoice.HueRotate) + '(' + testValue + 'deg)';
        component.filterChoice = FilterChoice.HueRotate;
        component.applyFilter(testValue);
        expect(component.workingCanvasCtx.filter).toEqual(filterHue);
    });

    it('apply filter with filterChoice.blur should set the filter properly', () => {
        const testValue = 15;
        const filterBlur = nameOfFilter.get(FilterChoice.Blur) + '(' + testValue + 'px)';
        component.filterChoice = FilterChoice.Blur;
        component.applyFilter(testValue);
        expect(component.workingCanvasCtx.filter).toEqual(filterBlur);
    });

    it('apply filter with filterChoice.grayscale should set the filter properly', () => {
        const testValue = 15;
        // tslint:disable-next-line: no-magic-numbers
        const filterGrayscale = nameOfFilter.get(FilterChoice.GrayScale) + '(' + testValue / 100 + ')';
        component.filterChoice = FilterChoice.GrayScale;
        component.applyFilter(testValue);
        expect(component.workingCanvasCtx.filter).toEqual(filterGrayscale);
    });

    it('writing something shoult set titleFormControlValue', async () => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        expect(component.titleFormControl.value).toEqual('monImg');
    });

    it('save image should set image file to titleFormControlValue and the format png', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        const stubA = component.download.nativeElement;
        spyOn(stubA, 'click').and.callFake(() => {});
        spyOn(document, 'createElement').and.returnValue(stubA);
        component.fileChoice = FileChoice.Png;
        await component.saveImage();
        expect(stubA.download).toEqual('monImg.png');
        done();
    });

    it('save image should click on the html element in order to download it', () => {
        const stubA = component.download.nativeElement;
        const testSpy = spyOn(stubA, 'click').and.callFake(() => {});
        spyOn(document, 'createElement').and.returnValue(stubA);
        component.saveImage();
        expect(testSpy).toHaveBeenCalledTimes(1);
    });

    it('save image should set image file to titleFormControlValue and the format jpg', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        const stubA = component.download.nativeElement;
        spyOn(stubA, 'click').and.callFake(() => {});
        spyOn(document, 'createElement').and.returnValue(stubA);
        component.fileChoice = FileChoice.Jpg;
        await component.saveImage();
        expect(stubA.download).toEqual('monImg.jpg');
        done();
    });

    it('save image on imgur should call json() on the data with jpg', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        component.fileChoice = FileChoice.Jpg;
        component.saveChoice = SaveChoice.Imgur;
        const response = new Response(
            JSON.stringify({
                data: { link: 'lol' },
            }),
        );
        spyOn(window, 'fetch').and.returnValue(
            new Promise<Response>((resolve, reject) => {
                resolve(response);
            }),
        );
        const spy = spyOn(response, 'json').and.returnValue(
            // tslint:disable: no-any
            new Promise<any>((resolve, reject) => {
                resolve({ data: { link: 'lol' } });
            }),
        );
        await component.saveImage();
        expect(spy).toHaveBeenCalledTimes(1);
        done();
    });

    it('save image on imgur should call json() on the data with png', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        component.fileChoice = FileChoice.Png;
        component.saveChoice = SaveChoice.Imgur;
        const response = new Response(
            JSON.stringify({
                data: { link: 'lol' },
            }),
        );
        spyOn(window, 'fetch').and.returnValue(
            new Promise<Response>((resolve, reject) => {
                resolve(response);
            }),
        );
        const spy = spyOn(response, 'json').and.returnValue(
            new Promise<any>((resolve, reject) => {
                resolve({ data: { link: 'lol' } });
            }),
        );
        await component.saveImage();
        expect(spy).toHaveBeenCalledTimes(1);
        done();
    });

    it('save image on imgur if error should show a snack bar', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        component.fileChoice = FileChoice.Jpg;
        component.saveChoice = SaveChoice.Imgur;
        const response = new Response(
            JSON.stringify({
                data: { link: 'lol' },
            }),
        );
        spyOn(window, 'fetch').and.returnValue(
            new Promise<Response>((resolve, reject) => {
                reject('Not working');
            }),
        );
        spyOn(response, 'json').and.returnValue(
            new Promise<any>((resolve, reject) => {
                resolve({ data: { link: 'lol' } });
            }),
        );
        await component.saveImage();
        expect(matSnackBar.open).toHaveBeenCalledTimes(1);
        done();
    });

    it('save image on imgur if response not ok should show a snack bar', async (done: DoneFn) => {
        await fixture.whenStable();
        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('monImg');
        component.fileChoice = FileChoice.Jpg;
        component.saveChoice = SaveChoice.Imgur;
        const response = new Response(
            JSON.stringify({
                data: { link: 'lol' },
            }),
        );
        spyOnProperty(response, 'ok', 'get').and.returnValue(false);
        spyOn(window, 'fetch').and.returnValue(
            new Promise<Response>((resolve, reject) => {
                resolve(response);
            }),
        );
        spyOn(response, 'json').and.returnValue(
            new Promise<any>((resolve, reject) => {
                resolve({ data: { link: 'lol' } });
            }),
        );
        await component.saveImage();
        expect(matSnackBar.open).toHaveBeenCalledTimes(1);
        done();
    });
});
