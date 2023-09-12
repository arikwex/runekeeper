import { on } from "./bus";
import { canvas, renderLines, retainTransform } from "./canvas";
import { LIGHT_BROWN, TAN } from "./color";
import { GAME_OVER, SCORED } from "./events";

function GameArena() {
    let score = 0;
    let gameOver = false;

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
        if (!gameOver) {
            ctx.fillStyle = "#222";
            ctx.textAlign = "center";
            ctx.font = `bold 30px arial`;
            ctx.fillText(`${score} ${score == 1 ? 'ENEMY' : 'ENEMIES'} SLAIN`, SIZE * 3, -SIZE * 0.4);
        } else {
            ctx.fillStyle = "#f00";
            ctx.textAlign = "center";
            ctx.font = `bold 30px arial`;
            ctx.fillText(`GAME OVER! (score = ${score})`, SIZE * 3, -SIZE * 0.4);
        }
    }

    function update(dT) {

    }

    function onScored() {
        score += 1;
    }

    function onGG() {
        gameOver = true;
    }
    on(SCORED, onScored);
    on(GAME_OVER, onGG);

    return {
        update,
        render,
        order: -20,
    }
}

export default GameArena;