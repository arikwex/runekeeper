import { on } from "./bus";
import Enemy from "./enemy";
import { add, getObjectsByTag } from "./engine";
import { TURN_END } from "./events";

function EnemySpawner() {
    function render(ctx) {
    }

    function update(dT) {
    }

    function onTurnEnd() {
        const enemies = getObjectsByTag('enemy');
        if (enemies.length < 3) {
            add(Enemy(5, Math.floor(Math.random() * 6)));
        }
    }

    on(TURN_END, onTurnEnd);

    return {
        update,
        render,
    };
}

export default EnemySpawner;