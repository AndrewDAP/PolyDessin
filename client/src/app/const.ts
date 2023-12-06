import { ToolType } from './tool-type';

const DASH_FREQ = 10;
export const DEFAULT_TOOL_SIZE = 5;

export const FLIPPED = -1;

export const DEFAULT_JUNCTION_SIZE = 10;
export const DEFAULT_DROPLET_SIZE = 2;
export const DEFAULT_DROPLET_SPEED = 50;
export const MIN_WIDTH_HEIGHT = 250;
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;
export const MIN_SIDES = 3;
export const MAX_SIDES = 12;
export const MARGIN = 40;
export const PERIMETER_STROKE_SIZE = 2;
export const DASH: number[] = [DASH_FREQ, DASH_FREQ];

export const LINE_DASH_OFFSET = 10;

export const LINE: number[] = [];
export const NO_MATCH = -1;
export const IMAGE_NOT_FOUND_PATH = '@app/../assets/image-not-found/image-not-found.svg';
export const IMAGE_TEST_PATH = '@app/../assets/image-not-found/image-not-found.svg';
export const HTTP_SERVER_DISCONNECTED = 0;
export const HTTP_STATUS_SERVER_ERROR = 500;
export const HTTP_STATUS_NOT_FOUND = 404;
export const ANIMATION_TIME = 100;

export const MAX_TOLERANCE = 100;

export const DEFAULT_OPACITY_CANVAS = 100;
export const DEFAULT_SQUARE_GRID_SIZE = 50;
export const MIN_SLIDER_SIZE_OPACITY = 15;
export const MAX_SLIDER_SIZE_OPACITY = 100;
export const MIN_SLIDER_SQUARE_GRID_SIZE = 20;
export const MAX_SLIDER_SQUARE_GRID_SIZE = 100;

export const IMGUR_ID = 'b7653557c868f67';
export const ACCESS_TOKEN = '7ccc402a2f402023aafa354067880dbf220cf0d7';

export const BIGGEST_LETTER = 'Mg';
export const INTERLINE = 1;
export const BOLD = 'bold';
export const ITALIC = 'italic';
export const POSSIBLE_ALIGNS = ['left', 'center', 'right'];

export const ANGLE_MIN_VALUE = 0;
export const ANGLE_MAX_VALUE = 360;

export enum MagnetGrabHandle {
    UpperLeft,
    UpperCenter,
    UpperRight,
    MiddleLeft,
    MiddleCenter,
    MiddleRight,
    LowerLeft,
    LowerCenter,
    LowerRight,
}

export const enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export const enum FileChoice {
    Png = 0,
    Jpg = 1,
}

export const enum FilterChoice {
    NoFilter = 0,
    GrayScale = 1,
    HueRotate = 2,
    Sepia = 3,
    Invert = 4,
    Blur = 5,
    Length = 6,
}

export const enum SaveChoice {
    Local = 0,
    Imgur = 1,
}

export const nameOfFilter: Map<FilterChoice, string> = new Map([
    [FilterChoice.NoFilter, 'none'],
    [FilterChoice.GrayScale, 'grayscale'],
    [FilterChoice.HueRotate, 'hue-rotate'],
    [FilterChoice.Sepia, 'sepia'],
    [FilterChoice.Invert, 'invert'],
    [FilterChoice.Blur, 'blur'],
]);
// tslint:disable: no-magic-numbers

export const filterMax: Map<FilterChoice, number> = new Map([
    [FilterChoice.NoFilter, 0],
    [FilterChoice.GrayScale, 100],
    [FilterChoice.HueRotate, 360],
    [FilterChoice.Sepia, 100],
    [FilterChoice.Invert, 100],
    [FilterChoice.Blur, 15],
]);

export const keyForTools: Map<ToolType, string> = new Map([
    [ToolType.pencil, 'c'],
    [ToolType.aerosol, 'a'],
    [ToolType.rectangle, '1'],
    [ToolType.ellipse, '2'],
    [ToolType.polygon, '3'],
    [ToolType.line, 'l'],
    [ToolType.paint, 'b'],
    [ToolType.text, 't'],
    [ToolType.eraser, 'e'],
    [ToolType.stamp, 'd'],
    [ToolType.pipette, 'i'],
    [ToolType.rectangleSelection, 'r'],
    [ToolType.ellipseSelection, 's'],
    [ToolType.lassoPolygonal, 'v'],
]);
