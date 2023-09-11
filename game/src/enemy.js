import { off, on } from "./bus";
import { retainTransform } from "./canvas";
import { DARK_GRAY, GRAY, LIGHT_GRAY, MID_GRAY, WHITE } from "./color";
import { add } from "./engine";
import { ABILITY_USE, RUNESTONE_MOVE, TURN_END } from "./events";
import PulseSFX from "./pulse-sfx";

function Enemy(cx, cy) {
    let anim = Math.random() * 7;
    let targetX = cx;
    let targetY = cy;
    let originX = cx;
    let originY = cy;
    const MOVE_DURATION = 0.35;
    const IDLE = 0;
    const MOVING = 1;
    let state = IDLE;
    let timeInState = 0;
    let dead = false;

    // VFX on spawn
    add(PulseSFX(cx, cy, 55, [0, 0, 0]));

    function render(ctx) {
        retainTransform(() => {
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
            
            // shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 19, 0, 0, 2 * Math.PI);
            ctx.fill();

            // hop while move
            if (state == MOVING) {
                const p = timeInState / MOVE_DURATION;
                ctx.translate(0, -120 * p * (1-p));
            }
            
            // torso
            ctx.lineWidth = 10;
            ctx.fillStyle = GRAY;
            ctx.strokeStyle = GRAY;
            const squish = Math.cos(anim * 10);
            const squish2 = Math.cos(anim * 10 + 1);
            ctx.fillRect(-10+squish, 0, 20-2*squish, -34-2*squish);
            ctx.strokeRect(-10+squish, 0, 20-2*squish, -34-2*squish);
            
            // head
            retainTransform(() => {
                ctx.translate(0, -39 - squish * 3);
                ctx.fillStyle = DARK_GRAY;
                ctx.strokeStyle = DARK_GRAY;
                ctx.fillRect(-6, 0, 12, -16);
                ctx.strokeRect(-6, 0, 12, -16);
                ctx.strokeStyle = '#c11';
                ctx.beginPath();
                ctx.moveTo(0, -62+41);
                ctx.lineTo(1, -70+41);
                ctx.lineTo(6, -74+41);
                ctx.lineTo(10, -70+41);
                ctx.stroke();
                ctx.strokeStyle = LIGHT_GRAY;
                ctx.beginPath();
                ctx.moveTo(-3, -49+41);
                ctx.lineTo(-3.01, -49+41);
                ctx.stroke();
            });

            // sword
            ctx.translate(-20, -18 + squish2 * 1);
            ctx.rotate(Math.cos(anim * 10 - 0.2) * 0.04);
            ctx.strokeStyle = '#eee';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-6, -45+13);
            ctx.stroke();
            ctx.strokeStyle = '#841';
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(5, -3);
            ctx.moveTo(0, 0);
            ctx.lineTo(2, 4);
            ctx.stroke();
        })
    }

    function update(dT) {
        anim += dT;
        timeInState += dT;

        if (state == MOVING) {
            const p = timeInState / MOVE_DURATION;
            cx = originX * (1-p) + targetX * p;
            cy = originY * (1-p) + targetY * p;
            if (timeInState > MOVE_DURATION) {
                cx = targetX;
                cy = targetY;
                timeInState = 0;
                state = IDLE;
            }
        }

        if (dead) {
            off(TURN_END, onTurnEnd);
            off(ABILITY_USE, onAbilityUse);
            return true;
        }
    }

    function issueMove(nx, ny) {
        originX = cx;
        originY = cy;
        targetX = nx;
        targetY = ny;
        state = MOVING;
        timeInState = 0;
    }

    function onTurnEnd() {
        issueMove(cx - 1, cy);
    }

    function onAbilityUse([tx, ty, powerType]) {
        if (tx == cx && ty == cy) {
            dead = true;
        }
    }

    on(TURN_END, onTurnEnd);
    on(ABILITY_USE, onAbilityUse);

    return {
        update,
        render,
        order: 30
    }
}

export default Enemy;