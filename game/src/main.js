import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import GameArena from './game-arena';
import RuneStone from './rune-stone';
import SpellCaster from './spell-caster';
import Wizard from './wizard';

function initialize() {
    add(GameArena());
    add(Wizard());
    add(RuneStone());
    add(SpellCaster());
}
initialize();
