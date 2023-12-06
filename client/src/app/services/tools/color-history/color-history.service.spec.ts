import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/tools/color/color.service';
import { ColorHistoryService } from './color-history.service';

describe('Service: ColorHistory', () => {
    let service: ColorHistoryService;
    const HISTORY_MAX = 10;
    let colorService: ColorService;
    beforeEach(() => {
        colorService = new ColorService();
        spyOnProperty(colorService, 'primaryColor', 'get').and.returnValue(new Color(0, 0, 0, 1));
        spyOnProperty(colorService, 'secondaryColor', 'get').and.returnValue(new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE));
        TestBed.configureTestingModule({ providers: [{ provide: ColorService, useValue: colorService }] });
        service = TestBed.inject(ColorHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add selected color to history upon accepting', () => {
        expect(service.getHistory[0]).toEqual(colorService.primaryColor);
        expect(service.getHistory[1]).toEqual(colorService.secondaryColor);
        expect(service.getHistory[2]).not.toBeDefined();

        service.addToHistory(Color.RED);
        expect(service.getHistory[2]).toEqual(Color.RED);
    });

    it('should not add selected color to history upon accepting with a color already present in the history', () => {
        expect(service.getHistory[0]).toEqual(colorService.primaryColor);
        expect(service.getHistory[1]).toEqual(colorService.secondaryColor);
        expect(service.getHistory[2]).not.toBeDefined();

        service.addToHistory(Color.WHITE);
        expect(service.getHistory[2]).not.toBeDefined();
    });

    it('should not add selected color to history upon accepting with a different alpha', () => {
        const mockAlpha = 0.32;
        expect(service.getHistory[0]).toEqual(colorService.primaryColor);
        expect(service.getHistory[1]).toEqual(colorService.secondaryColor);
        expect(service.getHistory[2]).not.toBeDefined();

        service.addToHistory(new Color(Color.WHITE.h, Color.WHITE.s, Color.WHITE.l, mockAlpha));
        expect(service.getHistory[2]).not.toBeDefined();
    });

    it('should remove first color (oldest color) and add the selected color (at the end : 9th pos) when the history exceeds 10 colors', () => {
        service.clearHistory();
        service.addToHistory(Color.BLUE);
        for (let i = 1; i < HISTORY_MAX; i++) service.addToHistory(new Color(i, i, i));

        expect(service.getHistory.length).toBe(HISTORY_MAX);
        expect(service.getHistory[0]).toEqual(Color.BLUE);
        const secondColor = service.getHistory[1];
        service.addToHistory(Color.RED);
        expect(service.getHistory[0]).toEqual(secondColor);
        expect(service.getHistory[HISTORY_MAX - 1]).toEqual(Color.RED);
    });

    it('clearHistory should clear the history and initialize with the current selected colors', () => {
        service.addToHistory(Color.RED, Color.BLUE);
        // tslint:disable-next-line:no-magic-numbers
        expect(service.getHistory.length).toBe(4);
        service.clearHistory();
        expect(service.getHistory.length).toBe(2);
        expect(service.getHistory[0]).toEqual(colorService.primaryColor);
        expect(service.getHistory[1]).toEqual(colorService.secondaryColor);
    });

    it('should initialize history with the current selected colors', () => {
        expect(service.getHistory.length).toBe(2);
        expect(service.getHistory[0]).toEqual(colorService.primaryColor);
        expect(service.getHistory[1]).toEqual(colorService.secondaryColor);
    });

    it('addToHistory should add multiple colors', () => {
        expect(service.getHistory.length).toBe(2);
        service.addToHistory(Color.RED, Color.BLUE);
        // tslint:disable-next-line:no-magic-numbers
        expect(service.getHistory.length).toBe(4);
    });
});
