import { Command } from '@app/classes/commands/command';
import { PathHelper } from '@app/classes/path-helper';
import { Vec2 } from '@app/classes/vec2';
import { DASH, FLIPPED, LINE_DASH_OFFSET, PERIMETER_STROKE_SIZE } from '@app/const';
import { PolygonalLassoService } from '@app/services/tools/selection/lasso/polygonal-lasso.service';
import { MirrorDirection } from '@app/services/tools/selection/logic/selection-logic.service';

export class PolyLassoSelectionCommand implements Command {
    selectionPath: Vec2[] = [];

    constructor(
        private ctx: CanvasRenderingContext2D,
        private polygonalLasso: PolygonalLassoService,
        private dimension: Vec2,
        private originalDimension: Vec2,
        private selectionPos: Vec2,
        private originalPos: Vec2,
        private isPreview: boolean,
        private pathData: Vec2[],
        private hasFlipped: Record<MirrorDirection, boolean>,
        private deleting: boolean,
    ) {}

    async do(): Promise<void> {
        if (this.pathData === undefined || this.pathData.length === 0) return;
        for (const coord of this.pathData) {
            const newCoord = {
                x: this.selectionPos.x + ((coord.x - this.originalPos.x) / this.originalDimension.x) * this.dimension.x,
                y: this.selectionPos.y + ((coord.y - this.originalPos.y) / this.originalDimension.y) * this.dimension.y,
            } as Vec2;
            if (this.hasFlipped.vertical) {
                newCoord.x = this.selectionPos.x + this.dimension.x - ((coord.x - this.originalPos.x) / this.originalDimension.x) * this.dimension.x;
            }
            if (this.hasFlipped.horizontal) {
                newCoord.y = this.selectionPos.y + this.dimension.y - ((coord.y - this.originalPos.y) / this.originalDimension.y) * this.dimension.y;
            }
            this.selectionPath.push(newCoord);
        }
        const originalPath = new Path2D(PathHelper.vec2ToSVGPathData(this.pathData));
        // Draw the lasso shape at the position where it was first sampled
        if (this.polygonalLasso.drawOG) {
            this.clipPath(this.originalPos, this.originalDimension, originalPath);
            this.ctx.restore();
        }

        const selectionPath = new Path2D(PathHelper.vec2ToSVGPathData(this.selectionPath));
        // Draw another lasso shape at the current position of the selection
        if (this.deleting) return;

        this.clipPath(this.selectionPos, this.dimension, selectionPath);

        // Move the canvas origin to scale it
        this.ctx.translate(this.selectionPos.x + this.dimension.x / 2, this.selectionPos.y + this.dimension.y / 2);

        this.ctx.scale(this.hasFlipped.vertical ? FLIPPED : 1, this.hasFlipped.horizontal ? FLIPPED : 1);

        // Converting the imageData sampled from the context to an ImageBitmap, allowing us to call context.drawImage
        this.polygonalLasso.imageBitmap = await createImageBitmap(this.polygonalLasso.content as ImageData);

        this.ctx.drawImage(
            this.polygonalLasso.imageBitmap as ImageBitmap,
            -this.dimension.x / 2,
            -this.dimension.y / 2,
            this.dimension.x,
            this.dimension.y,
        );

        // Move the canvas origin back to 0,0 after scaling it
        this.ctx.translate(0, 0);
        this.ctx.restore();

        if (this.isPreview) {
            this.ctx.save();
            this.ctx.lineDashOffset = 0;
            this.ctx.strokeStyle = 'black';
            this.ctx.setLineDash(DASH);
            this.ctx.lineWidth = PERIMETER_STROKE_SIZE;
            this.ctx.stroke(selectionPath);
            this.ctx.lineDashOffset = LINE_DASH_OFFSET;
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke(selectionPath);
            this.ctx.restore();
        }
        this.polygonalLasso.imageBitmap.close();
    }

    clipPath(position: Vec2, dimension: Vec2, path: Path2D): void {
        this.ctx.save();
        this.ctx.clip(path);
        this.ctx.fillStyle = 'white';
        if (this.isPreview) {
            this.ctx.fillRect(position.x, position.y, dimension.x, dimension.y);
        } else {
            this.ctx.clearRect(position.x, position.y, dimension.x, dimension.y);
        }
    }
}
