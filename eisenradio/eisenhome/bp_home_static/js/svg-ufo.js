// svg-ufo.js
"use strict";

// https://stackoverflow.com/questions/10640159/key-for-javascript-dictionary-is-not-stored-as-value-but-as-variable-name
class UfoMove {
  constructor(options) {
    if (options === undefined) options = {};
    if (options.y === undefined) options.y = getRandomIntInclusive(200, 175);
    if (options.waitTime === undefined) options.waitTime = 0;
    if (options.direction === undefined) options.direction = true;
    if (options.ufoVisible === undefined) options.ufoVisible = false;
    this.start = options.start;
    this.origin = this.start;
    this.end = options.end;
    this.x = this.start;
    this.y = options.y;
    this.speedX = .4;
    this.speedY = 0;
    this.waitTime = options.waitTime;
    this.waitCount = 0;
    this.direction = options.direction;  // true is 1, points right
    this.ufoVisible = options.ufoVisible;
    this.ufoSize = 0.1 * getRandomIntInclusive(4, 10);  // 0.5 - 1
    this.imgList = ["ufo"];  // svg img names to serialize for canvas and use them in one image.src
    this.tractorBeamsList = ["tractorBeamFour",  "tractorBeamThree", "tractorBeamTwo",  "tractorBeamOne"];  // start bottom
    this.beamColorList = ["#FF0000", "#FFEFD5", "#00FA9A", "#00FF00", "#FFFF00"]
    let idx = getRandomIntInclusive(0, this.beamColorList.length - 1);
    this.perimeterLights = [  // better write list by hand, inkscape populates groups like 4,7,3 not 1,2,3
      "bottomLightOne", "bottomLightTwo", "bottomLightThree", "bottomLightFour",
      "bottomLightFive", "bottomLightSix", "bottomLightSeven", "bottomLightEight"
    ];
    this.perimeterIdx = 0;
    this.beamCol = this.beamColorList[idx];
    this.tractorBeamsIdx = 0;  // keep track what we have already processed
    this.tractorWaitCount = 0;
    this.enableUpdown = getRandomIntInclusive(0, 1);  // ufo changes direction only sometimes
  }
  reset() {
    let idx = getRandomIntInclusive(0, this.beamColorList.length - 1);
    this.beamCol = this.beamColorList[idx];
    this.enableUpdown = getRandomIntInclusive(0, 1);
    this.ufoSize = 0.1 * getRandomIntInclusive(5, 7);
    this.y = getRandomIntInclusive(75, 150);
    let distance = this.end - this.start;
    if (this.direction) {
      this.start = this.end;
      this.end = this.origin;
      this.direction = false;
    } else {
      this.start = this.origin;
      this.end = this.origin + distance;
      this.direction = true;
    }

    this.waitCount = 0;
    this.waitTime = getRandomIntInclusive(35, 50);
    let speedMod = 0.1;
    this.speed = speedMod * getRandomIntInclusive(15, 25);
    this.ufoVisible = false;
  }
  move() {
    if (this.direction) {
      this.x += this.speedX;
      if (this.x >= this.end) {
        this.reset();
      }
    } else {
      this.x -= this.speedX;  // reverse the direction, need only to scale(-1.2, 1.2) in fun not minus translateX
      if (this.x <= this.end) {
        this.reset();
      }
    }
    this.y += this.speedY;
  }
  update() {
    if (this.waitCount <= this.waitTime) {
      this.waitCount += 1;
      this.ufoVisible = false;
      return;
    } else {
      this.ufoVisible = true;
      this.move();
    }
  }
}

function animateUfo(ufoImg) {

  let x;
  let y;
  ufoMove.update();
  ufoImg.rotate = 1;  // imperfection

  if(ufoMove.enableUpdown === 1) {
    ufoImg.imgScaleX = ufoImg.imgScaleY = ufoSizer.update();  // come and go away illusion
    x = ufoImg.canX = ufoMove.x;
    y = ufoImg.canY = ufoMove.y + ufoUpDown.update();
  } else {
    ufoImg.imgScaleX = ufoImg.imgScaleY = ufoMove.ufoSize;
    x = ufoImg.canX = ufoMove.x;
    y = ufoImg.canY = ufoMove.y;
  }
  if (!ufoMove.ufoVisible) {
    // clear ufo canvas to hide it
    ufoImg.ctx.clearRect(0, 0, ufoImg.canvasDim["width"], ufoImg.canvasDim["height"]);
    return;
  }
  svgTC.svgToCanvas( {dict: ufoImg } ); // after check visible or not, else clear rect.

  if (ufoMove.start && x <= ufoMove.end) {
    ufoImg.direction = ufoMove.direction;
  }
  if (ufoMove.end && x >= ufoMove.origin) {  // origin has init start value
    ufoImg.direction = ufoMove.direction;
  }
  animateUfoTractorBeams(ufoImg);
}
;
function animateUfoTractorBeams(ufoImg) {
  /* Have two different attempts here.
     Preconfigured lists for beams and rotation with dict key overwrite.
  */
  ufoMove.tractorWaitCount += 1;

  if (ufoMove.tractorWaitCount > 8) {  // cpu save
    ufoMove.tractorWaitCount = 0;
    // move index, switch next set on/off
    ufoMove.tractorBeamsIdx += 1;
    if (ufoMove.tractorBeamsIdx > ufoMove.tractorBeamsList.length - 1) { ufoMove.tractorBeamsIdx = 0; }
    ufoMove.perimeterIdx += 1;
    if (ufoMove.perimeterIdx > ufoMove.perimeterLights.length - 1) { ufoMove.perimeterIdx = 0; }

    let dct = {}
    // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
    for(let i = 0; i <= ufoMove.perimeterLights.length - 1; i++) {  // overkill for two, but handy for masses
      dct[[ufoMove.perimeterLights[i]]] = {"fill-opacity": "0"};
    }
    // overwrite current idx key to enable opacity for one in the list
    dct[[ufoMove.perimeterLights[ufoMove.perimeterIdx]]] = {"fill-opacity": "1"};
    // beam color
    for(let i = 0; i <= ufoMove.tractorBeamsList.length - 1; i++) {
      dct[[ufoMove.tractorBeamsList[i]]] = {"fill-opacity": "0", "fill": ufoMove.beamCol};
    }
    dct[[ufoMove.tractorBeamsList[ufoMove.tractorBeamsIdx]]] = {"fill-opacity": "1", "fill": ufoMove.beamCol};

    svgTC.svgEditPath( dct, ufoImg );  // 2nd argument is image dict with image.src and tagList
    svgTC.svgToCanvas( { dict: ufoImg } );
  }
}
;
function switchModeUfo() {
  let darkBody = getBodyColor();
  if (darkBody) {
    nightModeUfo();
  } else {
    dayModeUfo()
  }
}
;
function nightModeUfo() {
  //ufoSTC.serializeImg({ svg: "ufo" });
}
;
function dayModeUfo() {
  //ufoSTC.serializeImg({ svg: "portableHole" });
}
;

window.ufoSizer = new CountUpDown(0.0, 1, 0.001);  // updown(low, high, step per frame).update() ret current val
window.ufoUpDown = new CountUpDown(-30, 30, 0.1);

window.ufoMove = new UfoMove({
  start: 200, end: 500,
  waitTime: getRandomIntInclusive(150, 200),
  speed: 2,
  ufoVisible: true,  // clearRect() canvas
});

