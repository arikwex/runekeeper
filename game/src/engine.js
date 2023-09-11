import { canvas, ctx, retainTransform } from './canvas';
// import { updateGameControls } from './controls';
import { TAG_CAMERA } from './tags';

let gameObjects = [];
let gameObjectsByTag = {};
const objectsToRemove = [];
let lastFrameMs = 0;

function tick(currentFrameMs) {
    // updateGameControls();
    const dT = Math.min((currentFrameMs - lastFrameMs) * 0.001, 0.018);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Configure default camera
    const zoom = Math.min(
        canvas.width / 800,
        canvas.height / 1100,
    );
    ctx.setTransform(zoom, 0, 0, zoom, canvas.width/2 - 190 * zoom, canvas.height * 0.3 - 80 * 6 * 0.5 * zoom);
    
    retainTransform(() => {
        const camera = getObjectsByTag(TAG_CAMERA)[0];
        if (camera) {
            camera.set(ctx);
        }

        objectsToRemove.length = 0;
        gameObjects.map((g) => { if (g.update?.(dT)) { objectsToRemove.push(g); } });
        if (objectsToRemove.length) { remove(objectsToRemove); }
        if (camera) {
            gameObjects.map((g) => { if (g.inView(camera.x, camera.y)) { g.render?.(ctx); }});
        } else {
            gameObjects.map((g) => { g.render?.(ctx); });
        }
        lastFrameMs = currentFrameMs;
    });
    requestAnimationFrame(tick);
}

function add(obj) {
    if (!obj.inView) { obj.inView=()=>1 }
    gameObjects.push(obj);
    resort();
    obj.tags?.map((tag) => {
        gameObjectsByTag[tag] = (gameObjectsByTag[tag] ?? []);
        gameObjectsByTag[tag].push(obj);
    });
}

function resort() {
    gameObjects.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function arrayRemove(list, valuesToEvict) {
    return list.filter((g) => !valuesToEvict.includes(g));
}

function remove(objList) {
    gameObjects = arrayRemove(gameObjects, objList);
    objList.map((obj) => {
        obj.tags?.map((tag) => {
            gameObjectsByTag[tag] = arrayRemove(gameObjectsByTag[tag], [obj]);
        });
    });
}

function clear() {
    gameObjects = [];
}

function getObjectsByTag(tag) {
    return gameObjectsByTag[tag] || [];
}

requestAnimationFrame(tick);

export {
    add,
    remove,
    clear,
    resort,
    getObjectsByTag,
};