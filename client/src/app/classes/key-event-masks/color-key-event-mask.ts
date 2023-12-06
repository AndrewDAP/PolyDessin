import { KeyEventMask } from './key-event-mask';

export class ColorKeyEventMask implements KeyEventMask {
    downMask: string[] = ['Escape', 'Enter'];
    upMask: string[] = [];
}
