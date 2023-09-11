import { retainTransform } from "./canvas";

function PulseSFX(cx, cy, scale, rgb) {
    let t = 0;

    function render(ctx) {
        retainTransform(() => {
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
            const p = t / 0.5;
            const r = scale * (1 - Math.exp(-p * 4));
            const alpha = 1.0 - p;
            ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
            ctx.lineWidth = 12 * (1 - p);
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    function update(dT) {
        t += dT;
        return t > 0.5;
    }

    return {
        render,
        update,
        order: 15,
    };
}

export default PulseSFX;