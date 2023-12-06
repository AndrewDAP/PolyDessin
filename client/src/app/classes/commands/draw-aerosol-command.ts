import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { Command } from './command';

export class DrawAerosolCommand implements Command {
    constructor(public aerosolService: AerosolService, public color: string, public ctx: CanvasRenderingContext2D) {}

    do(): void {
        for (const position of this.aerosolService.dropletPosition) {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, this.aerosolService.dropletSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
}
