// svg-main.js
 "use strict";

window.frameCount = 0;
/**
* Animations called from here.
*/
function svgAnimationMain() {
  let darkBody = getBodyColor();

  // Audio normalizer for all themes.
  let smoothVolume = smoothOutVolume(128, 0.04);  // smoothOutVolume() + getAverageVolume() = audio visual engine

  /* Returns dict with custom key names { "midClassic": 1 } { "fullClassic": 1 } not used, so far.
  * Calls animatedInstance.midClassic(); to fill dicts with style.display none, or inline-block
  * Or {speakerFlatWavOne: 316.6666666666667, speakerFlatWavThree: 350, speakerFlatWavTwo: 333.3333333333333}
  * returns colors of the 360 deg hue circle
  */
  let powerLevelDict = powerLevelAnimation({ smoothVolume: smoothVolume });
  dataDictsSpeaker(smoothVolume);  // ---> data collector for animateSpeaker(),

  // Call anonymous, theme fun from dict, set in index.js.
  if(activeTheme.length > 0) {
    themeDict[activeTheme]({
      smoothVolume: smoothVolume,
      powerLevelDict: powerLevelDict,
      darkBody: darkBody
  });
  }
  /* requestAnimationFrame; only one in an app. */
  frameCount = requestAnimationFrame(svgAnimationMain);
}
;
/**
* Create a "SvgToCanvas" class instance and load all SVG images to canvas and memory.
* Create instances of classes where the images are used.
* ``svg-foreBackGround.js`` class is shared by themes
*/
function initSvgEnv() {
  //
  window.svgTC = new SvgToCanvas({  // multi-image-loader and translation class
    svg: svgList,  // see in constants.js; container SVGs; eisenradioSVG 100x100;
    useSprite: true,  // use as multi image loader for stacked groups; a group can be a sprite [img,img] also
    spriteList: spriteList  // in constants.js, We load non animated img also, assignments to canvas are fake.
  });

  window.switchStarGuest = new SwitchStarGuest();  // declare after SVG images are loaded; svg-frontMan.js
  window.switchAnalyzer = new SwitchAnalyzer();  // toggle analyzer
  window.foreBackGround = new ForeBackGround();  // Methods to load static SVG images as fore-, background on canvas

  // connect empty image src with loaded SVG groups, valid for all themes
  // document.getElementById('newRadioImage').src = svgTC.imgDict["newRadio"].image.src;  // remove from symbol
  // document.getElementById('saveRadioImage').src = svgTC.imgDict["saveRadio"].image.src;
  // document.getElementById('toolsRadioImage').src = svgTC.imgDict["toolsRadio"].image.src;
  // document.getElementById('aboutRadioImage').src = svgTC.imgDict["aboutRadio"].image.src;
  // document.getElementById('playRadioImage').src = svgTC.imgDict["playRadio"].image.src;
  document.getElementById('blacklistImage').src = svgTC.imgDict["blackList"].image.src;
  document.getElementById('hamburgerImage').src = svgTC.imgDict["hamburgerImg"].image.src;
  document.getElementById('recordImage').src = svgTC.imgDict["recordOn"].image.src;

  // Init instances, valid for all themes.

  window.buoyMenuFlash = new Flash({  // called by buoyMenu
    flashDayColor: "hsl(300, 100%, 50%)",
    flashNightColor: "hsl(10, 100%, 50%)",
    flashFrames: 20,
    flashList: [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  });
  window.buoyMenu = new Buoy({
    dict: svgTC.imgDict["Buoy"],
    x: 30, y: 450,
    path: document.getElementById("buoySegmentVeryTopLight"),
    flash: buoyMenuFlash,
  });
  // svgTC.imgDict["speakerOne"].canX = 15;  // uncomment if data collector was optimized, high CPU if both online
  // svgTC.imgDict["speakerOne"].canY = 75;
  // svgTC.imgDict["speakerOne"].rotate = 345;  // 15 deg
  svgTC.imgDict["speakerTwo"].canX = 600;
  svgTC.imgDict["speakerTwo"].canY = 100;
  svgTC.imgDict["speakerTwo"].rotate = 345;
  svgTC.imgDict["speakerTwo"].imgScaleX = -1;  // reverse
  // Checkered balloon burner animation.
  window.redBurnerFlash = new Flash({
    flashDayColor: "hsl(300, 100%, 50%)",
    flashNightColor: "hsl(10, 100%, 50%)",
    flashFrames: 20,
    flashList: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  });
  window.yellowBurnerFlash = new Flash({
    flashDayColor: "hsl(200, 100%, 50%)",
    flashNightColor: "hsl(100, 100%, 50%)",
    flashFrames: 20,
    flashList: [1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0],
  });
}
;
/**
* * Test loop, which is showing if all images can be loaded. -> todo implement Jest
*/
function testSVGtoCanvas() {
  // Let's see if we can write to canvas or fail early.
  for(let i = 0; i <= spriteList.length - 1; i++) {  // spriteList in constants.js
    let instanceName = Object.keys(spriteList[i])[0];
    svgTC.svgToCanvas( { dict: svgTC.imgDict[instanceName] } );
    // let dct = {[svgTC.imgDict[instanceName].groupName]: { "fill": "#ffffff" }};  // broken state if key same regex
    // svgTC.svgEditPath(dct, svgTC.imgDict[instanceName]);
  }
}
;