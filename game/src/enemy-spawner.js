import { on } from "./bus";
import Enemy from "./enemy";
import { add, getObjectsByTag } from "./engine";
import { TURN_END } from "./events";
import { spotOccupied } from "./sensor";

function EnemySpawner() {
    function render(ctx) {
    }

    function update(dT) {
    }

    function spawnOne() {
        const enemies = getObjectsByTag('enemy');
        if (enemies.length < 3) {
            const MAX_ALLOWED = parseInt(Math.min(getObjectsByTag('game')[0].getScore() / 4, 2));
            const enemyType = parseInt(Math.min(Math.floor(Math.random() * (MAX_ALLOWED + 1)), MAX_ALLOWED));
            for (let i = 0; i < 30; i++) {
                const offerY = Math.floor(Math.random() * 6);
                if (!spotOccupied(5, offerY)) {
                    add(Enemy(6, offerY, enemyType));
                    break;
                }
            }
        }
    }

    function onTurnEnd() {
        spawnOne();
    }

    on(TURN_END, onTurnEnd);
    spawnOne();

    return {
        update,
        render,
    };
}

export default EnemySpawner;