function SpellCaster() {
    const scaledCanvas = document.createElement("canvas");
    const scaledCtx = scaledCanvas.getContext("2d");
    document.body.appendChild(scaledCanvas);
    scaledCanvas.width = 28;
    scaledCanvas.height = 28;
    const grayscaleArray = new Array(28*28);
    const mapping = {
        0: 'garbage',
        1: 'fireball',
        2: 'meteor',
        3: 'dragon',
        4: 'ice',
        5: 'frost',
        6: 'hail',
        7: 'lightning',
        8: 'tornado',
        9: 'windwalk',
        10: 'transfusion',
        11: 'vine',
        12: 'shockwave',
    };

    function onMouseDown(evt) {
        console.log(evt);
    }
    function onMouseMove(evt) {
        console.log(evt.clientX, evt.clientY);
    }
    function onMouseUp(evt) {
        console.log(evt);
    }
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    function render(ctx) {
        // Render the pattern that's actively drawn
    }

    function update(dT) {
        // Draw something on the canvas
        // ctx.fillStyle = "black";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.beginPath();
        // ctx.moveTo(60, canvas.height/2-60);
        // ctx.lineTo(canvas.width/2, 160);
        // ctx.lineTo(canvas.width-60, canvas.height/2-60);
        // ctx.lineTo(canvas.width/2, canvas.height-160);
        // ctx.closePath();
        // ctx.strokeStyle = "white";
        // ctx.lineWidth = 60;
        // ctx.stroke();

        // Draw the subimage on the scaled canvas
        // scaledCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);

        // // Convert pixel data to grayscale array
        // const scaledImage = scaledCtx.getImageData(0, 0, 28, 28);
        // const pixelData = scaledImage.data;
        // for (let i = 0; i < pixelData.length; i += 4) {
        //     grayscaleArray[i>>2] = pixelData[i] / 255.0;
        // }

        // const z = classify(grayscaleArray);
        // const argmax = arr => arr.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        // console.log(mapping[argmax(z)], z);
    }

    return {
        update,
        render,
    }
}

export default SpellCaster;