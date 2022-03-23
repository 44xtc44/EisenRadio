var sun = new Image();
var moon = new Image();
var earth = new Image();  // copyright

function initPopper() {

    sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
    moon.src = 'https://mdn.mozillademos.org/files/1443/Canvas_moon.png';
    earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';
    window.requestAnimationFrame(popper);
}
;

function popper() {
    let ctx = canvasMasterCtx;
    let earthOrbit = canvasMaster.height/2 - 10

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    ctx.save();
    ctx.translate(150, 150);

    // Earth
    let time = new Date();
    ctx.rotate(((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 60000) * time.getMilliseconds());
    ctx.translate(earthOrbit, earthOrbit);
    ctx.fillRect(0, -12, 50, 24); // Shadow
    ctx.drawImage(earth, -12, -12);

    // Moon
    ctx.save();
    ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
    ctx.translate(0, 28.5);
    ctx.drawImage(moon, -3.5, -3.5);
    ctx.restore();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(canvasMaster.width/2,canvasMaster.height/2, earthOrbit, 0, Math.PI * 2, false); // Earth orbit, (x,y, radius,  startAngle, endAngle [, counterclockwise])
    ctx.stroke();

    ctx.drawImage(sun, 0, 0, canvasMaster.width,canvasMaster.height);  // drawImage(imgVar,x,y,picWidt,picHeight)
    requestIdAnimationFrame = window.requestAnimationFrame(popper);
}
;

