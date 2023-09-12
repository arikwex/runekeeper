import { getObjectsByTag } from "./engine";

export function findObstacles() {
    return getObjectsByTag('obstacle');
}

export function spotOccupied(x, y) {
    const obstacles = findObstacles();
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (obs.getX() == x && obs.getY() == y) {
            return true;
        }
    }
    return false;
}

export function spotHasEnemy(x, y) {
    const obstacles = getObjectsByTag('enemy');
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (obs.getX() == x && obs.getY() == y) {
            return true;
        }
    }
    return false;
}
