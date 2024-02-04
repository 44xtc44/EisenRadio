// svg-main.js
 "use strict";

window.frameCount = 0;

/**
* All animations called from here.
* An SVG group needs an own canvas in this setup.
*/

function svgAnimationMain() {
  let confAni = htmlSettingsDictGlobal["checkboxConfigAnimation"];   // disable all
  let confBall = htmlSettingsDictGlobal["checkboxConfigBalloon"];  // balloons and paras
  let confSpeak = htmlSettingsDictGlobal["checkboxConfigFlatSpeaker"];
  let confFront = htmlSettingsDictGlobal["checkboxConfigFrontPigs"];  // tux, cat, bear
  let confStyle = htmlSettingsDictGlobal["checkboxConfigStyle"];  // switched to a naked page, now same as "cpuUtilisation"
  let cpuMax = htmlSettingsDictGlobal["cpuUtilisation"];  // only some low CPU animations
  let darkBody = getBodyColor();
  let smoothVolume = smoothOutVolume(128, 0.04);  // smoothOutVolume() + getAverageVolume() = audio visual engine
  let powerLevelDict = powerLevelAnimation({ smoothVolume: smoothVolume });

  dataDictsSpeaker(smoothVolume);  // ---> data collector for animateSpeaker(), todo put together?
  dataDictsFrontPigs(darkBody, smoothVolume, powerLevelDict); //  ---> data collector powerLevelDict TUX, floe
  if(confFront) {
    animateIceFloe({ smoothVolume: smoothVolume, powerLevelDict: powerLevelDict });
    animateFront({
      smoothVolume: smoothVolume,
      powerLevelDict: powerLevelDict,
      guestList: [ svgTC.imgDict["Tux"], svgTC.imgDict["Cat"], svgTC.imgDict["Bear"], svgTC.imgDict["portableHole"] ]
    });
  }

  teslaCoils.animateTeslaTowerLights(svgTC.imgDict["teslaCoils"]);
  teslaAnalyzerOne.clearScreen();
  teslaAnalyzerOne.draw();
  teslaAnalyzerTwo.draw();
  // Analyzer are now integrated in the canvas scene, switchable but no more detachable.
  animateAnalyzer();  // can be switched off at GUI
  buoyMenu.update(darkBody);

  seaWave.horizontal( {
    waveList: [
      svgTC.imgDict["WaveRowOne"],
      svgTC.imgDict["WaveRowTwo"],
      svgTC.imgDict["WaveRowThree"]
    ]
  } );

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
  /* requestAnimationFrame; only one in an app. */
  frameCount = requestAnimationFrame(svgAnimationMain);
}
;
