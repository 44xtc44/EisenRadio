// theme-cut.js
"use strict";

/**
* Most simple and CPU saving theme.
*/
function mainCutAnimation(opt) {

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

  if(confFront) {
    animateFront({
      smoothVolume: smoothVolume,
      powerLevelDict: powerLevelDict,
      guestList: [ svgTC.imgDict["Tux"], svgTC.imgDict["Cat"], svgTC.imgDict["Bear"], svgTC.imgDict["portableHole"] ]
    });
  }
  if(cpuMax) {
    if(confSpeak) {
      // animateSpeaker( svgTC.imgDict["speakerOne"] );
      animateSpeaker( svgTC.imgDict["speakerTwo"] );
    }
  }
}
;
/**
* Cut simple theme without any bg animation.
*/
function themeInitCut() {
  activeTheme = "Cut";
  themeDict[activeTheme] = (opt) => { mainCutAnimation( opt ); };  // svg-main calls each frame themeDict[activeTheme]({foo: bar, baz: buz})
  foreBackGround.cutTheme();
  setColor("black");  // default to dark mode, have an ice bear.
  hideParachutes();  // else they stuck on page
}
;
