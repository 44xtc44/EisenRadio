// svg-balloons.js
"use strict";

/* Move balloons around and see what is looking good.
*/

class BalloonMove {
  constructor(options) {
    if (options === undefined) options = {};
    this.firstRun = true;
    this.start = options.start;
    this.origin = this.start;
    this.end = options.end;
    this.destination = this.end;
    this.x = this.start;
    if (options.y === undefined) options.y = getRandomIntInclusive(0, 80);
    this.y = options.y;
    if (options.y === undefined) options.speedX = 1;
    this.speedX = options.speedX;
    this.speedY = 0;
    if (options.waitTime === undefined) options.waitTime = 0;
    this.waitTime = options.waitTime;
    this.waitCount = 0;
    if (options.direction === undefined) options.direction = true;
    this.direction = options.direction;  // true is 1, points right
    if (options.airplaneVisible === undefined) options.airplaneVisible = false;
    this.airplaneVisible = options.airplaneVisible;
    this.scale = .16 * getRandomIntInclusive(4, 8);  // 0.5 - 1.5
    this.colorChangeTimer = 1000;   // 1000init, regex tries to change some colors
    this.zeppelinColorOrder = [
      "z1Body_RearFinUpperRear", "z1Body_01_part", "z1Body_02_part",
      "z1Body_RearFinUpperFront", "z1Body_03_part", "z1Body_04_part",
      "z1Body_05_part", "z1Body_06_part", "z1Body_RearFinUnderFront",
      "z1Body_07_part", "z1Body_RearFinUnderRear", "z1Body_08_part",
      "z1BodyFinSide",
      // "z1BodyCabin",
      ]
    this.zeppelinColorIdx = 0;
    this.changeLollipopLogo = true;  // change logo for left and right direction
    this.burnerFlashIdx = 0;
    this.redBurner = 0;  // svg path edit only on status change
    this.yellowBurner = 0;
    this.planeList = [];  // [svgTC.imgDict["doppelDecker"], svgTC.imgDict["ultraLight"]] svg img instance bound to a canvas and use them in one image.src
    this.planeIdx = 0;  // start index to begin a cycle until we change the image instance
    this.minUpDown = -50;  // plane flies a curve
    this.maxUpDown = 50;
    this.upDownStep = 0.02;
    this.upDown = new CountUpDown(this.minUpDown, this.maxUpDown, this.upDownStep);  // low, high y

  }

  reset() {
    // u turn
    this.planeIdx = getRandomIntInclusive(0, this.planeList.length - 1);
    this.scale = .16 * getRandomIntInclusive(4, 8);
    if(this.scale <= 0.4) {
      this.y = getRandomIntInclusive(0, 60);  // smaller fly higher
    } else {
      this.y = getRandomIntInclusive(61, 85);
    }
    this.waitCount = 0;
    this.waitTime = getRandomIntInclusive(75, 100);
    let speedMod = 0.01;
    this.speed = speedMod * getRandomIntInclusive(4, 10);
    this.airplaneVisible = false;
    this.changeLollipopLogo = true;
  }
}

function animateBalloon(opt) {
  /* Instances used to move a balloon around and animated it.
     balloonMove instance can carry list of images
  */
  balloonMove.waitCount += 1;
  if(balloonMove.waitCount <= balloonMove.waitTime) return;  // wait after leave screen
  if(balloonMove.firstRun) {
    balloonMove.firstRun = false;
    balloonMove.reset;  // start with random airPlane
  }

  let darkBody = opt.darkBody;
  let iLst = balloonMove.planeList = opt.planeList;
  let idx = balloonMove.planeIdx;  // current img instance index we move here around
  let speed = balloonMove.speedX;
  let upDown = balloonMove.upDown.update();
  let yNew = balloonMove.y + upDown;  // slow curve

  if( balloonMove.direction) {
    iLst[idx].canX += speed;
    iLst[idx].canY = yNew;
    iLst[idx].imgScaleX = iLst[idx].imgScaleY = balloonMove.scale;
    if(Object.is(svgTC.imgDict["zeppelin"], iLst[idx])) {  // track error line for broken state of SVG
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(Object.is(svgTC.imgDict["checkered"], iLst[idx])) {  // track error line for broken state of SVG
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(Object.is(svgTC.imgDict["lollipop"], iLst[idx])) {  // track error line for broken state of SVG
      if(balloonMove.changeLollipopLogo) {
        balloonMove.changeLollipopLogo = false;
        let dct = {};
        dct["txtLolliGoLeft"] = {"fill-opacity": "1" };
        dct["txtLolliGoRight"] = { "fill-opacity": "0" };
        svgTC.svgEditPath(dct, iLst[idx]);
      }
      iLst[idx].imgScaleX = iLst[idx].imgScaleY = 1.2 * iLst[idx].imgScaleY;
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(iLst[idx].canX > balloonMove.end){
      // can have a break, change image stuff here
      balloonMove.direction = false;
      balloonMove.reset();
      return;
    }
  }
  if(! balloonMove.direction) {
    iLst[idx].canX -= speed;
    iLst[idx].canY = yNew;
    iLst[idx].imgScaleX = -balloonMove.scale;
    iLst[idx].imgScaleY = balloonMove.scale;
    if(Object.is(svgTC.imgDict["zeppelin"], iLst[idx])) {  // track error line for broken state of SVG
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(Object.is(svgTC.imgDict["checkered"], iLst[idx])) {  // track error line for broken state of SVG
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(Object.is(svgTC.imgDict["lollipop"], iLst[idx])) {  // track error line for broken state of SVG
      if(balloonMove.changeLollipopLogo) {
        balloonMove.changeLollipopLogo = false;
        let dct = {};
        dct["txtLolliGoLeft"] = { "fill-opacity": "0" };
        dct["txtLolliGoRight"] = { "fill-opacity": "1" };
        svgTC.svgEditPath(dct, iLst[idx]);
      }
      iLst[idx].imgScaleX = -1.2 * iLst[idx].imgScaleY;
      iLst[idx].imgScaleY = 1.2 * iLst[idx].imgScaleY;
      svgTC.svgToCanvas( { dict: iLst[idx] } );
    }
    if(iLst[idx].canX < balloonMove.start){
      balloonMove.direction = true;
      balloonMove.reset();
      return;
    }
  }
  // color zeppelin
  balloonMove.colorChangeTimer += 1;  // balloonMove instance can carry list of images
  if (balloonMove.colorChangeTimer > 500) {   // init is 1.000 to get it right from start
    balloonMove.colorChangeTimer = 0;
    if(Object.is(svgTC.imgDict["zeppelin"], iLst[idx])) {
      colorizeZeppelin(iLst[idx]);
    }
  }
  // burner
  balloonMove.burnerFlashIdx += 1;
  if (balloonMove.burnerFlashIdx > 0) {   // init is 1.000 to get it right from start
    balloonMove.burnerFlashIdx = 0;
    if(Object.is(svgTC.imgDict["checkered"], iLst[idx])) {
      checkBurner(iLst[idx]);
    }
  }
}
;
window.balloonMove = new BalloonMove({
  start: -150, end: 850,
  waitTime: 0,
  speedX: .2,
  direction: true,
  airplaneVisible: true,
});

function colorizeZeppelin(zepImg) {
  let zepPathNum = balloonMove.zeppelinColorOrder.length - 1;
  let colorList = zeppelinShader.colorPaletteMulti({arrLength:zepPathNum, sat: 85, step: 3});
  let dct = {};

  // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
  for(let idx = 0; idx <= zepPathNum; idx++) {
    dct[[balloonMove.zeppelinColorOrder[idx]]] = { "fill": colorList[zepPathNum - idx].toString() };  // color reverse
  }
  svgTC.svgEditPath(dct, zepImg);  // second arg ddImg "SvgToCanvas" image dict with "TransCanvas" class img.scr, tagList, canvas ref ...
  svgTC.svgToCanvas( { dict: zepImg } );
}
;
function checkBurner(checkImg) {
  let dct = {};
  let redO = redBurnerFlash.update();  // 1, 0 return val for opacity
  let yellowO = yellowBurnerFlash.update();

  if(!(balloonMove.redBurner === redO)) {  // save CPU, edit only on change
    balloonMove.redBurner = redO;
    dct["b1BurnerFlameRed"] = { "fill": "#FF0000", "fill-opacity": redO };
    svgTC.svgEditPath(dct, checkImg);
  }
  if(!(balloonMove.yellowBurner === yellowO)) {
    balloonMove.yellowBurner = yellowO;
    dct["b1BurnerFlameYellow"] = { "fill": "#FFFF00", "fill-opacity": yellowO };
    svgTC.svgEditPath(dct, checkImg);
  }
}
;
window.zeppelinShader = new FourShadesSVG({ svgGroup: "gZ1" });  // group has no grey key word, want only the color base

