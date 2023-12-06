import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatChipHarness, MatChipInputHarness, MatChipListHarness } from '@angular/material/chips/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/modules/material.module';
import { SaveDrawingComponent } from './save-drawing.component';

describe('SaveDrawingComponent', () => {
    let component: SaveDrawingComponent;
    let fixture: ComponentFixture<SaveDrawingComponent>;
    let loader: HarnessLoader;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SaveDrawingComponent],
            imports: [MaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveDrawingComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get title input value in titleFormControl', async () => {
        await fixture.whenStable();

        const input = await loader.getHarness<MatInputHarness>(MatInputHarness);
        await input.setValue('titre-de-marde');

        expect(fixture.componentInstance.titleFormControl.value).toBe('titre-de-marde');
    });

    it('should add tag in input in tags', async () => {
        await fixture.whenStable();

        const chipHarness = await loader.getHarness<MatChipListHarness>(MatChipListHarness);
        const input: MatChipInputHarness = await chipHarness.getInput();

        await input.setValue('tag-de-marde');
        await input.sendSeparatorKey(TestKey.ENTER);

        expect(component.tags).toContain('tag-de-marde');

        const newInput: MatChipInputHarness = await chipHarness.getInput();
        expect(await newInput.getValue()).toBe('');
    });

    it('should not add an invalid tag in input in tags', async () => {
        await fixture.whenStable();

        const chipHarness = await loader.getHarness<MatChipListHarness>(MatChipListHarness);
        const input: MatChipInputHarness = await chipHarness.getInput();

        await input.setValue('tag!-de-marde');
        await input.sendSeparatorKey(TestKey.ENTER);

        expect(component.tags.length).toBe(0);

        const newInput: MatChipInputHarness = await chipHarness.getInput();
        expect(await newInput.getValue()).toBe('tag!-de-marde');
    });

    it('should not add the same tag multiple times', async () => {
        await fixture.whenStable();

        const chipHarness = await loader.getHarness<MatChipListHarness>(MatChipListHarness);
        const input: MatChipInputHarness = await chipHarness.getInput();

        await input.setValue('tag1');
        await input.sendSeparatorKey(TestKey.ENTER);
        await input.setValue('tag2');
        await input.sendSeparatorKey(TestKey.ENTER);

        expect(component.tags.length).toBe(2);

        await input.setValue('tag1');
        await input.sendSeparatorKey(TestKey.ENTER);

        expect(component.tags.length).toBe(2);
    });

    // tslint:disable:no-any
    it('should get 100 coverage', async () => {
        await fixture.whenStable();

        const newChipEvent: MatChipInputEvent = { input: undefined as any, value: undefined as any };

        component.add(newChipEvent);
        expect(component.tags.length).toBe(0);
    });

    it('should remove a tag when its cancel button is clicked', async () => {
        const chipHarness = await loader.getHarness<MatChipListHarness>(MatChipListHarness);
        const input: MatChipInputHarness = await chipHarness.getInput();

        await input.setValue('tag-de-marde');
        await input.sendSeparatorKey(TestKey.ENTER);
        expect(component.tags.length).toEqual(1);

        const cancelButton = await loader.getHarness<MatChipHarness>(MatChipHarness);
        await cancelButton.remove();
        expect(component.tags.length).toEqual(0);
    });

    it('should handle remove function being called on an empty tags array', () => {
        spyOn(component.tags, 'splice');
        component.remove('allo');
        expect(component.tags.splice).not.toHaveBeenCalled();
    });
});
