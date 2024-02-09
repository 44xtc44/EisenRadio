// theme-arctic.js
"use strict";

function mainArcticAnimation(opt) {

  if(opt === undefined) opt = {};
  let smoothVolume = opt.smoothVolume;
  let powerLevelDict = opt.powerLevelDict;
  let darkBody = opt.darkBody;
  let confAni = htmlSettingsDictGlobal["checkboxConfigAnimation"];   // disable all
  let confBall = htmlSettingsDictGlobal["checkboxConfigBalloon"];  // balloons and paras
  let confSpeak = htmlSettingsDictGlobal["checkboxConfigFlatSpeaker"];
  let confFront = htmlSettingsDictGlobal["checkboxConfigFrontPigs"];  // tux, cat, bear
  let confStyle = htmlSettingsDictGlobal["checkboxConfigStyle"];  // switched to a naked page, now same as "cpuUtilisation"
  let cpuMax = htmlSettingsDictGlobal["cpuUtilisation"];  // only some low CPU animations

  dataDictsFrontPigs(smoothVolume); // ---> data collector powerLevelDict TUX, floe
  // Always shown animations, regardless of constraints
  teslaCoils.animateTeslaTowerLights(svgTC.imgDict["teslaCoils"]);
  teslaAnalyzerOne.clearScreen();
  teslaAnalyzerOne.draw();
  teslaAnalyzerTwo.draw();
    // Analyzer are now integrated in the canvas scene, switchable but no more detachable.
  animateAnalyzer();  // can be switched off at GUI
  buoyMenu.update(darkBody);

  // seaWave.horizontal( {  // todo needs translation x as well
  //   waveList: [
  //     svgTC.imgDict["WaveRowOne"],
  //     svgTC.imgDict["WaveRowTwo"],
  //     svgTC.imgDict["WaveRowThree"]
  //   ]
  // } );

  // Constrains
  if(confFront) {
    animateStage({ smoothVolume: smoothVolume, powerLevelDict: powerLevelDict });
    if(darkBody) colorizeIceFloe();
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
    animateAirPlane([
      svgTC.imgDict["doppelDecker"], // doppelDecker 1st, must colorize
      svgTC.imgDict["ultraLight"],
    ]);

    if(confBall) {
      paraDropper.update();
      if(frameCount % 2 === 0) {
        nightSky.update(darkBody);
        animateSat(darkBody);
      }

      animateBalloon({
        planeList:[
          svgTC.imgDict["zeppelin"],   // same color, but different light values (doppelDecker)
          svgTC.imgDict["checkered"],  // burner animation
          svgTC.imgDict["lollipop"],   // change a logo if go left and right direction
          ],
        darkBody: darkBody
      });

      canvasCloudsIceHorizontal( svgTC.imgDict["fluffyOne"] );
      canvasCloudsIceHorizontal( svgTC.imgDict["fluffyTwo"] );
      canvasCloudsIceHorizontal( svgTC.imgDict["fluffyThree"] );
      canvasCloudsIceHorizontal( svgTC.imgDict["fluffyFour"] );
      canvasCloudsIceHorizontal( svgTC.imgDict["fluffyFive"] );
      canvasCloudsIceHorizontal( svgTC.imgDict["iceBerg"] );

    }
    animateUfo( svgTC.imgDict["Ufo"] );

  } else {  // clear
    let lst = [
      svgTC.imgDict["fluffyOne"],
      svgTC.imgDict["fluffyTwo"],
      svgTC.imgDict["fluffyThree"],
      svgTC.imgDict["fluffyFour"],
      svgTC.imgDict["fluffyFive"],
      svgTC.imgDict["iceBerg"],
      svgTC.imgDict["doppelDecker"],
      svgTC.imgDict["ultraLight"],
      svgTC.imgDict["checkered"],
      svgTC.imgDict["lollipop"],
      svgTC.imgDict["zeppelin"],
      svgTC.imgDict["speakerOne"],
      svgTC.imgDict["speakerTwo"],
      svgTC.imgDict["Ufo"],
      // svgTC.imgDict["xtraAnalyzer"]
    ]
    for(let i = 0; i <= lst.length - 1; i++) {
      lst[i].ctx.clearRect(0, 0, lst[i].canvas.width, lst[i].canvas.height);
    }
  }
}
;
/**
* Arctic theme, aircraft and balloon animation. Animated ice floe at night.
*/
function themeInitArctic() {
  activeTheme = "Arctic";
  themeDict[activeTheme] = (opt) => { mainArcticAnimation( opt ); };  // svg-main calls each frame themeDict[activeTheme]({foo: bar, baz: buz})

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

  window.satelliteOne = new ParticleStars({  // use x, y to drive the sat img
    canvasId: "cSkyDecorTwo",
    number: 1,
    partSpeed: 0.1,
    partSize: 0.01,
  });
  window.satelliteTwo = new ParticleStars({
    canvasId: "cSkyDecorThree",
    number: 1,
    partSpeed: 0.12,
    partSize: 0.01,
  });
  initClouds();
  switchModeCloudsIce();
  switchModeSeaSky();  // indirectly call foreBackGround.foo, dark mode?
}
;
