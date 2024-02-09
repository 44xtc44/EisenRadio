// svg-speaker.js
 "use strict";

function dataDictsSpeaker(smoothVolume) {
  /* (a) calc color and visibility of DOM element and (b) switch DOM element.
    (b) is obsolete, we use canvas and edit SVG path tags.
  */
  powerLevelAnimation({
    smoothVolume: smoothVolume,
    animatedInstance: infSpeaker
  });
}
;
function animateSpeaker(speakerImg) {
  /* Change color and show, hide (power on/off) the fake waves.

     {speakerFlatWavOne: "inline-block", speakerFlatWavThree: "none", speakerFlatWavTwo: "none"}
     {speakerFlatWavOne: 316.6666666666667, speakerFlatWavThree: 350, speakerFlatWavTwo: 333.3333333333333}
     svgEditPath({"pathFoo":{"fill": "#FF0023"}, "pathBar":{"fill": "%232300FF"}, "greyThree":{"fill": "#23aaFF"}})
  */
  let ePwrDct = infSpeaker.ePowerDict;  // infSpeaker instance in "setAudioContextVisual" get SVG paths after loading
  let eColDct = infSpeaker.eFillColorsDict;

  let pwrDct = {};
  let colDct = {};
  let wav1 = "speakerFlatWavOne";
  let wav2 = "speakerFlatWavTwo";
  let wav3 = "speakerFlatWavThree";

  // get visible
  for (let index = 0; index <= Object.keys(ePwrDct).length - 1; index++) {
    let key = Object.keys(ePwrDct)[index];
    let val = ePwrDct[key];

    if (val == "none") {
      pwrDct[key] = 0;  // opacity
    } else {
      pwrDct[key] = 1;
    }
  }

  // get color
  for (let index = 0; index <= Object.keys(eColDct).length - 1; index++) {

    let key = Object.keys(eColDct)[index];
    let val = eColDct[key];
    let col;
    col = Math.floor(val);
    if(!col) col = 16;
    colDct[key] = "hsl(" + col + ",100%,50%)";  // fill col
  }
  // paint
  svgTC.svgEditPath({
    "FlatWavOne": { "fill": colDct[wav1].toString(),   "opacity": pwrDct[wav1].toString() },
    "FlatWavTwo": { "fill": colDct[wav2].toString(),   "opacity": pwrDct[wav2].toString() },
    "FlatWavThree": { "fill": colDct[wav3].toString(), "opacity": pwrDct[wav3].toString() }
  }, speakerImg );  // 2nd argument is sprite dict
  svgTC.svgToCanvas( {dict: speakerImg } );
}
function switchModeSpeaker() {
  let darkBody = getBodyColor();
  if (darkBody) {
    nightModeSpeaker();
  } else {
    dayModeSpeaker()
  }
}
;
function nightModeSpeaker() {
  svgTC.imgDict["speakerOne"].ctx.clearRect(0, 0, svgTC.imgDict["speakerOne"].canvas.width, svgTC.imgDict["speakerOne"].canvas.height);
  // svgTC.svgEditPath({ "erFlatP": { "fill": "#222222" } }, svgTC.imgDict["speakerOne"] );
  svgTC.svgEditPath({ "erFlatP": { "fill": "#222222" } }, svgTC.imgDict["speakerTwo"]);
}
;
function dayModeSpeaker() {
  // svgTC.svgEditPath({ "erFlatP": { "fill": "#0184aa" } }, svgTC.imgDict["speakerOne"]);
  svgTC.svgEditPath({ "erFlatP": { "fill": "#0184aa" } }, svgTC.imgDict["speakerTwo"]);
}
;

