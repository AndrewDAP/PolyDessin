import { Vec2 } from '@app/classes/vec2';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { Command } from './command';

const ANGLE = 180;
const degreeToRadian = (degree: number): number => {
    return (degree * Math.PI) / ANGLE;
};

export class DrawStamp implements Command {
    constructor(public img: HTMLImageElement, public stampService: StampService, public centerImgCoord: Vec2, public ctx: CanvasRenderingContext2D) {}

    do(): void {
        const imgSize = this.imageSizeAccordingToRatio(this.img.width, this.img.height);
        const imageCoord = this.imageCoordAccordingToSize(imgSize, this.centerImgCoord);
        this.ctx.translate(this.centerImgCoord.x, this.centerImgCoord.y);
        const angleInRandian = degreeToRadian(this.stampService.angle);
        this.ctx.rotate(angleInRandian);
        this.ctx.drawImage(this.img, imageCoord.x, imageCoord.y, imgSize.x, imgSize.y);
        this.ctx.rotate(-angleInRandian);
        this.ctx.translate(-this.centerImgCoord.x, -this.centerImgCoord.y);
    }

    imageSizeAccordingToRatio(width: number, height: number): Vec2 {
        return { x: width * this.stampService.ratio, y: height * this.stampService.ratio };
    }

    imageCoordAccordingToSize(imgDimension: Vec2, mouseDownCoord: Vec2): Vec2 {
        return { x: -imgDimension.x / 2, y: -imgDimension.y / 2 };
    }
}
