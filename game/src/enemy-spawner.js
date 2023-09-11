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
            for (let i = 0; i < 30; i++) {
                const offerY = Math.floor(Math.random() * 6);
                if (!spotOccupied(5, offerY)) {
                    add(Enemy(5, offerY));
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