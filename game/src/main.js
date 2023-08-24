import * as bus from './bus';
import { canvas } from './canvas';
import { add } from './engine';
import SpellCaster from './spell-caster';

function initialize() {
    add(SpellCaster());
}
initialize();
