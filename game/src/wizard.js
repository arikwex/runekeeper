import { canvas, renderAndFill, renderLines, retainTransform } from "./canvas";
import { BLACK, LIGHT_PURPLE, PURPLE, WHITE } from "./color";

function Wizard() {
    let anim = 0;

    function render(ctx) {
        retainTransform(() => {
            ctx.translate(-120, 240);
            // Torso
            ctx.fillStyle = BLACK;
            ctx.strokeStyle = BLACK;
            ctx.lineWidth = 4;
            const squeeze = -Math.cos(anim * 10) * 0.05 + 0.95;
            renderAndFill(ctx, [[-20*squeeze, 0], [12*squeeze, 0], [1*squeeze, -30], [-10*squeeze, -10]]);
            // Hat
            ctx.fillStyle = PURPLE;
            ctx.strokeStyle = PURPLE;
            ctx.translate(0, -23 + Math.abs(Math.sin(anim * 5) * 2.5));
            ctx.rotate(Math.sin(anim*10-1) * 0.06);
            renderAndFill(ctx, [[-20, 2], [-10, -1], [13, 0], [20, 4], [17, 0], [12, -5], [7, -13], [0, -23], [-10, -29], [-21, -20], [-12, -22], [-6, -10]]);
            // Eyes
            ctx.lineWidth = 7;
            ctx.strokeStyle = WHITE;
            renderLines(ctx, [[8, -4], [8.01, -4]]);
            renderLines(ctx, [[-1, -4], [-1.01, -4]]);
            renderLines(ctx, [[2, -11], [2.01, -11]]);
        });
    }

    function update(dT) {
        anim += dT;
    }

    return {
        update,
        render,
    }
}

export default Wizard;