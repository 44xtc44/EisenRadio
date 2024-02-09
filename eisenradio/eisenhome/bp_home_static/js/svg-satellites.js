// svg-satellites.js
 "use strict";

function animateSat(dark) {
  satelliteOne.update(dark);  // only run at night
  satelliteTwo.update(dark);
  if(!dark) {
    svgTC.imgDict["Sat1"].ctx.clearRect(
    0,
    0,
    svgTC.imgDict["Sat1"].canvas.width,
    svgTC.imgDict["Sat1"].canvas.height);

    svgTC.imgDict["Sat2"].ctx.clearRect(
    0,
    0,
    svgTC.imgDict["Sat2"].canvas.width,
    svgTC.imgDict["Sat2"].canvas.height);
    return;
  }
  svgTC.imgDict["Sat1"].canX = satelliteOne.partList[0].x;  // use chords of ParticleStars instance with one star
  svgTC.imgDict["Sat1"].canY = satelliteOne.partList[0].y;
  svgTC.imgDict["Sat1"].imgScaleX = svgTC.imgDict["Sat1"].imgScaleY = 0.6;
  svgTC.imgDict["Sat2"].canX = satelliteTwo.partList[0].x;
  svgTC.imgDict["Sat2"].canY = satelliteTwo.partList[0].y;
  svgTC.imgDict["Sat2"].imgScaleX = svgTC.imgDict["Sat2"].imgScaleY = 0.4;
  svgTC.svgToCanvas( { dict: svgTC.imgDict["Sat1"] } );
  svgTC.svgToCanvas( { dict: svgTC.imgDict["Sat2"] } );
}
;