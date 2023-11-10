function animateZeppelin(darkBody, smoothVolume){
    /* Zeppelin */
  if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){

    let flashDayColor   = "hsl(" + 90 + ", 100%, 50%)";
    let flashNightColor = "hsl(" + 300 + ", 100%, 50%)";
    let divAnimate = "divSvgZ1_" + activeListenId;
    let animationTimerInstance = z1ZeppelinAniTimer;
    let moveSinCosInstance     = z1ZeppelinMoveSinCos;
    // Position lights
    if(darkBody){
        z1ZeppelinPosLightPSwitch.flashColor = flashNightColor;
    } else {
        z1ZeppelinPosLightPSwitch.flashColor = flashDayColor;
    }
    animationTimerInstance.update();
    let checkeredBalloon = b1BalloonAniTimer;
    if(checkeredBalloon.run === true) {
        /* help fireFox to not hang if b1 and paras appear at the same time */
        document.getElementById(divAnimate).style.display = "none";
        return;
    }
    if(animationTimerInstance.run === true){
        z1ZeppelinPosLightPSwitch.updateFlashPattern();
        let extraTransform = "rotateZ(" + z1ZeppelinUpDown.update() + "deg)";
        moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
        powerLevelAnimation({smoothVolume: smoothVolume,
                            animatedInstance: z1ZeppelinPowerSwitch
        });
    }
  }
}
;
let z1ZeppelinAniTimer   = new AnimationTimer({
                                               animationWaitTime: 1800,
                                               logName:"Zeppelin",
                                               speed:12,
                                               externalFunction:function(){
                                                                     let baseColorHue = getRandomIntInclusive(1,360);
                                                                     console.log("z1ZeppelinAniTimer color ",baseColorHue)
                                                                     zeppelinShadesOfColor.update(baseColorHue);
                                                                     /* write to dict timeout */
                                                                     setTimeout(function () {changeColorPathToHsl(zeppelinShadesOfColor)}, 500);
                                                                            },
                                              });
let z1ZeppelinMoveSinCos = new MoveSinCos();
let z1ZeppelinUpDown     = new CountUpDown(-0.5, 1, 1/Math.PI/10/10);  // fix for firefox, stutter if no rotation
let z1ZeppelinPosLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#z1PositionLights path"),  // if id mention path element,
                                           flashPatternList:  [0,0,0,1,1,1,0,0,0,1,0,1],// [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
                                           flashPatternMultiplier: 6
                                          });
let z1ZeppelinPowerSwitch = new PowerSwitch({path: document.querySelectorAll("#z1AnimatedFills path"),
                                  hue: getRandomIntInclusive(600,800),
                                  step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                  max:12,
                                  maxCount:6,
                                  slider:2,                            // all elements power on/off interval against the follower
                                  dropShadow: "",
                                  animatePower:false
                                  });