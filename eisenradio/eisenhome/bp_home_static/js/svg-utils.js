// svg-utils.js
 "use strict";

class Flash {
/* Return current flash pattern, 0 or 1, on/off.
   Modifier is how many frames to show one flashList index value,
   if update() is called every frame.

   window.buoyEditFlash = new Flash({
     flashDayColor: "hsl(300, 100%, 50%)",
     flashNightColor: "hsl(10, 100%, 50%)",
     flashFrames: 20,
     flashList: [0,0,0,1,1,1,0,0,0,1,0,1,0,1],

     Try to write only once to begin and end of a cycle. Else CPU gets mad, writes 20 times red.
   });
 */
  constructor(opt) {
   this.flashDayColor = opt.flashDayColor;
   this.flashNightColor = opt.flashNightColor;
   this.flashColor;
   this.flashIdx = 0;
   this.frameCount = 0;
   this.frames = opt.flashFrames;
   this.flashList = opt.flashList;
   this.flashStatus = 0;
  }
  update() {
    this.flashStatus = this.flashList[this.flashIdx];
    this.frameCount++;
    if (this.flashIdx > this.flashList.length - 1) { this.flashIdx = 0; }
    if (this.frameCount > this.frames) {
      this.frameCount = 0;
      this.flashIdx++;
    }
    return this.flashStatus;
  }
}

/* assign event listener for touch and move to the children of the class */
let touchMoveItemsList = [
  // '.divSvgBuoy',
]
function touchMoveItemsEventListenerSet() {
  /* touch for mobiles, one finger, test to move all stuff around, buoy is working
   * challenge here is that we have also nested container (div)
   * works so far with a single div with position absolute, but not with nested div animalOnIce; divSvgIceTux,divSvgTux
   */

  for (let iNum = 0; iNum <= touchMoveItemsList.length - 1; iNum++) {
    // get the class name
    let divList = document.querySelectorAll(touchMoveItemsList[iNum]);
    for (let index = 0; index <= divList.length - 1; index++) {
      divList[index].addEventListener('touchmove', function (ev) {
        //grab the location of the touch, one finger 0
        let touchLocation = ev.targetTouches[0];
        //assign new coordinates based on the touch
        divList[index].style.left = touchLocation.clientX + 'px';
        divList[index].style.top = touchLocation.clientY + 'px';
      })
    }
  }
}
;
class SceneChange {
  /* Use top canvas. Use the svg-main.js requestAnimationTimer to avoid race conditions between timer. No fun.
    c21 canvas in the moment available. See constants.js and bp_home.index.html.

    Help to fade from scene to scene or dark mode. Several methods to do that.
  */
  constructor(opt) {
    /* Dark mode change fun knows radio id and can get the correct canvas.

       usage: darkChange = new SceneChange( {svgInst:sceneDarkChangeSTC} );

      Need an existing SvgToCanvas instance bound to a canvas;
      window.sceneDarkChangeSTC = new SvgToCanvas( {svg: "portableHole"} );  // overlay_01_
             sceneDarkChangeSTC.canvas = document.getElementById("overlay_01_" + this.radioId);  // dark mode
             sceneDarkChangeSTC.ctx = sceneDarkChangeSTC.canvas.getContext("2d");
    */
    this.bgColor = undefined;  // rgba(0,255,0,1.0)' we manipulate the alpha channel part -1.0 later
    this.opacity = 0;
    this.svgInst = opt.svgInst;  // sceneDarkChangeSTC instance
    this.opacityStep = 0.005;  // turn up/down opacity of image or canvas bg color
    this.alpha = 1;  // rgba calls opacity alpha channel
    this.rWidth = 64;  // rect to write and clear screen
    this.rHeight = 64;
    this.x = this.rWidth;  // store x values dynamically
    this.y = this.rHeight;
    this.opacityDecreaseCount = undefined;
    this.clearRectanglesCount = undefined;
    this.cakePieces = [  // clockwise removal of pieces to free screen
      "partSeven",
      "partSix",
      "partFive",
      "partFour",
      "partThree",
      "partTwo",
      "partOne",
      "partTwelf",
      "partEight",
      "partNine",
      "partTen",
      "partEleven"
    ];
    this.cakePieceIdx = 0;
  }
  cakeSplit() {
    // not executes always
    if (this.cakePieceIdx <= this.cakePieces.length - 1) {

      if (cakeSplitCount % 30 === 0) {
        this.svgInst.ctx.clearRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);
        this.svgInst.svgEditPath({ [this.cakePieces[this.cakePieceIdx]]: { "fill-opacity": "0" } });
        this.svgInst.svgToCanvas();
        this.cakePieceIdx += 1;
        cl(this.cakePieceIdx);
      }
      cakeSplitCount = window.requestAnimationFrame(this.cakeSplit.bind(this));

    } else {
      cl("leave cakeSplit()");
      this.cakePieceIdx = 0;
      this.svgInst.svgToList();
      this.svgInst.ctx.clearRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);
      cancelAnimationFrame(cakeSplitCount);
    }
  }
  createBackground(opt) {
    /* Set background style. Trigger in setColor().
       usage: instance.createBackground( {bgColor:"255,0,255", alpha:1.0 } )
    */
    if (opt === undefined) opt = {};
    if (opt.bgColor === undefined) opt.bgColor = this.bgColor;
    this.bgColor = opt.bgColor;
    if (opt.alpha === undefined) opt.alpha = this.alpha;
    this.alpha = opt.alpha;  // set alpha again if it was modified
    this.svgInst.ctx.fillStyle = "rgba(" + opt.bgColor + "," + opt.alpha + ")";
    this.svgInst.ctx.fillRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);
  }
  opacityDecrease() {
    /* Decrease opacity (alpha channel) with a counter and a timer. Black |--> open curtain.
       Call once. We destroy ourself. We are a method, use bind in constructor.
    */
    this.alpha -= this.opacityStep;
    let fill = "rgba(" + this.bgColor + "," + this.alpha + ")";
    this.svgInst.ctx.fillStyle = fill;
    this.svgInst.ctx.clearRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);
    this.svgInst.ctx.fillRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);

    this.opacityDecreaseCount = window.requestAnimationFrame(this.opacityDecrease.bind(this));
    if (this.alpha <= 0) {
      this.svgInst.ctx.clearRect(0, 0, this.svgInst.canvas.width, this.svgInst.canvas.height);
      stopAnimation(this.opacityDecreaseCount);
      return;
    }
  }
  clearRectangles() {
    /* More robust scene transition, but old fashioned;
       Images need promise to load -> instance method needs properties of image in time.
  
       --> Create/attach/show a video snippet as a good transition.
    */
    let canW = this.svgInst.canvas.width;
    let canH = this.svgInst.canvas.height
    let rW = this.x;  // rectangle
    let rH = this.y;
    let xMod = 24;  // div by 2 smooth
    let yMod = 24;

    if ((canW / 2 - rW / 2) > 0) {

      if (this.clearRectanglesCount % 4 === 0) {
        this.svgInst.ctx.clearRect(canW / 2 - rW / 2, canH / 2 - rH / 2, rW, rH);
        this.x += xMod;
        this.y += yMod;
      }
      this.clearRectanglesCount = requestAnimationFrame(this.clearRectangles.bind(this));

    } else {  // exit
      this.svgInst.ctx.clearRect(0, 0, canW, canH);  // go save
      this.x = this.rWidth;  // restore x value
      this.y = this.rHeight;
      cancelAnimationFrame(this.clearRectanglesCount);  // go save; cancelAnimationFrame is const in index.js
    }
  }
}
;
class Shaker {
  /* target: shake an element, like a vibrating phone
   * could have rotation; only for short time animation, longer leads to brain damage
  */
  constructor() {
    this.shakeStatus = undefined;
    this.counter = 0;
    this.maxCount = 10;
    this.screwWaitCounter = new SimpleCounter();
  }
  shake(elementId, step) {
    let elem = document.getElementById(elementId);
    this.counter += step;
    if (this.counter > this.maxCount) { this.counter = 1 }
    if (this.counter === 1) { elem.style.transform = "translate(1px, 1px)   " }
    if (this.counter === 2) { elem.style.transform = "translate(-1px, -2px) " }
    if (this.counter === 3) { elem.style.transform = "translate(-2px, 0px)  " }
    if (this.counter === 4) { elem.style.transform = "translate(2px, 2px)   " }
    if (this.counter === 5) { elem.style.transform = "translate(1px, -1px)  " }
    if (this.counter === 6) { elem.style.transform = "translate(-1px, 2px)  " }
    if (this.counter === 7) { elem.style.transform = "translate(-2px, 0px)  " }
    if (this.counter === 7) { elem.style.transform = "translate(2px, 0px)   " }
    if (this.counter === 9) { elem.style.transform = "translate(-1px, -1px) " }
    if (this.counter === 10) { elem.style.transform = "translate(0px, 1px)   " }
  }
  animateScrewTeaser() {
    /* Shaker class - Advertising called in svg-main.js
      show I am clickable to switch some items on/off, headline, display badge

      Call fun in radioStyles.js for each radio. Self switch off after action.
    */
    let fps = 60;
    let ringTime = fps * 2;
    let waitTime = fps * 3;
    if (this.screwWaitCounter.count < waitTime + ringTime) {
      this.screwWaitCounter.update(1);

      if (this.screwWaitCounter.count > waitTime) {
        this.shake("divSvgScrewHeadBottomRight_" + activeListenId, 1);
        this.shake("divSvgScrewHeadBottomLeft_" + activeListenId, 1);
        this.shake("divSvgScrewHeadTopLeft_" + activeListenId, 1);
        this.shake("divSvgScrewHeadTopRight_" + activeListenId, 1);
      }
      requestAnimationFrame(this.animateScrewTeaser.bind(this));

    } else {
      this.screwWaitCounter.reset();
    }
  }
}
;
function paintPngTeaserToCanvas() {
  /* Teaser unlock screen.
     Exercise png to canvas, other is svg to canvas as a separate script/module.
     Canvas one can get overlay by canvas two paint effects on one, arrows, blinker ...
  */
  let canvas = document.getElementById('pageCoverTeaser')
  let windowWidth = window.innerWidth;
  let ctx = canvas.getContext("2d");
  // img instance
  let image = new Image(); // Using "optional" size for image; MDN docu
  let rawImg = document.getElementById('teaserImg');
  image.src = rawImg.src;
  drawImageActualSize(); // Draw on image loaded; fun ref to instance method

  function drawImageActualSize() {
    // canvas.width = rawImg.naturalWidth;  // MDN docu
    // canvas.height = rawImg.naturalHeight;
    let margin = 20;
    windowWidth -= margin;
    let ratioWH = rawImg.naturalWidth / rawImg.naturalHeight;
    image.height = windowWidth / ratioWH;
    image.width = windowWidth;
    canvas.height = image.height;
    canvas.width = image.width;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // draw big img, then small img upper left corner
    // ctx.drawImage(image, 0, 0, rawImg.width, rawImg.height);
    // ctx.drawImage(image, 0, 0,image.width,image.height);  // custom
  }
}
;