import { retainTransform } from "./canvas";

function DamageParticle(cx, cy, dmg, color) {
    let anim = 0;

    function render(ctx) {
        retainTransform(() => {
            ctx.translate((cx + 0.5) * 80, (cy + 0.3) * 80 - (1-Math.exp(-anim*5)) * 70);
            const alpha = 1 - anim/2;
            ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
            ctx.textAlign = 'center';
            ctx.font = `bold 40px arial`;
            ctx.fillText(`-${dmg}`, 0, 0);
        });
    }

    function update(dT) {
        anim += dT;
        if (anim > 2) {
            return true;
        }
    }

    return {
        update,
        render,
        order: 100,
    };
}

export default DamageParticle;