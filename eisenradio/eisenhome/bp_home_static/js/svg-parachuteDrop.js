// svg-parachuteDrop.js

/*  let's make a parachute drop
 * target: animate an unlimited number of divs that belong to one theme create random actions and colors inside the theme;
 * each parachute gets an id for an animated div
 */
"use strict";

class DomAirCraft {
  /* Encapsulate the aircraft animation. Used also to trigger a parachute drop.

    DOM animated, no canvas. Can easily use the whole HTML page.
    existing instances involved
      a1AirCraftAniTimer - rand angle, speed, wait time
      a1AirCraftFlash - flash pattern counter for warning lights
      a1AirCraftMoveSinCos - store and calc y for given x and angle
      a1AirCraftUpDown - over wing rotation effect

    .update() method is the driver
  */
  constructor() {
    // Aircraft
    this.flashBit = 0;  // a1AirCraftFlash.update();  // 0 or 1
    this.flashStatus = 0;  // keep color or show, hidden over the flash mod time, i.e 10 or 20 frames to save CPU
    this.flashTail = "hsl(" + 90 + ", 100%, 100%)";
    this.flashRight = "hsl(" + 360 + ", 100%, 50%)";
    this.flashLeft = "hsl(" + 90 + ", 100%, 50%)";
    this.divAnimate = "divA1AirCraft";  // div with SVG group, we move the div
    this.tailLight = undefined;  // SVG path path reference to put CSS style, no canvas here
    this.rightWingLight = undefined;
    this.leftWingLight = undefined;
    this.animationTimer = a1AirCraftAniTimer;  // init rand angle, speed, appearance
    this.moveSinCosInstance = a1AirCraftMoveSinCos;   // chords to move in a smooth angle
    // Parachutes
    this.paraAnimTimerDict = {};  // angle and time of appearance
    this.paraUpDownDict = {};     // angle for partial horizontal rotation of div
    this.paraMoveSinCosDict = {}; // calc the y for given x and angle (tan)
    this.paraParentDiv = "divDragRopeA1AirCraft";  // query class members divRadioFrontPlate_1 to divRadioFrontPlate_10
    this.paraMemberCount = getRandomIntInclusive(4, 6);
    this.airUnitLogTag = "AirDrop";  // better to imagine the real thing, not the technical side
    // init
    this.initAircraft();
    this.initParas();
  }
  initParas() {
    // initial we had multiple parent divs to feed with dropper divs (hardware store page bolts2mm,bolts4mm, radio1FM)
    for (let index = 1; index <= this.paraMemberCount; index++) {  // global var number
      // put each parachute instance in dict
      this.paraAnimTimerDict[this.airUnitLogTag + index] =
        new AnimationTimer({
          animationWaitTime: 999999, // 999999,   // airplane sets animationWaitTime 0 to trigger action
          scale: 0.8, scaleMax: 1.3, speed: 5, angleDown: false, logName: "parachuteDrop_" + index
        });
    }

    /* paraUpDownDict for partial Z rotation */
    for (let index = 1; index <= this.paraMemberCount; index++) {
      this.paraUpDownDict[this.airUnitLogTag + index] =
        new CountUpDown(-(getRandomIntInclusive(5, 10)), (getRandomIntInclusive(2, 10)), 1 / Math.PI / 10);
    }
    /* paraMoveSinCosDict random direction */
    for (let index = 1; index <= this.paraMemberCount; index++) {
      this.paraMoveSinCosDict[this.airUnitLogTag + index] = new MoveSinCos();
    }

    /* create a div for each parachute, divRadioFrontPlate parent div with position relative attribute to assign absolute for children
     */
    let htmlCollection = document.getElementsByClassName(this.paraParentDiv);  // collection of objects not array, can not work with original
    let paraParentDivIds = [...htmlCollection];                           // clone, all div ids of class collection in an array

    for (let index = 0; index <= paraParentDivIds.length - 1; index++) {       // for every radio (the parent) in the list
      for (let memberNum = 1; memberNum <= this.paraMemberCount; memberNum++) {   // random num of para divs to assign
        let div = document.createElement('div');
        // first part is unique, "_" plus id of parent, see html tag <div id="divA1AirCraft">
        div.id = this.airUnitLogTag + memberNum + "_" + paraParentDivIds[index].id;
        // here the magic is happen, we had multiple parents at first, radio divs, now only one
        paraParentDivIds[index].appendChild(div);

        /* An example how to dynamically assemble an svg with external <use> elements to color a particular <g> group,
         *  divided the svg in <g> groups, each group is a <use> in the new <svg> <use>, <use> ... </svg>
         *      this allows to assign a fill attribute to individual groups (<use>)
         *                      NO HARDCODED FILL IN THE PATH tag OR no color ...
         * paras keep their color and add-on (ribbon, star), also if switching back to a radio, one shot action on startup
         *  can be changed in para function for drop animation frame call
         */
        // refac fun

        // style the child div
        let rndColor = getRandomIntInclusive(0, htmlColNames.length - 1);
        let rndEvtNum = getRandomIntInclusive(1, 5);  // can show some extra animations seldom
        let starDrop = "<use href=#gParaDropStar visibility='collapse'></use>";
        let ribbonDrop = "<use href=#gRibbon visibility='collapse'></use>";
        if (rndEvtNum === 1 || rndEvtNum === 2) ribbonDrop = "<use href=#gParaDropStar visibility='visible'></use>";
        if (rndEvtNum === 3) ribbonDrop = "<use href=#gRibbon visibility='visible'></use>";
        div.innerHTML = "<svg id=" + "svg_" + this.airUnitLogTag + memberNum + "_" + paraParentDivIds[index].id + ">"
          + "<use href=#gParaDropPrimerGroup></use>"
          + "<use href=#gParachuteInnerHelmet></use>"
          + "<use href=#gParachuteHelmet fill=" + htmlColNames[rndColor] + "></use>"
          + "<use href=#gParachuteDots></use>"
          + "<use href=#gParachuteStrings></use>"
          + starDrop
          + ribbonDrop
          + "</svg>"
        div.style.border = "none";//"5px solid red";
        div.style.position = "absolute";
        div.style.zIndex = "3";
        div.style.display = "none";
        div.style.width = "100%";
        div.style.top = "0em";
        div.style.left = "0em";
        div.style.maxWidth = "1em";
        div.style.maxHeight = "1em";
        div.style.transform = "";    // break transform inheritance scale from aircraft
      }
    }
    // console.log("parachute dicts ", paraAnimTimerDict, paraUpDownDict, paraMoveSinCosDict);
    // console.log("parachute html collection ", htmlCollection);
  }
  animateParachuteDrop() {
    /* PARACHUTE DROP
    * animate a number of svg as air drop from elsewhere, aircraft triggers activation
    */
    // each parachute child div calls moveRandomAngle() to get moved around
    for (let index = 0; index <= this.paraMemberCount - 1; index++) {
      let timerKey = Object.keys(this.paraAnimTimerDict)[index];
      this.paraAnimTimerDict[timerKey].update();  // one instance of the parachutes in the dict

      let divAnimate = this.airUnitLogTag + (index + 1) + "_" + this.paraParentDiv;  // AirDrop2_divDragRopeA1AirCraft
      let moveKey = Object.keys(this.paraMoveSinCosDict)[index];
      let rotateKey = Object.keys(this.paraUpDownDict)[index];

      let extraTransform = "rotateZ(" + this.paraUpDownDict[rotateKey].update() + "deg)";
      moveRandomAngle(
        this.paraAnimTimerDict[timerKey],
        this.paraMoveSinCosDict[moveKey],
        divAnimate,
        extraTransform);
    }
  }
  initAircraft() {
    // pull references only once
    this.tailLight = document.getElementById("a1AirCraftTailLightWhite");
    this.rightWingLight = document.getElementById("a1AirCraftRightWingLightRed");
    this.leftWingLight = document.getElementById("a1AirCraftLeftSideWingLightGreen");
  }
  update() {
    // CALLED per frame
    this.animationTimer.update();
    this.flashBit = a1AirCraftFlash.update();
    this.animateParachuteDrop();  // must always update x,y if visible and aircraft is away

    if (this.animationTimer.run === true) {
      this.flyBy();
    }
  }
  flyBy() {
    this.flashPattern();

    let extraTransform = "rotateZ(" + a1AirCraftUpDown.update() + "deg)";
    let dropZone = moveRandomAngle(  // aircraft div left the window
      this.animationTimer,
      this.moveSinCosInstance,
      this.divAnimate,
      extraTransform
    );
    if (dropZone) {
      // Trigger paras; AnimationTimer forced run
      for (let index = 0; index <= this.paraMemberCount - 1; index++) {
        let timerKey = Object.keys(this.paraAnimTimerDict)[index];
        this.paraAnimTimerDict[timerKey].animationWaitTime = 0;
      }
    }
  }
  flashPattern() {
    let isOn = "none";
    if (!(this.flashStatus === this.flashBit)) {  // save CPU, edit only on change
      this.flashStatus = this.flashBit;
      // color
      this.tailLight.style.fill = this.flashTail;  // SVG has fill, not color
      this.rightWingLight.style.fill = this.flashRight;
      this.leftWingLight.style.fill = this.flashLeft;
      if (this.flashBit) {
        isOn = "block";
      } else {
        isOn = "none";
      }
      // display
      this.tailLight.style.display = isOn;
      this.rightWingLight.style.display = isOn;
      this.leftWingLight.style.display = isOn;
    }
  }
}

window.a1AirCraftAniTimer = new AnimationTimer({
  overrideDefault: true,  // not use all reset options to keep settings
  angle: getRandomIntInclusive(240, 360),
  angleUp: true,
  angleMod: 0.05,         // 0.01 default
  scale: 0.51,            // min val of constructor
  scaleMod: 1 / 150,      // inflate the img per cycle and change direction if get too small
  scaleMax: 5,            // Must reach scaleMax or hit boundaries of moveRandomAngle() to trigger parachute drop
  animationWaitTime: 4000, // 3min  10800
  logName: "a1AirCraftParaChuteDropper",
  speed: 15,
  externalFunction: function () {
    let rnd = getRandomIntInclusive(240, 360);
    //console.log("a1AirCraft, update approach direction ",a1AirCraftAniTimer.lastAngle);
    a1AirCraftAniTimer.lastAngle = rnd;
  },
});

window.a1AirCraftFlash = new Flash({
  flashDayColor: "hsl(200, 100%, 50%)",    // required
  flashNightColor: "hsl(100, 100%, 50%)",  // required
  flashFrames: 10,
  flashList: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
});

window.a1AirCraftMoveSinCos = new MoveSinCos();  // calc y for given x and angle
window.a1AirCraftUpDown = new CountUpDown(-30, 0, 1 / Math.PI / 5);  // over wing rotation
