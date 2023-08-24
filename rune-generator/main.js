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
        runeDrawFn(ctx);
        saveCanvas(canvas, path.join(outFolder, `r_${i}.png`));
    }
}

let FRACTIONAL_PATH = 1.0;
const drawNoisyPath = (ctx, path) => {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = Math.random() * 1.0 + 7;
    const squashX = 1 - Math.random() * 0.2;
    const squashY = 1 - Math.random() * 0.2;
    const skewX = (Math.random() - 0.5) * 0.25;
    const skewY = (Math.random() - 0.5) * 0.25;
    for (let i = 0; i < path.length; i++) {
        let xi = (path[i].x - SIZE / 2) * squashX;
        let yi = (path[i].y - SIZE / 2) * squashY;
        let x0 = (xi + yi * skewX) + SIZE / 2 + (Math.random() - 0.5) * 4;
        let y0 = (yi + xi * skewY) + SIZE / 2 + (Math.random() - 0.5) * 4;
        if (i == 0) {
            ctx.moveTo(x0, y0);
        } else {
            ctx.lineTo(x0, y0);
        }
    }
    ctx.stroke();
}

const addLineToPath = (path, x0, y0, x1, y1) => {
    if (Math.random() > FRACTIONAL_PATH) {
        return;
    }
    for (let i = 0; i < 6; i++) {
        const p = i / 5;
        path.push({ 
            x: x1 * p + x0 * (1-p),
            y: y1 * p + y0 * (1-p),
        });
    }
}

const drawFireballRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    for (let i = 0; i < 29 + Math.random() * 7; i++) {
        const angle = i / 32.0 * Math.PI * 2.0 + phase;
        path.push({
            x: Math.cos(angle) * SIZE * 0.35 + SIZE/2,
            y: Math.sin(angle) * SIZE * 0.35 + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawMeteorRune = (ctx) => {
    const path = [];
    
    const top = Math.random() * 17 + 12;
    path.push({ x: 12 - Math.random() * 5, y: top });
    path.push({ x: 22, y: top });
    path.push({ x: 32 + Math.random() * 12, y: top });

    const hookSize = Math.random() * 20 + 12;
    const hookDepth = Math.random() * 20 + 10 - top + 12;
    for (let i = 0; i < 21; i++) {
        const angle = i / 20.0 * Math.PI - Math.PI;
        path.push({
            x: (Math.cos(angle) * hookSize + SIZE/2),
            y: (-Math.sin(angle) * hookDepth + SIZE / 2 + top),
        });
    }
    
    const top2 = Math.random() * 17 + 12;
    path.push({ x: 100-32 - Math.random() * 12, y: top2 });
    path.push({ x: 100-22, y: top2 });
    path.push({ x: 100-12 + Math.random() * 5, y: top2 });

    drawNoisyPath(ctx, path);
}

const drawDragonRune = (ctx) => {
    const path = [];
    
    const topLeft = 12 + Math.random() * 8;
    const topRight = 12 + Math.random() * 8;
    const bottom = 7 + Math.random() * 16;
    const top = SIZE/4 - Math.random() * 15 + 8;
    addLineToPath(path, 12, topLeft, SIZE/2, SIZE-bottom);
    addLineToPath(path, SIZE/2, SIZE-bottom, SIZE-12, topRight);
    addLineToPath(path, SIZE-bottom, topRight, SIZE/2, top);
    addLineToPath(path, SIZE/2, top, 12, topLeft);

    drawNoisyPath(ctx, path);
}

const drawIceRune = (ctx) => {
    const path = [];
    
    const cxT = (Math.random() - 0.5) * 22 + SIZE/2;
    const cyT = Math.random() * 4 + 12;
    const cxR = SIZE - 10 - Math.random() * 7;
    const cyR = (Math.random() - 0.5) * 22 + SIZE/2;
    const cxB = (Math.random() - 0.5) * 22 + SIZE/2;
    const cyB = SIZE - (Math.random() * 4 + 12);
    const cxL = 10 + Math.random() * 7;
    const cyL = (Math.random() - 0.5) * 22 + SIZE/2;
    addLineToPath(path, cxT, cyT, cxR, cyR);
    addLineToPath(path, cxR, cyR, cxB, cyB);
    addLineToPath(path, cxB, cyB, cxL, cyL);
    addLineToPath(path, cxL, cyL, cxT, cyT);

    drawNoisyPath(ctx, path);
}

const drawFrostRune = (ctx) => {
    const path = [];
    
    const cxBL = (Math.random() - 0.5) * 5 + SIZE/2 - 7;
    const cyBL = SIZE - (Math.random() * 4 + 12);
    const cxL = 10 + Math.random() * 10;
    const cyL = SIZE - (Math.random() * 5 + 28);
    
    const cxML = (Math.random() - 0.5) * 6 + SIZE/2 - 8;
    const cyML = SIZE - (Math.random() * 6 + 40);
    const cxM = (Math.random() - 0.5) * 7 + SIZE/2;
    const cyM = 12 + (Math.random() * 7);
    const cxMR = (Math.random() - 0.5) * 6 + SIZE/2 + 8;
    const cyMR = SIZE - (Math.random() * 6 + 40);

    const cxR = SIZE - (10 + Math.random() * 10);
    const cyR = SIZE - (Math.random() * 5 + 28);
    const cxBR = (Math.random() - 0.5) * 5 + SIZE/2 + 7;
    const cyBR = SIZE - (Math.random() * 4 + 12);
    
    addLineToPath(path, cxBL, cyBL, cxL, cyL);
    addLineToPath(path, cxL, cyL, cxML, cyML);
    addLineToPath(path, cxML, cyML, cxM, cyM);
    addLineToPath(path, cxM, cyM, cxMR, cyMR);
    addLineToPath(path, cxMR, cyMR, cxR, cyR);
    addLineToPath(path, cxR, cyR, cxBR, cyBR);

    drawNoisyPath(ctx, path);
}

const drawHailRune = (ctx) => {
    const path = [];
    
    const cxT = 12 + Math.random() * 6;
    const cyT = 12 + Math.random() * 6;
    const cxR = SIZE - (12 + Math.random() * 6);
    const cyR = SIZE - (12 + Math.random() * 6);
    const cxB = SIZE - (12 + Math.random() * 6);
    const cyB = 12 + Math.random() * 6;
    const cxL = 12 + Math.random() * 6;
    const cyL = SIZE - (12 + Math.random() * 6);
    addLineToPath(path, cxT, cyT, cxR, cyR);
    addLineToPath(path, cxR, cyR, cxB, cyB);
    addLineToPath(path, cxB, cyB, cxL, cyL);
    addLineToPath(path, cxL, cyL, cxT, cyT);

    drawNoisyPath(ctx, path);
}

const drawLightningRune = (ctx) => {
    const path = [];
    
    const cx0 = SIZE/2 - 20 - Math.random() * 12;
    const cy0 = 12 + Math.random() * 5;
    const cx1 = SIZE/2 + 20 + Math.random() * 12;
    const cy1 = 12 + Math.random() * 5;
    const cx2 = SIZE/2 - 15 - Math.random() * 8;
    const cy2 = SIZE / 2 + Math.random() * 6 - 3;
    const cx3 = SIZE/2 + 15 + Math.random() * 8;
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

const drawTornadoRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    let omega = 1.5 + Math.random() * 0.5;
    if (Math.random() > 0.5) {
        omega = -omega;
    }
    for (let i = 0; i < 29 + Math.random() * 7; i++) {
        const angle = i / 32.0 * Math.PI * 2.0 + phase;
        const R = SIZE * 0.43 * i / 34.0;
        path.push({
            x: Math.cos(angle * omega) * R + SIZE/2,
            y: Math.sin(angle * omega) * R + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawWindwalkRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    let AMP = Math.random() * 15 + 11;
    let omega = 1.6 + Math.random() * 0.9;
    for (let i = 0; i < 18; i++) {
        const angle = i / 17.0 * Math.PI * 2.0 + phase;
        path.push({
            x: 12 + i * (SIZE - 24) / 17.0,
            y: Math.sin(angle * omega) * AMP + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawTransfusionRune = (ctx) => {
    const path = [];
    
    const bottomLeft = SIZE - (12 + Math.random() * 8);
    const bottomRight = SIZE - (12 + Math.random() * 8);
    const centerX = SIZE/2 + (Math.random() - 0.5) * 10;
    const top = 10 + Math.random() * 15;
    addLineToPath(path, 12, bottomLeft, centerX, top);
    addLineToPath(path, centerX, top, SIZE-12, bottomRight);

    drawNoisyPath(ctx, path);
}

const drawVineRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    let AMP = Math.random() * 15 + 18;
    let PACE = Math.random() * 0.3 + 0.7;
    for (let i = 0; i < 33; i++) {
        const angle = i / 32.0 * Math.PI * 2.0;
        const p = i / 32.0;
        path.push({
            x: 12 + i * (SIZE - 24) / 33.0 - Math.sin(angle * 2) * PACE * 24 * p * (1 - p) * 4,
            y: Math.cos(angle * 2) * AMP + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawShockwaveRune = (ctx) => {
    const path = [];
    
    const cxT = SIZE / 2 + Math.random() * 8 - 4;
    const cyT = 8 + Math.random() * 6;
    const cxB = SIZE / 2 + Math.random() * 8 - 4;
    const cyB = SIZE - (12 + Math.random() * 6);
    const cxR = (12 + Math.random() * 6);
    const cyR = SIZE / 2 + Math.random() * 8 - 4;
    const cxL = SIZE - (12 + Math.random() * 6);
    const cyL = SIZE / 2 + Math.random() * 8 - 4;
    addLineToPath(path, cxT, cyT, cxB, cyB);
    addLineToPath(path, cxB, cyB, cxL, cyL);
    addLineToPath(path, cxL, cyL, cxR, cyR);
    addLineToPath(path, cxR, cyR, cxB, cyB);

    drawNoisyPath(ctx, path);
}

const drawScribbles = (ctx) => {
    const path = [];
    
    const N = Math.random() * 4 + 3;
    let xi = 10 + Math.random() * (SIZE - 20);
    let yi = 10 + Math.random() * (SIZE - 20);
    for (let i = 0; i < N; i++) {
        let xn = 10 + Math.random() * (SIZE - 20);
        let yn = 10 + Math.random() * (SIZE - 20);    
        addLineToPath(path, xi, yi, xn, yn);
        xi = xn;
        yi = yn;
    }

    drawNoisyPath(ctx, path);
}

const drawGarbageRune = (ctx) => {
    FRACTIONAL_PATH = 0.25;
    // Only include the line-based runes for garbage generation
    const runeDrawOptions = [
        drawScribbles,
        // drawFireballRune,
        drawMeteorRune,
        drawDragonRune,
        drawIceRune,
        drawFrostRune,
        drawHailRune,
        drawLightningRune,
        // drawTornadoRune,
        // drawWindwalkRune,
        // drawTransfusionRune,
        // drawVineRune,
        drawShockwaveRune,
    ];
    const runeDraw = runeDrawOptions[Math.floor(Math.random() * runeDrawOptions.length)];
    runeDraw(ctx);

    FRACTIONAL_PATH = 1.0;
    drawScribbles(ctx);
}

const generateSet = (name, N=10) => {
    const {canvas, ctx} = generateCanvas();
    FRACTIONAL_PATH = 1;
    generateRuneDataset(`${name}/fireball`, canvas, ctx, drawFireballRune, N);
    generateRuneDataset(`${name}/meteor`, canvas, ctx, drawMeteorRune, N);
    generateRuneDataset(`${name}/dragon`, canvas, ctx, drawDragonRune, N);
    generateRuneDataset(`${name}/ice`, canvas, ctx, drawIceRune, N);
    generateRuneDataset(`${name}/frost`, canvas, ctx, drawFrostRune, N);
    generateRuneDataset(`${name}/hail`, canvas, ctx, drawHailRune, N);
    generateRuneDataset(`${name}/lightning`, canvas, ctx, drawLightningRune, N);
    generateRuneDataset(`${name}/tornado`, canvas, ctx, drawTornadoRune, N);
    generateRuneDataset(`${name}/windwalk`, canvas, ctx, drawWindwalkRune, N);
    generateRuneDataset(`${name}/transfusion`, canvas, ctx, drawTransfusionRune, N);
    generateRuneDataset(`${name}/vine`, canvas, ctx, drawVineRune, N);
    generateRuneDataset(`${name}/shockwave`, canvas, ctx, drawShockwaveRune, N);
    // Have more garbage data to enforce symbol discrimination
    generateRuneDataset(`${name}/garbage`, canvas, ctx, drawGarbageRune, N * 2);
}

// generateSet('train', N=10);
generateSet('train', N=6000);
generateSet('test', N=1000);
