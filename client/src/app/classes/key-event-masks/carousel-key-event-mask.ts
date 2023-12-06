import { KeyEventMask } from './key-event-mask';

export class CarouselKeyEventMask implements KeyEventMask {
    downMask: string[] = ['Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    upMask: string[] = [];
}
