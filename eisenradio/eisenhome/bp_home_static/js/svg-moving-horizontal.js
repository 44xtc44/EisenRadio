// svg-moving-horizontal.js

class MoveX {
/* target: move an element with fireFox jitter correction in x direction by using js (smil svg animation jitters in FireFox <animate>)
 * description:
 *  fFox fix, move x jitter correction with minimal z rotation depends on speed, else rotation is visible
 *  rotation must be up down over time to hide it, use CountUpDown class instance, MUST test values in ff
 * usage:
 *  let tuxIceBergMoveX = new MoveX({
                                    element:"tuxStageIceBerg",
                                    start:0,end:1000,duration:3600,
                                    rotation:0.02,moveBack:false
                                    })
 * tuxIceBergMoveX.update();

 * update:
 * functionality ok, but now we see no jitter in FireFox using js; if we disable z rotation on pure x axis translation, lol
 *
 * to let the satellite fly around we make a translateY with min, max (can move all y)
 */
  constructor(options){
    if(options === undefined) options={};
    if(options.moveBack === undefined) options.moveBack=false;
    if(options.waitTime === undefined) options.waitTime=false;
    if(options.scale === undefined) options.scale=1;
    if(options.direction === undefined) options.direction=1;   // 1 to right, 0 to the left
    if(options.modY === undefined) options.modY=0;             // y modifier to get a curve if needed, satellites
    this.element = options.element;   // html or svg element id
    this.start = options.start;       // start x
    this.end = options.end;           // end x
    this.duration = options.duration; // time frame in seconds must be converted in browser frames, 60/s
    this.durationMax = 125;
    this.durationMin = 85;
    this.frames = this.duration * 60;
    this.speed = (this.end-this.start)/this.frames;  // speed is negative if move from 20 to -10, (-10)-20=-30
    this.moveBack = options.moveBack; // true or false
    this.rotation = options.rotation; // z rotation deg from -deg to +deg
    this.zUpDown = new CountUpDown(-(this.rotation), (this.rotation), this.speed); // CountUpDown(start,end,step)
    this.currentX = this.start;
    this.maxY = 60; // can go down a bit to vary
    this.minY = 40;
    this.currentY = getRandomIntInclusive(this.minY,this.maxY);
    this.modY = options.modY;
    this.waitTime = options.waitTime;
    this.waitCount = 0;
    this.logName = this.element;
    this.scale = options.scale;
    this.direction = options.direction;
  }
  reset(){
  /* next interval */
    if(this.moveBack === true) {
    // move -x or +x
        if(this.speed >= 0) {
            this.speed = -this.speed;
        } else {
            this.speed = +this.speed;}
    } else {
    // jump to origin
        this.currentX = this.start;
        this.currentY = getRandomIntInclusive(this.minY,this.maxY);  // move element up down a bit
        // this.duration = getRandomIntInclusive(this.durationMin,this.durationMax);
        if(! this.waitTime === false) this.waitCount = 0;
        return;
    }
  }
  move(){
    /*
      Addition of transformations +, else nothing ;)
     */
    this.currentX += this.speed;
    if(this.direction == 1) {
        if(this.currentX >= this.end) this.reset();
    } else {
        if(this.currentX <= this.end) this.reset();
    }

    /* !!! + sign !!! for each successor transform */
    let box = document.getElementById(this.element);
    // box.style.transform = "scale(" + this.scale + "," + this.scale + ")";
    box.style.transform  = "translateX(" + this.currentX + "px)";
    this.currentY += this.modY;
    box.style.transform += "translateY(" + this.currentY + "px)";
    box.style.transform += "rotateZ(" + this.zUpDown + "deg)";
  }
  update(){
    if(this.waitTime === false) {
         this.move();
         return;
    }
    if(this.waitCount <= this.waitTime) {
        this.waitCount += 1;
        return;
    } else {
        this.move();
    }
  }
}

let tuxIceBergMoveX = new MoveX({
                                    element:"tuxStageIceBerg",
                                    start:getRandomIntInclusive(0,100),
                                    end:900,duration:200,
                                    rotation:0.02,moveBack:true,
                                    });

let tuxCloudOneMoveX = new MoveX({
                                  element:"gTuxCloudOne",
                                  start:getRandomIntInclusive(0,100),
                                  end:1000,
                                  duration:getRandomIntInclusive(30,40),
                                  rotation:1,
                                 });
let tuxCloudTwoMoveX = new MoveX({
                                  element:"gTuxCloudTwo",
                                  start:getRandomIntInclusive(0,100),
                                  end:1000,
                                  duration:getRandomIntInclusive(35,45),
                                  rotation:1,
                                 });

let tuxCloudThreeMoveX = new MoveX({
                                  element:"gTuxCloudThree",
                                  start:getRandomIntInclusive(0,100),
                                  end:1000,
                                  duration:getRandomIntInclusive(45,60),
                                  rotation:1,
                                 });
let tuxCloudFourMoveX = new MoveX({
                                  element:"gTuxCloudFour",
                                  start:getRandomIntInclusive(50,200),
                                  end:1000,
                                  duration:getRandomIntInclusive(65,75),
                                  rotation:1,
                                 });
let tuxCloudFiveMoveX = new MoveX({
                                  element:"gTuxCloudFive",
                                  start:getRandomIntInclusive(50,200),
                                  end:1000,
                                  duration:getRandomIntInclusive(65,75),
                                  rotation:1,
                                 });
// let tuxGpsSatMoveX = new MoveX({
//                                   element:"gGpsSat",
//                                   start:500,end:-800,  // start:700,end:-500,
//                                   duration:5,
//                                   rotation:0.02,
//                                   modY:-0.05,  // modY -
//                                   waitTime:0,
//                                   scale:0.3,direction:0,
//                                  });
// let tuxSatelliteMoveX = new MoveX({
//                                   element:"gSatellite",
//                                   start:0,end:500,
//                                   duration:25,
//                                   rotation:0.02,
//                                   modY:+0.1,   // modY +
//                                   waitTime:0,
//                                   scale:0.6,
//                                  });
//
function animateCloudsAndIce(darkBody){
    /* clouds and iceBerg fix for firefox, this is an example to not even think about using smil, svg inbound animation
     * ff is so buggy in relation to animation on canvas html and svg, canvas blur -> crash of ff
     * it is known to them for years, but nobody is interested in, looks like it is a government company
     * <animateTransform attributeName="transform" attributeType="XML" dur="3600s" from="0" repeatCount="indefinite" to="1000" type="translate"/>
     * workaround which does the same as the svg <animation >
     * write a class to remember the start and endpoints of the movement and know where we are in the moment
     */
    if(htmlSettingsDictGlobal["checkboxConfigAnimation"] && htmlSettingsDictGlobal["cpuUtilisation"]){
        tuxIceBergMoveX.update();
        tuxCloudOneMoveX.update();
        tuxCloudTwoMoveX.update();
        tuxCloudThreeMoveX.update();
        tuxCloudFourMoveX.update();
        tuxCloudFiveMoveX.update();
    }
}
;

let wantSatellite = false;
function animateGpsSatInit(darkBody) {

  if(htmlSettingsDictGlobal["checkboxConfigAnimation"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    if(darkBody && wantSatellite === false){
      wantSatellite = true;
      document.getElementById("gGpsSat").style.display = "inline-block";
      document.getElementById("gSatellite").style.display = "inline-block";
      return;
    }
    if(!darkBody && wantSatellite === true) {
      wantSatellite = false;
      document.getElementById("gGpsSat").style.display = "none";
      document.getElementById("gSatellite").style.display = "none";
      return;
    }
  }
}
;
function animateGpsSat(darkBody){
  animateGpsSatInit(darkBody);  // switch elem once on or off

  if(darkBody) {
    document.getElementById("gGpsSat").style.transform = "scale(.3,.3)";
    tuxGpsSatMoveX.update();
    tuxSatelliteMoveX.update();
  }
}
;
