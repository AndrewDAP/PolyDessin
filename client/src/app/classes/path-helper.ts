import { Vec2 } from '@app/classes/vec2';

export class PathHelper {
    static vec2ToSVGPathData(pathData: Vec2[]): string {
        let stringSVG = '';
        stringSVG = `M ${pathData[0].x} ${pathData[0].y}`;
        for (let i = 1; i < pathData.length; i++) {
            // Do not add last element, instead, return to first position
            if (i === pathData.length - 1) {
                stringSVG += ' Z';
            } else {
                stringSVG += ` L ${pathData[i].x} ${pathData[i].y}`;
            }
        }
        return stringSVG;
    }
}
