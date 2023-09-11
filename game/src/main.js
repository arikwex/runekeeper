import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import GameArena from './game-arena';
import PowerUp from './powerup';
import PulseSFX from './pulse-sfx';
import RuneStone from './rune-stone';
import SpellCaster from './spell-caster';
import Wizard from './wizard';

function initialize() {
    add(GameArena());
    add(Wizard());
    add(PowerUp(3, 3));
    add(PulseSFX(3, 3, 60, [230, 20, 20]))
    add(RuneStone());
    add(SpellCaster());
}
initialize();
