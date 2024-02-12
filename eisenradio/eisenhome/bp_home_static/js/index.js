// index.js
"use strict";

/**
* EisenRadio, a GUI for GhettoRecorder. Fullstack app.
* <p>``sphinx-js`` is using an incompatible MarkupSave package version, against Flask ``Werkzeug``.</p>
* <p>Java docStrings will not be included in the ``ReadTheDocs`` documentation.</p>
* <p>This project is using heavily args options dictionaries to call functions.
* <code>function foo(option) { let id = option.id; }</code></p>
* <ul>
* <li>Ported animations from DOM to canvas
* <li>Radios are chosen from a drop down dialog
* <li>Removed <code>Bootstrap</code> buttons
* <li>Removed all 3rd party, except jQuery and Google fonts
* <li>A set of animations is using an own script
* <li>Spectrum analyzers are fully integrated and no more draggable
* <li>Local sound files playlist is fully integrated and JS only
* <li>All animations are called, or not, by a single function <code>svgAnimationMain</code>
* </ul>
* @author René Horn
* @author www.github.com/44xtc44
* @version 2.4
* @since 1.0
* @see license MIT
*/

const cl = console.log;
const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;

const audio = document.getElementById("audioWithControls");
audio.volume = 0.75;
const audioVolumeController = document.getElementById("audioVolumeController");
const audioGainController = document.getElementById("audioGainController");
window.audioContext = undefined;
window.audioSource = undefined;
window.analyserNodeOne = undefined;
window.analyserNodeTwo = undefined;
window.gainNode = undefined;

window.htmlSettingsDictGlobal = {};  // themes decide to run on degradation, Tools/config menu
window.streamerDictGlobal = {};      // stores all currently active recorder connections, Android shows in notification

window.activeListenId = "noId";    // animation, only call functions if listen is selected
window.activeRadioName = "Eisen";
window.downloadDir = "";           // download dir to show
window.activeTheme = "";
window.themeDict = {};  // {"Sunset": function() { mainSunsetAnimation(); },} svg-main calls key, activeTheme each frame

/**
* Event page loaded sets event listener and loads all SVG images/groups into memory.
*/
window.addEventListener('load', function () {

  paintPngToCanvas( {
    canvasId: "pageCoverTeaser",
    svgImage: "teaserImg"
  } );  // paint "existing" PNG to canvas, now THE audio enabler we MUST have, else browser error, no user interaction

  /* SVG symbol grew too big for index.html, to edit in IDE. Outsource from index HTML to server.
  * Import. Steps how it works.
  * (a) Load SVG symbol container from server.
  * (b) Write symbol to div, make it public to the document, DOM. (as if it was inline before, "some" div is ok)
  * (c) Load SVG groups and images from DOM into mem, create instances as image sources. (svg-toCanvas.js)
  * (d) Use the img instances in the document as buttons and animations. (edit paths during runtime in svg-toCanvas.js)
  */
  loadSvgSymbol().then(function(response) {
    document.getElementById('divSvgImagesSymbol').innerHTML = response;
  }).then(function(response) {
    initSvgEnv();
  }).then(function(response){

    themeInitSunset();  // Need a default theme. fun registers itself as activeTheme.
    document.body.style.overflowX = "hidden";  // get rid of x scroll bar at bottom
    downloadDirGet();          // download dir to show if record pressed
    window.addEventListener('resize', function (event) {
      glob.updateScreen();
    }, true);
    glob.updateScreen();  // check if we are on mobile on first load, todo resize evt not working on Android browser

    setInterval(recorderGet, 5003);  // collect active recorder and draw div elem with listener to click, disable
    setInterval(headerInfo, 5004);  // show header of radio, Web URL, full name, content-type
    setInterval(updateMasterProgress, 5002);  // timer to end the app

    setEventListenerAudioBtn();
    // initSvgEnv();  // SVG image loader
    blacklistEnableGet();  // after SVG image loader, animate blacklist button
    configEisenradioHtmlSetting();  // create dict which animation is allowed; Tools/Config menu and CPU icon
    window.paraDropper = new DomAirCraft();  // No canvas, last pure DOM animation, use the whole HTML page to fly around.
    setColor("requestTheCookie");   // change document.body color, cookie exercise

  }).catch(function (err) {
    console.error("error caller loadSvgSymbol->", err.statusText);
  });
})
;
/**
* User interaction for browser to enable audio element.
*/
function removePageCover() {
  document.getElementById("pageCover").style.display = "none";
  setAudioContextVisual();

  document.getElementById("radioContainer").style.display = "block";
  svgAnimationMain();
}
;
/**
* Playlist of local sound files, played in/by the browser.
* Creates a "fresh" instance on each new HTML button call.
* Else reuse of the instance introduces more of the "bind" hell. (Help appreciated! Switch radio to playlist back and forth.)
* Display is located right beside the stage "monitor" if there is space. Else below.
*/
function runLocalSound() {
  document.getElementById('divFrameRight').style.display = "block";
  document.getElementById('divPlayListShow').style.display = "block";
  document.getElementById('playList').style.display = "block";
  window.playListOne = new PlayList();
  playListOne.create();
}
;
/**
* Trigger GhettoRecorder. Stream radio in listen mode. <code>No recording</code>.
* User choice of radio station leads to a Flask generated endpoint
* that serves, yield, the JS audio element.
* @param {String} value - radio table id and name in SQLite Database
*/
function enableSoundEndpoint(opt) {
  let radioValues = opt.value.split(";");
  let radioNum = radioValues[0];
  if (radioNum === "choiceHeader") return;  // header text dropdown dialog
  let radioName = radioValues[1];

  let divFrameRightWait = document.getElementById('divFrameRightWait');
  let divFrameRight = document.getElementById('divFrameRight');
  let customImg = document.getElementById("childCustomImg_" + radioNum);
  let customTxt = document.getElementById("childCustomTxt_" + radioNum);
  let playlist = document.getElementById('playList');

  // cleanup playlist remnants
  if ((activeRadioName === "Playlist")) {  // global active listen, user of DOM audio element
    divFrameRightWait.appendChild(playlist);  // put the playlist container div in wait position
    divFrameRightWait.style.display = "none";
    playlist.style.display = "none";
    document.getElementById("nextBtn").style.display = "none";  // playlist next button
    document.getElementById("prevBtn").style.display = "none";
    playListOne.reset();  // empty the list with file objects
  }

  activeRadioName = radioName;  // set global var from opt arg
  // web radio from dropdown dialog; attach custom img and txt stuff from DB
  while (divFrameRight.firstChild) {  // remove all child div from our container
    divFrameRight.lastChild.style.display = "none";
    divFrameRightWait.appendChild(divFrameRight.lastChild);
  }
  divFrameRight.appendChild(customImg);
  customImg.style.display = "block";
  divFrameRight.appendChild(customTxt);
  customTxt.style.display = "block";

  let req = $.ajax({
    type: 'POST',
    url: "/enable_sound_endpoint",
    cache: false,
    data: { 'radioNum': radioNum, "radioName": radioName }
  });

  req.done(function (data) {
    reloadAudioElement(data.newAudioSource);
  });
}
;
/**
* Trigger GhettoRecorder. Record stream of desired radio station.
* @param {String} value - radio table id and name in SQLite Database
*/
function enableRecorder(opt) {
  let radioValues = opt.value.split(";");
  let radioNum = radioValues[0];
  if (radioNum === "choiceHeader") return;  // header text dropdown dialog
  let radioName = radioValues[1];

  let req = $.ajax({
    type: 'POST',
    url: "/enable_recorder",
    cache: false,
    data: { 'radioNum': radioNum, "radioName": radioName }
  });

  req.done(function (data) {
    // cl("enableRecorder->", data.activeRecorderNameId);
    document.getElementById("titleDisplay").innerText = "files: " + downloadDir + "/" + radioName;  // downloadDir global window var
  });
}
;
/**
* Trigger GhettoRecorder. Stop recording.
* @param {String} name: name - table name in SQLite Database
* @param {String} id - table id in SQLite Database
*/
function disableRecorder(opt) {
  let name = opt.name;
  let id = opt.id;

  let req = $.ajax({
    type: 'POST',
    url: "/disable_recorder",
    cache: false,
    data: { 'name': name, "id": id }
  });

  req.done(function (data) {
    // cl("disableRecorder->", data.disabledRecorder);
  });
}
;
/**
* Collect active recorder threads from Flask endpoint.
* Build div elem stack of active recorder names with listener to click and disable rec.
*/
function recorderGet() {
  let req = $.ajax({
    type: 'GET',
    url: "/streamer_get",
    cache: false,
  });
  req.done(function (data) {
    if (data.streamerGet) {
      streamerDictGlobal = {};
      streamerDictGlobal = data.streamerGet;
      let oKeysList = Object.keys(streamerDictGlobal);
      let recorderList = [];

      recorderInfoImg(oKeysList);
      recorderList = recorderNewList(oKeysList)
      if(!recorderList) {
        return;
      }else {
        glob.activeRecorderList = recorderList;
        recorderNewView(recorderList);
      }
    }
  });
}
;
function recorderInfoImg(oKeysList) {
  // enable recorder info image
  if(oKeysList.length > 0) {
    document.getElementById('recorderIsOn').style.display = "inline-block";
    if(activeRadioName === "Playlist") {
      document.getElementById('recorderIsOn').style.opacity = "0.1";  // better view at playlist buttons
    }else {
      document.getElementById('recorderIsOn').style.opacity = "1";
    }
  } else {
    document.getElementById('recorderIsOn').style.display = "none";
  }
}
;
function recorderNewView(recorderList) {
  // draw a div list stack of active recorder names
  let parent = document.getElementById("divRecordView");
  let innerHTML = "";
  let id = "";
  let elemClass = "";
  removeDiv({ id: parent });  // clean up existing HTML display, all child div
  // create a div for every recorder name and set a listener to later click/disable recorder
  for (let i = 0; i < recorderList.length; ++i) {
    let name = recorderList[i];  // DOM needs unique id
    let dbId = streamerDictGlobal[name];
    id = "div::" + name + "::" + dbId;  // play save
    elemClass = "divRecorderList";
    innerHTML = "&#8226; " + name;
    appendDiv({ parent: parent, id: id, elemClass: elemClass, innerHTML: innerHTML });
    setEventListenerRecord({ id: id });
  }
}
;
function recorderNewList(oKeysList) {
  // Return a list of active recorder on status change. Check delivery for new items
  let recorderList = [];
  let allInStore = true;
  let outGoing = false;
  for (let i = 0; i < oKeysList.length; ++i) {  // Check delivery for new items
    let recName = oKeysList[i];
    recorderList.push(recName);
    if(! glob.activeRecorderList.includes(recName)) allInStore = false;
  }

  for (let i = 0; i < glob.activeRecorderList.length; ++i) {  // cross check items removed from stock
    let recName = glob.activeRecorderList[i];
    if(! recorderList.includes(recName)) outGoing = true;
  }
  if(allInStore && !outGoing) {
    return false;  // no change
  }else {
    return recorderList;
  }
}
;
/**
* Div elements with recorder name, each gets a listener to kill the radio station recorder.
* @param {String} name: name - table name in SQLite Database
* @param {String} id: id - table id in SQLite Database
*/
function setEventListenerRecord(opt) {
  let id = opt.id;
  let div = document.getElementById(id);
  let name = id.split("::")[1];
  let dbId = id.split("::")[2];
  div.style.cursor = "pointer";
  div.addEventListener("click", (e) => {
    setTimeout(function () {
      div.style.backgroundColor = "red";
      disableRecorder({ name: name, id: dbId });  // else not always working
    }, 100);
  });
}
;
/**
* Stack div elements.
* @param {String} id: id - id of new child
* @param {String} elemClass - class name of new child div
*/
function appendDiv(opt) {
  /* Reusable fun to stack div and use the stack as a list.  */
  if(opt.id === null || opt.id === undefined) return;
  let div = document.createElement('div');
  div.id = opt.id;
  if (opt.elemClass === undefined) opt.elemClass = "foo";
  div.classList.add(opt.elemClass);
  div.innerHTML = opt.innerHTML;
  opt.parent.appendChild(div);  // parent is full path document.getElem...
}
;
/**
* Remove all div elements from a parent.
* @param {String} id - id of parent div
*/
function removeDiv(opt) {
  if(opt.id === null || opt.id === undefined) return;
  while (opt.id.firstChild) {
    opt.id.removeChild(opt.id.lastChild);
  }
}
;
/**
* JS Audio element can be switched by custom buttons.
*/
function setEventListenerAudioBtn() {

  audioVolumeController.addEventListener("input", setAudioVolume);
  audioGainController.addEventListener("input", setAudioGain);

  let myAudioClone = document.getElementsByClassName("audioClone");  // todo name is bad, former second console
  for (let i = 0; i < myAudioClone.length; i++) {
    myAudioClone[i].addEventListener("input", (e) => {
      audio.volume = myAudioClone[i].value / 100;
    });
  }
  let myGainClone = document.getElementsByClassName("gainClone");
  for (let i = 0; i < myGainClone.length; i++) {
    myGainClone[i].addEventListener("input", (e) => {
      gainNode.gain.value = myGainClone[i].value;
    });
  }
  let playButtons = document.getElementsByClassName("playBtnClass");
  let pauseButtons = document.getElementsByClassName("pauseBtnClass");
  for (let i = 0; i <= playButtons.length - 1; i++) {
    playButtons[i].style.cursor = "pointer";
    playButtons[i].style.cursor = "hand";
    playButtons[i].style.fontSize = "200%";
    audio.addEventListener("play", (e) => {
      playButtons[i].style.color = "grey";
      pauseButtons[i].style.color = "red";
    });
    playButtons[i].addEventListener("click", (e) => {
      audio.play();
      playButtons[i].style.color = "grey";
    });
  }
  for (let i = 0; i <= pauseButtons.length - 1; i++) {
    pauseButtons[i].style.cursor = "pointer";
    pauseButtons[i].style.cursor = "hand";
    pauseButtons[i].style.fontSize = "200%";
    audio.addEventListener("pause", (e) => {
      playButtons[i].style.color = "red";
      pauseButtons[i].style.color = "grey";
    });
    pauseButtons[i].addEventListener("click", (e) => {
      audio.pause();
    });
  }
}
;
/**
* Show or hide volume and gain slider.
*/
function toggleAudioControls() {
  let console = document.getElementById("audioControls");
  let isShown = "";

  if (glob.audioControlShow === 1) {
    isShown = "inline-block";
    glob.audioControlShow = 0;  // global
  } else {
    isShown = "none";
    glob.audioControlShow = 1;
  }
  setTimeout(function () {
    console.style.display = isShown;
  }, 50);
}
;
/**
* Show or hide the pop up console window.
*/
function toggleRecordView() {
  let console = document.getElementById("wrapRecordView");
  let isShown = "";

  if (glob.recordViewShow === 1) {
    isShown = "inline-block";
    glob.recordViewShow = 0;  // global
  } else {
    isShown = "none";
    glob.recordViewShow = 1;
  }
  setTimeout(function () {
    console.style.display = isShown;
  }, 50);
}
;
function toggleConsole(divId) {
  let console = document.getElementById("console");
  let isShown = "";

  if (glob.consoleShow === 1) {
    isShown = "inline-block";
    glob.consoleShow = 0;  // global
  } else {
    isShown = "none";
    glob.consoleShow = 1;
  }
  setTimeout(function () {
    console.style.display = isShown;
  }, 50);
}
;
/**
* Basic methods to adapt on different screen sizes and OS.
*/
class Glob {
  constructor() {
    this.audioControlShow = 1;
    this.consoleShow = 1;
    this.recordViewShow = 1;
    this.activeRecorderList = [];
  }
  numberRange(start, end) {  // simulate range() of Python
    return new Array(end - start).fill().map((d, i) => i + start);
  }
  // return a random integer
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  updateScreen() {
    /* Rearrange menu and decoration for mobiles, small screens.*/
    // monitor panel right
    let displayRight = document.getElementById("divMeasurementsUpper");
    // monitor screws
    let screwBottomRight = document.getElementById("divSvgScrewHeadBottomRight");
    let screwTopRight = document.getElementById("divSvgScrewHeadTopRight");
    let glasBreakTopRight = document.getElementById("divSvgGlasBreakTopRight");
    // right, playlist, img, txt
    let divFrameRight = document.getElementById("divFrameRight");

    displayRight.style.left = (window.innerWidth - 110) + "px";
    screwBottomRight.style.left = (window.innerWidth - 80) + "px";
    screwTopRight.style.left = (window.innerWidth - 80) + "px";
    glasBreakTopRight.style.left = (window.innerWidth - 118) + "px";
    divFrameRight.style.position = "absolute";
    divFrameRight.style.display = "block";
    divFrameRight.style.left = "730px";

    if (window.innerWidth >= 670) {  // override
      displayRight.style.left = "600px";
      screwBottomRight.style.left = "670px";
      screwTopRight.style.left = "670px";
      glasBreakTopRight.style.left = "630px";
    }
    if (window.innerWidth <= 900) {
      divFrameRight.style.position = "relative";
      divFrameRight.style.left = "5px";
    }
  }
}
;
window.glob = new Glob();

/**
* Create a global accessible status <code>allowed</code> dictionary.
* Request Flask endpoint for the html and animation settings on/off.
* Change icon color for special setting <code>cpuUtilisation</code>.
* Switched with Tools/Config menu and CPU icon.
*/
function configEisenradioHtmlSetting() {
  let req = $.ajax({
    type: 'GET',
    url: "/tools_radio_config_get",
    cache: false
  });

  req.done(function (data) {
    htmlSettingsDictGlobal = data.configEisenradioHtmlSetting

    let cpuDict = {};  //
    if (htmlSettingsDictGlobal["cpuUtilisation"]) {
      cpuDict["cpuHotMarker"] = { "fill": "#FF8080" };  // red
    } else {
      cpuDict["cpuHotMarker"] = { "fill": "#00FF00" };  // green
    }
    svgTC.svgEditPath(cpuDict, svgTC.imgDict["degrade"]);
    document.getElementById('cpuImage').src = svgTC.imgDict["degrade"].image.src;
  });
}
;
/**
* Enable audio for the page.
* Gain node for louder output.
* Need two analyzer nodes. Background tesla coils, foreground TV.
*/
function setAudioContextVisual() {
  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  analyserNodeOne = audioContext.createAnalyser();
  /* if parallel animation must calculate different fftSize */
  analyserNodeTwo = audioContext.createAnalyser();
  audioSource = audioContext.createMediaElementSource(audio);
  audioSource.connect(analyserNodeOne).connect(gainNode).connect(audioContext.destination)
  audioSource.connect(analyserNodeTwo); // get the data copy for analyzer in foreground
  window.infSpeaker = new PowerSwitch({ path: document.querySelectorAll("#gSvgSpeakerFlatWaves path") });// animate speaker dynamic fake waves
}
;
/**
* Audio volume slider.
*/
function setAudioVolume() {
  audio.volume = audioVolumeController.value / 100;
}
;
/**
* Audio gain slider.
*/
function setAudioGain() {
  gainNode.gain.value = audioGainController.value;
}
;
/**
* JS blackbox audio element reload.
* Test various settings to load faster and without disruptions here.
* Flask endpoint sends different streams with different content-type.
*/
function reloadAudioElement(newAudioSource) {
  audio.src = "";
  audio.currentTime = 0;
  // audio.srcObject = null; // test 2 days
  audio.src = newAudioSource;  // Flask endpoint url
  audio.load();

  let playPromise = audio.play();    // must check status, else DOM promise error in log
  if (playPromise !== undefined) {
    playPromise.then(function () {
      // "Automatic playback started!"
    }).catch(function (error) {
      // "Automatic playback failed."
    });
  }
}
;
/**
* Create a random positive or negative.
* @return a random number of value one positive or negative
*/
function randomOne() {
  return Math.random() >= 0.5 ? 1 : -1;
}
;
/**
* Feed endpoint with timer value of user choice to end the app.
*/
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
/**
* Endpoint called to get status of timer.
*/
function updateMasterProgress() {
  /*
   * get calculated percent value for progress bar to show
   */
  let req = $.ajax({
    type: 'GET',
    url: "/index_posts_percent",
    cache: false,
  });

  req.done(function (data) {
    let percent = '';
    let runner = document.getElementById("progressbarTimerRuner")
    percent = data.result;

    if (percent === 0) {
      runner.style.width = "25%";
      runner.innerHTML = "Off";
    }
    if (percent !== 0) {
      runner.style.width = percent + "%";
      let timeLeft = timerEndGet( {percent: percent, hours: data.timer} );
      runner.innerHTML = "<span style='font-family: Roboto, Helvetica, Arial;'>" + timeLeft + "<span>";
      if (percent >= 100) {
        window.location.href = "/page_flash";
      }
    }
  });
}
;
function timerEndGet(opt) {
  const hoursLeft = opt.hours - ((opt.percent / 100) * opt.hours);
  let n = new Date(0,0);
  n.setSeconds(+hoursLeft * 60 * 60);
  return n.toTimeString().slice(0, 8)
}
;
/**
* Endpoint sets a dark mode cookie exercise.
* Could use the SQLite database for that.
*/
function setDarkMode() {
  let req;
  req = $.ajax({
    type: 'GET',
    url: "/cookie_set_dark",
    cache: false
  });
}
;
/**
* Endpoint deletes a dark mode cookie exercise.
*/
function delDarkMode() {
  let req;
  req = $.ajax({
    type: 'GET',
    url: "/cookie_del_dark",
    cache: false
  });
}
;
/**
* Enable show radio name dl folder in title display after recorder selection.
*/
function downloadDirGet() {
  let req = $.ajax({
    type: 'GET',
    url: "/download_dir_get",
    cache: false,
  });
  req.done(function (data) {
    downloadDir = data.downloadDirGet;
  });
}
;
/**
* Dispatcher style function call to change dark mode scheme.
*/
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
/**
* Change dark mode scheme.
* Set CSS global variables.
* Trigger scheme change functions of animations.
* @param {String} vas - black or white scheme
*/
function setColor(val) {
  /* Exercise complete toolbox of ajax request response (success, error, complete, request.done)
  */
  let req;
  var desiredColor = undefined;
  // from html switch button
  if (val === 'white') { desiredColor = 'white'; }
  if (val === 'black') { desiredColor = 'black'; }
  // from page load ready
  if (val === 'requestTheCookie') { desiredColor = "cookieRequest"; }

  req = $.ajax({
    type: 'GET',
    url: "/cookie_get_dark",
    cache: false,
    success: function (response) {
      /// console.log(response);
    },
    error: function () {
      // console.log("error in setColor()");
    },
    complete: function () {
      // console.log('callFunctionAfterAjaxCallComplete()');
    }
  });
  req.done(function (data) {
    // let listenerId = data.listenerId;
    // server response with darkMode cookie setting
    let moon = "&#127769";
    let sun = "&#127774";
    let darkMode = data.darkmode;
    let color;

    if ((desiredColor === "cookieRequest")) {
      if ((darkMode === 'darkmode')) { color = 'black'; } else { color = 'white'; }
    }
    if ((desiredColor === "black")) { color = 'black'; }
    if ((desiredColor === "white")) { color = 'white'; }

    var bodyStyles = document.body.style;
    if (color === 'black') {
      bodyStyles.setProperty('--background-color', 'rgba(26,26,26,1)');
      bodyStyles.setProperty('--hr-color', '#777777');
      bodyStyles.setProperty('--border-color', '#202020');
      bodyStyles.setProperty('--timerProgressOpacity', '0.5');
      bodyStyles.setProperty('--ghettoDataColor', 'ivory');
      bodyStyles.setProperty('--customTxtColor', 'coral');
      bodyStyles.setProperty('--canvasMaster', 'rgba(26,26,26,0.85)');

      setDarkMode();    // cookie
      let sunIcon = document.getElementById('darkModeIcon').innerHTML = sun;
    }
    if (color === 'white') {
      bodyStyles.setProperty('--background-color', '#ccc');

      bodyStyles.setProperty('--hr-color', '#eee');
      bodyStyles.setProperty('--border-color', '#fff');
      bodyStyles.setProperty('--timerProgressOpacity', '1');
      bodyStyles.setProperty('--ghettoDataColor', 'ivory');
      bodyStyles.setProperty('--customTxtColor', 'black');
      bodyStyles.setProperty('--canvasMaster', '#ccc');    // rgba(240, 240, 240, 0.85)

      delDarkMode(); // del cookie
      document.getElementById('darkModeIcon').innerHTML = moon;

    }

    switchModeThemes();
    switchModeSpeaker();
    switchModeScrewHeads();  // DOM elem monitor screw heads
  });
}
;
/**
* Themes with dark mode switching.
*/
function switchModeThemes() {
  if(activeTheme === "Arctic") {
    foreBackGround.clearAll();
    switchModeCloudsIce();
    switchModeIceFloe();
    switchModeSeaSky();   // called also in themeInitArctic
  }
}
;
/**
* Request endpoint for current listener stream header and show available information on page.
*/
function headerInfo() {
  /*
  * writes extracted header information to html bit rate, web site, genre ..., except if idle or playlist is on
  */
  if (activeRadioName === "Eisen" || activeRadioName === "Playlist") return;

  let name = activeRadioName;
  let req = $.ajax({
    type: 'POST',
    url: "/header_info",
    cache: false,
    data: { "name": name }
  });

  req.done(function (data) {
    if (data.header_result !== "-empty-") {
      let darkBody = getBodyColor();
      let headerDict = data.header_result;
      let response_time = headerDict["request_time"];
      let suffix = headerDict["request_suffix"];
      let genre = headerDict["request_icy_genre"];
      let station_name = headerDict["request_icy_name"];
      let station_id = headerDict["request_icy_view"];
      let bit_rate = headerDict["request_icy_br"];
      let icy_url = headerDict["request_icy_url"];
      let current_song = headerDict["current_song"];

      document.getElementById('request_time').innerText = "" + response_time + " ms";
      document.getElementById('request_suffix').innerText = "" + suffix;
      document.getElementById('request_icy_br').innerText = "" + bit_rate + " kB/s";
      document.getElementById('icy_name').innerText = "" + station_name;
      document.getElementById('request_icy_url').innerText = "" + icy_url;
      // need a value for url to click
      document.getElementById('request_icy_url').value = "" + icy_url;
      document.getElementById('titleDisplay').innerText = "" + current_song;
      // let modGenre = unifyGenre(genre);  // white space replace \n   // where to put genre now?
      // document.getElementById('request_icy_genre').innerHTML = modGenre.replace(/ /g, "\n");
    }
  });
}
;
/**
* Radio stations decide free style genre description string formats.
* We allow, extract, only three strings to keep the display clean.
* @return string of maximum three strings
*/
function unifyGenre(searchString) {
  let str = searchString.replace(/,/g, ' ').replace(/-/g, ' ');
  let splitList3 = str.split(' ');
  let outString = '';
  for (let index = 0; index <= splitList3.length - 1; index++) {
    outString += splitList3[index] + ' ';
    if (index > 2) break;
  }
  return outString;
}
;
/**
* Base function to request the current color scheme, dark mode preferred.
* @return true if dark ``rgb(26, 26, 26)``, hsl(0,0%,10%) ``10% light``
*/
function getBodyColor() {
  let bodyStyle = window.getComputedStyle(document.body, null);
  let backgroundColor = bodyStyle.backgroundColor;
  let darkBody;
  if (backgroundColor === 'rgb(26, 26, 26)') {
    darkBody = true;
  } else { darkBody = false; }
  return darkBody;
}
;
/**
* Random integer.
* @param {int} min - minimum
* @param {int} max - maximum
* @return random int between and inclusive min and max integer
*/
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
;
/**
* Show or hide a loader icon.
* @param {Boolean} enabled - true or false
*/
function loaderAnimation(enabled) {
  /* arg: enabled is true or false to start stop the loader animation */
  let darkBody = getBodyColor();
  if (darkBody) {
    if (enabled) { document.getElementById('divLoaderAnimationThreeNiceGuys').style.display = "block"; }
    if (!enabled) { document.getElementById('divLoaderAnimationThreeNiceGuys').style.display = "none"; }
  }
  else {
    if (enabled) { document.getElementById('divLoaderAnimationBright').style.display = "block"; }
    if (!enabled) { document.getElementById('divLoaderAnimationBright').style.display = "none"; }
  }
}
;
/**
* Trigger endpoint to store status variable if degradation is used.
* Callback <code>configEisenradioHtmlSetting</code> function to inform
* <code>svgAnimationMain</code> about the new status.
*/
function degradeAnimationsSet() {
  let req = $.ajax({
    type: 'GET',
    url: "/degrade_animation_level_set",
    cache: false,
  });

  req.done(function (data) {
    setTimeout(function () {
      configEisenradioHtmlSetting(); // get the value for cpu high/low 1/0, write new "htmlSettingsDictGlobal"
    }, 5);
  });
}
;
/**
* Trigger endpoint to get status if app is using blacklist feature.
* Callback sets color of blacklist icon.
*/
function blacklistEnableGet() {

  let req = $.ajax({
    type: 'GET',
    url: "/blacklist_enabled_get",
    cache: false,
  });

  req.done(function (data) {

    setTimeout(function () {
      let blacklistOn = data.blacklistEnableGet;
      let blDct = {};
      if (blacklistOn) {
        blDct["blacklistOff"] = { "fill-opacity": "0" };
        blDct["blacklistBlueParking"] = { "fill-opacity": "1" };
        blDct["blacklistNoParking"] = { "fill-opacity": "1" };
      } else {
        blDct["blacklistOff"] = { "fill-opacity": "1" };
        blDct["blacklistBlueParking"] = { "fill-opacity": "0" };
        blDct["blacklistNoParking"] = { "fill-opacity": "0" };
      }
      svgTC.svgEditPath(blDct, svgTC.imgDict["blackList"]);
      document.getElementById('blacklistImage').src = svgTC.imgDict["blackList"].image.src;
    }, 5);
  });
}
;
function loadSvgSymbol() {
  return new Promise(function(resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/svg_symbol_get');
    xhr.onload = function () {
      var data = xhr.responseText;  // or xhr.responseXML SVG is a subset XML
      if (xhr.status === 200) {
      // If successful, resolve the promise by passing back the request response
        resolve(xhr.response);

      } else {
      // If it fails, reject the promise with a error message
        cl("loadSvgSymbol failed onload")
        reject(Error('Image didn\'t load successfully; error code:' + xhr.statusText));

      }
    };

    xhr.onerror = function() {
    // Also deal with the case when the entire request fails to begin with
    // This is probably a network error, so reject the promise with an appropriate message
        cl("loadSvgSymbol failed onerror")
        reject(Error('There was a network error.'));
    };

    xhr.send();
  });
}
;
