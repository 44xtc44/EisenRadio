// svg-checkered-balloon.js

function animateCheckeredBalloon(smoothVolume){
    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* checkered balloon */
        let divAnimate = "divSvgB1_" + activeListenId;
        let animationTimerInstance = b1BalloonAniTimer;
        let moveSinCosInstance     = b1BalloonMoveSinCos;
        let extraTransform;

        animationTimerInstance.update();
        if(animationTimerInstance.run === true){
            extraTransform = "rotateZ(" + b1BalloonUpDown.update() + "deg)";
            b1BalloonBurnerRedPSwitch.flashColor = "hsl(" + 300 + ", 100%, 50%)";
            b1BalloonBurnerRedPSwitch.updateFlashPattern();
            b1BalloonBurnerYPSwitch.flashColor = "hsl(" + 60 + ", 100%, 50%)";
            b1BalloonBurnerYPSwitch.updateFlashPattern();
            moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
            /*
             * random event can start, from AnimationTimer class
             *  can not animate all four <g> color groups, this looks not good
             */
            if(b1BalloonAniTimer.randomEvent == true){
                powerLevelAnimation({smoothVolume: smoothVolume,
                                     animatedInstance: b1ColorOnePowerSwitch
                });
                powerLevelAnimation({smoothVolume: smoothVolume,
                                     animatedInstance: b1ColorFourPowerSwitch
                });
            }
        }
    }
}
;
let b1BalloonBurnerRedPSwitch = new PowerSwitch({path: document.querySelectorAll(".b1BurnerFlameRed"),
                                           flashPatternList:  [1,1,1,1,1,0,0,0,0,0,0],
                                           flashPatternMultiplier: 17,
                                          });
let b1BalloonBurnerYPSwitch = new PowerSwitch({path: document.querySelectorAll(".b1BurnerFlameYellow"),
                                           flashPatternList:  [0,0,0,1,1,1,1,1,1,0,0],
                                           flashPatternMultiplier: 10,
                                          });

let b1ColorOnePowerSwitch = new PowerSwitch({path: document.querySelectorAll(".color_One"),  // if class no need to mention element
                                              hue: getRandomIntInclusive(600,800),
                                              step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                              max:12,
                                              maxCount:6,
                                              slider:2,
                                              dropShadow: "",
                                              animatePower:false  // only color change, no on/off
                                               });
let b1ColorFourPowerSwitch = new PowerSwitch({path: document.querySelectorAll(".color_Four"),  // if class no need to mention element
                                              hue: getRandomIntInclusive(600,800),
                                              step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                              max:12,
                                              maxCount:6,
                                              slider:2,
                                              dropShadow: "",
                                              animatePower:false  // only color change, no on/off
                                               });
let b1BalloonAniTimer    = new AnimationTimer({animationWaitTime: 2000,scale:2,speed:5,logName:"b1Balloon",
                              /* target: store an argument function (instance call) in another instance class variable
                               *            and call it on demand
                               *    one: wrap function in anonymous function in the caller,
                               *    two: wrap argument in an anonymous function again, in the called
                               *    store it in a variable (parameter, the implementation inside the subroutine, write to clarify)
                               */
                                            randomEventFunction:function(){
                                                                    b1ColorOnePowerSwitch.applyOrgColor("b1Balloon");   // arg logName
                                                                    b1ColorFourPowerSwitch.applyOrgColor("b1Balloon");
                                                                            },
                            });
let b1BalloonMoveSinCos  = new MoveSinCos();  // calc y for given x and angle
let b1BalloonUpDown      = new CountUpDown(-.2, 1, 1/Math.PI/10/10);  // rotation in the "wind" for firefox stutter browser
