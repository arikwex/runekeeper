import { emit, on } from "./bus";
import { retainTransform } from "./canvas";
import { WHITE } from "./color";
import { add } from "./engine";
import { ABILITY_USE, RUNESTONE_LAND } from "./events";
import PulseSFX from "./pulse-sfx";

const POWER_COLORS = [
    [230, 30, 30],
    [48, 128, 230],
    [106, 250, 106],
];

function Ability(cx, cy, powerType) {
    let anim = Math.random() * 5;
    let t = 0;
    let renderOrder = 50;
    if (powerType == 1) {
        renderOrder = 10;
    }

    // VFX on spawn
    add(PulseSFX(cx, cy, 55, POWER_COLORS[powerType]));
    emit(ABILITY_USE, [cx, cy, powerType]);

    function update(dT) {
        anim += dT;
        t += dT * 1;
        
        if (t > 1) {
            return true;
        }
    }

    function render(ctx) {
        if (powerType == 0) {
            retainTransform(() => {
                ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
                for (let i = 0; i < 12; i++) {
                    const p = (i * 30 + anim * 100) % 50 / 50.0;
                    const q = 0.15 + p * 0.85;
                    const w = (1-p*p*p*p*p);
                    ctx.fillStyle = `rgba(${255 * w}, ${(50+p*200) * w}, ${30 * w}, ${(1-p)*(1-t*t*t)})`;
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
                const p = 1 - t * t * t;
                ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
                ctx.fillStyle = '#29e';
                ctx.fillRect(-38 * p, -38 * p, 76 * p, 76 * p);
                
                ctx.strokeStyle = '#eef';
                ctx.lineWidth = 5 * p;
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
        else if (powerType == 2) {
            retainTransform(() => {
                ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
                ctx.strokeStyle = '#131';
                ctx.lineWidth = 11 * (1 - t);
                ctx.beginPath();
                ctx.moveTo(-18 * Math.cos(Math.round(anim*13)*123), -55);
                ctx.lineTo(18 * Math.cos(Math.round(anim*15)*103), -40);
                ctx.lineTo(-11 * Math.cos(Math.round(anim*17)*93), -20);
                ctx.lineTo(11 * Math.cos(Math.round(anim*13)*133), -15);
                ctx.lineTo(6 * Math.cos(Math.round(anim*11)*97), 10);
                ctx.stroke();
                ctx.strokeStyle = '#1f1';
                ctx.lineWidth = 10 * (1 - t);
                ctx.stroke();
            });
        }
    }

    return {
        update,
        render,
        order: renderOrder,
    };
}

export default Ability;