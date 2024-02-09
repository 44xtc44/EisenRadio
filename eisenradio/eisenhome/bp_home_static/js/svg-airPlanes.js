// svg-airPlanes.js
 "use strict";

class FourShadesSVG {
  /* Our desired SVG is constructed with four greyscale colored paths (names).
    It is the name that counts here.
    We use one nice base color and shade the grey colors in four steps.
    <path id="airOne_greyTwo_wing_tail"  , search "greyTwo"
    console.log(document.querySelectorAll("#gSvgSpeakerFlatWaves path")[0].id);

    propReflect = new FourShadesSVG( {svgGroup:"#gPropReflect"} ); //
    propReflect.pathListsGet();
   */
  constructor(options) {
    this.forbiddenColors = this.numberRange(215, 275);  // bad shadows
    this.allColors = this.numberRange(0, 360);  // hue circle, to list
    this.niceColors = [];
    this.pickColors = () => {   // just to write a headless fun and no method
      for (let idx = 0; idx <= this.allColors.length - 1; idx++) {
        if (!this.forbiddenColors.includes(idx)) this.niceColors.push(idx);
      }
    };
    this.pickColors();
    this.pathsListArray = document.querySelectorAll(options.svgGroup + " path");  // options done "#gAirOne path"
    this.pathList = [];
    this.greyOnePathList = [];
    this.greyTwoPathList = [];
    this.greyThreePathList = [];
    this.greyFourPathList = [];
    this.greyLists = [this.greyOnePathList, this.greyTwoPathList, this.greyThreePathList, this.greyFourPathList];
    this.hslOne = null;
    this.hslTwo = null;
    this.hslThree = null;
    this.hslFour = null;
    this.hslInterpolationList = [];
  }

  numberRange(start, end) {
    // simulate range() of Python
    return new Array(end - start).fill().map((d, i) => i + start);
  }

  pathListsGet() {
    /* SVG path names must match the grey keyword.
       I used to colorize the original image in grey colors.
       Gentler for the eyes in the long run. */
    for (let index = 0; index <= this.pathsListArray.length - 1; index++) {
      let pID = this.pathsListArray[index].id;
      this.pathList.push(pID);

      if (pID.includes("greyOne")) this.greyOnePathList.push(pID)
      if (pID.includes("greyTwo")) this.greyTwoPathList.push(pID)
      if (pID.includes("greyThree")) this.greyThreePathList.push(pID)
      if (pID.includes("greyFour")) this.greyFourPathList.push(pID)
    }
  }
  colorPaletteMulti(opt) {
    /* Reusable. Multiple, custom step values. -> zeppelin, doppelDecker
       colorPaletteGet() had an error. [35,39,47,59] is NOT step 4 :)
       Return an array of step count length. .colorPaletteMulti({arrLength:7}); // for 8 paths

       One must take care that step is small enough to not get multiple val > 95%; pure white
    */
    let hueNum = getRandomIntInclusive(0, this.niceColors.length - 1);
    if(opt.sat === undefined) opt.sat = 80;
    const sat = opt.sat;
    if(opt.light === undefined) opt.light = 35;
    const light = opt.light;
    if(opt.step === undefined) opt.step = 4;
    const step = opt.step;
    let raise = 0;
    const arrLength = opt.arrLength;

    let retList = [];
    for(let idx = 0; idx <= arrLength; idx++) {
      retList.push("hsl(" + hueNum + "," + sat + "%," + (light + raise) + "%)");  // raise by step
      raise += step;
    }
    return retList;
  }

  colorPalettePush() {
    /* Assign the color to the list of paths.
     */
    for (let index = 0; index <= this.greyLists.length - 1; index++) {
      let greyShad = this.greyLists[index];

      for (let kIndex = 0; kIndex <= greyShad.length - 1; kIndex++) {
        let svgPathElem = document.getElementById(greyShad[kIndex]);
        svgPathElem.style.fill = this.hslInterpolationList[index];
      }
    }
  }
}
;

/* JavaScript deg and quadrants
       |270
 180 3 | 4  360
 --------------
     2 | 1    0
    90 |
*/

class AirMove {
  constructor(options) {
    if (options === undefined) options = {};
    this.firstRun = true;
    this.start = options.start;
    this.origin = this.start;
    this.end = options.end;
    this.destination = this.end;
    this.x = this.start;
    if (options.y === undefined) options.y = getRandomIntInclusive(100, 175);
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
    this.scale = .1 * getRandomIntInclusive(5, 12);  // 0.5 - 1.5
    this.colorChangeTimer = 1000;   // 1000init, regex tries to change some colors
    this.dDeckerScarfList = ["pilotTwo_scarfOne", "pilotTwo_scarfTwo", "pilotTwo_scarfThree"];
    this.dDeckerScarfIdx = 0;
    this.moveScarf = 0;  // 3 frames
    this.ultraSpinTimer = 0;
    this.ultraSpinList = ["UltraLightPropReflectOne", "UltraLightPropReflectTwo"];
    this.ultraSpinIdx = 0;
    this.planeList = [];  // [svgTC.imgDict["doppelDecker"], svgTC.imgDict["ultraLight"]] svg img instance bound to a canvas and use them in one image.src
    this.planeIdx = 0;  // start index to begin a cycle until we change the image instance
    this.deg2rad = Math.PI/180;
    this.rad2deg = 180/Math.PI;
    this.minUpDown = -20;  // plane flies a curve
    this.maxUpDown = 20;
    this.upDownStep = 0.05;
    this.upDown = new CountUpDown(this.minUpDown, this.maxUpDown, this.upDownStep);  // low, high y

  }

  reset() {
    // u turn
    this.planeIdx = getRandomIntInclusive(0, this.planeList.length - 1);
    this.scale = .1 * getRandomIntInclusive(5, 12);
    if(this.scale <= 0.8) {
      this.y = getRandomIntInclusive(80, 120);  // smaller fly higher
    } else {
      this.y = getRandomIntInclusive(145, 175);
    }
    this.waitCount = 0;
    this.waitTime = getRandomIntInclusive(75, 100);
    let speedMod = 0.01;
    this.speed = speedMod * getRandomIntInclusive(15, 40);
    this.airplaneVisible = false;
  }
}

function animateAirPlane(planeList) {
  /* Instances used to move a plain around and animated it.
  
     "planeList" list of image instance names con to a default canvas - animateAirPlane( [svgTC.imgDict["doppelDecker"], svgTC.imgDict["ultraLight"]] );
     Move:    airMove = new AirMove(  use a more sophisticated mover than default .update() of SvgToCanvas class
     Canvas:  svgTC = new SvgToCanvas( { ...  --> svgTC.imgDict["ultraLight"]
     Color:   fourShades = new FourShadesSVG(  shade color changer, four colors only but looks good
  */
  airMove.waitCount += 1;
  if(airMove.waitCount <= airMove.waitTime) return;  // wait after leave screen
  if(airMove.firstRun) {
    airMove.firstRun = false;
    airMove.reset;  // start with random airPlane
  }

  let iLst = airMove.planeList = planeList;
  let idx = airMove.planeIdx;  // current img instance index we move here around
  let speed = airMove.speedX;
  let upDown = airMove.upDown.update();
  if(upDown >= 0) {
    iLst[idx].rotate = -1/10 * upDown;
  } else {
    iLst[idx].rotate = 1/10 * upDown;
  }
  let yNew = airMove.y + upDown;  // slow curve

  if( airMove.direction) {
    iLst[idx].canX += speed;
    iLst[idx].canY = yNew;
    iLst[idx].imgScaleX = iLst[idx].imgScaleY = airMove.scale;
    svgTC.svgToCanvas( { dict: iLst[idx] } );
    if(iLst[idx].canX > airMove.end){
      // can have a break, change image stuff here
      airMove.direction = false;
      airMove.reset();
      return;
    }
  }
  if(! airMove.direction) {
    iLst[idx].canX -= speed;
    iLst[idx].canY = yNew;
    iLst[idx].imgScaleX = -airMove.scale;
    iLst[idx].imgScaleY = airMove.scale;
    svgTC.svgToCanvas( { dict: iLst[idx] } );
    if(iLst[idx].canX < airMove.start){
      airMove.direction = true;
      airMove.reset();
      return;
    }
  }
  // apply new color
  airMove.colorChangeTimer += 1;
  if (airMove.colorChangeTimer > 500) {   // init is 1.000 to get it right from start
    airMove.colorChangeTimer = 0;
    if(Object.is(svgTC.imgDict["doppelDecker"], iLst[idx])) {
      colorizeDoppelDecker(iLst[idx]);
    }
  }
  airMove.moveScarf += 1;
  if(airMove.moveScarf >= 6) {
    airMove.moveScarf = 0;
    if(Object.is(svgTC.imgDict["doppelDecker"], iLst[idx])) {
      moveDoppelDeckerParts(iLst[idx]);
    }
  }

  // ultraSpin propeller ultraLight
  airMove.ultraSpinTimer += 1;
  if(airMove.ultraSpinTimer >= 6) {
    airMove.ultraSpinTimer = 0;
    if(Object.is(svgTC.imgDict["ultraLight"], iLst[idx])) {
      ultraLightSpinProp(iLst[idx]);
    }
  }
}
;
function moveDoppelDeckerParts(ddImg) {
  airMove.dDeckerScarfIdx += 1;
  if (airMove.dDeckerScarfIdx > airMove.dDeckerScarfList.length - 1) { airMove.dDeckerScarfIdx = 0; }
  let dct = {}
  // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
  for(let i = 0; i <= airMove.dDeckerScarfList.length - 1; i++) {
    dct[[airMove.dDeckerScarfList[i]]] = {"fill-opacity": "0", "fill": "#CC1100"};
  }
  // overwrite current idx key to enable opacity for one in the list
  dct[[airMove.dDeckerScarfList[airMove.dDeckerScarfIdx]]] = {"fill-opacity": "1", "fill": "#FF0000"};
  svgTC.svgEditPath( dct, ddImg );  // second arg ultraImg "SvgToCanvas" image dict
  svgTC.svgToCanvas( { dict: ddImg } );
}
;
function ultraLightSpinProp(ultraImg) {
// propeller reflections of ultraLight
  airMove.ultraSpinIdx += 1;
  if (airMove.ultraSpinIdx > airMove.ultraSpinList.length - 1) { airMove.ultraSpinIdx = 0; }

  let dct = {}
  // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
  for(let i = 0; i <= airMove.ultraSpinList.length - 1; i++) {  // overkill for two, but handy for masses
    dct[[airMove.ultraSpinList[i]]] = {"fill-opacity": "0"};
  }
  // overwrite current idx key to enable opacity for one in the list
  dct[[airMove.ultraSpinList[airMove.ultraSpinIdx]]] = {"fill-opacity": "1"};
  svgTC.svgEditPath( dct, ultraImg );  // second arg ultraImg "SvgToCanvas" image dict
  svgTC.svgToCanvas( { dict: ultraImg } );
}
;
function colorizeDoppelDecker(ddImg) {
  let colorList = fourShades.colorPaletteMulti({arrLength:3, step:8});
  svgTC.svgEditPath({  // method of "SvgToCanvas" class
    "greyOne": { "fill": colorList[0].toString() },
    "greyTwo": { "fill": colorList[1].toString() },
    "greyThree": { "fill": colorList[2].toString() },
    "greyFour": { "fill": colorList[3].toString() },
  }, ddImg);  // second arg ddImg "SvgToCanvas" image dict with "TransCanvas" class img.scr, tagList, canvas ref ...
  svgTC.svgToCanvas( { dict: ddImg } );
}
;

window.airMove = new AirMove({
  start: -150, end: 750,
  waitTime: 0,
  speedX: 1,
  direction: true,
  airplaneVisible: true,
});
window.fourShades = new FourShadesSVG({ svgGroup: "gAirOne" });