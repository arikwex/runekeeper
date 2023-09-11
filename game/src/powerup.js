import { retainTransform } from "./canvas";

function PowerUp(cx, cy) {
    let anim = 0;

    function render(ctx) {
        retainTransform(() => {
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
            ctx.fillStyle = '#d22';
            ctx.beginPath();
            ctx.ellipse(0, 0, 18 + Math.cos(anim * 12) * 1, 18 - Math.cos(anim * 12) * 1, 0, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 3; i++) {
                const p = (i * 30 + anim * 50) % 50 / 50.0;
                const q = 0.15 + p * 0.85;
                ctx.beginPath();
                ctx.ellipse((i * 30 + 20) % 24 - 12, -p * 36, 12 * (1-p) * q, 16 * (1-p) / q * p, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
        });
    }

    function update(dT) {
        anim += dT;
    }

    return {
        render,
        update
    }
}

export default PowerUp;