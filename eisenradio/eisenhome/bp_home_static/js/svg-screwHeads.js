// svg-screwHeads.js
 "use strict";

function switchModeScrewHeads() {
/**/
  let darkBody = getBodyColor();
  if (darkBody) {
    document.getElementById("screwHeadPhillipsGround").style.fill = "#C0C0C0";
    document.getElementById("screwHeadPhillipsInnerSlit").style.fill = "#808080";
    document.getElementById("screwHeadPhillipsInnerSlitOutlineOne").style.fill = "#a9a9a9";
    document.getElementById("screwHeadPhillipsInnerSlitOutlineTwo").style.fill = "#808080";
  } else {
    document.getElementById("screwHeadPhillipsGround").style.fill = "#FFF600";
    document.getElementById("screwHeadPhillipsInnerSlit").style.fill = "#05507b";
    document.getElementById("screwHeadPhillipsInnerSlitOutlineOne").style.fill = "#0887ae";
    document.getElementById("screwHeadPhillipsInnerSlitOutlineTwo").style.fill = "#005270";
  }
}
;