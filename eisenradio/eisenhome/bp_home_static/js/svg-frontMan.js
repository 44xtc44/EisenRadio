// svg-frontMan.js
 "use strict";

// https://copyprogramming.com/howto/javascript-how-to-overlay-a-canvas-on-video
window.TuxIceFloeFrontPowerSwitch = new PowerSwitch({
  path: document.querySelectorAll("#gTuxIceFloeSTC path"),  // if document.getElementsByClass no need to mention "path"
  hue: getRandomIntInclusive(600, 800),
  step: 1 / getRandomIntInclusive(4, 8),   // to get more or less color reaction, divider
  max: 13,
  maxCount: 6,
  slider: 2,
  dropShadow: "",
  animatePower: false  // only color change, no on/off
});

class SwitchStarGuest {
/* Init in index.js
  Browser must call switchStarGuest.update()
*/
  constructor() {
    this.guestListIdx = 0;  // for starGuestList
    this.starGuestList = [  // image instances dicts; svgTC.imgDict["Tux"].image.src
      svgTC.imgDict["Tux"],
      svgTC.imgDict["Bear"],
      svgTC.imgDict["Cat"],
      svgTC.imgDict["portableHole"],
    ];
  }
  update() {
    this.guestListIdx += 1;
    if (this.guestListIdx > this.starGuestList.length - 1) { this.guestListIdx = 0; }
  }
}

function dataDictsFrontPigs(darkBody, smoothVolume, powerLevelDict) {
  /* inflated (omg), scaled ANIMALS */
  /* animal animation, use volume level to inflate */

  // defaultFrontAnimation(smoothVolume, powerLevelDict);  todo ----------------refac-------------------+++++++
  powerLevelAnimation({
    smoothVolume: smoothVolume,
    animatedInstance: TuxIceFloeFrontPowerSwitch
  });
}
;
function animateFront(opt) {
  /* TUX
  */
  if (opt === undefined) opt = {};
  let fullPower = false;  // used to show different colors at very high volume; later used for space cat with pink hands and eyes
  let scaleUnifier = opt.powerLevelDict[Object.keys(opt.powerLevelDict)[0]];  // multiply with all volume val to get lower audio ranges up
  if (Object.keys(opt.powerLevelDict)[0] == "fullPower") { fullPower = true; }
  if (opt.smoothVolume < 1) { opt.smoothVolume = 1; }

  let currentImg = opt.guestList[switchStarGuest.guestListIdx];
  currentImg.canX = 200;
  currentImg.canY = 240 + yTransUpDown.update();  // sea wave up down
  currentImg.rotate = zRotationUpDown.update();   // sea rolling
  currentImg.translateY = 60;
  currentImg.imgScaleX = currentImg.imgScaleY = opt.smoothVolume;  // inflate
  svgTC.svgToCanvas( {dict: currentImg } );
}
;
function animateIceFloe(opt) {
  /*
    Derived from "defaultFrontAnimation()" animation, can be switched off in tools menu config

    Go from div animation to direct SVG to canvas. Need ctx.drawImage() to paint something.
    This animation needs center rotation of the image. Default is top left.

    save()
    translate(current x + middle of image, y ...)
    scale()
    rotate()
    translate(-x, -y)
    drawImage()
    restore()
  */
  if (opt === undefined) opt = {};

  let darkBody = getBodyColor();
  let fullPower = false;  // used to show different colors at very high volume; later used for space cat with pink hands and eyes
  let scaleUnifier = opt.powerLevelDict[Object.keys(opt.powerLevelDict)[0]];  // multiply with all volume val to get lower audio ranges up
  if (Object.keys(opt.powerLevelDict)[0] == "fullPower") { fullPower = true; }
  if (opt.smoothVolume < 1) { opt.smoothVolume = 1; }

  svgTC.imgDict["iceFloe"].canX = 200;
  svgTC.imgDict["iceFloe"].canY = 300 + yTransUpDown.update();
  svgTC.imgDict["iceFloe"].imgScaleX = 1.4;
  svgTC.imgDict["iceFloe"].rotate = zRotationUpDown.update();
  if (darkBody) {
    colorizeIceFloe();
  }
  svgTC.svgToCanvas( {dict: svgTC.imgDict["iceFloe"] } );  // write canvas dict is img instance with .src
}
;
function colorizeIceFloe() {
  /* PowerSwitch class,
     applyOrgColor() method recovers all DOM queryElement members (tags <path or <circle) saved in to list, id compared against color list
     But now we can simply reload the original image with our SvgToCanvas iceFloe.serializeImg( {svg:"TuxIceFloe"]} ) on dark mode change
  */
  let orgColDct = TuxIceFloeFrontPowerSwitch.elementsList;
  // we apply CANVAS color not DOM
  let eColDct = TuxIceFloeFrontPowerSwitch.eFillColorsDict;
  // cl(eColDct);
  let colDct = {};
  let Front_01_ = "tuxIceFloeFront_01_part";  // order red out from dict
  let Front_02_ = "TuxIceFloeFront_02_part";
  let Front_03_ = "tuxIceFloeFront_03_part";
  let Front_04_ = "tuxIceFloeFront_04_part";
  let Front_05_ = "tuxIceFloeFront_05_part";
  let Front_06_ = "tuxIceFloeFront_06_part";
  let Front_07_ = "tuxIceFloeFront_07_part";
  let Front_08_ = "tuxIceFloeFront_08_part";
  let Front_11_ = "tuxIceFloeFront_11_part";
  let Front_09_ = "tuxIceFloeFront_09_part";
  let Front_10_ = "tuxIceFloeFront_10_part";

  // get color - tuxEllipse is also part of the group but may not be colored at all
  for (let index = 0; index <= Object.keys(eColDct).length - 1; index++) {
    let key = Object.keys(eColDct)[index];
    let val = eColDct[key];  // can be object type if no val is delivered
    if (!(Math.floor(val) % 1 === 0)) {  // garbage, not a number, no audio
      return false;
    }
    if (key === "tuxEllipse") { continue; }
    colDct[key] = "hsl(" + val + ",100%,50%)";  // fill col
  }
  // paint
  svgTC.svgEditPath({
    "Front_01_": { "fill": colDct[Front_01_].toString() },
    "Front_02_": { "fill": colDct[Front_02_].toString() },
    "Front_03_": { "fill": colDct[Front_03_].toString() },
    "Front_04_": { "fill": colDct[Front_04_].toString() },
    "Front_05_": { "fill": colDct[Front_05_].toString() },
    "Front_06_": { "fill": colDct[Front_06_].toString() },
    "Front_07_": { "fill": colDct[Front_07_].toString() },
    "Front_08_": { "fill": colDct[Front_08_].toString() },
    "Front_11_": { "fill": colDct[Front_11_].toString() },
    "Front_09_": { "fill": colDct[Front_09_].toString() },
    "Front_10_": { "fill": colDct[Front_10_].toString() }
  }, svgTC.imgDict["iceFloe"] );  // svgEditPath() queries "arguments[1]" which is the instance dict key with .tagList
}
;
function switchModeIceFloe() {
  let darkBody = getBodyColor();
  if (darkBody) {
    nightModeIceFloe();
  } else {
    dayModeIceFloe()
  }
}
;
function nightModeIceFloe() {

}
;
function dayModeIceFloe() {
  // serializer not working so far, manually, iceFloeSTC.serializeImg( {svg:"iceFloeSTC"} );
  svgTC.svgEditPath({
    "Front_01_": { "fill": "#8ea7af" },
    "Front_02_": { "fill": "#80989e" },
    "Front_03_": { "fill": "#abb6bb" },
    "Front_04_": { "fill": "#c1ced5" },
    "Front_05_": { "fill": "#9daaa8" },
    "Front_06_": { "fill": "#a7b7c1" },
    "Front_07_": { "fill": "#cdd8db" },
    "Front_08_": { "fill": "#9daaa8" },
    "Front_11_": { "fill": "#829aa2" },
    "Front_09_": { "fill": "#a5b4ba" },
    "Front_10_": { "fill": "#9daaa8" },
    "tuxEllipse": { "fill": "hsl(240,50%,80%)" }  // not pure white but more blueish ice
  }, svgTC.imgDict["iceFloe"]);
  svgTC.svgToCanvas( {dict: svgTC.imgDict["iceFloe"] } );
}
;

class Buoy {
/* Can animate a bunch of buoys. */
  constructor(opt) {
   this.buoyImg = opt.dict;
   this.topLight = opt.path;
   this.x = opt.x;
   this.y = opt.y;
   this.flash = opt.flash
   this.flashStatus = 0;
  }
  update(darkBody) {
    let flashBit = this.flash.update();  // returns 0 or 1
    let dct = {};
    this.buoyImg.canX = this.x;
    this.buoyImg.rotate = buoyZRotationUpDown.update();
    if(darkBody){
      this.flashColor = this.flash.flashNightColor;
    } else {
      this.flashColor = this.flash.flashDayColor;
    }

    if(!(this.flashStatus === flashBit)) {  // save CPU, edit only on change
      this.flashStatus = flashBit;
      dct = { [this.topLight.id] : {"fill-opacity": flashBit, "fill": this.flashColor}};  // needs "fill" and "fill-opacity" set
      svgTC.svgEditPath( dct, this.buoyImg );  // svgTC.imgDict["Buoy"]
    }

    svgTC.svgToCanvas( {dict: this.buoyImg } );  // write img to canvas
  }
}

window.zRotationUpDown = new CountUpDown(-5.5, 7, 1/Math.PI/10);    // Z rotation in deg and step
window.yTransUpDown = new CountUpDown(-4, 4, 1/Math.PI/10);
window.xTransUpDown = new CountUpDown(0, 40, 1/Math.PI/10);             // X translation in px and step
// buoy
window.buoyZRotationUpDown = new CountUpDown(-3.5, 4.5, 1/Math.PI/20);  // less rotation in shallow water
