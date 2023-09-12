import { emit, on } from "./bus";
import { canvas, renderAndFill, renderLines, retainTransform } from "./canvas";
import { BLACK, DARK_GRAY, GRAY, LIGHT_GRAY, MID_GRAY, TAN, WHITE } from "./color";
import { add, getObjectsByTag } from "./engine";
import { RUNESTONE_LAND, RUNESTONE_MOVE, SIGIL_DRAWN, TURN_END } from "./events";
import PulseSFX from "./pulse-sfx";
import { BOLT_RUNE, CARET_RUNE, CIRCLE_RUNE, HOURGLASS_RUNE, TRIANGLE_RUNE, WAVE_RUNE } from "./runes";

const ORDER_REMAP = { 5:0, 1:1, 3:2, 2:3, 4:4, 6:5 };
const runeOrder = [
    CARET_RUNE,
    CIRCLE_RUNE,
    BOLT_RUNE,
    TRIANGLE_RUNE,
    WAVE_RUNE,
    HOURGLASS_RUNE,
];

function RuneStone() {
    let anim = 0;
    
    // cell units for game grid
    let cx = 0;
    let cy = 2;
    const mesh = [[-35, 0], [-15, 30], [15, 30], [35, 0], [15, -30], [-15, -30]];

    // state
    const MOVE_DURATION = 0.66;
    const IDLE = 0;
    const MOVING = 1;
    let state = IDLE;
    let timeInState = 0;
    let targetCX = 0;
    let targetCY = 0;
    let originCX = 0;
    let originCY = 0;

    function render(ctx) {
        const caster = getObjectsByTag('caster')[0];

        retainTransform(() => {
            // sigil grid
            for (let i = 0; i < 6; i++) {
                ctx.lineWidth = 4;
                const SIZE = 80;
                const highlight = (caster.getIsDrawing() || caster.getInDrawArea());
                if (highlight && caster.getDrawingOnLeft()) {
                    ctx.strokeStyle = WHITE;
                } else {
                    ctx.strokeStyle = '#fbcda1';
                    // ctx.strokeStyle = '#eea';
                }
                retainTransform(() => {
                    ctx.translate(-SIZE / 2, SIZE / 2 + SIZE * i);
                    ctx.scale(1.5, 1.5);
                    renderLines(ctx, runeOrder[i]);
                });
                
                if (highlight && !caster.getDrawingOnLeft()) {
                    ctx.strokeStyle = WHITE;
                } else {
                    ctx.strokeStyle = '#fbcda1';
                    // ctx.strokeStyle = '#aee';
                }
                retainTransform(() => {
                    ctx.translate(SIZE / 2 + SIZE * i, SIZE * 6.5);
                    ctx.scale(1.5, 1.5);
                    renderLines(ctx, runeOrder[i]);
                });
            }

            // rune placement
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80+4);

            // shadow
            ctx.fillStyle = 'rgba(0,0,0,0.13)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 32, 22, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Rune
            if (state == MOVING) {
                const p = timeInState / MOVE_DURATION;
                ctx.translate(0, -90 * p * (1 - p));
            }
            const angle = anim;
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const xfmMesh = mesh.map((pt) => {
                return [
                    (pt[0] * c + pt[1] * s) * 0.8,
                    (-pt[0] * s * 0.6 + pt[1] * c * 0.6) * 0.8,
                ];
            });
            ctx.lineWidth = 10;
            ctx.strokeStyle = DARK_GRAY;
            ctx.fillStyle = GRAY;
            renderAndFill(ctx, xfmMesh);
            ctx.translate(0, -11);
            
            ctx.lineWidth = 6;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const pt = mesh[i];
                const x = (pt[0] * c + pt[1] * s) * 0.83;
                const y = (-pt[0] * s * 0.6 + pt[1] * c * 0.6) * 0.83;
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 10);
            }
            ctx.stroke();

            ctx.lineWidth = 10;
            ctx.fillStyle = GRAY;
            renderAndFill(ctx, xfmMesh);

            // rune
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.lineWidth = 6;
            const DOTS = [[0, -7], [7, 6], [-7, 6]];
            for (let i = 0; i < 3; i++) {
                const pt = DOTS[i];
                const x = (pt[0] * c + pt[1] * s) * 1;
                const y = (-pt[0] * s * 0.6 + pt[1] * c * 0.6) * 1;
                ctx.moveTo(x, y);
                ctx.lineTo(x + 0.01, y);
            }
            ctx.stroke();
        });
    }

    function update(dT) {
        // anim += dT;
        timeInState += dT;
        
        if (state == MOVING) {
            const p = timeInState / MOVE_DURATION;
            anim = p * Math.PI * 2;
            cx = originCX * (1 - p) + targetCX * p;
            cy = originCY * (1 - p) + targetCY * p;
            if (p >= 1) {
                cx = targetCX;
                cy = targetCY;
                timeInState = IDLE;
                state = IDLE;
                anim = 0;
                emit(RUNESTONE_LAND);
                add(PulseSFX(cx, cy, 50, [255,255,255]));
                setTimeout(() => { emit(TURN_END); }, 550);
            }
        }
    }

    function moveToDest(x, y) {
        originCX = cx;
        originCY = cy;
        targetCX = x;
        targetCY = y;
        state = MOVING;
        timeInState = 0;
        emit(RUNESTONE_MOVE, [originCX, originCY, targetCX, targetCY]);
    }

    let pivot = 0;
    function onSigilDrawn([idx, axis]) {
        if (idx == 0) {
            return;
        }
        const m = ORDER_REMAP[idx]
        if (axis == 1) {
            moveToDest(m, cy);
            // pivot = 1;
        } else {
            moveToDest(cx, m);
            // pivot = 0;
        }
    }

    on(SIGIL_DRAWN, onSigilDrawn);

    return {
        update,
        render,
        tags: ['obstacle'],
        getX: () => cx,
        getY: () => cy,
    }
}

export default RuneStone;