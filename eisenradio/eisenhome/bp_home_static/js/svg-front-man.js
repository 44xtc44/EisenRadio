// svg-front-man.js

function animateFrontPigs(darkBody, smoothVolume, powerLevelDict){
/* inflated (omg), scaled ANIMALS */
    if(htmlSettingsDictGlobal["checkboxConfigFrontPigs"]){
    /* animal animation, use volume level to inflate */
        defaultFrontAnimation(smoothVolume, powerLevelDict);
        if(darkBody){
                powerLevelAnimation({smoothVolume: smoothVolume,
                                    animatedInstance: tuxIceFloeFrontPowerSwitch
                });
        }
    }
}
;
