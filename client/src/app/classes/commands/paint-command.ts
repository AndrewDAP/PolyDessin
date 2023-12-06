import { Command } from './command';

// disabled because it is not an error. ts-lint reason : Bitwise operators are often typos
// tslint:disable: no-bitwise
export class PaintCommand implements Command {
    constructor(private ctx: CanvasRenderingContext2D, private imageData: ImageData) {}

    do(): void {
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
