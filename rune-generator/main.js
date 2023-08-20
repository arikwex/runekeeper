const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Create canvas
const SIZE = 100;
const OUT_SIZE = 28;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Draw a line on the canvas
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, SIZE, SIZE)

ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(90, 90);
ctx.strokeStyle = 'white';
ctx.lineWidth = 5;
ctx.stroke();

// Scale the canvas down to 28x28
const scaledCanvas = createCanvas(28, 28);
const scaledCtx = scaledCanvas.getContext('2d');
scaledCtx.drawImage(canvas, 0, 0, SIZE, SIZE, 0, 0, OUT_SIZE, OUT_SIZE);

// Save the image to a file
const buffer = scaledCanvas.toBuffer('image/png');
fs.writeFileSync('scaled_line.png', buffer);
console.log('out.png');
