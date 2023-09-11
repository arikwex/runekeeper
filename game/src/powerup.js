import { on } from "./bus";
import { retainTransform } from "./canvas";
import { add } from "./engine";
import { RUNESTONE_MOVE } from "./events";
import PulseSFX from "./pulse-sfx";

function PowerUp(cx, cy) {
    let anim = 0;
    let remove = false;

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
        return remove;
    }

    function onRunestoneMove([cx0, cy0, cx1, cy1]) {
        console.log(cx0, cy0, cx1, cy1);
        let distToHit = -1;
        let totalDist = Math.abs(cy1 - cy0) + Math.abs(cx1 - cx0);
        if (cx0 == cx && cx1 == cx && (cy >= cy0 && cy <= cy1 || cy >= cy1 && cy <= cy0)) {
            console.log(cy - cy0);
            distToHit = Math.abs(cy - cy0);
        }
        if (cy0 == cy && cy1 == cy && (cx >= cx0 && cx <= cx1 || cx >= cx1 && cx <= cx0)) {
            console.log(cx - cx0);
            distToHit = Math.abs(cx - cx0);
        }
        if (distToHit >= 0) {
            setTimeout(() => {
                add(PulseSFX(cx, cy, 60, [230, 20, 20]));
                remove = true;
            }, distToHit / (totalDist+0.01) * 660);
            console.log(distToHit / (totalDist+0.01));
        }
    }

    on(RUNESTONE_MOVE, onRunestoneMove);

    return {
        render,
        update
    }
}

export default PowerUp;