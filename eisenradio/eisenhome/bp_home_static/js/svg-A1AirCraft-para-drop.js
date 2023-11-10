/*  let's make a parachute drop
 * target: animate an unlimited number of divs that belong to one theme create random actions and colors inside the theme;
 * each parachute gets an id for an animated div
 */
  let paraAnimTimerDict = {};  // angle and time of appearance
  let paraUpDownDict = {};     // angle for partial horizontal rotation of div
  let paraMoveSinCosDict = {}; // calc the y for given x and angle (tan)
  let paraUnitDept = "AirDrop";  // if more drop instances, have log names
  let paraParentDiv = "divDragRopeA1AirCraft";  // query class members divRadioFrontPlate_1 to divRadioFrontPlate_10
  let paraMemberCount = getRandomIntInclusive(4,6);
  let airDropDelDict = {};  // index.js  {radioId: [div1,div2,div3]} for cleanup routine to set paraParentDiv child to display none

function animateA1AirCraft(){

    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* AirCraft has set scale Mod for a1AirCraftAniTimer instance
     */
        let flashTail   = "hsl(" + 90 + ", 100%, 100%)";
        let flashRight  = "hsl(" + 360 + ", 100%, 50%)";
        let flashLeft   = "hsl(" + 90 + ", 100%, 50%)";

        let divAnimate  = "divA1AirCraft_" + activeListenId;
        let animationTimerInstance = a1AirCraftAniTimer;
        let moveSinCosInstance = a1AirCraftMoveSinCos;

        animationTimerInstance.update();
        if(animationTimerInstance.run === true){
            a1AirCraftTLightPSwitch.flashColor = flashTail;
            a1AirCraftRLightPSwitch.flashColor = flashRight;
            a1AirCraftLLightPSwitch.flashColor = flashLeft;
            a1AirCraftTLightPSwitch.updateFlashPattern();
            a1AirCraftRLightPSwitch.updateFlashPattern();
            a1AirCraftLLightPSwitch.updateFlashPattern();
            let extraTransform = "rotateZ(" + a1AirCraftUpDown.update() + "deg)";
            moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
            /* termination here since moveRandomAngle() looks only for screen borders and y as terminator
             * trigger parachutes drop
             */
            if(animationTimerInstance.scale === animationTimerInstance.scaleMax){
                animationTimerInstance.reset();
                moveSinCosInstance.reset();
                document.getElementById(divAnimate).style.display = "none";

                // ParachuteDrop, force AnimationTimer instances to run
                let parachuteTimerInstance;
                for(let index=0;index<=paraMemberCount -1;index++){
                    let timerKey = Object.keys(paraAnimTimerDict)[index];
                    parachuteTimerInstance = paraAnimTimerDict[timerKey];
                    parachuteTimerInstance.animationWaitTime = 0;
                }
            }
        }
     }

}
;
let a1AirCraftAniTimer   = new AnimationTimer({
                                               overrideDefault: true,  // not use all reset options to keep settings
                                               angle: getRandomIntInclusive(240,360),
                                               angleUp: true,
                                               angleMod: 0.05,         // 0.01 default
                                               scale: 0.51,            // min val of constructor
                                               scaleMod: 1/150,
                                               scaleMax: 5,
                                               animationWaitTime: 2000, // 3min  10800
                                               logName:"a1AirCraftParaChuteDropper",
                                               speed:15,
                                               externalFunction:function(){
                                                                    let rnd = getRandomIntInclusive(240,360);
                                                                    //console.log("a1AirCraft, update approach direction ",a1AirCraftAniTimer.lastAngle);
                                                                    a1AirCraftAniTimer.lastAngle = rnd;
                                                                            },
                                              });
let a1AirCraftTLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftTailLightWhite"),  // if id mention path element, but only if multiple
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftRLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftRightWingLightRed"),  // if id mention path element,
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftLLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftLeftSideWingLightGreen"),  // if id mention path element,
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftMoveSinCos  = new MoveSinCos();  // calc y for given x and angle
let a1AirCraftUpDown      = new CountUpDown(-30, 0, 1/Math.PI/5);  // over wing rotation

function animateParachuteDrop(){

    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* PARACHUTE DROP
     * animate a number of svgs as air drop from elsewhere, aircraft triggers activation
     */
        let animationTimerInstance;
        let moveSinCosInstance;
        let divAnimate;
        let extraTransform;
            for(let index=0;index<=paraMemberCount -1;index++){
                divAnimate = paraUnitDept + (index + 1) + "_" + paraParentDiv + "_" + activeListenId;  // AirDrop2_divDragRopeA1AirCraft_11
                let timerKey  = Object.keys(paraAnimTimerDict)[index];
                let moveKey   = Object.keys(paraMoveSinCosDict)[index];
                let rotateKey = Object.keys(paraUpDownDict)[index];

                animationTimerInstance = paraAnimTimerDict[timerKey];
                animationTimerInstance.update();
                if(animationTimerInstance.run === true){
                    moveSinCosInstance     = paraMoveSinCosDict[moveKey];
                    extraTransform = "rotateZ(" + paraUpDownDict[rotateKey].update() + "deg)";
                    moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
                }
        }
     }
}
;

function parachuteInit() {
  /* paraAnimTimerDict */
  for(let index = 1;index<=paraMemberCount;index++){
      paraAnimTimerDict[paraUnitDept + index] =
          new AnimationTimer({animationWaitTime: 999999,   // changed! now airplane sets run status true for paraAnimTimerDict
                              scale:0.8,scaleMax:1.3,speed:10,angleDown:false,logName:"parachuteDrop_" + index});
  }

  /* paraUpDownDict for partial Z rotation */
  for(let index = 1;index<=paraMemberCount;index++){
      paraUpDownDict[paraUnitDept + index] =
          new CountUpDown(-(getRandomIntInclusive(5,10)), (getRandomIntInclusive(2,10)), 1/Math.PI/10);
  }
  /* paraMoveSinCosDict random direction */
  for(let index = 1;index<=paraMemberCount;index++){
      paraMoveSinCosDict[paraUnitDept + index] = new MoveSinCos();
  }

  /* create a div for each parachute, divRadioFrontPlate parent div with position relative attribute to assign absolute for children
   */
   let htmlCollection = document.getElementsByClassName(paraParentDiv);  // collection of objects not array, can not work with original
   let paraParentDivIds = [...htmlCollection];                           // clone, all div ids of class collection in an array

   for(let index=0;index<=paraParentDivIds.length -1;index++){       // for every radio
      let radioId;
      let divList = new Array();
      for(let memberNum=1;memberNum<=paraMemberCount;memberNum++){   // create num of divs
          let div = document.createElement('div');
          /* pcDrop10_divSvgZ1_10; z1DivNames[index].id is also underscore name_10, so id can id.split[2]*/
          div.id = paraUnitDept + memberNum + "_" + paraParentDivIds[index].id;   // paraParentDivIds[index].id is text name of object
          paraParentDivIds[index].appendChild(div);                           // paraParentDivIds[index]    is (real) object html, element
          divList.push(div.id);
          radioId = div.id.split("_")[2];
          /* An example how to dynamically assemble an svg with external <use> elements to color a particular <g> group,
           *  divided the svg in <g> groups, each group is a <use> in the new <svg> <use>, <use> ... </svg>
           *      this allows to assign a fill attribute to individual groups (<use>)
           *                      NO HARDCODED FILL IN THE PATH tag OR no color ...
           * paras keep their color and add-on (ribbon, star), also if switching back to a radio, one shot action on startup
           *  can be changed in para function for drop animation frame call
           */

          let rndColor = getRandomIntInclusive(0,htmlColNames.length -1);
          let rndEvtNum = getRandomIntInclusive(1,5);  // can show some extra animations seldom
          let starDrop   = "<use href=#gParaDropStar visibility='collapse'></use>";
          let ribbonDrop = "<use href=#gRibbon visibility='collapse'></use>";
          if(rndEvtNum === 1 || rndEvtNum === 2) ribbonDrop = "<use href=#gParaDropStar visibility='visible'></use>";
          if(rndEvtNum === 3) ribbonDrop = "<use href=#gRibbon visibility='visible'></use>";
          div.innerHTML = "<svg id=" + "svg_" + paraUnitDept + memberNum + "_" + paraParentDivIds[index].id + ">"
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
      airDropDelDict[radioId] = divList;  // help to delete (set display none), function in index.js, deleteInfoExec()
   }
  console.log("parachute dicts ",paraAnimTimerDict, paraUpDownDict, paraMoveSinCosDict);
  console.log("parachute html collection ",htmlCollection, airDropDelDict);
}
;
parachuteInit();