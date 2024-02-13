// theme-sunset.js
"use strict";

function mainSunsetAnimation(opt) {

  if(opt === undefined) opt = {};
  let smoothVolume = opt.smoothVolume;
  let darkBody = opt.darkBody;
  let confAni = htmlSettingsDictGlobal["checkboxConfigAnimation"];   // disable all
  let confBall = htmlSettingsDictGlobal["checkboxConfigBalloon"];  // balloons and paras
  let confSpeak = htmlSettingsDictGlobal["checkboxConfigFlatSpeaker"];
  let confFront = htmlSettingsDictGlobal["checkboxConfigFrontPigs"];  // tux, cat, bear
  let confStyle = htmlSettingsDictGlobal["checkboxConfigStyle"];  // switched to a naked page, now same as "cpuUtilisation"
  let cpuMax = htmlSettingsDictGlobal["cpuUtilisation"];  // only some low CPU animations

  let powerLevelDict = powerLevelAnimation({ smoothVolume: smoothVolume });
  dataDictsFrontPigs(smoothVolume); // ---> data collector powerLevelDict TUX, floe

  // Always shown animations, regardless of constraints
  animateAnalyzer();  // TV
  buoyMenu.update(darkBody);
  blackBird.animate();
  sunsetReflect.animate();
  // Constrains
  if(cpuMax) {
    paraDropper.update();
    if(confSpeak) {
      // animateSpeaker( svgTC.imgDict["speakerOne"] );
      animateSpeaker( svgTC.imgDict["speakerTwo"] );
    }
  }
  if(confFront) {
    animateStage({
      svgImg: "lifebuoy",
      smoothVolume: smoothVolume,
      powerLevelDict: powerLevelDict,
      canX: 200,
      canY: 390,
      translateY: 60,
      imgScaleX: 1,
    });
    animateFront({
      smoothVolume: smoothVolume,
      powerLevelDict: powerLevelDict,
      guestList: [ svgTC.imgDict["Tux"], svgTC.imgDict["Cat"], svgTC.imgDict["Bear"], svgTC.imgDict["portableHole"] ],
      canX: 200,
      canY: 330,
      translateY: 60,
    });
  }
}
;
/**
* Sunset simple theme, minimal bg animation. Water reflections to come and Tux on lifebuoy.
*/
function themeInitSunset() {
  activeTheme = "Sunset";
  themeDict[activeTheme] = (opt) => { mainSunsetAnimation( opt ); };  // svg-main calls each frame themeDict[activeTheme]({foo: bar, baz: buz})
  foreBackGround.sunset();
  setColor("black");  // night theme

  window.blackBird = new BirdSideView({
    start: getRandomIntInclusive(-100,200), end: getRandomIntInclusive(600, 900),
    waitTime: getRandomIntInclusive(400, 800),
    speed: getRandomIntInclusive(8, 16),
    itemVisible: true,  // clearRect() canvas
    sizer: [0.0, 1, 0.001],
    updownY: [-50, 50, 0.1],
    svgInstanceDict: svgTC.imgDict["Tweety"],  // which canvas num to use
    svgGroup: "gBlackBird",  // SVG group to show paths
    skipFlapFrames: 10,
  });

  window.sunsetReflect = new SunsetReflect({
    svgInstanceDict: svgTC.imgDict["sunsetWaterReflect"],  // which canvas num to use
    svgGroup: "gSunsetWaterReflect",  // SVG group to show paths
    skipFrames: 300,
    maxReflections: 12,
  });
}
;
/**
* Reflection dots are members of an SVG group.
  window.sunsetReflect = new SunsetReflect({
    svgInstanceDict: svgTC.imgDict["sunsetWaterReflect"],  // which canvas num to use
    svgGroup: "gSunsetWaterReflect",  // SVG group to show paths
    skipFrames: 246,
    maxReflections: 12,
  });
*/
class SunsetReflect{
  constructor(options) {
    // SVG img instance dict and group of paths
    this.svgIDct = options.svgInstanceDict;  // svgTC.imgDict["sunsetWaterReflect"] to write current image
    this.svgGrp = options.svgGroup;  // "gSunsetWaterReflect" got path_01_, path_02_, ... to edit paths
    this.pathDict = {};  // {path1: 0, path2: 3, path3: 0, path4: 6 }  timer until pop from list
    // reflections
    this.skipFrames = options.skipFrames;  // set 6 to skip 6 frames
    this.maxReflections = options.maxReflections;
    this.pathIdx = 0;
    this.pathIdList = [];
    this.checkOutDict = {};
    this.skipped = 0;  // counter to reset on this.skipFrames

    this.init();
  }
  init() {
   this.equipRefList();
   this.loadPathDict();
   this.preLoadCheckOutDict();
  }
  equipRefList() {
    let lst = document.querySelectorAll("#" +  this.svgGrp + " path");
    let idLst = [];
    for(let i = 0; i <= lst.length - 1; i++) {
      idLst.push(lst[i].id);
    }
    this.pathIdList = this.shuffleArray(idLst);
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  loadPathDict() {
    for(let i = 0; i <= this.pathIdList.length - 1; i++) {
      this.pathDict[this.pathIdList[i]] = 0;
    }
  }
  preLoadCheckOutDict() {
    for(let i = 0; i <= this.maxReflections - 1; i++) {
      this.checkOutDict[this.pathIdList[i]] = this.skipFrames * i;
    }
  }
  /**
  * checkOutDict keys are SVG path names, value is (frame) counter.
  * Frame counter reaches max, we del key from dict, add new key (path) with frame counter zero to dict.
  * Edit new SVG path in checkOutDict to opacity 1 (show). Deleted  "exitCandidates" SVG path is set back to opacity 0.
  * checkOutDict dict is faster and less CPU consuming than reorganizing a list at each frame.
  */
  animate() {
    let oKeysList = Object.keys(this.checkOutDict);
    let exitCandidates = [];
      // delete max key val
    for(let i = 0; i <= oKeysList.length - 1; i++) {
      this.checkOutDict[oKeysList[i]] += 1;  // until max skipFrames

      if(this.checkOutDict[oKeysList[i]] > this.skipFrames) {
         exitCandidates.push(oKeysList[i]);  // exitCandidate sets its opacity back to zero in edit mode
         delete this.checkOutDict[oKeysList[i]];  // del exitCandidate path from dict
      }
    }
    // add new paths
    let newPaths = [];
    while(Object.keys(this.checkOutDict).length < this.maxReflections) {
      this.pathIdx += 1;
      if(this.pathIdx > this.pathIdList.length - 1) this.pathIdx = 0;
      this.checkOutDict[this.pathIdList[this.pathIdx]] = getRandomIntInclusive(0,this.skipFrames/2);
      newPaths.push(this.pathIdList[this.pathIdx]);  // only edit SVG path once, if added to the "checkOutDict"
    }
    if(newPaths.length !== 0 || exitCandidates.length !== 0) {
      this.editSvgPath( {newPaths: newPaths, exitCandidates: exitCandidates} )
    }
  }
  editSvgPath(opt) {
    let dct = {}
    for(let i = 0; i <= opt.newPaths.length - 1; i++) {
      // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
      dct[opt.newPaths[i]] = {"fill-opacity": "1"};   // visible
    }
    for(let i = 0; i <= opt.exitCandidates.length - 1; i++) {
      dct[opt.exitCandidates[i]] = {"fill-opacity": "0"};   // hide path
    }
    svgTC.svgEditPath( dct, this.svgIDct );  // second arg ultraImg "SvgToCanvas" image dict
    svgTC.svgToCanvas( { dict: this.svgIDct } );
  }
}
