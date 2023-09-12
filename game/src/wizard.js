import { emit, on } from "./bus";
import { canvas, renderAndFill, renderLines, retainTransform } from "./canvas";
import { BLACK, DARK_GRAY, GRAY, LIGHT_PURPLE, MID_GRAY, PURPLE, WHITE } from "./color";
import { add } from "./engine";
import { ENEMY_DAMAGE, GAME_OVER } from "./events";
import PulseSFX from "./pulse-sfx";

function Wizard() {
    let anim = 0;
    let hp = 10;
    let dead = false;

    function render(ctx) {
        retainTransform(() => {
            ctx.translate(-120, 160);

            if (hp > 0) {
                // HP
                ctx.fillStyle = '#f11';
                ctx.textAlign = 'center';
                ctx.font = `bold 30px arial`;
                ctx.fillText(`${hp} HP`, 0, 230);
            }

            // Tower
            ctx.fillStyle = GRAY;
            ctx.strokeStyle = DARK_GRAY;
            ctx.lineWidth = 10;
            for (let i = 0; i < 4; i++) {
                ctx.translate(0, 20);
                renderAndFill(ctx, [[-30, 0], [-15, 10], [-15, 30], [-30, 20]]);
                renderAndFill(ctx, [[-15, 10], [15, 10], [30, 0], [30, 20], [15, 30], [-15, 30]]);
                ctx.translate(0, 20);
                renderAndFill(ctx, [[-30, 0], [-15, 10], [15, 10], [15, 30], [-15, 30], [-30, 20]]);
                renderAndFill(ctx, [[15, 10], [30, 0], [30, 20], [15, 30]]);
            }
            ctx.translate(0, -143);
            ctx.fillStyle = MID_GRAY;
            renderAndFill(ctx, [[-30, 0], [-15, 10], [15, 10], [30, 0], [15, -10], [-15, -10]]);

            if (hp > 0) {
                // Wizard
                ctx.translate(3, -2);
                // Torso
                ctx.fillStyle = BLACK;
                ctx.strokeStyle = BLACK;
                ctx.lineWidth = 4;
                const squeeze = -Math.cos(anim * 10) * 0.05 + 0.95;
                renderAndFill(ctx, [[-20*squeeze, 0], [12*squeeze, 0], [1*squeeze, -30], [-10*squeeze, -10]]);
                // Hat
                ctx.fillStyle = PURPLE;
                ctx.strokeStyle = PURPLE;
                ctx.translate(0, -23 + Math.abs(Math.sin(anim * 5) * 2.5));
                ctx.rotate(Math.sin(anim*10+3) * 0.08);
                renderAndFill(ctx, [[-20, 2], [-10, -1], [13, 0], [20, 4], [17, 0], [12, -5], [7, -13], [0, -23], [-10, -29], [-21, -20], [-12, -22], [-6, -10]]);
                // Eyes
                ctx.lineWidth = 7;
                ctx.strokeStyle = WHITE;
                renderLines(ctx, [[8, -4], [8.01, -4]]);
                renderLines(ctx, [[-1, -4], [-1.01, -4]]);
                renderLines(ctx, [[2, -11], [2.01, -11]]);
            }
        });
    }

    function update(dT) {
        anim += dT * 1.52;
    }

    function onEnemyDamage(dmg) {
        hp -= dmg;
        if (hp <= 0) {
            hp = 0;
            if (!dead) {
                dead = true;
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        add(PulseSFX(-2.0, 1.5, 70, [255, 255, 255]));
                    }, i * 400);
                }
                // BOP: you dead
                emit(GAME_OVER);
            }
        }
    }

    on(ENEMY_DAMAGE, onEnemyDamage);

    return {
        update,
        render,
    }
}

export default Wizard;