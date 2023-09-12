import { on } from "./bus";
import { canvas, renderLines, retainTransform } from "./canvas";
import { LIGHT_BROWN, TAN } from "./color";
import { SCORED } from "./events";

function GameArena() {
    let score = 0;

    function render(ctx) {
        retainTransform(() => {
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = LIGHT_BROWN;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        ctx.strokeStyle = '#fbcda1';
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

        // draw score
        ctx.fillStyle = "#222";
        ctx.textAlign = "center";
        ctx.font = `bold 30px arial`;
        ctx.fillText(`${score} ${score == 1 ? 'ENEMY' : 'ENEMIES'} SLAIN`, SIZE * 3, -SIZE * 0.4);
    }

    function update(dT) {

    }

    function onScored() {
        score += 1;
    }
    on(SCORED, onScored);

    return {
        update,
        render,
        order: -20,
    }
}

export default GameArena;