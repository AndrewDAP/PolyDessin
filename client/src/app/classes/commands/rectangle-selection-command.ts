import { Command } from '@app/classes/commands/command';
import { Vec2 } from '@app/classes/vec2';
import { FLIPPED } from '@app/const';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';

export class RectangleSelectionCommand implements Command {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private rectangleSelection: RectangleSelectionService,
        private originalDimension: Vec2,
        private dimension: Vec2,
        private selectionPos: Vec2,
        private hasFlipped: Record<MirrorDirection, boolean>,
        private isPreview: boolean,
    ) {}

    async do(): Promise<void> {
        const originalPos = this.rectangleSelection.originalPos;

        // Draw a rectangle at the position where it was originally sampled
        if (this.rectangleSelection.drawOG) {
            this.drawRectangle(originalPos, this.originalDimension);
            this.ctx.restore();
        }

        // Draw another rectangle at the current position of the selection
        this.drawRectangle(this.selectionPos, this.dimension);

        // Move the canvas origin to scale it
        this.ctx.translate(this.selectionPos.x + this.dimension.x / 2, this.selectionPos.y + this.dimension.y / 2);

        this.ctx.scale(this.hasFlipped.vertical ? FLIPPED : 1, this.hasFlipped.horizontal ? FLIPPED : 1);

        // Converting the imageData sampled from the context to an ImageBitmap, allowing us to call context.drawImage
        this.rectangleSelection.imageBitmap = await createImageBitmap(this.rectangleSelection.content);

        this.ctx.drawImage(
            this.rectangleSelection.imageBitmap as ImageBitmap,
            -this.dimension.x / 2,
            -this.dimension.y / 2,
            this.dimension.x,
            this.dimension.y,
        );

        // Move the canvas origin back to 0,0 after scaling it
        this.ctx.translate(0, 0);
        this.ctx.restore();

        // Dispose of all graphical ressources associated with the ImageBitmap
        this.rectangleSelection.imageBitmap.close();
    }

    drawRectangle(position: Vec2, dimension: Vec2): void {
        this.ctx.save();
        if (this.isPreview) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(position.x, position.y, dimension.x, dimension.y);
        } else {
            this.ctx.clearRect(position.x, position.y, dimension.x, dimension.y);
        }
    }
}
