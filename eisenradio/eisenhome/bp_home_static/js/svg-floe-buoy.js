// svg-floe-buoy.js

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
let tuxCloudOneUpDow        = new CountUpDown(85, 100, 1/Math.PI/11);      // cloud changes white and grey a bit
let tuxCloudTwoUpDow        = new CountUpDown(85, 100, 1/Math.PI/12);      // cloud changes white and grey a bit
let tuxCloudThreeUpDow      = new CountUpDown(75, 95, 1/Math.PI/13);       // cloud changes white and grey a bit
let tuxCloudFourUpDow       = new CountUpDown(80, 98, 1/Math.PI/10);       // cloud changes white and grey a bit
let tuxEllipseColorUpDown   = new CountUpDown(70, 100, 1/Math.PI);         // Tux ellipse blue 240 to white , here lightness values, surface of Floe
let tuxIceBerg_1_LayerUpDown= new CountUpDown(85, 100, 1/Math.PI/10);      // blue 240 to white , here lightness values
let tuxIceBerg_2_LayerUpDown= new CountUpDown(60, 80, 1/Math.PI/10);       // hsl 180,50%,60-80% hue sat light
let tuxIceBerg_3_LayerUpDown= new CountUpDown(45, 65, 1/Math.PI/10);       // 190,35%,45-65%
let tuxIceBerg_4_LayerUpDown= new CountUpDown(40, 60, 1/Math.PI/10);       // 200,35%,40-60%
