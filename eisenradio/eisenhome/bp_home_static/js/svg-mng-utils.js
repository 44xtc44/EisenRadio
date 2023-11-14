// svg-mng-utils.js

/* assign event listener for touch and move to the children of the class */
let touchMoveItemsList = [
    '.divSvgBuoy',
]
function touchMoveItemsEventListenerSet () {
/* touch for mobiles, one finger, test to move all stuff around, buoy is working
 * challenge here is that we have also nested container (div)
 * works so far with a single div with position absolute, but not with nested div animalOnIce; divSvgIceTux,divSvgTux
 */

    for(let iNum=0;iNum<=touchMoveItemsList.length-1;iNum++) {
            // get the class name
        let divList = document.querySelectorAll(touchMoveItemsList[iNum]);
        for(let index=0;index<=divList.length-1;index++) {
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

function animateGenreClickTeaser(){
/* Shaker class - Advertising
  show I am clickable to switch some items on/off, headline, display badge */
    let fpm = 3600;
    let ringTime = 30 * fpm;
    genreSimpleCounter.update(); // 60fps 3600fpm * 30 = half hour
    if(genreSimpleCounter.count >= ringTime){genreShaker.shake("divStationGenre_" + activeListenId, 1);}
    if(genreSimpleCounter.count >= ringTime + 120){genreSimpleCounter.reset();}
}
;
function toggleAnimalDefaultDivSvG() {
/* html call: toggle between animals */
    eisenStylesDict["eisenRadio_" + activeListenId].updateAnimals();
}
;
function toggleWriteToDiskAnimation(){
/* radio starts rec: animate a rotating golden disk
 * update the global dict for streamer/recorder {name:id}, show disc if id is in server dict, else display none for disc div
 * called also by degradeAnimationsSet(), cpuUtilisation, discs on/off
 */
    let req = $.ajax({
        type: 'GET',
        url: "/streamer_get",
        cache: false,
    });
    req.done(function (data) {
        if (data.streamerGet) {

            streamerDictGlobal = {};
            streamerDictGlobal = data.streamerGet;

            if(htmlSettingsDictGlobal["checkboxConfigAnimation"]){
                try{
                    // non empty dict
                    if(Object.keys(streamerDictGlobal).length > 0){
                        for (const [key, radioId] of Object.entries(streamerDictGlobal)) {
                            let div = document.getElementById("divWriteToDisk_" + radioId);
                                /* cpuUtilisation check */
                            if(htmlSettingsDictGlobal["cpuUtilisation"]) {
                                div.style.display = "inline-block";
                                // set event listener to disappear on click
                                div.addEventListener("click", function (){div.style.display = "none";});
                            }  else {
                                div.style.display = "none";
                            }
                        }
                    }
                } catch (error) {console.log(".toggleWriteToDiskAnimation() ", error);}
            }
        }
    });
}
;
function skipRecordShowMessageInABottle(){
/**
 * must be called on a regular basis:
 *       if skipped record file by using the blacklist for current LISTEN Radio,
 *       info by showing a message in a bottle image with 'skip' label for the radio
 *       parseInt(activeListenId) convert id to integer
 *       server keeps track of skipped records and updates compare dict
 */
    let req = $.ajax({
        type: 'GET',
        url: "/skipped_records_get",
        cache: false,
    });
    req.done(function (data) {
        if (data.skippedRecordsGet) {
            let skipList = data.skippedRecordsGet;
            if(skipList.includes(parseInt(activeListenId))) {
                let bottle = document.getElementById("divMessageInABottle_" + activeListenId);
                bottle.style.display = "inline-block";
                bottle.style.top = "-5em";
                bottle.style.left = "1em";
                bottle.style.transform = "scale(0.8,0.8)";
                setTimeout(function (){
                    bottle.style.display = "none";
                }, 10000);

            }
        }
    });
}
;
function dimRadioForAnimation(){
/* show or hide the title displays
 * timeout to work against power clicking and dblClick bug
 */
    try{
        setTimeout(function (){dimRadioForAnimationExec();}, 50);
    } catch (error) {}
}
;
function dimRadioForAnimationExec(){
/* target: dim opacity of radio elements to better present the animation; now switching on/off opacity 0
 * click on genre displayed, if radio has no genre it will not work, who cares
 */
    let opaMin = "0.00";
    let opaMax = "1";
    try{
        let metric = document.getElementById("divMeasurementsUpper_" + activeListenId);
        let header = document.getElementById("divHeaderShadow_" + activeListenId);
        let pic = document.getElementById("pixies_" + activeListenId);

       if(header.style.opacity == opaMax || ! header.style.opacity){
           metric.style.opacity = opaMin;
           header.style.opacity = opaMin;
           pic.style.opacity = opaMin;

       } else {
           metric.style.opacity = opaMax;
           header.style.opacity = opaMax;
           pic.style.opacity = opaMax;
       }
    } catch (error) {console.log(error); }
}
;
