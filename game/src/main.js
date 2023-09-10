import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import GameArena from './game-arena';
import SpellCaster from './spell-caster';

function initialize() {
    add(GameArena());
    add(SpellCaster());
}
initialize();
