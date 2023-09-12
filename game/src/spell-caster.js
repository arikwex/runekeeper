import { emit } from './bus';
import { canvas, renderLines, retainTransform } from './canvas';
import { BLACK, DARK_GRAY, GRAY } from './color';
import { SIGIL_DRAWN } from './events';
import { classify } from './rune-model';
import { COLOR_MAP } from './runes';

function SpellCaster() {    
    const scaledCanvas = document.createElement("canvas");
    const scaledCtx = scaledCanvas.getContext("2d");
    // document.body.appendChild(scaledCanvas);
    // scaledCanvas.style.position = "fixed";
    // scaledCanvas.style.top = "10px";
    // scaledCanvas.style.left = "10px";
    // scaledCanvas.style.border = "1px solid red";
    // scaledCanvas.width = 28;
    // scaledCanvas.height = 28;
    const grayscaleArray = new Array(28*28);
    const mapping = {
        0: 'garbage',
        1: 'circle',
        2: 'triangle',
        3: 'bolt',
        4: 'wave',
        5: 'caret',
        6: 'hourglass',
    };
    const lines = [];
    let isDrawing = false;
    let selectedLines = [];
    let selectedClass = -1;
    let timeSinceSelect = 0;
    let drawingOnLeft = false;
    let inDrawArea = false;

    function touchifyEvent(evt) {
        const touches = evt.changedTouches;
        if (touches) {
            evt.clientX = touches[0].clientX;
            evt.clientY = touches[0].clientY;
        }
    }

    function onMouseDown(evt) {
        touchifyEvent(evt);
        selectedClass = -1;
        if (evt.clientY < canvas.height * 0.65 - 5) {
            return;
        }
        drawingOnLeft = evt.clientX < canvas.width / 2;
        lines.length = 0;
        lines.push([evt.clientX, evt.clientY]);
        isDrawing = true;
    }

    function onMouseMove(evt) {
        touchifyEvent(evt);
        if (!isDrawing) {
            drawingOnLeft = evt.clientX < canvas.width / 2;
        }
        inDrawArea = evt.clientY > canvas.height * 0.65 - 5;
        if (isDrawing && lines.length > 0) {
            const latestPt = lines[lines.length - 1];
            let dx = evt.clientX - latestPt[0];
            let dy = evt.clientY - latestPt[1];
            if (!inDrawArea) {
                return;
            }
            if (drawingOnLeft && evt.clientX > canvas.width / 2) {
                return;
            }
            if (!drawingOnLeft && evt.clientX < canvas.width / 2) {
                return;
            }
            // If dragged far enough, register new point
            if (dx * dx + dy * dy > 20) {
                lines.push([evt.clientX, evt.clientY]);
                // classifyDrawing();
            }
        }
    }

    function onMouseUp(evt) {
        touchifyEvent(evt);
        if (lines.length == 0) {
            return;
        }

        // Classify
        selectedClass = classifyDrawing();
        selectedLines = JSON.parse(JSON.stringify(lines));
        timeSinceSelect = 0;
        lines.length = 0;
        isDrawing = false;
        emit(SIGIL_DRAWN, [selectedClass, drawingOnLeft ? 0 : 1]);
    }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onMouseDown);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);

    function classifyDrawing() {
        // Normalize lines
        let mins = [Infinity, Infinity];
        let maxs = [-Infinity, -Infinity];
        lines.map((pt) => {
            mins[0] = Math.min(pt[0], mins[0]);
            mins[1] = Math.min(pt[1], mins[1]);
            maxs[0] = Math.max(pt[0], maxs[0]);
            maxs[1] = Math.max(pt[1], maxs[1]);
        });
        
        let normalizeLines = [];
        let size = Math.max(maxs[0] - mins[0], maxs[1] - mins[1]);
        if (size < 70) {
            return 0;
        }
        size = Math.max(size, 100);
        // lines.map((pt) => {
        //     normalizeLines.push([
        //         (pt[0] - (maxs[0] + mins[0])/2) / size * (Math.random() * 3 + 20),
        //         (pt[1] - (maxs[1] + mins[1])/2) / size * (Math.random() * 3 + 20),
        //     ]);
        // });

        const tracker = {};
        let topPred = 0;
        let topVal = 0;
        for (let i = 0; i < 20; i++) {
            normalizeLines = [];
            const SKX = (Math.random() * 3 + 16);
            const SKY = (Math.random() * 3 + 16);
            lines.map((pt) => {
                normalizeLines.push([
                    (pt[0] - (maxs[0] + mins[0])/2) / size * SKX,
                    (pt[1] - (maxs[1] + mins[1])/2) / size * SKY,
                ]);
            });

            scaledCtx.setTransform(1,0,0,1,0,0);
            scaledCtx.clearRect(0, 0, 28, 28);
            scaledCtx.strokeStyle = "white";
            scaledCtx.lineWidth = Math.random() * 0.5 + 1.3;
            scaledCtx.lineJoin = 'round';
            scaledCtx.lineCap = 'round';
            scaledCtx.setTransform(
                1 + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1, 1 + (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 2 + 14, (Math.random() - 0.5) * 2 + 14,
            );
            renderLines(scaledCtx, normalizeLines);

            // Convert pixel data to grayscale array
            const scaledImage = scaledCtx.getImageData(0, 0, 28, 28);
            const pixelData = scaledImage.data;
            for (let i = 0; i < pixelData.length; i += 4) {
                grayscaleArray[i>>2] = pixelData[i] / 255.0;
            }

            const z = classify(grayscaleArray);
            const argmax = arr => arr.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            const prediction = argmax(z);
            if (tracker[prediction] === undefined) {
                tracker[prediction] = 0;
            }
            tracker[prediction] += 1;
            const v = tracker[prediction];
            if (v > topVal) {
                topVal = v;
                topPred = prediction;
            }
        }
        // console.log(Object.keys(tracker).map((k) => { return `${mapping[parseInt(k)]}: ${tracker[k]}`; }));
        // console.log(mapping[argmax(z)], z);
        // const keys = Object.keys(tracker);
        // for (let i = 0; i < keys.length; i++) {
        //     const key = keys[i];
        //     if (tracker[key] >= 9 && key != 'garbage') {
        //         return key;
        //     }
        // };
        // Garbage fallback
        return topPred;
    }

    function render(ctx) {
        // Casting zone
        retainTransform(() => {
            // Drawing slab
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = DARK_GRAY;
            ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.36);
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#3d3d3d';
            renderLines(ctx, [[canvas.width / 2, canvas.height * 0.65], [canvas.width / 2, canvas.height]]);
            ctx.strokeStyle = BLACK;
            renderLines(ctx, [[0, canvas.height * 0.65], [canvas.width, canvas.height * 0.65]]);

            ctx.lineWidth = 6;
            let h = canvas.height * 0.65 + 30;
            let w = canvas.width / 2 - 10;
            ctx.strokeStyle = '#664';
            renderLines(ctx, [[w-30, h], [w-30, h+40]]);
            renderLines(ctx, [[w-40, h+10], [w-30, h], [w-20, h+10]]);
            renderLines(ctx, [[w-40, h+30], [w-30, h+40], [w-20, h+30]]);
            ctx.strokeStyle = '#466';
            h += 20;
            w = canvas.width / 2;
            renderLines(ctx, [[w+30, h], [w+70, h]]);
            renderLines(ctx, [[w+40, h-10], [w+30, h], [w+40, h+10]]);
            renderLines(ctx, [[w+60, h-10], [w+70, h], [w+60, h+10]]);
            
            if (isDrawing) {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 20;
                renderLines(ctx, lines);
            }

            if (selectedClass != -1) {
                // const classLabel = mapping[selectedClass];
                // ctx.fillStyle = '#fff';
                // ctx.textAlign = 'center';
                // ctx.font = 'bold 48px arial';
                // ctx.fillText(classLabel, canvas.width/2, 100);

                // Pulse
                const p = Math.exp(-timeSinceSelect*3)*2;
                const c = COLOR_MAP[selectedClass];
                ctx.strokeStyle = `rgba(${c[0]*255}, ${c[1]*255}, ${c[2]*255}, ${p * 0.6})`;
                ctx.lineWidth = 20 + (1 - Math.exp(-timeSinceSelect*5)) * 80;
                renderLines(ctx, selectedLines);
                ctx.strokeStyle = `rgba(${c[0]*300}, ${c[1]*300}, ${c[2]*300}, ${p})`;
                ctx.lineWidth = 20;
                renderLines(ctx, selectedLines);
            }
        });
    }

    function update(dT) {
        timeSinceSelect += dT;
        if (selectedClass != -1 && timeSinceSelect < 5.0) {
            selectedLines.map((pt, i) => {
                pt[0] += Math.cos(timeSinceSelect * 3.0 + 0.2 * i) * 24.0 * dT;
                pt[1] += Math.sin(timeSinceSelect * 3.0 + 0.2 * i) * 24.0 * dT;
            });
        }
    }

    return {
        update,
        render,
        tags: ['caster'],
        getIsDrawing: () => isDrawing,
        getDrawingOnLeft: () => drawingOnLeft,
        getInDrawArea: () => inDrawArea,
    }
}

export default SpellCaster;