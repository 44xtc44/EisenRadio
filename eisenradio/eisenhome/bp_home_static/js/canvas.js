// canvas.js
"use strict";

/* Canvas, animation of canvas element itself
 * Functions
 * ---------
 *      dragElement(elem)                  - canvas is mouse draggable
 *      divCanvasCallBackBtnFct(disappear) - canvas fly's back on btn press
 *      divCanMasterWrapShowHiddenBtn()    - show button for canvas fly back
 *      divCanMasterWrapHideHiddenBtn()    - hide ...
 */

var maxAnimationTime = 2000;

function dragElement(elem) {
/* div draggable */
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elem.id)) {
    // can be a touch bar to handle the div, other div id:
    document.getElementById(elem.id).onmousedown = dragMouseDown;
  } else {
    // otherwise move the div from elsewhere on div body
    elem.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // assign new coordinates based on the touch on the viewport .clientX
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position
    elem.style.top = (elem.offsetTop - pos2) + "px";
    elem.style.left = (elem.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
;
function divCanvasCallBackBtnFct(opt) {
/* bring the canvas back (TV style) */
  let canvas = opt.canvas;
  let rect = canvas.getBoundingClientRect();
  let distance = rect.x;              // to zero left
  let vertical = rect.y;              // from top
  let distanceLeft;                   // to left side
  let pace = getRandomIntInclusive(2,5);
  let scaleHeight = 1;
  let scaleWidth = 1;
  let skew = getRandomIntInclusive(1,3);                       // skew \\ or // style
  let skewMod = 0.1;
  let rotate = getRandomIntInclusive(4,8);
  let rotateMod = 1;
  let rotArr = ["X", "Y", "Z"]
  let rotDirect = rotArr[getRandomIntInclusive(0,2)]           // randomize rotation axis
  let animeIdCanvasMaster = null;     // animeFrameCounter killed by disableCanvasMasterAnimation()
  let pageWidth = window.innerWidth;
  let halfPageWidth = pageWidth / 2;
  let direction = 1;                  // right ++
  // get top left distance from middle of canvas if in the middle of the screen / left --
  if (distance <= (halfPageWidth - divCanvasMaster.clientWidth/2)) {direction = 0;}

  var startTime = (new Date()).getTime();
  flyBackHomeCanvas();         // animation call before function, else call again on termination and hangs on fFox
  function flyBackHomeCanvas() {

    var currentTime = (new Date()).getTime();
    if (currentTime - startTime >= maxAnimationTime - 100) {
      disableCanvasMasterAnimation();
      return;
    }
    divCanvasMaster.style.transformOrigin = "initial";
    scaleHeight -= 0.01;
    scaleWidth -= 0.009;

    if (direction == 1) {
      skew += skewMod * 7;
      rotate += rotateMod * 2;
      distance = parseInt(divCanvasMaster.style.left.split("px")[0]);
      divCanvasMaster.style.left = distance + pace + "px";
      divCanvasMaster.style.transform = "scale(" + scaleWidth + ", " + scaleHeight + ")";
      divCanvasMaster.style.transform += "skew(" + skew + "deg, " + skew + "deg)";
      divCanvasMaster.style.transformOrigin = "bottom right";
      divCanvasMaster.style.transform += "rotate" + rotDirect + "(" + rotate + "deg)";
      if (distance >= pageWidth || scaleHeight <= 0) {
        disableCanvasMasterAnimation();
        canvasMasterSetPositionAbsolute();
        return;
      }
    }
    else {
      skew += skewMod * 5;
      rotate += rotateMod;
      distanceLeft = parseInt(divCanvasMaster.style.left.split("px")[0]);
      divCanvasMaster.style.left = distanceLeft - pace + "px";
      divCanvasMaster.style.transform = "scale(" + scaleWidth + ", " + scaleHeight + ")";
      divCanvasMaster.style.transform += "skew(" + skew + "deg, " + skew + "deg)";
      divCanvasMaster.style.transform += "rotate" + rotDirect + "(" + (-rotate) + "deg)";
      }
      // complete behind left border or shrunken
      if (distanceLeft <= -(divCanvasMaster.clientWidth) || scaleHeight <= 0) {
          return;
      }
      animeIdCanvasMaster = window.requestAnimationFrame(flyBackHomeCanvas);
  }

  setTimeout(function () {
    disableCanvasMasterAnimation();
    canvasMasterSetPositionAbsolute();
    divCanMasterWrapHideHiddenBtn();
  }, maxAnimationTime+500);   // wait animation end, now have time
}
;

function canvasMasterSetPositionAbsolute() {
  divCanvasMaster.style.top = "-14em";
  divCanvasMaster.style.left = "0em";
  divCanvasMaster.style.transform = "scale(1,1)";
}
;

function disableCanvasMasterAnimation (e) {
  window.cancelAnimationFrame(animeIdCanvasMaster);
}

function divCanMasterWrapShowHiddenBtn() {
/* SHOW the button div to call canvas back */
  let divHiddenButtons = document.getElementById("divHiddenButtons");
  divHiddenButtons.style.display = "block";
}
;

function divCanMasterWrapHideHiddenBtn() {
/* HIDE the button div to call canvas back */
  let divHiddenButtons = document.getElementById("divHiddenButtons");
  divHiddenButtons.style.display = "none";
}
;

function stageAnalyzerShow() {
  /* Draw the TV frame to show different analyzer
    and some educational broadcast.
  */
  let canvas = document.getElementById("cTV");
  let ctx = canvas.getContext('2d');
  canvas.style.display = "inline-block";

  let w = canvas.width;
  let h = canvas.height;
  ctx.fillStyle = 'rgba(0,135,200,0.0)';  // test color, push alpha up
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.style.left = "360px";
  canvas.style.top = "200px";

  canvas.style.border = '10px solid';
  canvas.style.borderColor = 'rgb(175, 238, 238)'
  canvas.style.borderRadius = '1em';

  canvas.style.transform = "scale(0.8, 0.8)";
  canvas.style.transform += "skew(0deg, 10deg)";
  canvas.style.transform += "rotateX(0deg)";
}
;

function stageAnalyzerHide() {
  let canvas = document.getElementById("cTV");
  let ctx = canvas.getContext('2d');
  canvas.style.display = "none";
}
;