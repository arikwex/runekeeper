import { canvas, renderLines, retainTransform } from "./canvas";
import { LIGHT_BROWN, TAN } from "./color";
import { BOLT_RUNE, CARET_RUNE, CIRCLE_RUNE, HOURGLASS_RUNE, TRIANGLE_RUNE, WAVE_RUNE } from "./runes";

const runeOrder = [
    CARET_RUNE,
    CIRCLE_RUNE,
    BOLT_RUNE,
    TRIANGLE_RUNE,
    WAVE_RUNE,
    HOURGLASS_RUNE,
];

function GameArena() {

    function render(ctx) {
        retainTransform(() => {
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = LIGHT_BROWN;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        ctx.strokeStyle =  TAN;
        ctx.lineWidth = 4;
        ctx.beginPath();
        const SIZE = 80;
        for (let x = 0; x <= 6; x++) {
            ctx.moveTo(x * SIZE, 0);
            ctx.lineTo(x * SIZE, 6 * SIZE);
            ctx.moveTo(0, x * SIZE);
            ctx.lineTo(6 * SIZE, x * SIZE);
        }
        ctx.stroke();

        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = TAN;
            ctx.lineWidth = 4;
            retainTransform(() => {
                ctx.translate(-SIZE / 2, SIZE / 2 + SIZE * i);
                ctx.scale(1.5, 1.5);
                renderLines(ctx, runeOrder[i]);
            });
            retainTransform(() => {
                ctx.translate(SIZE / 2 + SIZE * i, SIZE * 6.5);
                ctx.scale(1.5, 1.5);
                renderLines(ctx, runeOrder[i]);
            });
        }
    }

    function update(dT) {

    }

    return {
        update,
        render,
    }
}

export default GameArena;