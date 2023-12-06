import { KeyEventMask } from './key-event-mask';

export class DialogKeyEventMask implements KeyEventMask {
    downMask: string[] = ['Escape', 'Enter'];
    upMask: string[] = [];
}
