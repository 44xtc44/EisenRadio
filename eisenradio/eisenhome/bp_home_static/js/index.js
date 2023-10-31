/* index
 *
 * Target:
 * 0) Record multiple streams at the same time with the help of a database frontend
 * 1) Animation can be disabled completely. Functions look in a dictionary if they may run.
 *     htmlSettingsDictGlobal - css style off, only black or grey page
 *                            - animations off, no animations at all, not even loader animation on start page
 *                            - spectrum analyser can be called, nearly look and feel of previous versions,
 *                              but with detachable analyzer and console hidden, monitor recordings and file repair
 * 2) Animation can be disabled partially.
 *     degradeAnimationsDict  - quick degradation if CPU is high or FireFox refuses to run properly
 *                              allowed: iceBerg, floe (animated in dark mode), buoy and animal on the floe
 * Functions
 * ---------
 *      eisenRadioCreateStyleInstances() - get all radio table ids and create an instance for each radio to set rec, listen on/off
 *      degradeAnimationsSet(level)      - radio button for cpu utilisation, write on/off to database
 *      degradeAnimationsWriteDict()     - write "animationsAllowedDict", call degradeAnimationsDict(level)
 *           degradeAnimationsDict(level)- returns the dict made from a list of allowed/disallowed animations
 *      rootVariableCompute()            - can get property values of various elements, color
 *      setEventListenerPlay ()
 *      setEventListenerPause ()
 *      configEisenradioHtmlSetting()    - update global html settings dict, html style and animation settings on/off
 *      toggleHideConsole()
 *      enlightPicCommentPre(divId)      - switch textColor on or of
 *      maxHeightPicCommentPreToggle()   - can touch scroll plus expand on dblClick
 *      setAudioContextVisual()          - create instances of audio, gain nodes
 *      removePageCover()
 *      setAudioVolume()
 *      setAudioGain()
 *      reloadAudioElement(newAudioSource, isPlayList) - called if radio changes
 *      randomOne()                                    - can return 1 or -1, used for star velocity
 *      updateDisplay()                                - writes title info to all active radios
 *      setTimer(val)                                  - send hour value from html drop down, or -1 for stop now
 *      updateMasterProgress()                         - get and show calculated percent value for progress bar
 *      setDarkMode()                                  - cookie for dark mode
 *      delDarkMode()                                  - del cookie
 *      stationGet()                                   - request the active listen radio name
 *      streamerGet()                                  - request list of active recorders
 *      cookie_set_show_visuals()                      - spectrum analyser cookie
 *      cookie_del_show_visuals()                      - del spectrum analyser cookie
 *      cookie_toggle_show_visuals()                   - on/off spectrum analyser canvas
 *      cookie_start_set_text_show_visuals()           - change the displayed html text for on/off spectrum analyser
 *      changeColorScheme()                            - dark mode or not
 *      setColor(val)                                  - apply color schema
 *      headerInfo()                                   - writes extracted header information to html bit rate, web site, genre ...
 *      unifyGenre(searchString)                       - replace strings in genre sent from radio to filter out comma
 *      deleteInfo()                                   - clean the whole html page from unused radios, get list
 *      deleteInfoExec(station_id, darkBody, logName)  - take list and clean
 *      cacheListFeed(table_id, title)                 - creates a drop-down dialog from where we can auto scroll directly to the radio id
 *      toggleCacheListShowSelectBox()                 - shows or hides the drop-down dialog
 *      getBodyColor()                                 - returns true if dark mode, else false
 *      getRandomIntInclusive(min, max)                - /
 *      deactivateAudioElement()                       - deactivate audio element to faster load new src
 *      loaderAnimation(enabled)                       - start stop the loader animation for basic mode without animation
 *      recOrListenAction()                            - catch button press and send it to the server, switch styles, record and listen
 *        recOrListenAutoClickListenButton(buttonNum)                   - autoClicker, Button press
 *        recOrListenAutoClickerRecorderStyle(buttonId)                 - autoClicker has endet listen, now set minimal style for record, if on
 *                                                                        switch EisenRadioStyles instance status for listen from true to false
 *        recOrListenRunRecordsDisplay(activeRecorderList)              - show running recorder in drop-down dialog with jump to radio option
 *        recOrListenRecorderStyleSet(activeRecordId = data.streamerId) - get id of pressed record button, call record animation golden disc
 *        recOrListenDeactivateAudio(dataRadioId, dataLastListenId)     - switch EisenRadioStyles instance status for listen from true to false
 *        recOrListenAudioActivateLoad(radioName, localHostSoundRoute)  - radio name and url with port number for audio endpoint (flask sends its port num)
 *        recOrListenAudioSetId(radioName, radioId)                     - set global "activeListenId" for functions to show divs with id
 *        recOrListenAudioSetListenStyleSpectrum(radioName, radioId)    - write radio name to console, call spectrum analyser
 *
 */
const divStartPageFadeIn = document.getElementById("divStartPageFadeIn");
const pageCover = document.getElementById("pageCover");
const pageCoverCanvas = document.getElementById("pageCoverCanvas");
const pageCoverCanvasCtx = pageCoverCanvas.getContext('2d');
const canvasMaster = document.getElementById("canvasMaster");
const canvasMasterCtx = canvasMaster.getContext('2d');
const currentRadioName = document.getElementById('currentRadioName');
currentRadioName.innerText = "Eisenradio"
const fileUpload = document.getElementById("fileUpload");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const audio = document.getElementById("audioWithControls");
audio.volume = 0.25;
const audioVolumeController = document.getElementById("audioVolumeController");
const audioGainController = document.getElementById("audioGainController");

var cleanUpDict = {};                                                    // function or class method can write elements to clean, deleteInfoExec()
var divCustomText = document.getElementsByClassName("divCustomText");    // custom ideas or copied stuff for reading while listening
var AnimationContainer = document.getElementsByClassName("divAnimationContainer");
var audioContext, audioSource, analyserNode, analyserNodeTwo, gainNode;
var spectrumAnalyserActive = false;
var spectrumAnalyserShow = false;
var localPlayList = [];
var trackGlobalNumber;
var lastAudioSrcGlobal = undefined;
var lastAudioRadioGlobal = undefined;
var divCanvasMasterPositionTop = undefined;
var divCanvasMasterPositionLeft = undefined;
var canvasMasterRectangle;        // top, left, x, y ...  info obj
var htmlSettingsDictGlobal = {};  // {"animationOfEisenRadio": True,"styleOfEisenRadio": False}
var eisenStylesDict = {};         // apply color and shadows to the radio
var streamerDictGlobal = {};            // stores all currently active streaming connections or rec style
var animationsAllowedDict = {};
var consoleUpDown = 1;           // up 1 down 0

const fadeIn = [{opacity: 0}, {opacity: 1}];    // iterator
const faderInTiming = {duration: 1500, iterations: 1,};
const faderPulseTiming = {duration: 1500, iterations: 5,};
const playListHeadText = "playListHeadText";

$(document).ready(function () {

    pageCoverAnimation();
    configEisenradioHtmlSetting();      // request if animation and or style functions should be called, pb: python True,js true so use 0 1
                                        //document.body.style.overflowX = "hidden";
    setColor("requestTheCookie");       // document.body color
    stationGet();                       // active listen db id and name if any to animate the correct div id and console name
    streamerGet();                      // active rec button list to rebuild watch drop down dialog
    blacklistInfoOff();                 // disable sticky note info if blacklist feature is enabled by user
    eisenRadioCreateStyleInstances();   // each radio get an instance to make styles more easy if record is running; before, after, sim. to listen stuff
    degradeAnimationsWriteDict();       // dict of currently allowed animations
    touchMoveItemsEventListenerSet();   // make div touchable for mobile or touchscreen, svgAnimation.js

    setInterval(skipRecordShowMessageInABottle, 15006);
    setInterval(deleteInfo, 10005);
    setInterval(headerInfo, 10004);
    setInterval(toggleCacheListShowSelectBox, 5003);
    setInterval(updateMasterProgress, 5002);
    setInterval(updateDisplay, 5001);

    $('[data-toggle="tooltip"]').tooltip()
    $("button").click(recOrListenAction);   // button press (big mess so far, menu etc.)
    pageCover.addEventListener('click', removePageCover);
    audioVolumeController.addEventListener("input", setAudioVolume);
    audioGainController.addEventListener("input", setAudioGain);
    fileUpload.addEventListener("change", playLocalAudio);
    setEventListenerPlay();
    setEventListenerPause();

    // double click event for expansion of 'pre' element with custom text (if it is larger than predefined high)
    for (var i = 0; i < divCustomText.length; i++) {
        divCustomText[i].addEventListener('dblclick', maxHeightPicCommentPreToggle);
    }

    // mobile screen size below 1080 toggle console to get more space on screen
    if (window.innerWidth < 1081) {
    toggleHideConsole();
}
})
;

function eisenRadioCreateStyleInstances(){
/* get all radio table ids and create an instance for each radio
 * class EisenRadioStyles in radio_styles.js
 *   radio name and id for record, listen variables to apply or remove a style for rec or listen
 */
    let req = $.ajax({
        type: 'GET',
        url: "/all_radio_table_ids_and_names_get",
        cache: false,
    });
    req.done(function (data) {

        if (data.eisenRadioCreateStyleInstances) {
            let radioIdNameDict = data.eisenRadioCreateStyleInstances;
            for(let index = 0;index <= Object.keys(radioIdNameDict).length -1;index++){
                let radioId   = Object.keys(radioIdNameDict)[index];
                let radioName = radioIdNameDict[radioId];
                eisenStylesDict["eisenRadio_" + radioId] = new EisenRadioStyles({radioId:radioId,radioName:radioName});
            }
            console.log("EisenRadioStyles ",eisenStylesDict);
        }
    });

}

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
function setEventListenerPlay () {
/* play button on console */
    audio.addEventListener("play", function () {
        playBtn.style.display = "none";
        pauseBtn.style.display = "block";
        pauseBtn.style.cursor = "pointer";
        pauseBtn.style.cursor = "hand";
        $("#pauseBtn").on('click', function () {
            audio.pause();
        });
    });
}
;
function setEventListenerPause () {
/* pause button on console */
    audio.addEventListener("pause", function () {
        playBtn.style.display = "block";
        pauseBtn.style.display = "none";
        playBtn.style.cursor = "pointer";
        playBtn.style.cursor = "hand";
        $("#playBtn").on('click', function () {
            audio.play();
        });
    });
}
;

function configEisenradioHtmlSetting() {
/* update global html settings dict
 * request the html and animation settings on/off
 */
    req = $.ajax({
        type: 'GET',
        url: "/tools_radio_config_get",
        cache: false
    });

    req.done(function (data) {
        htmlSettingsDictGlobal = data.configEisenradioHtmlSetting
        console.log("htmlSettingsDictGlobal ",htmlSettingsDictGlobal)
    });
}
;

function toggleHideConsole() {
/* show and hide console, bug, console must be set to inline-block on startup in on load,
 * fixed with var
 */
    let consoleShow = document.getElementById("console");
    let consoleHidden = document.getElementById("consoleHidden");

    if(consoleUpDown === 0){
        consoleShow.style.display = "inline-block";
        consoleHidden.style.display = "none";
        consoleUpDown = 1;
    } else {
      consoleShow.style.display = "none";
      consoleHidden.style.display = "inline-block";
      consoleUpDown = 0;
    }
}
;

function enlightPicCommentPre(divId) {
/* switch textColor on or of by clicking on it
 * have id of enclosing div, idea was to make a backlight around/behind (glow?) the text, but not working so far
 */
    let commentCol = rootVariableCompute('--pic-comment-head');  // works only reliable with named colors
    let backColor = rootVariableCompute('--background-color');
    let darkBody = getBodyColor();
    let radioIdList = divId.split("_");
    let radioId = radioIdList[1]

    if(darkBody){

            if(document.getElementById("radioStationComment_" + radioId).style.color == 'orange'){
                document.getElementById("radioStationComment_" + radioId).style.color = commentCol;
            } else {
                document.getElementById("radioStationComment_" + radioId).style.color = 'orange';
                // document.getElementById(divId).style.backgroundColor = 'white';
            }

    } else {
            if(document.getElementById("radioStationComment_" + radioId).style.color == 'black'){
                document.getElementById("radioStationComment_" + radioId).style.color = commentCol;
                // document.getElementById(divId).style.backgroundColor = backColor;
            } else {
                document.getElementById("radioStationComment_" + radioId).style.color = 'black';
            }
    }
}
;

function maxHeightPicCommentPreToggle() {
/* Comment/Text under the Stage image; can touch scroll plus expand now */
        let varMaxHeight = rootVariableCompute('--max-comment-text-height')
        let id = this.id;
        let div = document.getElementById(id);
        let divMaxHeight = div.style.maxHeight;

        if(divMaxHeight == "none" || divMaxHeight == "" ){
             div.style.maxHeight = varMaxHeight;
        }
        else {
             div.style.maxHeight = "none";
        }
}
;

function setAudioContextVisual() {
/* create instances of audio, */
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    analyserNode = audioContext.createAnalyser();
    /* if parallel animation must calculate different fftSize */
    analyserNodeTwo = audioContext.createAnalyser();
    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyserNode).connect(gainNode).connect(audioContext.destination)
    audioSource.connect(analyserNodeTwo);
}
;

function removePageCover() {
/* like every function it started simple, now a mess [Baustelle] */
    stopVisualise();
    pageCover.style.display = "none";
    pageCoverCanvas.style.display = "none";
    setAudioContextVisual();
    cookie_start_set_text_show_visuals();
     divStartPageFadeIn.animate(fadeIn, faderInTiming);

    // set canvas top left position for animation in canvas.js, await unhidden
    setTimeout(function () {
        canvasMasterRectangle = canvasMaster.getBoundingClientRect();
        divCanvasMasterPositionTop = canvasMasterRectangle.y;
        divCanvasMasterPositionLeft = canvasMasterRectangle.x;
    }, 400);
    /*
     * html settings check, also if we come from page refresh or blacklist
     */
    if(htmlSettingsDictGlobal["checkboxConfigAnimation"]){
        if(!(activeListenId == "noId")){
            svgAnimationMain();
        }
    }
    if(!(activeListenId == "noId")){
        setTimeout(function () {
            if(!(activeListenId == "noId")){
                eisenStylesDict["eisenRadio_" + activeListenId].listenStyle();
            }
        }, 500);
    }
}
;

function setAudioVolume() {
    audio.volume = audioVolumeController.value / 100;
}
;

function setAudioGain() {
    gainNode.gain.value = audioGainController.value;
}
;

function reloadAudioElement(newAudioSource, isPlayList) {
/* called if radio changes - listen
 * keep playlist settings for volume and gain on title change
 */
    if (!isPlayList) {
        audio.volume = 0.25;
        audioVolumeController.value = 25;
        gainNode.gain.value = 1
        audioGainController.value = 1;
    } else {
        if(!spectrumAnalyserActive) {
        // set false in fct stopVisualise(e) spectrumAnalyserActive
            selectSpectrumAnalyser();
        }

    }
    audio.src = "";
    audio.currentTime = 0;
    audio.srcObject = null; // MDN documentation is not good (srcObject vs src), perhaps this helps
    audio.src = newAudioSource;
    audio.load();
    audio.play();
}
;

function randomOne() {
    return Math.random() >= 0.5 ? 1: -1;
}
;

function updateDisplay() {
/* updates the console (at bottom) radio name
 * try catch not really needed, we work local
 */
    var req;

    req = $.ajax({
        type: 'GET',
        url: "/display_info",
        cache: false
    });

    req.done(function (data) {
        let displays_dict = data.updateDisplay
        $.each(displays_dict, function (idx, val) {
            let radioId = idx;
            let textInfo = val;
            try {
                document.getElementById("Display_" + radioId).innerText = textInfo;
            } catch (error) { console.error(error); }
        });
    });
}
;

function setTimer(val) {
/*
 * send hour value from html drop down timer selector, -1 for stopping instantaneously
 */
    $.ajax({
        type: 'POST',
        url: "/index_posts_combo",
        cache: false,
        data: { 'timeRecordSelectAll': val }
    });
}
;

function updateMasterProgress() {
/*
 * get calculated percent value for progress bar to show
 */
    var req;

    req = $.ajax({
        type: 'GET',
        url: "/index_posts_percent",
        cache: false,
    });

    req.done(function (data) {
        let percent = '';
        percent = data.result;
        if (percent === 0) {
            $('.progress-bar').css('width', 25 + '%').attr('aria-valuenow', 25).html('Timer Off');
        }
        if (percent !== 0) {
            $('.progress-bar').css('width', percent + '%').attr('aria-valuenow', percent).html('Run, Forrest! RUN!');
            if (percent >= 100) {
                window.location.href = "/page_flash";
            }
        }

    });
}
;

function setDarkMode() {
    let req;
    req = $.ajax({
        type: 'POST',
        url: "/cookie_set_dark",
        cache: false
    });
}
;

function delDarkMode() {
    let req;
    req = $.ajax({
        type: 'POST',
        url: "/cookie_del_dark",
        cache: false
    });
}
;

function stationGet() {
/* the active radio name listened; ---> updateDisplay() does the same? [Baustelle]
 * rebuild console after page refresh
 */
    let req;
    req = $.ajax({
        type: 'GET',
        url: "/station_get",
        cache: false,
    });
    req.done(function (data) {
        if (data.stationGet) {

            let stationDict = data.stationGet
            let keyList = Object.keys(stationDict);

            if(keyList.length > 0){
                let stationName = keyList[0];
                let stationId = stationDict[stationName]
                currentRadioName.innerText = stationName; /*stationName.substring(0, 20)*/
                currentRadioName.setAttribute("id", "currentRadioName");
                currentRadioName.style.cursor = "pointer";
                currentRadioName.style.cursor = "hand";
                $("#currentRadioName").on('click', function () {
                    document.getElementById('dot_' + stationId).scrollIntoView({ behavior: "smooth" });
                });
                currentRadio = stationName;
                activeListenId = stationId;
            }
        }
    });
}
;

function streamerGet() {
/*
 * redraw dropdown dialog for recorder in console after page refresh
 */
    let req = $.ajax({
        type: 'GET',
        url: "/streamer_get",
        cache: false,
    });
    req.done(function (data) {

        if (data.streamerGet) {
            $('#cacheList').find('option:not(:first)').remove();
            streamerDictGlobal = {};
            streamerDictGlobal = data.streamerGet;
            for(name in streamerDictGlobal){
                let table_id = streamerDictGlobal[name];
                cacheListFeed(table_id, name);
            }
        }
    });
}
;

function blacklistInfoOff() {
/**
 * disable sticky note info if blacklist feature is enabled by user
 */
    let req = $.ajax({
        type: 'GET',
        url: "/blacklist_status_get",
        cache: false,
    });
    req.done(function (data) {

        let blacklistPostIt = document.getElementById('blacklistPostIt');
        if (data.blacklistStatus === "enabled") {
            blacklistPostIt.style.display = "none";
        } else {
            blacklistPostIt.style.display = "inline-block";
        }
    });
}
;

function cookie_set_show_visuals() {
/**
 * spectrum analyser cookie
 */
    let req;
    req = $.ajax({
        type: 'POST',
        url: "/cookie_set_show_visuals",
        cache: false
    });
}
;

function cookie_del_show_visuals() {
    let req;
    req = $.ajax({
        type: 'POST',
        url: "/cookie_del_show_visuals",
        cache: false
    });
}
;

function cookie_toggle_show_visuals() {
    let req;
    req = $.ajax({
        type: 'GET',
        url: "/cookie_get_show_visuals",
        cache: false
    });

    req.done(function (data) {
        let analyserBadge = document.getElementById('analyserBadge');
        let canvasMaster = document.getElementById('canvasMaster');
        let divCanvasMaster = document.getElementById('divCanvasMaster');
        let show_visuals = data.str_visuals;
        if (show_visuals !== 'show_visuals') {
            analyserBadge.textContent = "hide";
            canvasMaster.style.display = "inline-block";
            divCanvasMaster.style.display = "inline-block";
            cookie_set_show_visuals();
            spectrumAnalyserShow = true;

            selectSpectrumAnalyser();
        }
        if (show_visuals === 'show_visuals') {
            analyserBadge.textContent = "show";
            canvasMaster.style.display = "none";
            divCanvasMaster.style.display = "none";
            let divHiddenButtons = document.getElementById("divHiddenButtons");
            divHiddenButtons.style.display = "none";
            cookie_del_show_visuals();
        }
    });
}
;

function cookie_start_set_text_show_visuals() {
    let req;
    req = $.ajax({
        type: 'GET',
        url: "/cookie_get_show_visuals",
        cache: false,

    });

    req.done(function (data) {
        let analyserBadge = document.getElementById('analyserBadge');
        let divCanvasMaster = document.getElementById('divCanvasMaster');
        let canvasMaster = document.getElementById('canvasMaster');
        let show_visuals = data.str_visuals;
        if (show_visuals === 'show_visuals') {
            analyserBadge.textContent = "hide";
            canvasMaster.style.display = "inline-block";
            divCanvasMaster.style.display = "inline-block";
            spectrumAnalyserShow = true;
            selectSpectrumAnalyser();

        }
        if (show_visuals !== 'show_visuals') {
            analyserBadge.textContent = "show";
            canvasMaster.style.display = "none";
            divCanvasMaster.style.display = "none";
            spectrumAnalyserShow = false;
        }
    });
}
;

function changeColorScheme() {
/* change color scheme for the front page from html button */

    let darkBody = getBodyColor();
    if (darkBody) {
        setColor("white");
    } else {
        setColor("black");
    }
}
;


function setColor(val) {
/* complete toolbox of ajax request response (success, error, complete, request.done) */
    let req;
    var desiredColor = undefined;
    // from html switch button
    if (val === 'white') {desiredColor = 'white';}
    if (val === 'black') {desiredColor = 'black';}
    // from page load ready
    if (val === 'requestTheCookie') {desiredColor = "cookieRequest";}

    req = $.ajax({
        type: 'GET',
        url: "/cookie_get_dark",
        cache: false,
        success: function(response){
            // console.log(response);
        },
        error: function(){
                //console.log("error in setColor()");
        },
        complete: function(){
           //  console.log('callFunctionAfterAjaxCallComplete()');
        }
    });
    req.done(function (data) {
        let listenerId = data.listenerId;
        // server response with darkMode cookie setting
        let moon = "&#127769";
        let sun = "&#127774";
        let darkMode = data.darkmode;
        let color;
        if ((desiredColor === "cookieRequest")) {
            if ((darkMode === 'darkmode')) {color = 'black';} else {color = 'white';}
        }
        if ((desiredColor === "black")) {color = 'black';}
        if ((desiredColor === "white")) {color = 'white';}

        var bodyStyles = document.body.style;
        if (color === 'black') {
            bodyStyles.setProperty('--background-color', 'rgba(26,26,26,1)');
            bodyStyles.setProperty('--form-background', '#333333');
            bodyStyles.setProperty('--form-text', '#bbbbbb');
            bodyStyles.setProperty('--hr-color', '#777777');
            bodyStyles.setProperty('--border-color', '#202020');
            bodyStyles.setProperty('--text-color', '#bbbbbb');
            bodyStyles.setProperty('--form-edit', '#333333');
            bodyStyles.setProperty('--opacity', '0.5');
            bodyStyles.setProperty('--btn-opacity', '0.75');
            bodyStyles.setProperty('--footer-color', 'rgba(26,26,26,0.90)');
            bodyStyles.setProperty('--main-display-arrow', '#34A0DB');
            bodyStyles.setProperty('--dot-for-radio-headline', '#E74C3C');
            bodyStyles.setProperty('--lbl-div-audio', '#db6f34');
            bodyStyles.setProperty('--ghetto-measurements-bottom-color', '#FCA841');
            bodyStyles.setProperty('--ghetto-measurements-upper-color', '#d441fc');
            bodyStyles.setProperty('--radio-station-headline', '#4195fc');
            bodyStyles.setProperty('--controls-background', 'rgba(26,26,26,1)');
            bodyStyles.setProperty('--canvasMaster', 'rgba(26,26,26,0.85)');
            bodyStyles.setProperty('--divButton-color', '--background-color');
            bodyStyles.setProperty('--radio-station-url', 'grey');
            bodyStyles.setProperty('--colorPlayListAndDropDown', 'darkOrange');

            setDarkMode();    // cookie
            document.getElementById('darkModeIcon').innerHTML = sun;
            document.getElementById('darkModeIconConsole').innerHTML = sun;

        }
        if (color === 'white') {
            bodyStyles.setProperty('--background-color', '#ccc');
            bodyStyles.setProperty('--form-background', 'BlanchedAlmond');
            bodyStyles.setProperty('--form-text', 'black');
            bodyStyles.setProperty('--hr-color', '#eee');
            bodyStyles.setProperty('--border-color', '#fff');
            bodyStyles.setProperty('--text-color', '#f0f0f0');
            bodyStyles.setProperty('--form-edit', '#777777');
            bodyStyles.setProperty('--opacity', '1');
            bodyStyles.setProperty('--btn-opacity', '1');
            bodyStyles.setProperty('--footer-color', 'rgba(0,63,92,0.90)');
            bodyStyles.setProperty('--main-display-arrow', '#bc5090');
            bodyStyles.setProperty('--dot-for-radio-headline', '#565454');
            bodyStyles.setProperty('--lbl-div-audio', '#FCA841');
            bodyStyles.setProperty('--ghetto-measurements-bottom-color', 'ivory');
            bodyStyles.setProperty('--ghetto-measurements-upper-color', 'ivory');
            bodyStyles.setProperty('--radio-station-headline', 'black');
            bodyStyles.setProperty('--controls-background', '#565454');
            bodyStyles.setProperty('--canvasMaster', '#ccc');    // rgba(240, 240, 240, 0.85)
            bodyStyles.setProperty('--divButton-color', '#565454');
            bodyStyles.setProperty('--radio-station-url', 'black');
            bodyStyles.setProperty('--colorPlayListAndDropDown', 'black');
            // del cookie
            delDarkMode();
            document.getElementById('darkModeIcon').innerHTML = moon;
            document.getElementById('darkModeIconConsole').innerHTML = moon;
            tuxIceFloeFrontPowerSwitch.applyOrgColor("tuxIceFoeFront");  // logName arg
        }

        setTimeout(function () {
            if(!(activeListenId == "noId")){
                eisenStylesDict["eisenRadio_" + activeListenId].listenDarkModeStyle();
            }
        }, 500);
    });
}
;

function headerInfo() {
/*
 * writes extracted header information to html bit rate, web site, genre ...
 */
    let req = $.ajax({
        type: 'GET',
        url: "/header_info",
        cache: false
    });

    req.done(function (data) {
        if (data.header_result !== "-empty-") {
            let darkBody = getBodyColor();
            $.each(data.header_result, function (idx, val) {

                let response_time = val[0];
                let suffix = val[1];
                let genre = val[2];
                currentRadioGenre = genre;
                let station_name = val[3];
                let station_id = val[4];
                let bit_rate = val[5];
                let icy_url = val[6];

                document.getElementById('toggleAnimals_' + station_id).innerHTML = "🐻‍❄"; // element can switch animals, former fake temperature
                document.getElementById('toggleAnimals_' + station_id).style.cursor = "hand";
                document.getElementById('toggleAnimals_' + station_id).style.cursor = "pointer"; // html onclick="toggleAnimalDefaultDivSvG();
                document.getElementById('request_time_' + station_id).innerText = "" + response_time + " ms";
                document.getElementById('request_suffix_' + station_id).innerText = "" + suffix;
                document.getElementById('request_icy_br_' + station_id).innerText = "" + bit_rate + " kB/s";
                document.getElementById('icy_name_' + station_id).innerText = "" + station_name;
                let modGenre = unifyGenre(genre);
                document.getElementById('request_icy_genre_' + station_id).innerHTML = modGenre;
                document.getElementById('request_icy_url_' + station_id).innerText = "" + icy_url;
                // need value for url click
                document.getElementById('request_icy_url_' + station_id).value = "" + icy_url;
            });
        }   /*data.cache_result !== ""*/
    });
}
;

function unifyGenre(searchString){
    let str = searchString.replace(/,/g, ' ').replace(/-/g, ' ')
    return str;
}
;

function deleteInfo() {
/*
 * clean the whole html page from unused radios every few seconds
 * tell if there is an active connection
 *
 * return if playlist is active, nothing to do
 */

    if(!(lastAudioRadioGlobal === undefined)){return;}  // playlist is active

    let req = $.ajax({
        type: 'GET',
        url: "/delete_info",
        cache: false
    });

    req.done(function (data) {
        if (data.is_data_transfer == true) {
             document.getElementById('isOnlineDot').innerHTML = "&#128994";
            // red dot &#128308; 	green dot &#128994;
        } else {
            document.getElementById('isOnlineDot').innerHTML = "&#128308";
        }

        if (data.stopped_result !== "-empty-") {
            let stopped_list = data.stopped_result;
            let darkBody = getBodyColor();
            $.each(stopped_list, function (idx, station_id) {
                setTimeout(function (){deleteInfoExec(station_id, darkBody);}, 1000);
            });/**/
        }
    });
}
;

function deleteInfoExec(station_id, darkBody, logName){
/* delete/cleanup function can called one time for single radio or by loop
 * station_id: radioId,  darkBody:true/false dark mode

 * ------------------------ STATION.ID ----------------------
 */

    try{
        // del radio style
        let pixies = document.getElementById('pixies_' + station_id);
        let pix = document.getElementById('pix_' + station_id);
        let divRadioFrontPlate = document.getElementById('divRadioFrontPlate_' + station_id);
        let radioHeadLine = document.getElementById('radioHeadLine_' + station_id);
        let divMeasurementsUpper = document.getElementById('divMeasurementsUpper_' + station_id);
        let divStationDisplayGrid = document.getElementById('divStationDisplayGrid_' + station_id);
        let divHeaderShadow = document.getElementById('divHeaderShadow_' + station_id);
        let divRadioBackLight = document.getElementById('divRadioBackLight_' + station_id);
        let divStationGenre = document.getElementById('divStationGenre_' + station_id);
        let radioStationComment = document.getElementById('radioStationComment_' + station_id);
        let picComment = document.getElementById('divCustomText_' + station_id);

        if (!darkBody) {
            radioHeadLine.style.color = "#565454";
        }
        else {
            radioHeadLine.style.color = " #4195fc";
        }

       pix.style.maxHeight = "5em";
       pixies.style.float = "";
       divHeaderShadow.style.display = "none";
       picComment.style.display = "none";
       divMeasurementsUpper.style.display = "none";
       divStationDisplayGrid.style.display = "none";
       divRadioFrontPlate.style.backgroundImage = "";
       divRadioFrontPlate.style.boxShadow = "";
       divRadioFrontPlate.style.minHeight = "1em"; // basicApplyStyle() set 40em for animation
       document.getElementById('divStationDisplayGrid_' + station_id).style.left = "5em";
       /* animation incl. stage */
       document.getElementById("divGracefulDegradation_" + station_id).style.display = "none";
       document.getElementById("animatedBackGround_" + station_id).style.display = "none";
       document.getElementById("divMainAnimationContainer_" + station_id).style.display = "none";
       document.getElementById('divRadioContainer_' + station_id).style.height = "100%";
       document.getElementById('divBtnAbsWrapper_' + station_id).style.top = "0em";
       // document.getElementById("divMainAnimationContainer_" + activeListenId).style.display = "none";   // svg sky, ocean

        // del ajax stuff
        document.getElementById('Display_' + station_id).innerText = "";
        document.getElementById('request_time_' + station_id).innerText = "";
        document.getElementById('request_suffix_' + station_id).innerText = "";
        document.getElementById('request_icy_br_' + station_id).innerText = "";
        document.getElementById('request_icy_url_' + station_id).innerText = "";
        document.getElementById('icy_name_' + station_id).innerText = "";
        document.getElementById('request_icy_genre_' + station_id).innerHTML = "";

        for(let index=0;index<=airDropDelDict[station_id].length -1;index++){
            document.getElementById(airDropDelDict[station_id][index]).style.display = "none";
        }

    } catch (error) {console.log("-> error deleteInfoExec() radioId ",station_id, error);}
}
;

function cacheListFeed(table_id, title) {
/*
 * creates a drop-down dialog from where we can auto scroll directly to the radio id on start page
 * is called for each radio listed in json response
 * caller  1 (recOrListenAction() req.done(function (data) {)
 *         2 streamerGet()
 *
 * HTML
 * <form action="" name="CACHE">
 *        onChange="location = this.value;cacheList.options[0].selected = true;"
 *
 *         jumps to
 * <div class="divCacheListFeedAnchorJump" id=dot_{{post['id']}}></div>
 *     <span class="radio-station-headline">
 *
 * JavaScript
 * opt.value = '#dot_' + table_id;
 */

    if (title !== 'Null') {

        let cacheList = document.getElementById('cacheList');
        cacheList.style.color = "#db6f34";
        cacheList.style.textColor = "#db6f34";

        let opt = document.createElement('option');
        opt.id = 'opt_' + table_id;
        opt.value = '#dot_' + table_id;
        opt.innerHTML = title;
        cacheList.appendChild(opt);
    }
}
;

function toggleCacheListShowSelectBox() {
/*
 * element 1 is hard coded " (ಠ_ಠ) ", to show that the option select box is active
 */
    if (document.getElementById('cacheList').childElementCount > 1) {
        document.getElementById("cacheList").style.display = "block";
    } else {
        document.getElementById("cacheList").style.display = "none";
    }
}
;
function getBodyColor() {
/* returns true if dark mode, else false */
    let bodyStyle = window.getComputedStyle(document.body, null);
    let backgroundColor = bodyStyle.backgroundColor;
    let darkBody;
    if (backgroundColor === 'rgb(26, 26, 26)') {
        darkBody = true;
    } else { darkBody = false; }
    return darkBody;
}
;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
;

function deactivateAudioElement(){
/*
 * deactivate audio element to faster load new src
 */
    audio.src = "";
    audio.currentTime = 0;
    audio.srcObject = null;
    stopVisualise();
}
;

function loaderAnimation(enabled) {
/* arg: enabled is true or false to start stop the loader animation */
    let darkBody = getBodyColor();
    if (darkBody) {
        if (enabled) {document.getElementById('divLoaderAnimationThreeNiceGuys').style.display = "block";}
        if (!enabled) {document.getElementById('divLoaderAnimationThreeNiceGuys').style.display = "none";}
    }
    else {
        if (enabled) {document.getElementById('divLoaderAnimationBright').style.display = "block";}
        if (!enabled) {document.getElementById('divLoaderAnimationBright').style.display = "none";}
    }
}
;

function recOrListenAction() {
/* target: catch button press and send it to the server
 * information, lesson learned:
 *  never (more) use jscript except for ajax, never use external libs (popper, bootstrap) and buttons. use custom divs and svg
 *  use querySelectorAll to set eventListener, use options to set function args: function aFunction({evt: function (){myFunction()}})
 *  in eventListener Body foo.addEventListener(<listen option>, function (){evt(),false});
 */
        // jquery button press event hits on navbar, one more reason to never use preconfigured buttons
    if ($(this).attr("class") === "navbar-toggle collapsed") {
        return;
    }
    ;
        // show loader Animation
    if(htmlSettingsDictGlobal["checkboxConfigStyle"] === 1) loaderAnimation(enabled = true);

    let buttonClass = $(this).attr("class");
    let buttonId = $(this).attr("id");
    let action0_id1 = buttonId.split("_");   // Listen_17

    if (buttonClass === "btn btn-primary") {
        $('#' + buttonId).removeClass("btn btn-primary");
        $('#' + buttonId).addClass("btn btn-danger");
        if(action0_id1[0] === "Listen"){
            deactivateAudioElement();   // instant button change and kill audio
            activeListenId = action0_id1[1]    // set global listener id for applying styles, calling divs with num id
        }
    }
    if (buttonClass === "btn btn-danger") {
        $('#' + buttonId).removeClass("btn btn-danger");
        $('#' + buttonId).addClass("btn btn-primary");
    }
    let dict = {
        'action': action0_id1[0],
        'table_id': action0_id1[1]
    };

    req = $.ajax({
        type: 'POST',
        dataType: "json",
        url: "/",
        data: dict
    });

    req.done(function (data) {

        if (data.button_to_switch) {
            /* autoClicker, Button press */
            recOrListenAutoClickListenButton(buttonSwitch = data.button_to_switch);
        }
        if (data.autoClicker) {
            /* autoClicker has endet listen, now set minimal style for record, if on
             *  switch EisenRadioStyles instance status for listen from true to false
             */
            recOrListenAutoClickerRecorderStyle(buttonId = data.autoClicker);
        }
        if (data.streamer) {
            /* show running recorder in drop-down dialog with jump to radio option */
            recOrListenRunRecordsDisplay(activeRecorderList = data.streamer);
        }
        if (data.streamerId) {
            /* get id of pressed record button, call record animation golden disc */
            recOrListenRecorderStyleSet(data.streamerId);
        }
        if (data.result === 'deactivate_audio') {
            /* must have two id: listen id active in this moment;
             *                   last id; to switch EisenRadioStyles instance status for listen from true to false
             * manual button press off, so no autoClicker can do it
             */
            recOrListenDeactivateAudio(dataRadioId = data.radio_id, dataLastListenId = data.last_listen_id);
        }
        if (data.result === 'activate_audio') {
            recOrListenAudioActivateLoad(radioName = data.radio_name, localHostSoundRoute = data.sound_endpoint);
            if (data.radio_name) {
                /* current radio, listen */
                recOrListenAudioSetId(radioName = data.radio_name, radioId = data.radio_id);
                /* set style, call spectrum analyser, set console radio name */
                recOrListenAudioSetListenStyleSpectrum(radioName = data.radio_name, radioId = data.radio_id);
            }
        }
        // hide loader Animation
        loaderAnimation(enabled = false);
    });
}
;
function recOrListenAutoClickListenButton(buttonNum) {
    console.log('autoClick button_to_switch: ' + buttonNum);
    $("#" + buttonNum).click();
}
;
function recOrListenAutoClickerRecorderStyle(buttonId) {
    setTimeout(function () {
        if(!(activeListenId == "noId")){
        /* if active listener, (EisenRadioStyles {radioId: '1', radioName: 'classic', listen: false, record: false})
         * set this.listen attribute to false and decides if recorder must get a style
         */
            eisenStylesDict["eisenRadio_" + buttonId].listenStyle();
        }
    }, 500);
}
;
function recOrListenRunRecordsDisplay(activeRecorderList) {
/* the list is actually a json string */
    $('#cacheList').find('option:not(:first)').remove();
    let streamer = activeRecorderList.split(",");

    $.each(streamer, function (idx, val) {

        let stream = val;
        if (stream.length !== 0) {
            stream = val.split("=");
            let table_id = stream[1];
            let title = stream[0];
            cacheListFeed(table_id, title);

            if (activeRecorderList === 'empty_json') {
                $('#cacheList').find('option:not(:first)').remove();
                document.getElementById('cacheList').style.color = "#696969";
                document.getElementById('cacheList').style.textColor = "#696969";
            }
            console.log('data.streamer ' + activeRecorderList);
        }
    });
}
;
function recOrListenRecorderStyleSet(activeRecordId) {
    console.log("recOrListenRecorderStyleSet.. ",activeRecordId, eisenStylesDict);
    setTimeout(function () {
    /* use style instance created in eisenRadioCreateStyleInstances(), class in radio_styles.js */
        eisenStylesDict["eisenRadio_" + activeRecordId].recordStyle();
    }, 50);
    setTimeout(function () {
    /* use style instance created in eisenRadioCreateStyleInstances(), class in radio_styles.js */
        toggleWriteToDiskAnimation();
    }, 1500);
}
;
function recOrListenDeactivateAudio(dataRadioId, dataLastListenId) {
    if(lastAudioRadioGlobal == undefined){
        deactivateAudioElement();
            // currentRadioName is global
        currentRadioName.innerText = "Eisenradio"
        activeListenId = dataRadioId;  // write "noId" default

        /* flask sends extra var for last_listen_id,
         * first call set listen to true, next with same id to false so recorder can apply style too
         */
        eisenStylesDict["eisenRadio_" + dataLastListenId].listenStyle();
        console.log('deactivateAudio', activeListenId, dataLastListenId);
    } else {
            console.log('playlist active not kill audio');
    }
}
;
function recOrListenAudioActivateLoad(radioName, localHostSoundRoute) {
    displayLocalPlayListDisable();
    let newSource = localHostSoundRoute + radioName;
    let isPlayList = false;
    reloadAudioElement(newSource, isPlayList);
}
;
function recOrListenAudioSetId(radioName, radioId) {
    console.log('listen radioName ' + radioName);
    console.log('listen radioId ' + radioId);
    activeListenId = radioId;
}
;
function recOrListenAudioSetListenStyleSpectrum(radioName, radioId) {
    setTimeout(function () {
        if(!(activeListenId == "noId")){
            eisenStylesDict["eisenRadio_" + activeListenId].listenStyle();
        }
    }, 500);
    selectSpectrumAnalyser(radioId);
        // set console name for radio
    currentRadioName.innerText = radioName; /*currentRadioName.substring(0, 20)*/
    currentRadioName.style.cursor = "pointer";
    currentRadioName.style.cursor = "hand";
    // divCacheListFeedAnchorJump has top margin for auto scroll
    $("#currentRadioName").on('click', function () {
        document.getElementById('dot_' + radioId).scrollIntoView({ behavior: "smooth" });
    });
}
;