import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { TextService } from '@app/services/text/text.service';
import { ToolType } from '@app/tool-type';
import { Observable } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    let component: AppComponent;

    let keyEventService: jasmine.SpyObj<KeyEventService>;
    let textService: jasmine.SpyObj<TextService>;

    beforeEach(async(() => {
        keyEventService = jasmine.createSpyObj('KeyEventService', [
            'getKeyDownEvent',
            'getKeyUpEvent',
            'getMouseEvent',
            'getWheelEvent',
            'onMouseMove',
            'onMouseMoveWindow',
            'onMouseDown',
            'onMouseUp',
            'onMouseLeave',
            'onMouseEnter',
            'onKeyDown',
            'onKeyUp',
            'onWheelEvent',
        ]);
        textService = jasmine.createSpyObj('TextService', ['writing', 'onKeyDown']);

        keyEventService.getKeyDownEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getKeyUpEvent.and.returnValue(new Observable<KeyboardEvent>());
        keyEventService.getMouseEvent.and.returnValue(new Observable<MouseEvent>());
        keyEventService.getWheelEvent.and.returnValue(new Observable<WheelEvent>());
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [
                { provide: KeyEventService, useValue: keyEventService },
                { provide: TextService, useValue: textService },
            ],
        });
        const fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it(' should call key event onKeyDown when receiving a KeyBoardEvent', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation']);
        component.onKeyDown(event);
        expect(keyEventService.onKeyDown).toHaveBeenCalled();
    });

    it(' should call key event onKeyDown of text when writing text', () => {
        keyEventService.currentTool = ToolType.text;
        textService.writing = true;
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation']);
        component.onKeyDown(event);
        expect(textService.onKeyDown).toHaveBeenCalled();
        keyEventService.currentTool = ToolType.pencil;
    });
});
