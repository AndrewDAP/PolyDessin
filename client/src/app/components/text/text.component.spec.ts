import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/modules/material.module';
import { TextService } from '@app/services/text/text.service';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
    let component: TextComponent;
    let fixture: ComponentFixture<TextComponent>;
    let loader: HarnessLoader;

    let textServiceSpy: jasmine.SpyObj<TextService>;

    beforeEach(async(() => {
        textServiceSpy = jasmine.createSpyObj('TextService', ['drawPreview', 'setStartPos', 'bold', 'italic', 'textAlign', 'size', 'police']);

        TestBed.configureTestingModule({
            declarations: [TextComponent],
            providers: [{ provide: TextService, useValue: textServiceSpy }],
            imports: [MaterialModule, BrowserAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change police', async () => {
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#police' }));
        await select.open();
        const options = await select.getOptions();

        await options[1].click();
        expect(await select.getValueText()).toEqual(component.polices[1]);
        expect(textServiceSpy.police).toBe(component.polices[1]);

        await options[2].click();
        expect(await select.getValueText()).toEqual(component.polices[2]);
        expect(textServiceSpy.police).toBe(component.polices[2]);
    });

    // tslint:disable:no-magic-numbers
    it('should change size', async () => {
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#size' }));
        await select.open();
        const options = await select.getOptions();

        await options[6].click();
        expect(Number(await select.getValueText())).toEqual(component.sizes[6]);
        expect(textServiceSpy.size).toBe(component.sizes[6]);
    });

    it('should *bold*', async () => {
        textServiceSpy.bold = false;
        const toggle = await loader.getHarness(MatButtonToggleHarness.with({ selector: '#bold' }));

        await toggle.check();
        expect(textServiceSpy.bold).toBeTrue();
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();

        await toggle.uncheck();
        expect(textServiceSpy.bold).toBeFalse();
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();
    });

    it('should italic', async () => {
        textServiceSpy.italic = false;
        const toggle = await loader.getHarness(MatButtonToggleHarness.with({ selector: '#italic' }));

        await toggle.check();
        expect(textServiceSpy.italic).toBeTrue();
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();

        await toggle.uncheck();
        expect(textServiceSpy.italic).toBeFalse();
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();
    });

    it('should align', async () => {
        component.textAlign = 'right';
        textServiceSpy.writing = true;
        const align = await loader.getHarness(MatButtonToggleGroupHarness.with({ selector: '#align' }));
        const toggles = await align.getToggles();

        // tslint:disable:no-magic-numbers
        expect(toggles.length).toBe(3);

        await toggles[0].check();
        expect(component.textAlign).toEqual('left');
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();

        await toggles[1].check();
        expect(component.textAlign).toEqual('center');
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();

        await toggles[2].check();
        expect(component.textAlign).toEqual('right');
        expect(textServiceSpy.drawPreview).toHaveBeenCalled();
    });
});
