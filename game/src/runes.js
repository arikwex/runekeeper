// Contiguous lines
export const CARET_RUNE = [[-7, 10], [0, -10], [7, 10]];
export const CIRCLE_RUNE = [[10, 0], [9, 4], [7, 7], [4, 9], [0, 10], [-4, 9], [-7, 7], [-9, 4], [-10, 0], [-9, -4], [-7, -7], [-4, -9], [0, -10], [4, -9], [7, -7], [9, -4], [10, 0]];
export const BOLT_RUNE = [[-5, -10], [5, -10], [-3, 0], [3, 0], [0, 10]];
export const TRIANGLE_RUNE = [[-9,-10],[9,-10],[0,10],[-9,-10]];
export const WAVE_RUNE = [[-10, -4], [-5, 4], [0, -4], [5, 4], [10, -4]];
export const HOURGLASS_RUNE = [[-9, -8], [9, 8], [9, -8], [-9, 8], [-9, -8]];

// pairs of points / line segments
export const SQUARE_SHAPE = [[-7,-7],[7,-7], [7,-7],[7,7], [7,7],[-7,7], [-7,7],[-7,-7]];
export const PLUS_SHAPE = [[-7,0],[7,0], [0,-7],[0,7]];
export const EX_SHAPE = [[-7, -7],[7,7], [-7,7],[7,-7]];
export const HORIZONTAL_SHAPE = [[-7,0],[7,0]];
export const VERTICAL_SHAPE = [[0,-7],[0,7]];

export const COLOR_MAP = {
    0: [0.4, 0.4, 0.4],
    1: [1.0, 0.3, 0.3],
    2: [0.3, 0.65, 1.0],
    3: [0.4, 1.0, 0.4],
    4: [1.0, 1.0, 0.3],
    5: [1.0, 0.65, 0.3],
    6: [1.0, 0.4, 1.0],
};