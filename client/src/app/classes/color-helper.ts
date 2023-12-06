import { Color } from './color';
// tslint:disable: no-magic-numbers
export class ColorHelper {
    // Author: J. Kantner, “Converting Color Spaces in JavaScript: CSS-Tricks,” CSS, 26-Jan-2021. [Online].
    // Available: https://css-tricks.com/converting-color-spaces-in-javascript/. [Accessed: 01-Feb-2021].
    // Modified to conform with TSLint.
    static hex2hsl(hex: string, alpha: number = Color.MAX_ALPHA): Color {
        const H: string[] = hex.split('');

        const firstVal = 0;
        const secondVal = 1;
        const thirdVal = 2;
        const fourthVal = 3;
        const fifthVal = 4;
        const sixthVal = 5;
        // Convert hex to RGB first
        const rHexString: string = '0x' + H[firstVal] + H[secondVal];
        const gHexString: string = '0x' + H[thirdVal] + H[fourthVal];
        const bHexString: string = '0x' + H[fifthVal] + H[sixthVal];
        const MAX_RGB = 255;
        // Then to HSL
        const r: number = +rHexString / MAX_RGB;
        const g: number = +gHexString / MAX_RGB;
        const b: number = +bHexString / MAX_RGB;
        const cmin: number = Math.min(r, g, b);
        const cmax: number = Math.max(r, g, b);
        const delta: number = cmax - cmin;
        let h = 0;
        let s = 0;
        let l = 0;

        const hueMax = 6;
        const hueMax2 = 4;
        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % hueMax;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + hueMax2;

        const hueTo360 = 60;
        h = Math.round(h * hueTo360);

        const hueNegative = 360;
        if (h < 0) h += hueNegative;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return new Color(h, s, l, alpha);
    }

    // Author : K. Kiełczewski, “Convert HSB/HSV color to HSL” Stack Overflow, 09-Jan-2019. [Online].
    // Available: https://stackoverflow.com/questions/3423214/convert-hsb-hsv-color-to-hsl. [Accessed: 01-Feb-2021].
    // Modified to conform with TSLint.
    static readonly hsl2hsv = (s: number, l: number, v: number = s * Math.min(l, 1 - l) + l) => [v ? 2 - (2 * l) / v : 0, v];
    // Author : K. Kiełczewski, “Convert HSB/HSV color to HSL” Stack Overflow, 09-Jan-2019. [Online].
    // Available: https://stackoverflow.com/questions/3423214/convert-hsb-hsv-color-to-hsl. [Accessed: 01-Feb-2021].
    // Modified to conform with TSLint.
    static readonly hsv2hsl = (s: number, v: number, l: number = v - (v * s) / 2, m: number = Math.min(l, 1 - l)) => [m ? (v - l) / m : 0, l];

    // Author : icl7126, “convert Hsl to rgb and hex” Stack Overflow, 23-May-2017. [Online].
    // Available: https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex. [Accessed: 05-Feb-2021].
    // Modified to conform with TSLint.
    static hsl2hex(color: Color): string {
        const h = color.h;
        const s = color.s;
        let l = color.l;

        l /= 100;
        const a = (s * Math.min(l, 1 - l)) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;

            const res = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * res)
                .toString(16)
                .toUpperCase()
                .padStart(2, '0');
        };

        return `${f(0)}${f(8)}${f(4)}`;
    }

    static rbga2hsla(r: number, g: number, b: number, a: number): Color {
        const RGB_MAX = 255;
        const alpha = a / RGB_MAX;
        const hex: string = this.rgb2hex(r, g, b);
        const color: Color = this.hex2hsl(hex);
        return new Color(color.h, color.s, color.l, alpha);
    }

    static rgb2hex(r: number, g: number, b: number): string {
        return [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('')
            .toUpperCase();
    }

    // Author : icl7126, “convert Hsl to rgb and hex” Stack Overflow, 23-May-2017. [Online].
    // Available: https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex. [Accessed: 05-Feb-2021].
    // Modified to conform with TSLint
    static hsl2rgb(color: Color): number[] {
        const h = color.h / Color.MAX_HUE;
        const s = color.s / Color.MAX_SATURATION;
        const l = color.l / Color.MAX_LUMINANCE;

        let r: number;
        let g: number;
        let b: number;

        if (s === 0) {
            r = g = b = l;
        } else {
            // tslint:disable-next-line: no-shadowed-variable
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}
