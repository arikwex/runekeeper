import { canvas, renderLines } from './canvas';
import { classify } from './rune-model';

function SpellCaster() {    
    const scaledCanvas = document.createElement("canvas");
    const scaledCtx = scaledCanvas.getContext("2d");
    document.body.appendChild(scaledCanvas);
    scaledCanvas.style.position = "fixed";
    scaledCanvas.style.top = "10px";
    scaledCanvas.style.left = "10px";
    scaledCanvas.style.border = "1px solid red";
    scaledCanvas.width = 28;
    scaledCanvas.height = 28;
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
    const colorMap = {
        0: [0.4, 0.4, 0.4],
        1: [1.0, 0.65, 0.3],
        2: [0.3, 0.65, 1.0],
        3: [1.0, 1.0, 0.1],
        4: [0.3, 1.0, 0.65],
        5: [1.0, 0.1, 1.0],
        6: [1.0, 1.0, 1.0],
    }
    const lines = [];
    let isDrawing = false;
    let selectedLines = [];
    let selectedClass = -1;
    let timeSinceSelect = 0;

    function onMouseDown(evt) {
        selectedClass = -1;
        lines.length = 0;
        lines.push([evt.clientX, evt.clientY]);
        isDrawing = true;
    }

    function onMouseMove(evt) {
        if (isDrawing && lines.length > 0) {
            const latestPt = lines[lines.length - 1];
            let dx = evt.clientX - latestPt[0];
            let dy = evt.clientY - latestPt[1];
            // If dragged far enough, register new point
            if (dx * dx + dy * dy > 20) {
                lines.push([evt.clientX, evt.clientY]);
                classifyDrawing();
            }
        }
    }

    function onMouseUp(evt) {
        selectedClass = classifyDrawing();
        selectedLines = JSON.parse(JSON.stringify(lines));
        timeSinceSelect = 0;
        lines.length = 0;
        isDrawing = false;
    }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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
        const size = Math.max(maxs[0] - mins[0], maxs[1] - mins[1], 100);
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
            tracker[prediction] += (prediction == 0) ? 1 : 2;
            const v = tracker[prediction];
            if (v > topVal) {
                topVal = v;
                topPred = prediction;
            }
        }
        console.log(Object.keys(tracker).map((k) => { return `${mapping[parseInt(k)]}: ${tracker[k]}`; }));
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
        if (isDrawing) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 20;
            renderLines(ctx, lines);
        }

        if (selectedClass != -1) {
            const classLabel = mapping[selectedClass];
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 48px arial';
            ctx.fillText(classLabel, canvas.width/2, 100);

            // Pulse
            const p = Math.exp(-timeSinceSelect*3)*2;
            const c = colorMap[selectedClass];
            ctx.strokeStyle = `rgba(${p*c[0]*255}, ${p*c[1]*255}, ${p*c[2]*255}, ${p * 0.6})`;
            ctx.lineWidth = 20 + (1 - Math.exp(-timeSinceSelect*5)) * 80;
            renderLines(ctx, selectedLines);
            ctx.strokeStyle = `rgba(${p*c[0]*300}, ${p*c[1]*300}, ${p*c[2]*300}, ${p})`;
            ctx.lineWidth = 20;
            renderLines(ctx, selectedLines);
        }
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
    }
}

export default SpellCaster;