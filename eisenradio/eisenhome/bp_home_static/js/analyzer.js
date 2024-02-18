// analyzer.js
"use strict";

/* Use of multiple analyzer at the same time.
   Data must be copied to all audioContext nodes.
   analyzerNode.getByteTimeDomainData(dataArray) seems to manipulate/destroy the buffer,

   -> race condition for all nodes
   Created a second analyzer node in "setAudioContextVisual()". Fixed.
*/

class SwitchAnalyzer {
  /* Init in index.js
    Browser must call switchAnalyzer.update() to increment index
  */
  constructor() {
    // TV symbol can switch the list.
    this.stageAnalyzerShow = true;
    this.analyzerListIdx = 0;
    this.analyzerList = [  // includes an option to disappear todo dispatcher for hardcoded canvas id
      function() { stageCircling.update(); },  // todo id here
      function() { stageRotateVisualiser.rotate({ canvasId: "cTV" }); },
      function() { stageFlowField.draw({ canvasId: "cTV" }); },
      function() { stageAnimatedBars({ canvasId: "cTV", clearRect: true }); },
      function() { stageDrawAnalyzer({ canvasId: "cTV" }); },
      function() { toggleAnalyzer(); },  // toggle idx 5
    ];
  }
  update() {
    // index
    this.analyzerListIdx += 1;
    if (this.analyzerListIdx > this.analyzerList.length - 1) { this.analyzerListIdx = 0; }
  }
}

function animateAnalyzer() {
  /* Called by svg-main.js. If off, look for idx. */
  let toggle = 5;
  let runner = switchAnalyzer.analyzerListIdx;
  if (switchAnalyzer.stageAnalyzerShow) {
    switchAnalyzer.analyzerList[runner]();  // exex analyzer fun from list
  }
  if (!switchAnalyzer.stageAnalyzerShow && switchAnalyzer.analyzerListIdx < toggle) {
    toggleAnalyzer();
  }
}
;

function toggleAnalyzer() {
  /* Show analyzer canvas. */
  if (switchAnalyzer.stageAnalyzerShow) {
    switchAnalyzer.stageAnalyzerShow = false;
    analyzerCanvas.stageAnalyzerHide();
  } else {
    switchAnalyzer.stageAnalyzerShow = true;
    analyzerCanvas.stageAnalyzerShow();
  }
}
;

class TeslaAnalyzer {
  /* Analyzer between Tesla coils. Background. Not switchable.
  */
  constructor(opt) {
    this.canvasId = opt.canvasId;
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.posX = opt.posX;
    this.posY = opt.posY;
    this.color = opt.color;
    this.lineWidth = opt.width;
  }
  draw() {
    analyserNodeOne.fftSize = 2048;
    const bufferLength = analyserNodeOne.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNodeOne.getByteTimeDomainData(dataArray);
    // clearScreen() called extern to draw multiple lines on top of each other
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillStyle = 'rgba(26,26,26,0.0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.color;

    this.ctx.beginPath();
    let sliceWidth = (this.canvas.width / 2) * (1.0 / bufferLength);
    // let x = 0;
    let x = this.canvas.width / this.posX;  // move to center on bigger canvas

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      // let y = v * this.canvas.height / 2;
      let y = v * this.canvas.height / this.posY;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    if (dataArray[0] !== 128) this.ctx.stroke();  // no line if idle
  }
  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.teslaAnalyzerOne = new TeslaAnalyzer({
  canvasId: "cAnalyzer",
  posX: 4,
  posY: 5,
  color: "rgb(123, 104, 238)",
  width: 4
});
window.teslaAnalyzerTwo = new TeslaAnalyzer({
  canvasId: "cAnalyzer",
  posX: 4,
  posY: 5,
  color: "rgb(255, 192, 203)",
  width: 1
});

function stageDrawAnalyzer(opt) {
  // simple lines dancing
  analyserNodeTwo.fftSize = 2048;  // node two
  const bufferLength = analyserNodeTwo.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNodeTwo.getByteTimeDomainData(dataArray);

  let canvas = document.getElementById(opt.canvasId);
  let ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2.0;
  let darkBody = getBodyColor();
  if (darkBody) {
    ctx.fillStyle = 'rgba(15,71,87,.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgb(219, 111, 52)';
  } else {
    ctx.fillStyle = 'rgba(0, 191, 255, .0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'red';
  }
  ctx.beginPath();
  var sliceWidth = canvas.width * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0;
    var y = v * canvas.height / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }
  ctx.stroke();
};

function stageAnimatedBars(opt) {
  // Old fashioned, retro stapled bars colorized on top.
  let canvas = document.getElementById(opt.canvasId);
  let ctx = canvas.getContext('2d');

  analyserNodeTwo.fftSize = 128;  // node two
  const bufferLength = analyserNodeTwo.frequencyBinCount;
  var barWidth = (canvas.width / bufferLength) * 2;
  const dataArray = new Uint8Array(bufferLength);
  analyserNodeTwo.getByteFrequencyData(dataArray);

  if (opt.clearRect) ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 0 - barWidth * 2;   // kill the guys scratching the ceiling anyhow
  for (let i = 0; i < bufferLength; i++) {
    let barHeight = ((dataArray[i] / 2) - 12) + 2;
    ctx.lineWidth = 3;
    let darkBody = getBodyColor();
    // draw layer over layer
    ctx.fillStyle = 'red';
    ctx.fillRect(x, canvas.height - barHeight - 3, barWidth, 3);
    ctx.fillStyle = 'rgb(219, 111, 52)';
    ctx.fillRect(x, canvas.height - barHeight - 6, barWidth, 3);
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

    x += barWidth;
  }
}
;


class StageRotateVisualiser {
  /* Rotated radio names on a gradient background. Put the analyzer on top of it. */
  constructor() {
    this.firstRun = true;
    this.counter = 0;
    this.archivedRadioName = "42";
    this.snapShotGradient = undefined;
  }
  snapshotGradient() {
    // prepare background for analyzer to sit on
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const bufferLength = analyserNodeTwo.frequencyBinCount;
    // Gradient
    let gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    let rndOmNum = getRandomIntInclusive(0, (paletteArray.length - 1));

    gradient.addColorStop("0.1", paletteArray[rndOmNum][0]);
    gradient.addColorStop("0.15", paletteArray[rndOmNum][1]);
    gradient.addColorStop("0.21", paletteArray[rndOmNum][2]);
    gradient.addColorStop("0.3", 'blue');
    gradient.addColorStop("0.4", 'rgb(30, 144, 255,1)');   // 'rgb(20,20,20,1)');
    gradient.addColorStop("0.5", 'rgb(0, 191, 255,1)');   // 'rgb(55,55,55,1)');
    gradient.addColorStop("0.7", 'blue');
    gradient.addColorStop("0.79", paletteArray[rndOmNum][3]);
    gradient.addColorStop("0.9", paletteArray[rndOmNum][4]);
    this.ctx.fillStyle = gradient;  // Gradient fill style
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // write name
    this.ctx.fillStyle = 'rgb(0,0,0,0.01)';  // see through for radio name save translate can write on
    for (let i = 0; i < bufferLength; i++) {
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(i * Math.PI * 8 / bufferLength);
      const hue = i * 32;
      this.ctx.fillStyle = 'hsl(' + hue + ',100%,50%)';
      this.ctx.font = '18px Roboto';

      this.ctx.fillText(activeRadioName, 60, 50);
      this.ctx.restore();
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);   // write a gradient layer
    this.snapShotGradient = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);  // save img of it
  }
  rotate(opt) {
    // draw analyzer on rotated radio names on gradients
    this.canvas = document.getElementById(opt.canvasId);
    this.ctx = this.canvas.getContext('2d');

    analyserNodeTwo.fftSize = 128;  // global var
    let bufferLength = analyserNodeTwo.frequencyBinCount;
    let barWidth = (this.canvas.width / bufferLength) * 2; // const barWidth = (this.canvas.width/2) / bufferLength;
    let dataArray = new Uint8Array(bufferLength);
    barWidth = (this.canvas.width / 2) / bufferLength;
    analyserNodeTwo.getByteFrequencyData(dataArray);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.firstRun) {
      /* Reduce CPU/GPU load, make an img of the action and draw it. No realtime rendering, same look */
      this.snapshotGradient();
      this.firstRun = false;
    }
    // modulo of frame count, browser paints 60 times per second
    if ((this.counter % 90) == 0) {
      if (!(this.archivedRadioName == activeRadioName)) {
        this.snapshotGradient();   // new name, paint new background img
        this.archivedRadioName = activeRadioName;  // global var
      }
    }
    this.counter++;
    // draw in mem snapshot of gradient with radio names
    this.ctx.putImageData(this.snapShotGradient, 0, 0);
    this.ctx.fill();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // draw analyzer on top
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      let barHeight = dataArray[i] * 0.32;
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2 - 6);
      this.ctx.rotate(i * Math.PI * 4 / bufferLength);
      let hue = i * 5;
      this.ctx.fillStyle = 'hsl(' + hue + ',100%,50%)';
      this.ctx.globalCompositeOperation = 'source-over'
      this.ctx.fillRect(0, 0, barWidth, barHeight);
      x += barWidth;
      this.ctx.restore();
    }
  }
}

window.stageRotateVisualiser = new StageRotateVisualiser();

class StageFlowField {
  /* Moving bars starting synchronized and end in a good looking chaos.
     Can get random bg color and bar color.
  */
  constructor() {
    this.firstRun = true;
    this.canvas = undefined;
    this.ctx = undefined;
    this.gradient = undefined;
    this.radius = 0;
    this.cellSize = getRandomIntInclusive(10, 20);
    this.radiusVelocity = Math.random() * (0.02 - 0.005) + 0.005;  // floor whole num, Math.floor(Math.random() * (max - min + 1)) + min;
  }
  createGradient() {
    this.gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    let rndOmNum = getRandomIntInclusive(0, (paletteArray.length - 1));
    this.gradient.addColorStop("0.1", paletteArray[rndOmNum][0]);
    this.gradient.addColorStop("0.2", paletteArray[rndOmNum][1]);
    this.gradient.addColorStop("0.4", paletteArray[rndOmNum][2]);
    this.gradient.addColorStop("0.6", paletteArray[rndOmNum][3]);
    this.gradient.addColorStop("0.9", paletteArray[rndOmNum][4]);
  }
  drawLine(angle, x, y) {
    this.ctx.globalAlpha = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + Math.cos(angle) * 30, y + Math.sin(angle) * 30);
    this.ctx.stroke();
  }
  draw(opt) {
    this.canvas = document.getElementById(opt.canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 1;
    if (this.firstRun) {
      this.createGradient();
      this.firstRun = false;
    }
    this.ctx.strokeStyle = this.gradient;
    this.ctx.clearRect(0, 0, this.width, this.height)

    let darkBody = getBodyColor();
    if (!darkBody) {
      this.ctx.fillStyle = 'rgba(15,71,87,.6)';  //"#565454";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = 'rgba(26,26,26,0.85)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.radius += this.radiusVelocity;

    for (let y = 0; y < this.canvas.height; y += this.cellSize) {
      for (let x = 0; x < this.canvas.width; x += this.cellSize) {
        let angle = (Math.cos(x * 0.03) + Math.sin(y * 0.03)) * this.radius;  // more rnd here
        this.drawLine(angle, x, y);
      }
    }
  }
}
window.stageFlowField = new StageFlowField();


class StageCircling {
  /* Analyzer flies around an imaginary center in 2D space AND rotates.

         1.5 * Math.PI (old base radiant thingy, now transform is the choice)
            |
          y | x
    1 -------------- 0   |
            | radius     |
            |            |
         0.5 * Math.PI   . true clock write
  */
  constructor(opt) {
    if (opt.enableDraw === undefined) opt.enableDraw = true;  // false use only chords of .update() for piggy-back img use x,y
    this.enableDraw = opt.enableDraw;
    this.canvasId = opt.canvasId;
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.speed = opt.speed;  // speed can change -> integrate smoothVolume value somehow?
    this.offCenter = opt.offCenter; // radius we fly around something, give it a name
    this.x = this.offCenter;  // manipulate x > 0 creates a clean circle rotation around pin point, take skew to press oval
    this.y = 0;  // center of circle; will be translated to pin point
    this.pinX = this.canvas.width / 2;  // create opt to place somewhere
    this.pinY = this.canvas.height / 2;  // translate circle to pin point y
    this.rotate = 0;
  }
  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.rotate += this.speed;

    this.ctx.translate(this.pinX, this.pinY);
    this.ctx.beginPath();  // drawing lines here
    // ****************** first rotate ctx; then draw, write 100 times :) ***************
    this.ctx.rotate(this.rotate * (Math.PI / 180));
    this.drawAnalyzer();
    this.ctx.translate(-this.pinX, -this.pinY);
    this.ctx.closePath;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  drawAnalyzer() {
    let x = 0;
    let barWidth = 5;
    let bufferLength = analyserNodeTwo.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyserNodeTwo.fftSize = 128;
    analyserNodeTwo.getByteFrequencyData(dataArray);

    this.ctx.lineWidth = 2;
    for (let i = 0; i < bufferLength; i++) {
      let barHeight = dataArray[i] * 0.28;
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(i * Math.PI * 8 / bufferLength);
      this.ctx.fillStyle = 'gold';
      this.ctx.fillRect(0, this.canvas.height - barHeight - 60, barWidth, 4);
      let hue = 256 + (i * Math.PI / 2);
      this.ctx.fillStyle = 'hsl(' + hue + ',100%,50%)';
      this.ctx.fillRect(0, 0, barWidth, barHeight);
      x += barWidth;
      this.ctx.restore();  // save, restore needed, we work in an existing transform
    }
  }
}

window.stageCircling = new StageCircling({
  canvasId: "cTV",
  offCenter: 30,  // Radius of movement circle. Around an imaginary point.
  speed: 0.5,
})

/**
* StageAnalyzer stores properties related to analyzer and canvas.
*/
class StageAnalyzerCanvas{
  constructor(opt) {
    this.pxLeft = 0;
    this.pxTop = 0;
    this.canvas = document.getElementById(opt.canvasId);  // "cTV"
    this.ctx = this.canvas.getContext('2d');
    // default canvas decoration and transform
    this.border = '8px solid';
    this.borderColor = 'rgb(175, 238, 238)'
    this.borderRadius = '1em';
    this.scale = "scale(1.0, 1.0)";
    this.skew = "skew(0deg, 10deg)";
    this.rotateX = "rotateX(0deg)";
  }
  /**
  * Draw the TV frame to show different analyzer
  * and some educational broadcast.
  */
  stageAnalyzerShow( opt ) {
    this.canvas.style.display = "inline-block";
    this.ctx.fillStyle = 'rgba(0,135,200,0.0)';  // test color, push alpha up
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.style.left = this.pxLeft; // "360px";
    this.canvas.style.top = this.pxTop;  // "200px";

    this.canvas.style.border = this.border;
    this.canvas.style.borderColor = this.borderColor;
    this.canvas.style.borderRadius = this.borderRadius;

    this.canvas.style.transform = this.scale;
    this.canvas.style.transform += this.skew;
    this.canvas.style.transform += this.rotateX;
  }
  stageAnalyzerHide() {
    this.canvas.style.display = "none";
  }
}
  window.analyzerCanvas = new StageAnalyzerCanvas( {canvasId: "cTV"} );
