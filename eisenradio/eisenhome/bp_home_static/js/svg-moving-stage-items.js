// svg-moving-stage-items.js

function defaultFrontAnimation(smoothVolume, powerLevelDict){
  /* default animation, can be switched off in tools menu config */

  let fullPower = false;  // used to show different colors at very high volume; later used for space cat with pink hands and eyes
  let scaleUnifier = powerLevelDict[Object.keys(powerLevelDict)[0]];  // multiply with all volume val to get lower audio ranges up
  if(Object.keys(powerLevelDict)[0] == "fullPower"){fullPower = true;}
  let darkBody = getBodyColor();   // html body
  let animSvg;                     // svg

  try {
    let ypsilonTranslation;  // fine tune position of animal up or down
    // enable animal
    let animalContainer = eisenStylesDict["eisenRadio_" + activeListenId].animal + activeListenId;
    let animSvg = document.getElementById(animalContainer);
    animSvg.style.display = "inline-block";
    // enable ice floe
    let divSvgIceTux = document.getElementById("divSvgIceTux_" + activeListenId); // ice floe
    divSvgIceTux.style.display = "inline-block";

    if(smoothVolume < 1){smoothVolume = 1;}
    animSvg.style.transformOrigin = "40% center"; // top,center
    animSvg.style.transform      = "translateX(" + animalTranslationUpDown.update() + "px)";
    divSvgIceTux.style.transform = "translateX(" + animalTranslationUpDown.update() + "px)";
    divSvgIceTux.style.transform += "rotateZ(" + animalZRotationUpDown.update() + "deg)";
    ypsilonTranslation = -50;

    animSvg.style.transform += "scaleX(" + (smoothVolume * scaleUnifier) + ")";
    animSvg.style.transform += "scaleY(" + (smoothVolume * scaleUnifier) + ")";
    animSvg.style.transform += "rotateZ(" + animalZRotationUpDown.update() + "deg)";
    animSvg.style.transform += "translateY(" + ypsilonTranslation + "px)";

  } catch (error) {
    console.log(error);
  }
}
;
function animateBuoy(darkBody){

  /* BUOY Must not disabled, second EDIT BUTTON */
  let buoySegmentVeryTopLight = document.getElementById("buoySegmentVeryTopLight");
  let divSvgBuoy = document.getElementById("divSvgBuoy_" + activeListenId);
  let flashDayColor   = "hsl(" + 300 + ", 100%, 50%)";
  let flashNightColor = "hsl(" + 10 + ", 100%, 50%)";
  if(darkBody){
      buoyPosLightPSwitch.flashColor = flashNightColor
  } else {
      buoyPosLightPSwitch.flashColor = flashDayColor
  }
  buoyPosLightPSwitch.updateFlashPattern();
  // zRotation and x to swim
  divSvgBuoy.style.transform = "translateX(" + -animalTranslationUpDown.update()/4 + "px)";
  divSvgBuoy.style.transform += "rotateZ(" + buoyZRotationUpDown.update() + "deg)";
}
;
function animateSpeaker(smoothVolume){

  if(htmlSettingsDictGlobal["checkboxConfigFlatSpeaker"]){
  /* SPEAKER */
    powerLevelAnimation({smoothVolume: smoothVolume,
                        animatedInstance: infSpeaker
    });
  }
}
;
