// svg-cloudsIce.js
"use strict";

function canvasCloudsIceHorizontal(opt) {
  /*
  */
  let size = opt.imgScaleX;
  let x = opt.canX;
  let y = opt.canY;
  let buffer = 0;  // px to hide from window

  if (opt.direction && x <= (opt.canvasDim["width"] + buffer)) {  // canvas width defined in class SvgToCanvas
    opt.update();
    svgTC.svgToCanvas( {dict: opt } );  // write
    opt.direction = true;

  } else {

    if(Object.is(svgTC.imgDict["iceBerg"], opt)) {
      svgTC.imgDict["iceBerg"].canX = 0;
    } else {
     updateClouds( opt ) // random again, except iceBerg
    }
  }
}
;
function initClouds() {
  // init background, called on window load
  let lst = ["fluffyOne", "fluffyTwo", "fluffyThree", "fluffyFour", "fluffyFive"]
  for(let i = 0; i <= lst.length - 1; i++) {
    updateClouds( svgTC.imgDict[ lst[i] ] );
  }
   svgTC.imgDict["iceBerg"].canX = 50;  // need constant y, not init with clouds
   svgTC.imgDict["iceBerg"].canY = 180;
   svgTC.imgDict["iceBerg"].imgScaleX = svgTC.imgDict["iceBerg"].imgScaleY = 1.4;
   svgTC.imgDict["iceBerg"].speedX = 0.02;
}
;
function updateClouds( instance ) {
  let speedMod = 0.05;
  let cloudXMin = -50;
  let cloudXMax = 200;
  let cloudTopMin = 0;
  let cloudTopMax = 85;
  let cloudSpeedMin = 10;
  let cloudSpeedMax = 15;

  let cloudSizedMin = 6;
  let cloudSizedMax = 9;

  instance.canX  = getRandomIntInclusive(cloudXMin, cloudXMax);
  instance.canY = getRandomIntInclusive(cloudTopMin, cloudTopMax);
  instance.speedX = getRandomIntInclusive(cloudSpeedMin, cloudSpeedMax) / 100;
  instance.imgScaleX = instance.imgScaleY = getRandomIntInclusive(cloudSizedMin, cloudSizedMax) / 10 ;
}
;
function switchModeCloudsIce() {
  let darkBody = getBodyColor();
  let cloudList = [
    svgTC.imgDict["fluffyOne"],
    svgTC.imgDict["fluffyTwo"],
    svgTC.imgDict["fluffyThree"],
    svgTC.imgDict["fluffyFour"],
    svgTC.imgDict["fluffyFive"]
  ];
  let iceIList = [ svgTC.imgDict["iceBerg"]   ];

  if (darkBody) {
    nightModeCloudsIce({ cloudList: cloudList, iceIList: iceIList });
  } else {
    dayModeCloudsIce({ cloudList: cloudList, iceIList: iceIList });
  }
}
;
function nightModeCloudsIce(opt) {
  let bodyStyle = window.getComputedStyle(document.body, null);
     // paint - regex strings
  for (let idx = 0; idx <= opt.cloudList.length - 1; idx++) {
    svgTC.svgEditPath({
      "cloudOne": { "fill": bodyStyle.backgroundColor },
      "cloudTwo": { "fill": bodyStyle.backgroundColor },
      "cloudThree": { "fill": bodyStyle.backgroundColor },
      "cloudFour": { "fill": bodyStyle.backgroundColor },
      "cloudFive": { "fill": bodyStyle.backgroundColor },
    }, opt.cloudList[idx]);
    svgTC.svgToCanvas( { dict: opt.cloudList[idx] } );
  }

  for (let idx = 0; idx <= opt.iceIList.length - 1; idx++) {
    svgTC.svgEditPath({
      "IceBerg_1_Layer": { "fill": "hsl(240, 25%," + 80 + "%)" },
      "IceBerg_2_Layer": { "fill": "hsl(180, 25%," + 80 + "%)" },
      "IceBerg_3_Layer": { "fill": "hsl(190, 25%," + 80 + "%)" },
      "IceBerg_4_Layer": { "fill": "hsl(200, 25%," + 80 + "%)" },
    }, opt.iceIList[idx]);
    svgTC.svgToCanvas( { dict: opt.iceIList[idx] } );
  }
}
;
function dayModeCloudsIce(opt) {
  let bodyStyle = window.getComputedStyle(document.body, null);
   // paint - regex strings
  for (let idx = 0; idx <= opt.cloudList.length - 1; idx++) {
    svgTC.svgEditPath({
      "CloudOne":   { "fill": "hsl(200,80%," + 86 + "%)" },
      "CloudTwo":   { "fill": "hsl(200,80%," + 86 + "%)" },
      "CloudThree": { "fill": "hsl(200,80%," + 86 + "%)" },
      "CloudFour":  { "fill": "hsl(200,80%," + 86 + "%)" },
      "CloudFive":  { "fill": "hsl(200,80%," + 86 + "%)" },
      "BigWhite":   { "fill": "hsl(203,67%," + 93 + "%)" },
    }, opt.cloudList[idx]);

    svgTC.svgToCanvas( { dict: opt.cloudList[idx] } );
  }

  for (let idx = 0; idx <= opt.iceIList.length - 1; idx++) {
    svgTC.svgEditPath({
      "IceBerg_1_Layer": { "fill": "hsl(240,50%," + 86 + "%)" },
      "IceBerg_2_Layer": { "fill": "hsl(180,50%," + 82 + "%)" },
      "IceBerg_3_Layer": { "fill": "hsl(190,35%," + 76 + "%)" },
      "IceBerg_4_Layer": { "fill": "hsl(200,35%," + 72 + "%)" },
    }, opt.iceIList[idx]);
    svgTC.svgToCanvas( { dict: opt.iceIList[idx] } );
  }
}
;


