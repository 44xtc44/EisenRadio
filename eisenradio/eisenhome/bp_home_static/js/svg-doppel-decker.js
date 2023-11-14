// svg-doppel-decker.js

class FourShadesSVG {
  /* Our desired SVG is constructed with four greyscale colored paths (names).
    It is the name that counts here.
    We use one nice base color and shade the grey colors in four steps.
    <path id="airOne_greyTwo_wing_tail"  , search "greyTwo"
    console.log(document.querySelectorAll("#gSvgSpeakerFlatWaves path")[0].id);

    propReflect = new FourShadesSVG( {svgGroup:"#gPropReflect"} ); //
    propReflect.pathListsGet();
   */
  constructor(options){
    this.forbiddenColors = this.numberRange(215, 275);  // bad shadows
    this.pathsListArray = document.querySelectorAll(options.svgGroup + " path");  // options done "#gAirOne path"
    this.pathList = [];
    this.greyOnePathList = [];
    this.greyTwoPathList = [];
    this.greyThreePathList = [];
    this.greyFourPathList = [];
    this.greyLists = [this.greyOnePathList, this.greyTwoPathList, this.greyThreePathList, this.greyFourPathList];
    this.hslOne = null;
    this.hslTwo = null;
    this.hslThree = null;
    this.hslFour = null;
    this.hslInterpolationList = [];
  }

  numberRange(start, end) {
    // simulate range() of Python
    return new Array(end - start).fill().map((d, i) => i + start);
  }

  pathListsGet() {
    /* SVG path names must match the grey keyword.
       I used to colorize the original image in grey colors.
       Gentler for the eyes in the long run. */
    for(let index = 0; index <= this.pathsListArray.length -1; index++){
      let pID = this.pathsListArray[index].id;
     this.pathList.push(pID);

     if (pID.includes("greyOne")) this.greyOnePathList.push(pID)
     if (pID.includes("greyTwo")) this.greyTwoPathList.push(pID)
     if (pID.includes("greyThree")) this.greyThreePathList.push(pID)
     if (pID.includes("greyFour")) this.greyFourPathList.push(pID)
    }
  }

  colorPaletteGet(force_hueNum) {
    /* Create random color. Work only with light part of hsl, like a photograph.
       Assign start and end for interpolation of four color shades.
       https://hypejunction.github.io/color-wizard/ to get an impression what is running here.
     */
     let hueNum = force_hueNum;
     if(!force_hueNum) {
       hueNum = getRandomIntInclusive(0,360);
       while (true) {
         if(this.forbiddenColors.includes(hueNum)) {
           hueNum = getRandomIntInclusive(0,360);
         } else {
            break;
          }
       }
     }
     let col = hueNum;
     let sat = 80;
     let light = 35;
     let step = 4;

     this.hslOne = "hsl(" + hueNum + "," + sat + "%," + light + "%)";  // hsl(339, 80%, 94%)
     this.hslTwo = "hsl(" + hueNum + "," + sat + "%," + (light += step * 1) + "%)";
     this.hslThree = "hsl(" + hueNum + "," + sat + "%," + (light += step * 2) + "%)";
     this.hslFour = "hsl(" + hueNum + "," + sat + "%," + (light += step * 3) + "%)";
     this.hslInterpolationList = [this.hslOne, this.hslTwo, this.hslThree, this.hslFour];
  }

  colorPalettePush() {
    /* Assign the color to the list of paths.
     */
    for(let index = 0; index <= this.greyLists.length -1; index++){
      let greyShad = this.greyLists[index];

      for(let kIndex = 0; kIndex <= greyShad.length -1; kIndex++) {
        let svgPathElem = document.getElementById(greyShad[kIndex]);
        svgPathElem.style.fill = this.hslInterpolationList[index];
      }
    }
  }
}
;
class ShowHideElemGroups {
  /* Enable to show, hide multiple DOM element groups at once.

   Store current index of element in path list switched.
   myGroup = new ShowHideElemGroups( {pathList: "#gScarfGroup"}) ; path string is attached in constructor
   */
   constructor(opt) {
     this.pathsListArray = document.querySelectorAll(opt.pathList + " path");  // a collection object
     this.pathIndex = 0;
     this.pathList = [];  // clean list
     this.pathListGet();
   }
  pathListGet() {
    for(let index = 0; index <= this.pathsListArray.length -1; index++){  // pathsListArray (s) class FourShadesSVG
      let pID = this.pathsListArray[index].id;  // collection .id
     this.pathList.push(pID);
    }
  }
  update() {
    for(let index = 0; index <= this.pathList.length - 1; index++) {
      let svgPath = document.getElementById(this.pathList[index]);

      if (index == this.pathIndex || (index - 1 < this.pathIndex && index > this.pathIndex + 1)) {
        svgPath.style.visibility = "hidden";
      } else {
        svgPath.style.visibility = "visible";
      }
    }

    this.pathIndex += 1;
    if(this.pathIndex > this.pathList.length -1) {
      this.pathIndex = 0
    }
    // cl(opt.index)
  }
}
function enableAirplane() {
  /* stolen from latest GhettoRecorder :) */
    // colorize plane
    doubleDecker = new FourShadesSVG( {svgGroup:"#gAirOne"} );
    doubleDecker.pathListsGet();
    doubleDecker.colorPaletteGet();
    doubleDecker.colorPalettePush();
    // colorize pilot just for fun, red baron?
    document.getElementById("airOne_pilotTwo_neck").style.fill = "#CC1100";
    document.getElementById("airOne_pilotTwo_scarfOne").style.fill = "#CC1100";
    document.getElementById("airOne_pilotTwo_scarfTwo").style.fill = "#CC1100";
    document.getElementById("airOne_pilotTwo_scarfThree").style.fill = "#CC1100";
    document.getElementById("airOne_pilotTwo_scarfFour").style.fill = "red";
    // show hide elements
    gPropNose = new ShowHideElemGroups({pathList: "#gPropNose"});
    gPropAxis = new ShowHideElemGroups({pathList: "#gPropAxis"});
    gScarfGroup = new ShowHideElemGroups({pathList: "#gScarfGroup"});
    gPropReflect = new ShowHideElemGroups({pathList: "#gPropReflect"});
}
;
enableAirplane();

function colorizeAirplane() {
    this.doubleDecker = new FourShadesSVG( {svgGroup:"#gAirOne"} );
    this.doubleDecker.pathListsGet();
    this.doubleDecker.colorPaletteGet();
    this.doubleDecker.colorPalettePush();
}
;

/* JavaScript deg
       |90
 180   |     0
 --------------
       |    360
   270 |
*/

class DoppelDeckerMove {
  constructor(options) {
    if(options === undefined) options = {};
    if(options.y === undefined) options.y = getRandomIntInclusive(100,175);
    if(options.waitTime === undefined) options.waitTime = 0;
    if(options.direction === undefined) options.direction = true;
    if(options.divIsVisible === undefined) options.divIsVisible = false;
    if(options.duration === undefined) options.duration = 25;
    this.start = options.start;
    this.origin = this.start;
    this.end = options.end;
    this.x = this.start;
    this.y = options.y;
    this.duration = options.duration;
    this.frames = this.duration * 60;
    this.speed = (this.end - this.start)/this.frames;
    this.waitTime = options.waitTime;
    this.waitCount = 0;
    this.direction = options.direction;  // true is 1, points right
    this.divIsVisible = options.divIsVisible;
  }
  reset() {
  // u turn
    let distance = this.end - this.start;
    if(this.direction) {
      this.start = this.end;
      this.end = this.origin;
      this.direction = false;
    } else {
      this.start = this.origin;
      this.end = this.origin + distance;
      this.direction = true;
    }

    this.waitCount = 0;
    this.waitTime = getRandomIntInclusive(1500,2500);
    this.duration = getRandomIntInclusive(10,30);
    this.divIsVisible = false;
  }
  move(){
    if(this.direction) {
      this.x += this.speed;
      if(this.x >= this.end) {
        this.reset();
      }
    } else {
      this.x -= this.speed;  // reverse the direction, need only to scale(-1.2, 1.2) in fun not minus translateX
      if(this.x <= this.end) {
        this.reset();
      }
    }
  }
   update(){
    if(this.waitCount <= this.waitTime) {
        this.waitCount += 1;
        this.divIsVisible = false;
        return;
    } else {
        this.divIsVisible = true;
        this.move();
    }
  }
}

let ddMove = new DoppelDeckerMove( {
                                     start:-300,end:500,
                                     waitTime:100,
                                     duration:25,
                                     divIsVisible:false,
                                     } );

function animateDoppelDecker(){
    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
        let divSvgAirOne = document.getElementById("divSvgAirOne_"  + activeListenId);  //"imgOutput_" + activeListenId);
        ddMove.update();

        if(ddMove.divIsVisible) {
          divSvgAirOne.style.display = "inline-block";
        } else {
          divSvgAirOne.style.display = "none";
          return;
        }

        divSvgAirOne.style.transform  = "translateX(" + ddMove.x + "px)";
        if(ddMove.direction) {
          divSvgAirOne.style.transform  += "translateY(" + (- ddMove.y) + "px)";
          divSvgAirOne.style.transform  += "scale(1.2, 1.2)";
        } else {
          let y = -150;
          divSvgAirOne.style.transform  += "translateY(" + y + "px)";
          divSvgAirOne.style.transform  += "scale(-0.7, 0.7)";
        }
    }
}
;
