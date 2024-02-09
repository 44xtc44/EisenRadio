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
}
;