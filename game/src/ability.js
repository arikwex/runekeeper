import { retainTransform } from "./canvas";
import { WHITE } from "./color";

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
        else if (powerType == 1) {
            retainTransform(() => {
                ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
                ctx.fillStyle = '#29e';
                ctx.fillRect(-38, -38, 76, 76);
                
                ctx.strokeStyle = '#eef';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-25, 5);
                ctx.lineTo(-20, -5);
                ctx.lineTo(-15, 5);
                ctx.moveTo(-5, 25);
                ctx.lineTo(0, 15);
                ctx.lineTo(5, 25);
                ctx.moveTo(-5, -15);
                ctx.lineTo(0, -25);
                ctx.lineTo(5, -15);
                ctx.moveTo(25, 5);
                ctx.lineTo(20, -5);
                ctx.lineTo(15, 5);
                ctx.stroke();
            });
        }
    }

    return {
        update,
        render
    };
}

export default Ability;