import Ability from './ability';
import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import { POWERUP_ACQUIRED } from './events';
import GameArena from './game-arena';
import PowerUp from './powerup';
import RuneStone from './rune-stone';
import SpellCaster from './spell-caster';
import Wizard from './wizard';

function initialize() {
    add(GameArena());
    add(Wizard());
    add(PowerUp(2, 2, Math.floor(Math.random() * 3), Math.floor(Math.random() * 5)));
    add(PowerUp(4, 4, Math.floor(Math.random() * 3), Math.floor(Math.random() * 5)));
    add(PowerUp(1, 4, Math.floor(Math.random() * 3), Math.floor(Math.random() * 5)));
    add(PowerUp(3, 1, Math.floor(Math.random() * 3), Math.floor(Math.random() * 5)));
    add(RuneStone());
    add(SpellCaster());

    function onPowerupAcquired() {
        add(PowerUp(
            Math.floor(Math.random() * 6), Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 3), Math.floor(Math.random() * 5)
        ));
    }
    bus.on(POWERUP_ACQUIRED, onPowerupAcquired);
}
initialize();
