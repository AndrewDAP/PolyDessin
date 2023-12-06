export class Color {
    constructor(h: number, s: number, l: number, a: number = 1) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }

    static readonly MAX_HUE: number = 360;
    static readonly MAX_SATURATION: number = 100;
    static readonly MAX_LUMINANCE: number = 100;
    static readonly MAX_ALPHA: number = 1;
    static readonly MAX_RGB: number = 255;
    static readonly WHITE: Color = new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE);
    static readonly BLACK: Color = new Color(0, 0, 0, 1);
    static readonly RED: Color = new Color(0, Color.MAX_SATURATION, Color.MAX_LUMINANCE / 2);
    // tslint:disable-next-line: no-magic-numbers
    static readonly GREEN: Color = new Color(120, Color.MAX_SATURATION, Color.MAX_LUMINANCE / 2);
    // tslint:disable-next-line: no-magic-numbers
    static readonly BLUE: Color = new Color(240, Color.MAX_SATURATION, Color.MAX_LUMINANCE / 2);

    // tslint:disable-next-line: no-magic-numbers
    static readonly FUSHIA: Color = new Color(301, Color.MAX_SATURATION, Color.MAX_LUMINANCE / 2);

    h: number;
    s: number;
    l: number;
    a: number;

    hsl(): string {
        return `hsl(${this.h},${this.s}%,${this.l}%)`;
    }

    hsla(): string {
        return `hsla(${this.h},${this.s}%,${this.l}%,${this.a})`;
    }

    copy(): Color {
        return new Color(this.h, this.s, this.l, this.a);
    }

    equals(other: Color): boolean {
        return this.h === other.h && this.s === other.s && this.l === other.l && this.a === other.a;
    }
}
