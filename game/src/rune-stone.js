import { emit, on } from "./bus";
import { canvas, renderAndFill, renderLines, retainTransform } from "./canvas";
import { BLACK, DARK_GRAY, GRAY, LIGHT_GRAY, MID_GRAY, TAN, WHITE } from "./color";
import { add, getObjectsByTag, resort } from "./engine";
import { ENEMY_BONK, GAME_OVER, RUNESTONE_LAND, RUNESTONE_MOVE, SIGIL_DRAWN, TURN_END } from "./events";
import PulseSFX from "./pulse-sfx";
import { BOLT_RUNE, CARET_RUNE, CIRCLE_RUNE, HOURGLASS_RUNE, TRIANGLE_RUNE, WAVE_RUNE } from "./runes";
import { spotHasEnemy, spotOccupied } from "./sensor";

const ORDER_REMAP = { 5:0, 1:1, 3:2, 2:3, 4:4, 6:5 };
const runeOrder = [
    CARET_RUNE,
    CIRCLE_RUNE,
    BOLT_RUNE,
    TRIANGLE_RUNE,
    WAVE_RUNE,
    HOURGLASS_RUNE,
];

const OUTLINE_COLOR = '#828';
const FILL_COLOR = '#f7f';
const DOT_COLOR = '#fff';

function RuneStone() {
    let anim = 0;
    let gameOver = false;
    
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
    let bonkCX = -1;
    let bonkCY = -1;
    let originCX = 0;
    let originCY = 0;
    let self = {};

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
            ctx.strokeStyle = OUTLINE_COLOR;
            ctx.fillStyle = FILL_COLOR;
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
            ctx.fillStyle = FILL_COLOR;
            renderAndFill(ctx, xfmMesh);

            // rune
            ctx.strokeStyle = DOT_COLOR;
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
            if (bonkCX > 0 || bonkCY > 0) {
                const distSplit = Math.abs(originCX - targetCX) + Math.abs(originCY - targetCY);
                const percentSplit = distSplit / (distSplit + 0.5);
                if (p > percentSplit) {
                    const q = (p - percentSplit) / (1 - percentSplit);
                    cx = cx * (1-q) + bonkCX * q;
                    cy = cy * (1-q) + bonkCY * q;
                }
            }
            if (p >= 1) {
                if (bonkCX > 0 || bonkCY > 0) {
                    cx = bonkCX;
                    cy = bonkCY;
                } else {
                    cx = targetCX;
                    cy = targetCY;
                }
                timeInState = IDLE;
                state = IDLE;
                anim = 0;
                targetCX = cx;
                targetCY = cy;
                emit(RUNESTONE_LAND);
                add(PulseSFX(cx, cy, 50, [255,255,255]));
                setTimeout(() => { emit(TURN_END); }, 550);
            }

            self.order = 30 + cy * 0.02;
            resort();
        }
    }

    function moveToDest(x, y, hitCoord) {
        originCX = cx;
        originCY = cy;
        targetCX = x;
        targetCY = y;
        state = MOVING;
        timeInState = 0;
        if (hitCoord != null) {
            // Move to target then bonk to landing spot
            targetCX = hitCoord[0];
            targetCY = hitCoord[1];
            bonkCX = x;
            bonkCY = y;
            const distSplit = Math.abs(originCX - targetCX) + Math.abs(originCY - targetCY);
            const percentSplit = distSplit / (distSplit + 0.5);
            setTimeout(() => {
                emit(ENEMY_BONK);
                add(PulseSFX(targetCX, targetCY, 50, [255, 0, 255]));
            }, MOVE_DURATION * 1000 * percentSplit);
        } else {
            // No bonk if clear path
            bonkCX = -1;
            bonkCY = -1;
        }
        emit(RUNESTONE_MOVE, [originCX, originCY, targetCX, targetCY, hitCoord != null ? [bonkCX, bonkCY] : null]);
    }

    function onSigilDrawn([idx, axis]) {
        if (gameOver) {
            return;
        }
        if (idx == 0) {
            return;
        }
        const m = ORDER_REMAP[idx];
        if (axis == 1) {
            // HORIZONTAL MOTION
            const dir = Math.sign(m - cx);
            let destX = cx;
            let hitX = -1;
            for (let tx = cx + dir; (dir > 0 && tx <= m) || (dir < 0 && tx >= m); tx += dir) {
                if (spotHasEnemy(tx, cy)) {
                    hitX = tx;
                    break;
                }
                destX = tx;
            }
            if (hitX >= 0) {
                moveToDest(destX, cy, [hitX,  cy]);
            } else {
                moveToDest(destX, cy, null);
            }
        } else {
            // VERTICAL MOTION
            const dir = Math.sign(m - cy);
            let destY = cy;
            let hitY = -1;
            for (let ty = cy + dir; (dir > 0 && ty <= m) || (dir < 0 && ty >= m); ty += dir) {
                if (spotHasEnemy(cx, ty)) {
                    hitY = ty;
                    break;
                }
                destY = ty;
            }
            if (hitY >= 0) {
                moveToDest(cx, destY, [cx,  hitY]);
            } else {
                moveToDest(cx, destY, null);
            }
        }
    }

    function onGG() {
        gameOver = true;
    }

    on(SIGIL_DRAWN, onSigilDrawn);
    on(GAME_OVER, onGG);

    self = {
        update,
        render,
        order: 30 + cy * 0.02,
        tags: ['obstacle'],
        getX: () => targetCX,
        getY: () => targetCY,
    }
    return self;
}

export default RuneStone;