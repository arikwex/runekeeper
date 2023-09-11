import Ability from './ability';
import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import GameArena from './game-arena';
import PowerUp from './powerup';
import RuneStone from './rune-stone';
import SpellCaster from './spell-caster';
import Wizard from './wizard';

function initialize() {
    add(GameArena());
    add(Wizard());
    add(PowerUp(3, 3));
    add(Ability(2,2,0));
    add(RuneStone());
    add(SpellCaster());
}
initialize();
