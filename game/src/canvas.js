const canvas = document.getElementsByTagName('canvas')[0];
canvas.width = innerWidth;
canvas.height = innerHeight;

window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.imageSmoothingEnabled = false;
};
let ctx;

function renderText(txt, x, y, size) {
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = `bold ${size}px arial`;
    ctx.fillText(txt, x, y);
}

function retainTransform(fn) {
    const xfm = ctx.getTransform();
    fn();
    ctx.setTransform(xfm);
}

function renderLines(ctx, lines, close=false) {
    ctx.beginPath();
    lines.map((pt, i) => {
        if (i == 0) {
            ctx.moveTo(pt[0], pt[1]);
        } else {
            ctx.lineTo(pt[0], pt[1]);
        }
    });
    if (close){
        ctx.closePath();
    }
    ctx.stroke();
}

function renderAndFill(ctx, lines) {
    renderLines(ctx, lines, true);
    ctx.fill();
}

// Favicon
const favicon = document.createElement('canvas');
favicon.width = favicon.height = 64;
ctx = favicon.getContext('2d');
// TODO
ctx = canvas.getContext('2d');
let link = document.querySelector("link");
link.href = favicon.toDataURL();
ctx.imageSmoothingEnabled = false;

ctx.lineJoin = 'round';
ctx.lineCap = 'round';

export {
    canvas,
    ctx,
    renderText,
    retainTransform,
    renderLines,
    renderAndFill,
};