import { off, on } from "./bus";
import { retainTransform } from "./canvas";
import { WHITE } from "./color";
import { add } from "./engine";
import { RUNESTONE_MOVE } from "./events";
import PulseSFX from "./pulse-sfx";
import { EX_SHAPE, HORIZONTAL_SHAPE, PLUS_SHAPE, SQUARE_SHAPE, VERTICAL_SHAPE } from "./runes";

const SHAPES = [
    SQUARE_SHAPE,
    PLUS_SHAPE,
    EX_SHAPE,
    HORIZONTAL_SHAPE,
    VERTICAL_SHAPE,
];

const POWER_COLORS = [
    [230, 30, 30],
    [48, 128, 230],
    [16, 240, 16],
];

function PowerUp(cx, cy) {
    let anim = 0;
    let remove = false;

    const shapeType = 0;
    const powerType = 1;

    function render(ctx) {
        retainTransform(() => {
            // Ball with smoke
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
            const color = POWER_COLORS[powerType];
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
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

            // Configuration dots
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 5;
            ctx.beginPath();
            const shape = SHAPES[shapeType];
            for (let i = 0; i < shape.length; i++) {
                const pt = shape[i];
                if (i % 2 == 0) {
                    ctx.moveTo(pt[0], pt[1]);
                } else {
                    ctx.lineTo(pt[0], pt[1]);
                }
            }
            ctx.stroke();
        });
    }

    function update(dT) {
        anim += dT;
        return remove;
    }

    function onRunestoneMove([cx0, cy0, cx1, cy1]) {
        // Check if runestone in the pathway
        let distToHit = -1;
        let totalDist = Math.abs(cy1 - cy0) + Math.abs(cx1 - cx0);
        if (cx0 == cx && cx1 == cx && (cy >= cy0 && cy <= cy1 || cy >= cy1 && cy <= cy0)) {
            distToHit = Math.abs(cy - cy0);
        }
        if (cy0 == cy && cy1 == cy && (cx >= cx0 && cx <= cx1 || cx >= cx1 && cx <= cx0)) {
            distToHit = Math.abs(cx - cx0);
        }

        // Apply hit
        if (distToHit >= 0) {
            // TODO: This will probably need some love after introducing in-path collisions
            setTimeout(() => {
                add(PulseSFX(cx, cy, 60, POWER_COLORS[powerType]));
                remove = true;
                off(RUNESTONE_MOVE, onRunestoneMove);
            }, distToHit / (totalDist+0.01) * 600);
            setTimeout(() => {
                add(PulseSFX(cx1+1, cy1, 60, [255, 255, 255]));
                add(PulseSFX(cx1-1, cy1, 60, [255, 255, 255]));
                add(PulseSFX(cx1, cy1+1, 60, [255, 255, 255]));
                add(PulseSFX(cx1, cy1-1, 60, [255, 255, 255]));
            }, 660);
        }
    }

    on(RUNESTONE_MOVE, onRunestoneMove);

    return {
        render,
        update
    }
}

export default PowerUp;