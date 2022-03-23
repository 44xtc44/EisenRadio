const hueArray = [0,30,60,120,150,180,210,240,270,300,330];
const floatingMultiply = [0.5,2,4,8]
const paletteArray = [
                        ['#dc8665','#138086','#534666','#cd7672','#eeb462'],
                        ['#e8a49c','#3c4cad','#240e8b','#f04393','#f9c449'],
                        ['#fbeee6','#ffe5d8','#ffcad4','#f3abb6','#f98189'],
                        ['#2c6975','#6882a0','#cde0c9','#edecde','#ffffff'],
                        ['#3588ca','#0191b4','#f8d90f','#d3dd18','#fe7a15'],
                        ['#47cacc','#63bcc9','#cdb3d4','#e7b7c8','#ffbe88'],
                        ['#ff7b89','#8a5082','#6f5f90','#758eb7','#a5cad2'],
                        ['#df825f','#f8956f','#dfb15b','#4d446f','#706695'],
                        ['#85cbcc','#a8dee0','#f9e2ae','#fbc78d','#a7d676'],
                        ['#86e3ce','#d0e6a5','#ffdd94','#fa897b','#ccabd8'],
                        ['#ff5c33','#ff66b3','#ccccff','#b3ffff','#ffff33'],
                        ['#ed5875','#da5290','#f5be63','#ff736a','#75abc5'],
                        ['#010006','#c5bdca','#ffdae7','#fb92b3','#d03d74'],
                        ['#70cab0','#f5917a','#eddeb7','#f7cc88','#f38091'],
                        ['#ebac9b','#fccead','#faf3e1','#bd3329','#f4ce69'],
                        ['#072448','#2a6fdb','#ffb00a','#f8aa4b','#ff6150'],
                        ['#122c91','#54d2d2','#48d6d2','#81e9e6','#fefcbf'],
                        ['#27104e','#64379f','#9854cb','#ddacf5','#75e8e7'],
                        ['#f7a400','#3a9efd','#3e4491','#292a73','#1a1b4b'],
                        ['#343090','#5f59f7','#6592fd','#44c2fd','#8c61ff'],
                        ['#e0f0ea','#95adbe','#574f7d','#503a65','#3c2a4d'],
                        ['#ffa822','#134e6f','#ff6150','#1ac0c6','#dee0e6']
];
const STAR_NUM = 88;
const STAR_SPEED = 0.01;

var counter = 0;
var firstRun = true;
var currentRadio;
var snapShot, snapShot2, clone_snapShot;
var particlesColorSwitch = false;
var canvasMasterGlobalAlpha = 1;
var hueColor;
var paletteColorArray = [];
var floatingStageParticles = [];
var starFieldParticles = [];
var particlesArray = [];
var stars = [];
var starSpeed = STAR_SPEED * canvasMaster.width;
var xVelocity = starSpeed * Math.random() * randomOne();
var yVelocity = Math.sqrt(Math.pow(starSpeed, 2) - Math.pow(xVelocity, 2)) * randomOne();
var fieldAnimationRandom;
var fieldCellRandom;
var currentRadioGenre = 'undefined';
var animatedFunctionInterval = 1000/60;
var animatedFunctionTimer = 0;
var animatedFunctionLastTime = 0;
var direction = 1;
var requestIdAnimationFrame = undefined;
var requestIdFieldAnimation = undefined;
var floatingMultiplyNum;


let ctx;
let flowFieldAnimation;
document.getElementById('currentRadioName').innerText = 'Eisenradio';

class Particle {

    constructor (canvas, ctx, fill, stroke, maxSize, minSize) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.fill = fill;
        this.stroke = stroke;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * maxSize + minSize;
        this.speedX = Math.random() * (-0.5);
        this.speedY = Math.random() * (-0.2);
    }

    update () {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) {this.size -= 0.1;}
    }

    drawCircle () {
        this.ctx.fillStyle = this.fill;
        this.ctx.strokeStyle = this.stroke;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.size,0,Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

}
;

function initParticles (canvas, context, fill, stroke, numParticles, maxSize, minSize) {
    for(let i = 0; i < numParticles; i++) {
        particlesArray.push(new Particle(canvas, context, fill, stroke, maxSize, minSize));
    }
}
;

function animateParticle(ctx, animation) {
    for(let i = 0; i < particlesArray.length; i++) {

        if (animation == 'lineAnimation') {
            particlesArray[i].update();
            particlesArray[i].drawCircle();
            for(let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);   // coord. particle x and particle y; hypotenuse; a²+b²=c²
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = particlesArray[i].color;
                    ctx.lineWidth = particlesArray[i].size/10;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
            if (particlesArray[i].size <= 0.3) {
                particlesArray.splice(i, 1);
                i--;
            }
        }
    }
}
;

class flowFieldEffect {
    // private fields   version 1.1.4 crashes on Snap manjaro 'Uncaught SyntaxError: private fields are not currently supported
    //                  the app is dead   firefox 86  snap firefox 96 not better, since default 86 version is started
    // #ctx;
    // #width;
    // #height;
    constructor(ctx,width,height,palette){
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.palette = palette;
        this.ctx.lineWidth = 1;
        this.lastTime = 0;
        this.interval = 1000/60;    // 1000/60 most monitors have 16,6 ms refresh rate
        this.timer = 0;
        this.cellSize = fieldCellRandom;  // fieldCellRandom generated in visualiseAudio()
        this.gradient;
        this.createGradient();
        this.ctx.strokeStyle = this.gradient;
        this.radius = 0;
        this.radiusVelocity = fieldAnimationRandom;   // fieldAnimationRandom generated in visualiseAudio()

    }

    createGradient(){
        this.gradient = this.ctx.createLinearGradient(0,0,this.width,this.height);
        let rndOmNum = getRandomIntInclusive(0,(paletteArray.length - 1));
        this.gradient.addColorStop("0.1", paletteArray[rndOmNum][0]);
        this.gradient.addColorStop("0.2", paletteArray[rndOmNum][1]);
        this.gradient.addColorStop("0.4", paletteArray[rndOmNum][2]);
        this.gradient.addColorStop("0.6", paletteArray[rndOmNum][3]);
        this.gradient.addColorStop("0.9", paletteArray[rndOmNum][4]);
    }
    drawLine(angle,x,y){
        this.ctx.globalAlpha = canvasMasterGlobalAlpha;
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(x + Math.cos(angle) * 30, y + Math.sin(angle) * 30);
        this.ctx.stroke();
    }
    animate(timeStamp){     // requestAnimationFrame() feeds timeStamp, is an instance so bind is used to loop it
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        if(this.timer > this.interval){
             // clear
            this.ctx.clearRect(0,0,this.width,this.height)

            let darkBody = getBodyColor();
            if (!darkBody) {
                this.ctx.fillStyle = 'rgb(0,0,0,1)'; //"#565454";
                this.ctx.fillRect(0,0,this.width,this.height);
            }
            this.radius += this.radiusVelocity;

            for(let y = 0; y < this.height; y += this.cellSize){
                for(let x = 0; x < this.width; x += this.cellSize){
                    const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.radius;
                    this.drawLine(angle,x,y);
                }

            }

            this.timer = 0;
        } else {
            this.timer += deltaTime;
        }

        requestIdFieldAnimation = requestAnimationFrame(this.animate.bind(this));
    }
}
function floatingStageMove(x,y,radius,color,ctx) {

    this.x = x;
    this.xMultiplier;   // movement: different x y values can create an oval, real thing needs then collision detection
    this.y = y;
    this.yMultiplier;
    this.radius = radius;   // size: radius of the 'ball', not the movement
    this.color = color;
    // ratio: initial arc to line ratio of the circle to move, will be negative for sin and cos in some quadrants
    this.radians = Math.random() * Math.PI * 2;
    // double pi is diameter
    this.velocity = 0.002;   // path length per animation frame
    this.ctx = ctx;

    this.update = () => {

        this.radians += this.velocity;    // push the radians value, arc size ... line size
        this.x = x + Math.cos(this.radians) * 26;  // old x position plus a good amount of pos and neg rad
        this.y = y + Math.sin(this.radians) * 26;
    }
    this.draw = () => {
        // color overwritten
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2);
        this.ctx.fillStyle = 'rgb(0,0,' + animatedFunctionTimer + ',0.8)';
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath;
    }
}
;

function initFloatingStage() {

   for (let i = 0; i < 1; i++) {
    floatingStageParticles.push(new floatingStageMove(canvasMaster.width/2,canvasMaster.height/2,(canvasMaster.height/2)/2 - 12, 'blue',canvasMasterCtx))
   }
}
;

function drawStage(){
    canvasMasterCtx.lineWidth = 2;
    let stageSize = canvasMaster.height/2 - 24;
    canvasMasterCtx.beginPath();
    canvasMasterCtx.arc(canvasMaster.width /2,canvasMaster.height/2,stageSize,0,Math.PI * 2);
    canvasMasterCtx.fillStyle = 'rgb(' + animatedFunctionTimer + ',0,' + animatedFunctionTimer + ',0.8)';
    canvasMasterCtx.fill();
    canvasMasterCtx.stroke();
    canvasMasterCtx.closePath();
}
;

function floatingStage() {
   // ctx.arc(x, y, radius, startAngle, endAngle [, counterclockwise]);

    analyserNode.fftSize = 128;
    const bufferLength = analyserNode.frequencyBinCount;
    const barWidth = 5;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    // set alpha back
    canvasMasterCtx.globalAlpha = 1;
    // draw circles
    drawStage();
    // draw rotating circle inside stage;
    let posX;
    let posY;
    $.each(floatingStageParticles, function (idx, val) {
        let particle = val;
        particle.update();
        particle.draw();
        posX = particle.x;
        posY = particle.y;
    });
    canvasMasterCtx.lineWidth = 2;
    // Spectrum Analyser
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 0.28;
        canvasMasterCtx.save();
        canvasMasterCtx.translate(posX, posY);
        canvasMasterCtx.rotate(i * Math.PI * 8 / bufferLength);
        canvasMasterCtx.fillStyle = 'gold';
        canvasMasterCtx.fillRect(0, canvasMaster.height - barHeight - 60, barWidth, 4);
        const hue = hueColor + (i * Math.PI / floatingMultiplyNum);
        canvasMasterCtx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        canvasMasterCtx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        canvasMasterCtx.restore();
    }
    countUpDownInclusiveInt(0, 128);
    requestIdAnimationFrame = window.requestAnimationFrame(floatingStage);
};

function pageCoverAnimation() {
    // remove for trails
    let cover = pageCoverCanvas
    cover.width = window.innerWidth;
    cover.height = window.innerHeight;

    requestAnimationFrame(pageCoverAnimation);
    animateParticle(pageCoverCanvasCtx, 'lineAnimation');
    if ((counter % 60) == 0) {
        if (particlesColorSwitch) {
            initParticles(pageCoverCanvas, pageCoverCanvasCtx, 'SandyBrown', 'gold', 20, 20, 1);
            particlesColorSwitch = false;
        } else {
            initParticles(pageCoverCanvas, pageCoverCanvasCtx, 'coral', 'gold', 10, 20, 1);
            particlesColorSwitch = true;
        }
        counter = 0;
    }
    counter++;
}
;

function rotateVisualiserGradient(){
    const bufferLength = analyserNode.frequencyBinCount;
       // Gradient
    canvasMasterCtx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);
    let gradient = canvasMasterCtx.createLinearGradient(0,0,canvasMaster.width,canvasMaster.height);
    let rndOmNum = getRandomIntInclusive(0,(paletteArray.length - 1));
    canvasMasterGlobalAlpha = 0.5;  // weaken color
    gradient.addColorStop("0.1", paletteArray[rndOmNum][0]);
    gradient.addColorStop("0.15", paletteArray[rndOmNum][1]);
    gradient.addColorStop("0.21", paletteArray[rndOmNum][2]);
    gradient.addColorStop("0.3", 'black');
    gradient.addColorStop("0.4", 'rgb(20,20,20,1)');
    gradient.addColorStop("0.5", 'rgb(55,55,55,1)');
    gradient.addColorStop("0.7", 'black');
    gradient.addColorStop("0.79", paletteArray[rndOmNum][3]);
    gradient.addColorStop("0.9", paletteArray[rndOmNum][4]);
    canvasMasterCtx.fillStyle = gradient;  // Gradient fill style
    canvasMasterCtx.fillRect(0,0,canvasMaster.width, canvasMaster.height);  // write Gradient done.
      // write name
    canvasMasterCtx.fillStyle = 'rgb(0,0,0,0.01)';  // see through for radio name save translate can write on
    for (let i = 0; i < bufferLength; i++) {
        canvasMasterCtx.save();
        canvasMasterCtx.translate(canvasMaster.width / 2, canvasMaster.height / 2);
        canvasMasterCtx.rotate(i * Math.PI * 8 / bufferLength);
        const hue = i * 32;
        canvasMasterCtx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        canvasMasterCtx.font = '18px Finger Paint';
        canvasMasterCtx.fillText(currentRadio, 60, 50);
        canvasMasterCtx.restore();
    }
    canvasMasterCtx.fillRect(0, 0, canvasMaster.width, canvasMaster.height);   // write on Gradient layer
    snapShot = canvasMasterCtx.getImageData(0, 0, canvasMaster.width, canvasMaster.height);
}
;

function rotateVisualiserFillText(){
    const bufferLength = analyserNode.frequencyBinCount;
      // write name
    canvasMasterCtx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);
    canvasMasterCtx.fillStyle = 'rgb(0,0,0,0.01)';  // see through for radio name save translate can write on
    for (let i = 0; i < bufferLength; i++) {
        canvasMasterCtx.save();
        canvasMasterCtx.translate(canvasMaster.width / 2, canvasMaster.height / 2);
        canvasMasterCtx.rotate(i * Math.PI * 8 / bufferLength);
        const hue = i * 32;
        canvasMasterCtx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        canvasMasterCtx.font = '18px Finger Paint';
        canvasMasterCtx.fillText(currentRadio, 60, 50);
        canvasMasterCtx.restore();
    }
    canvasMasterCtx.fillRect(0, 0, canvasMaster.width, canvasMaster.height);   // write on Gradient layer
    snapShot2 = canvasMasterCtx.getImageData(0, 0, canvasMaster.width, canvasMaster.height);
}
;

function rotateVisualiser() {

    analyserNode.fftSize = 128;
    const bufferLength = analyserNode.frequencyBinCount;
    var barWidth = (canvasMaster.width / bufferLength) * 2; // const barWidth = (canvasMaster.width/2) / bufferLength;
    const dataArray = new Uint8Array(bufferLength);
    barWidth = (canvasMaster.width / 2) / bufferLength;
    analyserNode.getByteFrequencyData(dataArray);

    // clear
    canvasMasterCtx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);

    if (firstRun) {
        /* reduce cpu/gpu load, make a picture of the action and present pic instead of realtime rendering, looks same */
        rotateVisualiserGradient();
        // rotateVisualiserFillText();
        firstRun = false;
    }
    // normal run
    canvasMasterCtx.putImageData(snapShot, 0, 0);
    canvasMasterCtx.fill();
    canvasMasterCtx.fillRect(0, 0, canvasMaster.width, canvasMaster.height);

    // draw Spectrum
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 0.32;
        canvasMasterCtx.save();
        canvasMasterCtx.translate(canvasMaster.width / 2, canvasMaster.height / 2 - 6);
        canvasMasterCtx.rotate(i * Math.PI * 4 / bufferLength);
        const hue = i * 5;
        canvasMasterCtx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        canvasMasterCtx.globalCompositeOperation = 'source-over'
        canvasMasterCtx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        canvasMasterCtx.restore();
    }
    requestIdAnimationFrame = window.requestAnimationFrame(rotateVisualiser);
};

function starFieldCirclesMove(x,y,radius,color,ctx) {

    this.x = x;
    this.xMultiplier = getRandomIntInclusive(15,25);   // movement: different x y values can create an oval
    this.y = y;
    this.yMultiplier = this.xMultiplier -10;
    this.radius = radius;   // size: radius of the 'ball', not the movement
    this.color = color;
    // ratio: initial arc to line ratio of the circle to move, will be negative for sin and cos in some quadrants
    this.radians = Math.random() * Math.PI * 2;
    // double pi is diameter
    this.velocity = Math.random() * 0.003;   // path length per animation frame
    this.ctx = ctx;

    this.update = () => {

        this.radians += this.velocity;    // push the radians value, arc size ... line size
        this.x = x + Math.cos(this.radians) * this.xMultiplier;  // old x position plus a good amount of pos and neg rad
        this.y = y + Math.sin(this.radians) * this.yMultiplier;
    }
    this.draw = () => {
        // color overwritten
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2);
        this.ctx.fillStyle = 'rgb(219, 111, 52)';
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath;
    }
}
;

function initStarFieldCircles(x,y) {

   for (let i = 0; i < 2; i++) {
    starFieldParticles.push(new starFieldCirclesMove(x,y,getRandomIntInclusive(5,7), 'rgb(219, 111, 52)',canvasMasterCtx))
   }
}
;

function starField () {

    analyserNode.fftSize = 128;
    const bufferLength = analyserNode.frequencyBinCount;
    const barWidth = 4;
    const dataArray = new Uint8Array(bufferLength);

    x = 0;
    analyserNode.getByteFrequencyData(dataArray);
    canvasMasterCtx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);

    // space
    canvasMasterCtx.fillStyle = 'black';
    canvasMasterCtx.fillRect(0, 0, canvasMaster.width, canvasMaster.height);
    // stars
    canvasMasterCtx.fillStyle = 'white';
    canvasMasterCtx.strokeStyle = 'gold';
    canvasMasterCtx.lineWidth = 0.5;
    // let startTime = Date.now();

    for (let i = 0; i < STAR_NUM; i++) {
        let xPosition = stars[i].x
        let yPosition = stars[i].y
        let moveX = stars[i].xVelocity * -0.001 * 60;
        let moveY = stars[i].yVelocity * -0.001 * 60;

        canvasMasterCtx.beginPath();
        canvasMasterCtx.arc(xPosition, yPosition, stars[i].r, 0, Math.PI * 2);
        canvasMasterCtx.fill();
        canvasMasterCtx.stroke();

        xPosition += moveX;
        yPosition += moveY;

        // move out of screen left/right
        if (xPosition < 0 - stars[i].r) {
            xPosition = canvasMaster.width + stars[i].r;
        } else if (xPosition > canvasMaster.width + stars[i].r) {
            xPosition = 0 - stars[i].r;
        }
        // move out of screen up/down
        if (yPosition < 0 - stars[i].r) {
            yPosition = canvasMaster.height + stars[i].r;
        } else if (yPosition > canvasMaster.height + stars[i].r) {
            yPosition = 0 - stars[i].r;
        }

        stars[i].x = xPosition;
        stars[i].y = yPosition;
    }
    // analyser
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 0.31;
        canvasMasterCtx.save();
        canvasMasterCtx.translate(canvasMaster.width / 2, canvasMaster.height / 2);
        canvasMasterCtx.rotate(i * Math.PI * 8 / bufferLength);
        const hue = i * 15;
        canvasMasterCtx.fillStyle = 'hsl(' + hue + ',100%,50%)';
        canvasMasterCtx.globalCompositeOperation = 'source-over';  // default, but to remember
        canvasMasterCtx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        canvasMasterCtx.restore();
    }
    // let endTime = Date.now() - startTime;
    $.each(starFieldParticles, function (idx, val) {
        let particle = val;
        particle.update();
        particle.draw();
    });
    requestIdAnimationFrame = window.requestAnimationFrame(starField);
    counter++;
}
;

function animatedBars() {

    analyserNode.fftSize = 128;
    const bufferLength = analyserNode.frequencyBinCount;
    var barWidth = (canvasMaster.width / bufferLength) * 2; // const barWidth = (canvasMaster.width/2) / bufferLength;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    x = 0 - barWidth * 2;   // kill the guys scratching the ceiling anyhow
    for (let i = 0; i < bufferLength; i++) {
        barHeight = ((dataArray[i]/2) - 12) + 2;
        canvasMasterCtx.lineWidth = 3;
        let darkBody = getBodyColor();
        if (darkBody) {
            canvasMasterCtx.fillStyle = 'red';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight - 3, barWidth, 3);
            canvasMasterCtx.fillStyle = 'rgb(219, 111, 52)';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight - 6, barWidth, 3);
            canvasMasterCtx.fillStyle = 'blue';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight, barWidth, barHeight)

        } else {
            canvasMasterCtx.fillStyle = '#d441fc';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight - 3, barWidth, 3);
            canvasMasterCtx.fillStyle = 'rgb(219, 111, 52)';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight - 7, barWidth, 2);
            canvasMasterCtx.fillStyle = '#565454';
            canvasMasterCtx.fillRect(x, canvasMaster.height - barHeight, barWidth, barHeight)
        }

        x += barWidth;

    }

    counter++;
    requestIdAnimationFrame = window.requestAnimationFrame(animatedBars);
};

function draw() {

    analyserNode.fftSize = 2048;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    canvasMasterCtx.clearRect(0, 0, canvasMaster.width, canvasMaster.height);

    canvasMasterCtx.lineWidth = 1.0;
    let darkBody = getBodyColor();
    if (darkBody) {
        canvasMasterCtx.strokeStyle = 'rgb(219, 111, 52)';
    } else {
        canvasMasterCtx.strokeStyle = 'red';
    }
    canvasMasterCtx.beginPath();
    var sliceWidth = canvasMaster.width * 1.0 / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * canvasMaster.height / 2;

        if (i === 0) {
            canvasMasterCtx.moveTo(x, y);
        } else {
            canvasMasterCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasMasterCtx.stroke();

    requestIdAnimationFrame = window.requestAnimationFrame(draw);
};

function initFlowFieldEnv(){

    fieldAnimationRandom = Math.random() * (0.02 - 0.005) + 0.005;    // floor whole num, Math.floor(Math.random() * (max - min + 1)) + min;
    fieldCellRandom = getRandomIntInclusive(10,14);
    flowField = new flowFieldEffect(canvasMasterCtx,canvasMaster.width, canvasMaster.height, null);
    flowField.animate(0);
}
;

function initStarFieldEnv(){

    for (let i = 0; i < STAR_NUM; i++) {
        let speedMultiplier = Math.random() * 0.75 + 0.5;
        let starSize = Math.random() * 0.026;
        stars[i] = {
            r: Math.random() * starSize * canvasMaster.width / 2,
            x: Math.floor(Math.random() * canvasMaster.width),
            y: Math.floor(Math.random() * canvasMaster.height),
            xVelocity: xVelocity * speedMultiplier,
            yVelocity: yVelocity * speedMultiplier
        }
    }
}
;

function popper_org() {
    canvasMasterCtx.clearRect(0,0,canvasMaster.width,canvasMaster.height);
    $.each(floatingStageParticles, function (idx, val) {
        let particle = val;
        particle.update();
        particle.draw();
    });

    requestIdAnimationFrame = window.requestAnimationFrame(popper);
}
;

function visualiseAudio(var_canvas) {
    stopVisualise();
    currentRadio = document.getElementById('currentRadioName').innerText;
    if(currentRadio === 'Eisenradio'){return;}

    spectrumAnalyserActive = true;
    animatedFunctionTimer = 0;
    animatedFunctionLastTime = 0;
    firstRun = true;
    counter = 0;
    canvasMasterGlobalAlpha = 1;

    // cleanup arrays
    particlesArray.splice(0,particlesArray.length);
    stars.splice(0,stars.length);
    floatingStageParticles.splice(0,floatingStageParticles.length);
    starFieldParticles.splice(0,starFieldParticles.length);
    paletteColorArray.splice(0,paletteColorArray.length);

    let barHeight;
    let x = 0;

    try {

        if (analyserRandom == 1) { draw(); }
        if (analyserRandom == 2) {
                                    snapShot = undefined;
                                    rotateVisualiser(); }
        if (analyserRandom == 3) {
                                    initFlowFieldEnv();
                                    animatedBars(0); }
        if (analyserRandom == 4) {
                                    initFloatingStage();
                                    initFlowFieldEnv();
                                    hueColor = hueArray[getRandomIntInclusive(0,10)]
                                    floatingMultiplyNum = getRandomIntInclusive(0,(floatingMultiply.length - 1));
                                    floatingStage(); }
        if (analyserRandom == 5) {
                                    initStarFieldEnv();
                                    let x = canvasMaster.width * 0.2;
                                    let y = canvasMaster.height/2;
                                    initStarFieldCircles(x,y);
                                    x = canvasMaster.width * 0.8;
                                    y -= getRandomIntInclusive(0,25);
                                    initStarFieldCircles(x,y);
                                    starField();
        }

        if (analyserRandom == 6) {
                                    // initFloatingStage();
                                    // popper();
                                    initPopper();
                                    }

    } catch (error) { console.error(error); }

}
;

function selectSpectrumAnalyser() {

    let selectOverrideSpectrum = document.getElementById('selectOverrideSpectrum').value
    if (selectOverrideSpectrum == 0) {
        analyserRandom = Math.round(Math.random() * 4 + 1);    // 4 options;  3 + 1
    } else {
        analyserRandom = selectOverrideSpectrum;
    }
    visualiseAudio(null);
}
;

function overrideSpectrumAnalyser() {
    stopVisualise();
    selectSpectrumAnalyser();
}
;
