import { renderLines } from './canvas';
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
    const lines = [];
    let isDrawing = false;

    function onMouseDown(evt) {
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
        classifyDrawing();
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
        
        normalizeLines = [];
        const size = Math.max(maxs[0] - mins[0], maxs[1] - mins[1], 30);
        lines.map((pt) => {
            normalizeLines.push([
                (pt[0] - (maxs[0] + mins[0])/2) / size * 20 + 14,
                (pt[1] - (maxs[1] + mins[1])/2) / size * 20 + 14,
            ]);
        });

        const tracker = {};
        for (let i = 0; i < 20; i++) {
            scaledCtx.clearRect(0, 0, 28, 28);
            scaledCtx.strokeStyle = "white";
            scaledCtx.lineWidth = Math.random() * 0.6 + 1.2;
            scaledCtx.lineJoin = 'round';
            scaledCtx.lineCap = 'round';
            scaledCtx.setTransform(
                1 + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1, 1 + (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1,
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
        }
        console.log(Object.keys(tracker).map((k) => { return `${mapping[parseInt(k)]}: ${tracker[k]}`; }));
        // console.log(mapping[argmax(z)], z);
    }

    function render(ctx) {
        if (isDrawing) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 20;
            renderLines(ctx, lines);
        }
    }

    function update(dT) {
    }

    return {
        update,
        render,
    }
}

export default SpellCaster;