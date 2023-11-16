// degradeAnimation.js

// CPU radio button to reduce fun

function degradeAnimationsSet(level) {
/* HTML call: radio buttons for CPU utilisation high or low, write on/off to database
 * server set level value (high, low) in db as 1,0
 * call toggleDegradeAnimation() in radio_styles.js to switch divs and <g> on/off
 */
    loaderAnimation(enabled = true);
    if(level === "high") degradeAnimationsDict("high");
    if(level === "low")  degradeAnimationsDict("low");
    let req = $.ajax({
        type: 'POST',
        url: "/degrade_animation_level_set",
        cache: false,
        data: level
    });

    req.done(function (data) {
        loaderAnimation(enabled = false);
        /* timeOutFunction to call degradeAnimationsWriteDict function so the animationsAllowedDict is written new
         * can not call simple function from req.done
         */
        setTimeout(function () {
            configEisenradioHtmlSetting(); // get the value for cpu high/low 1/0, write new "htmlSettingsDictGlobal"
        }, 50);
        setTimeout(function () {
            degradeAnimationsWriteDict();  // write new "animationsAllowedDict", which div and <g> should be shown or hidden
            }, 60);
        setTimeout(function () {
            toggleDegradeAnimation();      // read "animationsAllowedDict", do the switch of div and <g>
            }, 1000);
        setTimeout(function () {
            toggleWriteToDiskAnimation();  // show or hide the golden disks image for rec
            }, 1001);
    });
}
;
function degradeAnimationsWriteDict() {
   /* must be called on page load to ask server which option to set for CPU animation mode
    * ---> writes animationLevelDict new <----
    */
    let req = $.ajax({
        type: 'GET',
        url: "/degrade_animation_level_get",
        cache: false,
    });
    req.done(function (data) {
        let animationLevel = data.degradeAnimationsWriteDict;
        animationsAllowedDict = {};// del all key/val pairs
        if(animationLevel === "high"){
            /* write animationsAllowedDict true for all  */
            animationsAllowedDict = degradeAnimationsDict("high");
        } else if(animationLevel === "low"){
            animationsAllowedDict = degradeAnimationsDict("low");
        }
        console.log("animationsAllowedDict. ",animationsAllowedDict)
    });
}
;
function degradeAnimationsDict(level){
/* return a dict with animation and status true or false dependent on CPU level
 * can not use multiple level, server db function has only on/off
 */
    let aniDict = {};
    let b1Balloon     = "gB1";
    let blurBuoy      = "gBlurBuoy";
    let blurScrews    = "gScrewHeadPhillipsBlur";
    let clouds        = "gTuxClouds";
    let speaker       = "gSvgSpeakerFlat" ;
    let z1Zeppelin    = "gZ1";

    allAnimationsList = [
    b1Balloon ,
    blurBuoy  ,
    blurScrews,
    clouds    ,
    speaker   ,
    z1Zeppelin,
    ]
    for(let index=0;index<=allAnimationsList.length -1;index++){
        if(level === "high") {
            aniDict[allAnimationsList[index]] = true;
        } else {
            aniDict[allAnimationsList[index]] = false;
        }
    }
    return aniDict;
}
;
function rootVariableCompute(propertyValue){
        let root = document.querySelector(':root');
        let rootStyle = getComputedStyle(root);
        let varPropVal = rootStyle.getPropertyValue(propertyValue);
        return varPropVal;
}
;
function degradeMobile() {
   /*   WORKON

     Python returns true for possible mobile app.
     call degradeAnimationsSet()?
    */
   let req = $.ajax({
       type: 'GET',
       url: "/degrade_mobile_get",
       cache: false,
   });
   req.done(function (data) {
       let animationLevel = data.degradeAnimationsWriteDict;
       // animationsAllowedDict = {};// del all key/val pairs
       // if(animationLevel === "high"){
       //     /* write animationsAllowedDict true for all  */
       //     animationsAllowedDict = degradeAnimationsDict("high");
       // } else if(animationLevel === "low"){
       //     animationsAllowedDict = degradeAnimationsDict("low");
       // }
       // console.log("animationsAllowedDict. ",animationsAllowedDict)

       // if true call
        setTimeout(function () {
           degradeAnimationsSet("low");
       }, 50);
   });
}
;
