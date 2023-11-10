// svg-last-loaded-aniFrame.js

function svgAnimationMain(){
    /* renamed MAIN for svg/html animation
     * function is browser frame based, calls itself, requestAnimationFrame at bottom
     * target: call all animations that have a run status, function decides itself
     * smoothVolume is used as scale multiplier for animations of animals and color differences for speakers
     * AnimationTimer class has run attribute, true if an animation may run;
     * AnimationTimer instance can call functions after reset() to change color, direction ...
     */
    let smoothVolume = smoothOutVolume(128, 0.04);

    /* target: powerLevelDict gets name of the coloring method of PowerSwitch class and a multiplier for the animation level
     *  to artificial raise smoothVolume for low animation levels; is not implemented yet, only no power strikes
     *  to lever scaling of the animals at very low frequency/amplitude to see a movement, {"lowPower":1}
     *  leads to the fact, that at no data input the animal is glued max size to the screen, {"noPower":3}
     * powerLevelAnimation({smoothVolume: smoothVolume, animatedInstance: animatedInstance})
     */
    let powerLevelDict = powerLevelAnimation({smoothVolume: smoothVolume}); // can also send instance as option
    let darkBody = getBodyColor();

    defaultStageHtmlElementsShow();  // hasStageItemsListenId must match activeListenId, later
    colorizeDefaultSvgStageElements(darkBody);  // dito, load only once!

    animateBuoy(darkBody);  // edit button
    animateFrontPigs(darkBody, smoothVolume, powerLevelDict); // powerLevelDict
    animateSpeaker(smoothVolume);
    animateZeppelin(darkBody, smoothVolume);
    animateCheckeredBalloon(smoothVolume);
    animateParachuteDrop();
    animateA1AirCraft();
    animateClouds(darkBody);
    animateGpsSat(darkBody);
    animateStars(darkBody);
    animateGenreClickTeaser();

    inflateAnim = window.requestAnimationFrame(svgAnimationMain);
}
;