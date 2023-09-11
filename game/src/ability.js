import { retainTransform } from "./canvas";

function Ability(cx, cy, powerType) {
    let anim = Math.random() * 5;

    function update(dT) {
        anim += dT;
    }

    function render(ctx) {
        if (powerType == 0) {
            retainTransform(() => {
                ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
                for (let i = 0; i < 12; i++) {
                    const p = (i * 30 + anim * 100) % 50 / 50.0;
                    const q = 0.15 + p * 0.85;
                    const w = (1-p*p*p*p*p);
                    ctx.fillStyle = `rgba(${255 * w}, ${(50+p*200) * w}, ${30 * w}, ${1-p})`;
                    ctx.beginPath();
                    ctx.ellipse(
                        ((i * 83) % 130 - 65) * 0.5,
                        -p * 56 + ((i * 11) % 23 - 5) * 2,
                        26 * (1-p) * q, 26 * (1-p) / q * p, 0, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            });
        }
    }

    return {
        update,
        render
    };
}

export default Ability;