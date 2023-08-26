const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const SIZE = 100;
const OUT_SIZE = 28;

const clearContext = (ctx) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE)
}

const generateCanvas = () => {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    return { canvas, ctx };
}

const saveCanvas = (canvas, destFile = '../rune-data/out.png') =>{
    const scaledCanvas = createCanvas(OUT_SIZE, OUT_SIZE);
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.drawImage(canvas, 0, 0, SIZE, SIZE, 0, 0, OUT_SIZE, OUT_SIZE);
    const buffer = scaledCanvas.toBuffer('image/png');
    fs.writeFileSync(destFile, buffer);
}

const generateRuneDataset = (name, canvas, ctx, runeDrawFn, N=10) => {
    const outFolder = `../rune-data/${name}/`
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    console.log(`Generating N=${N} for ${name}`);
    for (let i = 0; i < N; i++) {
        clearContext(ctx);
        runeDrawFn(ctx, i);
        saveCanvas(canvas, path.join(outFolder, `r_${i}.png`));
    }
}

const drawNoisyPath = (ctx, path, color='white') => {
    // // Normalize lines
    // let mins = [Infinity, Infinity];
    // let maxs = [-Infinity, -Infinity];
    // origPath.map((pt) => {
    //     mins[0] = Math.min(pt.x, mins[0]);
    //     mins[1] = Math.min(pt.y, mins[1]);
    //     maxs[0] = Math.max(pt.x, maxs[0]);
    //     maxs[1] = Math.max(pt.y, maxs[1]);
    // });
    
    // const path = [];
    // const size = Math.max(maxs[0] - mins[0], maxs[1] - mins[1], 40);
    // origPath.map((pt) => {
    //     path.push({
    //         x: (pt.x - (maxs[0] + mins[0])/2) / size * 70 + SIZE/2,
    //         y: (pt.y - (maxs[1] + mins[1])/2) / size * 70 + SIZE/2,
    //     });
    // });

    ctx.beginPath();
    ctx.strokeStyle = color;
    if (color == 'white') {
        ctx.lineWidth = Math.random() * 2.0 + 3;
    } else {
        ctx.lineWidth = 12;
    }
    let squashX = 1;
    let squashY = 1 - Math.random() * 0.25;
    if (Math.random() > 0.5) {
        squashX = squashY;
        squashY = 1;
    }
    const skewX = (Math.random() - 0.5) * 0.25;
    const skewY = (Math.random() - 0.5) * 0.25;
    for (let i = 0; i < path.length; i++) {
        let xi = (path[i].x - SIZE / 2) * squashX;
        let yi = (path[i].y - SIZE / 2) * squashY;
        let x0 = (xi + yi * skewX) + SIZE / 2 + (Math.random() - 0.5) * 4;
        let y0 = (yi + xi * skewY) + SIZE / 2 + (Math.random() - 0.5) * 4;
        if (i == 0 || path[i].newline) {
            ctx.moveTo(x0, y0);
        } else {
            ctx.lineTo(x0, y0);
        }
    }
    ctx.stroke();
}

const addLineToPath = (path, x0, y0, x1, y1) => {
    for (let i = 0; i < 6; i++) {
        const p = i / 5;
        path.push({
            newline: i == 0,
            x: x1 * p + x0 * (1-p),
            y: y1 * p + y0 * (1-p),
        });
    }
}

const drawCircleRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    const motion = 5 - Math.random() * 25;
    for (let i = 0; i < 30 + Math.random() * 8; i++) {
        const angle = i / 32.0 * Math.PI * 2.0 + phase;
        const dR = motion * i / 32.0;
        path.push({
            x: Math.cos(angle) * (SIZE * 0.35 + dR) + SIZE/2,
            y: Math.sin(angle) * (SIZE * 0.35 + dR) + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawTriangleRune = (ctx) => {
    const path = [];
    
    const topLeft = 12 + Math.random() * 28;
    const topRight = 12 + Math.random() * 28;
    const bottom = 7 + Math.random() * 16;
    const midx = SIZE/2 + (Math.random() - 0.5) * 16;
    addLineToPath(path, 12+Math.random()*13, topLeft, midx, SIZE-bottom);
    addLineToPath(path, midx, SIZE-bottom, SIZE-12, topRight);
    addLineToPath(path, SIZE-12-Math.random()*13, topRight, 12, topLeft);

    drawNoisyPath(ctx, path);
}

const drawHourglassRune = (ctx) => {
    const path = [];
    
    const cxT = 12 + Math.random() * 6;
    const cyT = 12 + Math.random() * 20;
    const cxR = SIZE - (12 + Math.random() * 6);
    const cyR = SIZE - (12 + Math.random() * 20);
    const cxB = SIZE - (12 + Math.random() * 6);
    const cyB = 12 + Math.random() * 20;
    const cxL = 12 + Math.random() * 6;
    const cyL = SIZE - (12 + Math.random() * 20);
    addLineToPath(path, cxT, cyT, cxR, cyR);
    addLineToPath(path, cxR, cyR, cxB, cyB);
    addLineToPath(path, cxB, cyB, cxL, cyL);
    addLineToPath(path, cxL, cyL, cxT, cyT);

    drawNoisyPath(ctx, path);
}

const drawBoltRune = (ctx) => {
    const path = [];
    
    const cx0 = SIZE/2 - 10 - Math.random() * 11;
    const cy0 = 12 + Math.random() * 5;
    const cx1 = SIZE/2 + 10 + Math.random() * 11;
    const cy1 = 12 + Math.random() * 5;
    const cx2 = SIZE/2 - 10 - Math.random() * 11;
    const cy2 = SIZE / 2 + Math.random() * 6 - 3;
    const cx3 = SIZE/2 + 10 + Math.random() * 11;
    const cy3 = SIZE / 2 + Math.random() * 6 - 3;
    const cx4 = SIZE/2 + Math.random() * 10 - 5;
    const cy4 = SIZE - 12 - Math.random() * 6;
    if (Math.random() > 0.5) {
        addLineToPath(path, cx0, cy0, cx1, cy1);
        addLineToPath(path, cx1, cy1, cx2, cy2);
        addLineToPath(path, cx2, cy2, cx3, cy3);
        addLineToPath(path, cx3, cy3, cx4, cy4);
    } else {
        addLineToPath(path, SIZE-cx0, cy0, SIZE-cx1, cy1);
        addLineToPath(path, SIZE-cx1, cy1, SIZE-cx2, cy2);
        addLineToPath(path, SIZE-cx2, cy2, SIZE-cx3, cy3);
        addLineToPath(path, SIZE-cx3, cy3, SIZE-cx4, cy4);
    }

    drawNoisyPath(ctx, path);
}

const drawWaveRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    let AMP = Math.random() * 6 + 8;
    let omega = 1.8 + Math.random() * 0.5;
    for (let i = 0; i < 18; i++) {
        const angle = i / 17.0 * Math.PI * 2.0 + phase;
        path.push({
            x: 12 + i * (SIZE - 24) / 17.0,
            y: Math.sin(angle * omega) * AMP + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawCaretRune = (ctx) => {
    const path = [];
    
    const bottomLeft = SIZE - (12 + Math.random() * 12);
    const bottomRight = SIZE - (12 + Math.random() * 12);
    const centerX = SIZE/2 + (Math.random() - 0.5) * 10;
    const top = 10 + Math.random() * 15;
    addLineToPath(path, 12 + Math.random() * 3, bottomLeft, centerX, top);
    addLineToPath(path, centerX, top, SIZE-12 - Math.random() * 3, bottomRight);

    drawNoisyPath(ctx, path);
}

/*************************************************************************/
/*** BAD RUNES ***********************************************************/
/*************************************************************************/

const drawBadCircleRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    const motion = 5 - Math.random() * 25;
    for (let i = 0; i < 13 + Math.random() * 16; i++) {
        const angle = i / 32.0 * Math.PI * 2.0 + phase;
        const dR = motion * i / 32.0;
        path.push({
            x: Math.cos(angle) * (SIZE * 0.35 + dR) + SIZE/2,
            y: Math.sin(angle) * (SIZE * 0.35 + dR) + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
    if (Math.random() > 0.7) {
        drawScribbles(ctx, 'black');
    }
}

const drawBadTriangleRune = (ctx) => {
    const path = [];
    
    const topLeft = 12 + Math.random() * 8;
    const topRight = 12 + Math.random() * 8;
    const bottom = 7 + Math.random() * 16;
    const midx = SIZE/2 + (Math.random() - 0.5) * 16;
    const skipIdx = Math.floor(Math.random() * 3);
    if (skipIdx != 0) {
        addLineToPath(path, 12, topLeft, midx, SIZE-bottom);
    }
    if (skipIdx != 1) {
        addLineToPath(path, midx, SIZE-bottom, SIZE-12, topRight);
    }
    if (skipIdx != 2) {
        addLineToPath(path, SIZE-12, topRight, 12, topLeft);
    }

    drawNoisyPath(ctx, path);
}

const drawBadHourglassRune = (ctx) => {
    const path = [];
    
    const cxT = 12 + Math.random() * 16;
    const cyT = 12 + Math.random() * 16;
    const cxR = SIZE - (12 + Math.random() * 16);
    const cyR = SIZE - (12 + Math.random() * 16);
    const cxB = SIZE - (12 + Math.random() * 16);
    const cyB = 12 + Math.random() * 16;
    const cxL = 12 + Math.random() * 16;
    const cyL = SIZE - (12 + Math.random() * 16);
    const skipIdx = parseInt(Math.floor(Math.random() * 4));
    if (skipIdx != 0) {
        addLineToPath(path, cxT, cyT, cxR, cyR);
    }
    if (skipIdx != 1) {
        addLineToPath(path, cxR, cyR, cxB, cyB);
    }
    if (skipIdx != 2) {
        addLineToPath(path, cxB, cyB, cxL, cyL);
    }
    if (skipIdx != 3) {
        addLineToPath(path, cxL, cyL, cxT, cyT);
    }

    drawNoisyPath(ctx, path);
}

const drawBadBoltRune = (ctx) => {
    const path = [];
    
    const cx0 = SIZE/2 - 10 - Math.random() * 11;
    const cy0 = 12 + Math.random() * 5;
    const cx1 = SIZE/2 + 10 + Math.random() * 11;
    const cy1 = 12 + Math.random() * 5;
    const cx2 = SIZE/2 - 10 - Math.random() * 11;
    const cy2 = SIZE / 2 + Math.random() * 6 - 3;
    const cx3 = SIZE/2 + 10 + Math.random() * 11;
    const cy3 = SIZE / 2 + Math.random() * 6 - 3;
    const cx4 = SIZE/2 + Math.random() * 10 - 5;
    const cy4 = SIZE - 12 - Math.random() * 6;
    const skipIdx = Math.floor(Math.random() * 4);
    if (Math.random() > 0.5) {
        if (skipIdx != 0) {
            addLineToPath(path, cx0, cy0, cx1, cy1);
        }
        if (skipIdx != 1) {
            addLineToPath(path, cx1, cy1, cx2, cy2);
        }
        if (skipIdx != 2) {
            addLineToPath(path, cx2, cy2, cx3, cy3);
        }
        if (skipIdx != 3) {
            addLineToPath(path, cx3, cy3, cx4, cy4);
        }
    } else {
        if (skipIdx != 0) {
            addLineToPath(path, SIZE-cx0, cy0, SIZE-cx1, cy1);
        }
        if (skipIdx != 1) {
            addLineToPath(path, SIZE-cx1, cy1, SIZE-cx2, cy2);
        }
        if (skipIdx != 2) {
            addLineToPath(path, SIZE-cx2, cy2, SIZE-cx3, cy3);
        }
        if (skipIdx != 3) {
            addLineToPath(path, SIZE-cx3, cy3, SIZE-cx4, cy4);
        }
    }

    drawNoisyPath(ctx, path);
    drawScribbles(ctx, 'black');
}

const drawBadWaveRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    let AMP = Math.random() * 19 + 15;
    let omega = 1.6 + Math.random() * 0.9;
    let start = Math.random() * 9;
    for (let i = start; i < start + 8; i++) {
        const angle = i / 17.0 * Math.PI * 2.0 + phase;
        path.push({
            x: 12 + i * (SIZE - 24) / 17.0,
            y: Math.sin(angle * omega) * AMP + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
    drawScribbles(ctx, 'black');
}

const drawBadCaretRune = (ctx) => {
    const path = [];
    
    const bottomLeft = SIZE - (12 + Math.random() * 8);
    const bottomRight = SIZE - (12 + Math.random() * 8);
    const centerX = SIZE/2 + (Math.random() - 0.5) * 10;
    const top = 10 + Math.random() * 15;
    
    const skipIdx = Math.floor(Math.random() * 3);
    if (skipIdx != 0) {
        addLineToPath(path, 12, bottomLeft, centerX, top);
    }
    if (skipIdx != 1) {
        addLineToPath(path, centerX, top, SIZE-12, bottomRight);
    }
    // Bad carets always have bottoms
    addLineToPath(path, 12, bottomLeft, SIZE-12, bottomRight);

    drawNoisyPath(ctx, path);
}

/***********************************************************************/
/*** SCRIBBLES *********************************************************/
/***********************************************************************/

const drawScribbles = (ctx, color='white') => {
    const path = [];
    
    const N = Math.random() * 6 + 5;
    let xi = 10 + Math.random() * (SIZE - 20);
    let yi = 10 + Math.random() * (SIZE - 20);
    for (let i = 0; i < N; i++) {
        let xn = 10 + Math.random() * (SIZE - 20);
        let yn = 10 + Math.random() * (SIZE - 20);    
        addLineToPath(path, xi, yi, xn, yn);
        xi = xn;
        yi = yn;
    }

    drawNoisyPath(ctx, path, color);
}

const drawGarbageRune = (ctx, idx) => {
    const runes = [
        drawBadCircleRune,
        drawBadTriangleRune,
        drawBadTriangleRune, // Yes, double up triangle rune
        drawBadBoltRune,
        // drawBadWaveRune,  // Yes, skip wave rune
        drawBadCaretRune,
        drawBadHourglassRune,
        drawScribbles,
    ];
    const runeDraw = runes[idx % runes.length];
    runeDraw(ctx);
}

const generateSet = (name, N=10) => {
    const {canvas, ctx} = generateCanvas();
    generateRuneDataset(`${name}/circle`, canvas, ctx, drawCircleRune, N);
    generateRuneDataset(`${name}/triangle`, canvas, ctx, drawTriangleRune, N);
    generateRuneDataset(`${name}/bolt`, canvas, ctx, drawBoltRune, N);
    generateRuneDataset(`${name}/wave`, canvas, ctx, drawWaveRune, N);
    generateRuneDataset(`${name}/caret`, canvas, ctx, drawCaretRune, N);
    generateRuneDataset(`${name}/hourglass`, canvas, ctx, drawHourglassRune, N);
    // Have more garbage data to enforce symbol discrimination
    generateRuneDataset(`${name}/garbage`, canvas, ctx, drawGarbageRune, N * 6);
}

// generateSet('train', N=10);
generateSet('train', N=6000);
generateSet('test', N=1000);
