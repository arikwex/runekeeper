import { canvas, retainTransform } from "./canvas";
import COLORS from "./color";

function GameArena() {

    function render(ctx) {
        retainTransform(() => {
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = COLORS.TAN;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        ctx.strokeStyle = COLORS.LIGHT_BROWN;
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
    }

    function update(dT) {

    }

    return {
        update,
        render,
    }
}

export default GameArena;