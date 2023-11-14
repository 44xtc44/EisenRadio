// svg-animation-main.js

function svgAnimationMain(){
  /* browser frame based, fun calls itself, requestAnimationFrame
    'inflateAnim' is the Oracle (JS) black box var to count frames already shown and kill our fun if needed
     see in action

   target: powerLevelDict gets name of the coloring method of PowerSwitch class and a multiplier for the animation level
     to artificial raise smoothVolume for low animation levels; is not implemented yet, only no power strikes
     to lever scaling of the animals at very low frequency/amplitude to see a movement, {"lowPower":1}
     leads to the fact, that at no data input the animal is glued max size to the screen, {"noPower":3}
     powerLevelAnimation({smoothVolume: smoothVolume, animatedInstance: animatedInstance})
  */
  let smoothVolume = smoothOutVolume(128, 0.04);  // smoothOutVolume() + getAverageVolume() = audio engine

  let powerLevelDict = powerLevelAnimation({smoothVolume: smoothVolume}); // can also send instance as option
  let darkBody = getBodyColor();

  inflateAnim = window.requestAnimationFrame(svgAnimationMain);  // inflateAnim was used for the first anim, now it runs the show

  defaultStageHtmlElementsShow();  // hasStageItemsListenId must match activeListenId, later todo: better have one frame for all radios and put base svg in folder not html so can better change the whole stage
  colorizeDefaultSvgStageElements(darkBody);  // like defaultStageHtmlElementsShow(), we should load only once on start up!
  animateFrontPigs(darkBody, smoothVolume, powerLevelDict); // powerLevelDict
  animateSpeaker(smoothVolume);
  animateA1AirCraft();

  if(inflateAnim % 2 === 0) {  // save cpu for the important animations
    animateCheckeredBalloon(smoothVolume);
    animateZeppelin(darkBody, smoothVolume);
    animateBuoy(darkBody);  // edit button
    animateParachuteDrop();
  }
  if(inflateAnim % 10 === 0) {  // save cpu
    animateCloudsAndIce(darkBody);
    animateGpsSat(darkBody);
    animateStars(darkBody);
    animateGenreClickTeaser();
  }
}
;