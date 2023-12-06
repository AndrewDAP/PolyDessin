import { Command } from '@app/classes/commands/command';
import { Vec2 } from '@app/classes/vec2';
import { DASH, FLIPPED, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';

export class EllipseSelectionCommand implements Command {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private ellipseSelection: EllipseSelectionService,
        private originalDimension: Vec2,
        private dimension: Vec2,
        private selectionPos: Vec2,
        private originalPos: Vec2,
        private isPreview: boolean,
        private hasFlipped: Record<MirrorDirection, boolean>,
    ) {}

    async do(): Promise<void> {
        const originalRadius = { x: this.originalDimension.x / 2, y: this.originalDimension.y / 2 };
        const newRadius = { x: this.dimension.x / 2, y: this.dimension.y / 2 };
        const originalPath = new Path2D();
        const newPath = new Path2D();

        // Draw an ellipse at the position where it was first sampled
        if (this.ellipseSelection.drawOG) {
            this.clipEllipse(this.originalPos, originalRadius, this.originalDimension, originalPath);
            this.ctx.restore();
        }

        // Draw another ellipse at the current position of the selection
        this.clipEllipse(this.selectionPos, newRadius, this.dimension, newPath);

        // Move the canvas origin to scale it
        this.ctx.translate(this.selectionPos.x + this.dimension.x / 2, this.selectionPos.y + this.dimension.y / 2);

        this.ctx.scale(this.hasFlipped.vertical ? FLIPPED : 1, this.hasFlipped.horizontal ? FLIPPED : 1);

        // Converting the imageData sampled from the context to an ImageBitmap, allowing us to call context.drawImage
        this.ellipseSelection.imageBitmap = await createImageBitmap(this.ellipseSelection.content as ImageData);

        this.ctx.drawImage(
            this.ellipseSelection.imageBitmap as ImageBitmap,
            -this.dimension.x / 2,
            -this.dimension.y / 2,
            this.dimension.x,
            this.dimension.y,
        );

        // Move the canvas origin back to 0,0 after scaling it
        this.ctx.translate(0, 0);
        this.ctx.restore();

        // Should only draw the dotted lines around the shape while editing the selection
        if (this.isPreview) {
            this.ctx.save();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineDashOffset = 0;
            this.ctx.setLineDash(DASH);
            this.ctx.lineWidth = PERIMETER_STROKE_SIZE;
            this.ctx.stroke(newPath);
            this.ctx.lineDashOffset = LINE_DASH_OFFSET;
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke(newPath);
            this.ctx.restore();
        }

        // Dispose of all graphical ressources associated with the ImageBitmap
        this.ellipseSelection.imageBitmap.close();
    }

    clipEllipse(position: Vec2, radius: Vec2, dimension: Vec2, path: Path2D): void {
        this.ctx.save();
        path.ellipse(position.x + radius.x, position.y + radius.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
        this.ctx.clip(path);
        this.ctx.fillStyle = 'white';
        if (this.isPreview) {
            this.ctx.fillRect(position.x, position.y, dimension.x, dimension.y);
        } else {
            this.ctx.clearRect(position.x, position.y, dimension.x, dimension.y);
        }
    }
}
