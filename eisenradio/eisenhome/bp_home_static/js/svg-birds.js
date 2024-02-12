// svg-birds.js
"use strict";

/*
* Simulate movement of flying animals.
* PNG uses sprites, we use SVG stacked paths and change opacity bit here.
* Constraint is the need of one canvas for each instance. Instance name and canvas id in constants.js.
*/

/**
* Move x axis.
* Most methods stolen from Ufo plus integration of the animation fun.
* Class is dependent on other class instances like CountUpDown and SvgToCanvas.
* This should be the class where we can easily create multiple instances for a swarm.
* We need the SVG img instance name and the group name.
* SVG img instance dict stores x, y, scale. Group name reveals path names for the "flap" list.
  window.blackBird = new BirdSideView({
    start: 100, end: 700,
    waitTime: getRandomIntInclusive(150, 400),
    speed: 10,
    itemVisible: true,  // clearRect() canvas
    sizer: [0.0, 1, 0.001],
    updownY: [-30, 30, 0.1],
    svgInstanceDict: svgTC.imgDict["Tweety"],  // which canvas num to use
    svgGroup: "gBlackBird",  // SVG group to show paths
    skipFlapFrames: 6,
  });
*/
class BirdSideView {
  constructor(options) {
    if (options === undefined) options = {};
    if (options.y === undefined) options.y = getRandomIntInclusive(200, 175);
    if (options.waitTime === undefined) options.waitTime = 0;
    if (options.direction === undefined) options.direction = true;
    if (options.itemVisible === undefined) options.itemVisible = false;

    this.start = options.start;
    this.origin = this.start;
    this.end = options.end;
    this.x = this.start;
    this.y = options.y;
    this.speedX = .4;
    this.speedY = 0;
    this.waitTime = options.waitTime;
    this.waitCount = 0;
    this.direction = options.direction;  // true is 1, points right
    this.itemVisible = options.itemVisible;
    this.itemSize = 0.1 * getRandomIntInclusive(4, 10);  // 0.5 - 1
    this.enableUpdown = getRandomIntInclusive(0, 1);  // item changes direction only sometimes
    // SVG img instance dict and group of paths
    this.svgIDct = options.svgInstanceDict;  // svgTC.imgDict["Tweety"]
    this.svgGrp = options.svgGroup;  // "gBlackBird" got path_01_, path_02_, ...
    // external instances
      // CountUpDown class, new CountUpDown(0.0, 1, 0.001); min, max, step
    this.sizer = new CountUpDown(
      options.sizer[0], options.sizer[1], options.sizer[2]
    );  // scale the img during flight to create illusion of near or far away from us
    this.updownY = new CountUpDown(
      options.updownY[0], options.updownY[1], options.updownY[2]
    );  // small correction during flight for imperfection
    // flapping
    this.flapIdx = 0;
    this.flapList = [];
    this.skipFrames = options.skipFlapFrames;  // set 6 to skip 6 frames
    this.skipped = 0;  // counter to reset on this.skipFrames
    this.equipFlapList();
  }
  reset() {

    this.enableUpdown = getRandomIntInclusive(0, 1);
    this.itemSize = 0.1 * getRandomIntInclusive(5, 7);
    this.y = getRandomIntInclusive(75, 150);
    let distance = this.end - this.start;
    if (this.direction) {
      this.start = this.end;
      this.end = this.origin;
      this.direction = false;
    } else {
      this.start = this.origin;
      this.end = this.origin + distance;
      this.direction = true;
    }

    this.waitCount = 0;
    this.waitTime = getRandomIntInclusive(35, 50);
    let speedMod = 0.1;
    this.speed = speedMod * getRandomIntInclusive(15, 25);
    this.itemVisible = false;
  }
  move() {
    if (this.direction) {
      this.x += this.speedX;
      if (this.x >= this.end) {
        this.reset();
      }
    } else {
      this.x -= this.speedX;  // reverse the direction, need only to scale(-1.2, 1.2) in fun not minus translateX
      if (this.x <= this.end) {
        this.reset();
      }
    }
    this.y += this.speedY;
  }
  update() {
    if (this.waitCount <= this.waitTime) {
      this.waitCount += 1;
      this.itemVisible = false;
      return;
    } else {
      this.itemVisible = true;
      this.move();
    }
  }
  /**
  * birdSideView.animate()
  */
  animate() {
    let x;
    let y;
    let goLeft = this.direction;
    this.update();
    this.svgIDct.rotate = 1;  // imperfection

    if (!this.itemVisible) {
      // clear item canvas to hide it
      this.svgIDct.ctx.clearRect(0, 0, this.svgIDct.canvasDim["width"], this.svgIDct.canvasDim["height"]);
      return;
    }

    if(this.enableUpdown === 1) {
      this.svgIDct.imgScaleY = this.sizer.update();  // come and go away illusion
      this.svgIDct.imgScaleX = goLeft ? this.svgIDct.imgScaleY : -this.svgIDct.imgScaleY
      x = this.svgIDct.canX = this.x;
      y = this.svgIDct.canY = this.y + this.updownY.update();
    } else {
      this.svgIDct.imgScaleY = this.itemSize;
      this.svgIDct.imgScaleX = goLeft ? this.svgIDct.imgScaleY : -this.svgIDct.imgScaleY
      x = this.svgIDct.canX = this.x;
      y = this.svgIDct.canY = this.y;
    }

    svgTC.svgToCanvas( {dict: this.svgIDct } ); // after check visible or not, else clear rect.

    if (this.start && x <= this.end) {
      this.svgIDct.direction = this.direction;
    }
    if (this.end && x >= this.origin) {  // origin has init start value
      this.svgIDct.direction = this.direction;
    }
    // flap cycle
    this.skipped += 1;
    if(this.skipped >= this.skipFrames) {
      this.skipped = 0;
      this.flapWings();
    }
  }
  /**
  * Show/hide stacked paths to simulate flapping.
  * Stolen from doppelDecker "scarf" and integrated as method.
  */
  flapWings() {
    /* List of paths red from the SVG group and sort ascending into the list.
    * Option? (A) timeout can be set for a custom path to simulate gliding or headwind.
    */
    this.flapIdx += 1;
    if (this.flapIdx > this.flapList.length - 1) { this.flapIdx = 0; }
    let dct = {}
    // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
    for(let i = 0; i <= this.flapList.length - 1; i++) {
      dct[[this.flapList[i]]] = {"fill-opacity": "0", "fill": "#000000"};   // "#CC1100"
    }
    // overwrite current idx key to enable opacity for one in the list
    dct[[this.flapList[this.flapIdx]]] = {"fill-opacity": "1", "fill": "#000000"};  // "#FF0000"
    svgTC.svgEditPath( dct, this.svgIDct );  // second arg ultraImg "SvgToCanvas" image dict
    svgTC.svgToCanvas( { dict: this.svgIDct } );
  }
  equipFlapList() {
    let lst = document.querySelectorAll("#" +  this.svgGrp + " path");
    let idLst = [];
    for(let i = 0; i <= lst.length - 1; i++) {
      idLst.push(lst[i].id);
    }
    this.flapList = idLst.sort();  // ascending
  }
}
