import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { BIGGEST_LETTER, BOLD, INTERLINE, ITALIC } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolType } from '@app/tool-type';
import { Subject } from 'rxjs';
import { TextService } from './text.service';

describe('TextService', () => {
    let service: TextService;

    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let changingToolsServiceSpy: jasmine.SpyObj<ChangingToolsService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const toolTypeSubject: Subject<ToolType> = new Subject();
    beforeEach(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['clearCanvas']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        changingToolsServiceSpy = jasmine.createSpyObj('ChangingToolsService', ['getTool', 'setTool']);
        changingToolsServiceSpy.getTool.and.returnValue(toolTypeSubject.asObservable());
        changingToolsServiceSpy.setTool.and.callFake((tool) => {
            toolTypeSubject.next(tool);
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: ChangingToolsService, useValue: changingToolsServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });
        service = TestBed.inject(TextService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable:no-string-literal
        drawingServiceSpy.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        drawingServiceSpy.previewCtx = previewCtxStub;

        service.writing = true;
        service.text = ['test'];
        service.index.x = 'test'.length;
        service.index.y = 0;
        service.mouseDownCoord = { x: 0, y: 0 };
        colorServiceSpy.primaryColor = Color.RED;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not start textbox on invalid mouseDown event', () => {
        spyOn(service, 'setCursorInterval');
        service.writing = false;
        const invalidMouseEvent: MouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(invalidMouseEvent);
        expect(service.writing).toBeFalse();
        expect(service.setCursorInterval).not.toHaveBeenCalled();
    });

    it('should start textbox on mouseDown event', () => {
        spyOn(service, 'setCursorInterval');
        service.writing = false;
        const validMouseEvent: MouseEvent = {
            clientX: 10,
            clientY: 10,
            button: 0,
        } as MouseEvent;
        service.onMouseDown(validMouseEvent);
        expect(service.writing).toBeTrue();
        expect(service.setCursorInterval).toHaveBeenCalled();
        expect(service.mouseDownCoord).toEqual({ x: validMouseEvent.clientX, y: validMouseEvent.clientY });
    });

    it('should end textbox on mouseDown event outside textbox', () => {
        spyOn(service, 'drawTextCommand').and.callThrough();
        spyOn(service, 'endText').and.callThrough();

        service.text = ['t', 'cooooool', 'toi'];
        service.bold = false;
        service.italic = false;
        drawingServiceSpy.previewCtx.font = service.size + 'px ' + service.police;

        drawingServiceSpy.previewCtx.fillText('test', service.mouseDownCoord.x, service.mouseDownCoord.y);
        const width = drawingServiceSpy.previewCtx.measureText('cooooool').width;
        const heigth = drawingServiceSpy.previewCtx.measureText('M').actualBoundingBoxAscent;

        const mouseEvent: MouseEvent = { clientX: width * 2, clientY: heigth * service.text.length * 2, button: 0 } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.drawTextCommand).toHaveBeenCalled();
        expect(service.endText).toHaveBeenCalled();
        expect(service.writing).toBeFalse();
    });

    it('should not end textbox on mouseDown event inside textbox', () => {
        spyOn(service, 'drawText');

        drawingServiceSpy.previewCtx.fillText(service.text[service.index.y], service.mouseDownCoord.x, service.mouseDownCoord.y);
        const textMetrics = drawingServiceSpy.previewCtx.measureText(service.text[service.index.y]);
        const mouseEvent: MouseEvent = { clientX: textMetrics.width / 2, clientY: textMetrics.actualBoundingBoxAscent / 2, button: 0 } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.writing).toBeTrue();
        expect(service.drawText).not.toHaveBeenCalledWith(drawingServiceSpy.baseCtx);
    });

    it('should not do anything if a keyEvent is caught while not writing', () => {
        service.writing = false;
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: '1' });
        service.onKeyDown(keyEvent);
        expect(service.text).toEqual(['test']);
    });

    it('should add letter to text', () => {
        const keyEvent = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: '1' });
        service.onKeyDown(keyEvent);
        expect(service.text).toEqual(['test1']);
    });

    it('should handle key event (arrows left)', () => {
        service.text = ['hello', 'les', 'imbéciles'];
        service.index.y = 1;
        service.index.x = 1;
        service.bold = true;

        const keyEventLeft = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'ArrowLeft' });
        service.onKeyDown(keyEventLeft);
        expect(service.index.x).toBe(0);

        service.onKeyDown(keyEventLeft);
        expect(service.index.x).toBe(service.text[0].length);
        expect(service.index.y).toBe(0);

        service.index.x = 0;
        service.onKeyDown(keyEventLeft);
        expect(service.index.x).toBe(0);
        expect(service.index.y).toBe(0);
    });

    it('should handle key event (arrows right)', () => {
        service.text = ['hello', 'les', 'imbéciles'];
        service.index.y = 1;
        service.index.x = 2;
        service.italic = true;

        const keyEventRight = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'ArrowRight' });
        service.onKeyDown(keyEventRight);
        expect(service.index.x).toBe('les'.length);

        service.onKeyDown(keyEventRight);
        expect(service.index.x).toBe(0);
        expect(service.index.y).toBe(2);

        service.index.x = 'imbéciles'.length;
        service.onKeyDown(keyEventRight);
        expect(service.index.x).toBe('imbéciles'.length);
        expect(service.index.y).toBe(2);
    });

    it('should handle key event (arrows up-down)', () => {
        service.text = ['hello', 'les', 'imbéciles'];
        service.index.y = 1;
        service.index.x = 2;

        const keyEventUp = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'ArrowUp' });
        service.onKeyDown(keyEventUp);
        expect(service.index.y).toBe(0);

        const keyEventDown = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'ArrowDown' });
        service.onKeyDown(keyEventDown);
        expect(service.index.y).toBe(1);
    });

    it('should handle key event (delete)', () => {
        service.text = ['test', 'delete'];
        service.index.x = 'tes'.length;

        const keyEventDelete = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'Delete' });
        service.onKeyDown(keyEventDelete);
        expect(service.index.x).toBe('tes'.length);
        expect(service.text).toEqual(['tes', 'delete']);

        service.onKeyDown(keyEventDelete);
        expect(service.index.x).toBe('tes'.length);
        expect(service.text).toEqual(['tesdelete']);
    });

    it('should handle key event (backspace)', () => {
        service.text = ['on', 'peut', 'enlever', 'du', 'texte!!!'];
        service.index.x = 0;
        service.index.y = 0;

        const keyEventBackspace = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'Backspace' });
        service.onKeyDown(keyEventBackspace);
        expect(service.index.x).toBe(0);
        expect(service.text).toEqual(['on', 'peut', 'enlever', 'du', 'texte!!!']);

        service.index.y = 1;
        service.index.x = 1;
        service.onKeyDown(keyEventBackspace);
        expect(service.index.x).toBe(0);
        expect(service.text).toEqual(['on', 'eut', 'enlever', 'du', 'texte!!!']);

        service.onKeyDown(keyEventBackspace);
        expect(service.index.x).toBe(2);
        expect(service.text).toEqual(['oneut', 'enlever', 'du', 'texte!!!']);
    });

    it('should handle key event (escape)', () => {
        spyOn(service, 'endText').and.callThrough();

        service.index.x = 'te'.length;

        const keyEventEscape = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'Escape' });
        service.onKeyDown(keyEventEscape);
        expect(service.endText).toHaveBeenCalled();
        expect(service.index.x).toBe(0);
        expect(service.text).toEqual(['']);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(drawingServiceSpy.previewCtx);
    });

    it('should handle key event (enter)', () => {
        service.text = ['multiline', 'power'];
        service.index.x = 1;

        const keyEventEscape = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { key: 'Enter' });
        service.onKeyDown(keyEventEscape);
        expect(service.index.y).toBe(1);
        expect(service.index.x).toBe(0);
        expect(service.text).toEqual(['m', 'ultiline', 'power']);
    });

    it('should not call drawText and endText if the tool is text', () => {
        service.italic = true;
        service.bold = true;
        spyOn(service, 'drawTextCommand').and.callThrough();
        spyOn(service, 'endText').and.callThrough();

        changingToolsServiceSpy.setTool(ToolType.text);
        expect(service.isActive).toBeTruthy();

        changingToolsServiceSpy.setTool(ToolType.pencil);
        expect(service.drawTextCommand).toHaveBeenCalled();
        expect(service.endText).toHaveBeenCalled();
        expect(service.isActive).toBeFalsy();
    });

    it('should draw centered text', (done: DoneFn) => {
        drawingServiceSpy.previewCtx.font =
            (service.bold ? BOLD + ' ' : '') + (service.italic ? ITALIC + ' ' : '') + service.size + 'px ' + service.police;

        service.textAlign = 'center';
        service.mouseDownCoord = { x: 0, y: 0 };
        service.text = ['AAAAALLLLLOOOOOOOO', 'POISSON', 'https://www.youtube.com/watch?v=xvFZjo5PgG0&ab_channel=DeeckPeeck'];
        const textWidth = drawingServiceSpy.previewCtx.measureText(service.text[2]).width;

        service.setStartPos();
        expect(service.startPos).toBe(service.mouseDownCoord.x + textWidth / 2);

        spyOn(drawingServiceSpy.previewCtx, 'fillRect');
        const textHeight =
            drawingServiceSpy.previewCtx.measureText(BIGGEST_LETTER).actualBoundingBoxAscent +
            drawingServiceSpy.previewCtx.measureText(BIGGEST_LETTER).actualBoundingBoxDescent;

        service.setCursorInterval();
        setTimeout(() => {
            expect(drawingServiceSpy.previewCtx.fillRect).toHaveBeenCalledWith(
                textWidth / 2 -
                    drawingServiceSpy.previewCtx.measureText(service.text[service.index.y]).width / 2 +
                    drawingServiceSpy.previewCtx.measureText(service.text[service.index.y].substring(0, service.index.x)).width,
                textHeight + INTERLINE + INTERLINE / 2,
                1,
                -(textHeight + INTERLINE),
            );
            done();
            // tslint:disable-next-line: no-magic-numbers
        }, 1001);
    });

    it('COVERAGE', () => {
        spyOn(service, 'drawText');

        service.textAlign = 'wefmwlk';
        service.writing = false;
        service.setStartPos();
        service.drawPreview();

        expect(service.startPos).toBe(service.mouseDownCoord.x);
        expect(service.drawText).not.toHaveBeenCalled();
    });

    it('should draw right aligned text', () => {
        drawingServiceSpy.previewCtx.font =
            (service.bold ? BOLD + ' ' : '') + (service.italic ? ITALIC + ' ' : '') + service.size + 'px ' + service.police;

        service.textAlign = 'right';
        service.mouseDownCoord = { x: 0, y: 0 };
        service.text = ['AAAAALLLLLOOOOOOOO', 'POISSON', 'https://www.youtube.com/watch?v=xvFZjo5PgG0&ab_channel=DeeckPeeck'];
        const textWidth = drawingServiceSpy.previewCtx.measureText(service.text[2]).width;

        service.setStartPos();
        expect(service.startPos).toBe(service.mouseDownCoord.x + textWidth);

        spyOn(drawingServiceSpy.previewCtx, 'fillRect');
        const textHeight =
            drawingServiceSpy.previewCtx.measureText(BIGGEST_LETTER).actualBoundingBoxAscent +
            drawingServiceSpy.previewCtx.measureText(BIGGEST_LETTER).actualBoundingBoxDescent;

        service.cursorShown = true;
        service.showCursor();
        expect(drawingServiceSpy.previewCtx.fillRect).toHaveBeenCalledWith(
            textWidth -
                drawingServiceSpy.previewCtx.measureText(service.text[service.index.y]).width +
                drawingServiceSpy.previewCtx.measureText(service.text[service.index.y].substring(0, service.index.x)).width,
            textHeight + INTERLINE + INTERLINE / 2,
            1,
            -(textHeight + INTERLINE),
        );
    });
});
