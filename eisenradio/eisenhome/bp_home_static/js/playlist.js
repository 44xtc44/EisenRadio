"use strict";
/* Plays local sound files.
   Can move through the playlist, back and forth.
*/
class PlayList {
  constructor() {
    this.fileUpload = document.getElementById('fileUpload');
    this.detachCustomImg = document.getElementById('customImg');
    this.detachCustomTxt = document.getElementById('customTxt');
    this.detachWait = document.getElementById('divFrameRightWait');
    this.divFrameRight = document.getElementById('divFrameRight');
    this.divPlayListShow = document.getElementById('divPlayListShow');
    this.divPlayList = document.getElementById('playList');
    this.checkboxShuffle = document.getElementById("checkboxShuffle");
    this.titleDisplay = document.getElementById('titleDisplay');
    this.icyName = document.getElementById('icy_name');                 // misuse radio header display to show playlist info
    this.request_icy_url = document.getElementById('request_icy_url');  // display track count
    this.request_suffix = document.getElementById('request_suffix');    // clean display from former radio header info
    this.request_icy_br = document.getElementById('request_icy_br');    // can display file info, if flask would read file header, length
    this.request_time = document.getElementById('request_time');        // like GhettoRecorder listenWhitelist

    this.nextBtn = document.getElementById("nextBtn");
    this.prevBtn = document.getElementById("prevBtn");
    this.playBtn = document.getElementById("playBtn");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.audioIcon = document.getElementById("audioIcon");

    this.playList = [];  // get the file objects here, not only the title
    this.trackNumber = 0;
    this.fadeIn = [{ opacity: 0 }, { opacity: 1 }]; // css styling show, key frame thingy args, blackbox JS VOODOO
    this.faderPulseTiming = { duration: 1500, iterations: 5, };
  }
  reset() {
  /* free mem */
    this.playList = [];
    this.trackNumber = 0;
  }
  create() {
    // Entry point.
    this.reset();
    this.createHtmlDisplay();
    this.attachAnimation();
    this.shufflePlayList();
    this.playLocalAudio();
    this.drawButtons();
    this.addListenerButtons();
  }
  playLocalAudio() {
    let self = this;  // bind() JS VOODOO of lost context :)
    // a hand icon helps finding the current line in a big list, also to show that is is 'really' shuffled
    let showText = "👉️ " + this.playList[this.trackNumber].name;
    // we created a txt createHtmlDisplay(); display parent is "divPlayListShow" div;
    // each <track name> is shown on its own child div, this div has the div.id attribute set as <track name> to be unique
    let curTitleName = document.getElementById(this.playList[this.trackNumber].name);
    curTitleName.innerHTML = showText;
    curTitleName.style.color = "Magenta";
    this.titleDisplay.innerHTML = this.playList[this.trackNumber].name;
    this.icyName.innerHTML = "Local Playlist";
    this.request_icy_url.innerHTML = this.playList.length + " track(s)";
    this.request_suffix.innerHTML = "--";  // empty right panel
    this.request_icy_br.innerHTML = "--";
    this.request_time.innerHTML = "--";
    audio.src = URL.createObjectURL(this.playList[this.trackNumber]);
    audio.onended = function () {
      // get rid of the hand
      curTitleName.innerHTML = self.playList[self.trackNumber].name
      //change color of played filename
      self.markPlayedFile(self.playList[self.trackNumber].name);
      self.trackNumber++;
      if (self.trackNumber < self.playList.length) {
        self.playLocalAudio();  // fun recursion
      } else {
        return;
      }
    }
  }
  removeElementFromParent(elementId) {
    /* Catch error if div is in state of being deleted, means div with desired name exists yet.
       We use a dot in front in next, prev btn listener to be unique.
    */
    try {
      elementId.parentNode.removeChild(elementId);
    } catch (error) { }
  }
  markPlayedFile(fName) {
    /* Mark played files and del div from list to generate some action. */
    let self = this;
    let playedFile = document.getElementById(fName);
    try {
      playedFile.style.color = "red";
    } catch (error) { return; }
    playedFile.animate(this.fadeIn, this.faderPulseTiming);
    setTimeout(function () {
      self.removeElementFromParent(playedFile);  // JS VOODOO
    }, 10000);
  }
  shufflePlayList() {
    /* Clone the upload list. Can not re-arrange the original. */
    let fileList = this.fileUpload.files;
    // shuffle
    if (this.checkboxShuffle.checked) {
      this.playList = this.shuffleArray([...fileList]);
      return;
    }
    // regular
    for (let i = 0; i < fileList.length; i++) {
      this.playList.push(fileList[i]);
    }
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  createHtmlDisplay() {
    /* Collect all the file references from upload mask and create a list of the file names.
       Each file name gets its own div, so we can later reduce, remove the played list members.
    */
    activeRadioName = "Playlist";  // One analyzer can show a name.
    let fileUpload = this.fileUpload;
    let parent = this.divPlayListShow;
    let id = "";
    let innerHTML = "";
    let elemClass = "divChildOfPlayListShow";

    this.removeDiv({ id: parent });  // old HTML display
    for (let i = 0; i < this.fileUpload.files.length; ++i) {
      id = this.fileUpload.files[i]["name"];  // DOM needs unique id
      innerHTML = id;
      this.appendDiv({ parent: parent, id: id, id: id, elemClass: elemClass, innerHTML: innerHTML });
    }
  }
  appendDiv(opt) {
    /* Reusable fun to stack div and use the stack as a list.  */
    let div = document.createElement('div');
    div.id = opt.id;  // id of new child
    div.classList.add(opt.elemClass);
    div.innerHTML = opt.innerHTML;
    opt.parent.appendChild(div);  // parent is full path document.getElem...
  }
  removeDiv(opt) {
    while (opt.id.firstChild) {
      opt.id.removeChild(opt.id.lastChild);
    }
  }
  attachAnimation() {
    let parent = this.divFrameRight;
    let node = this.divPlayList;
    // put our custom divs where we find them later
    this.removeDiv({ id: parent });
    this.detachWait.appendChild(this.detachCustomImg);  // custom div do it with the playlist
    this.detachWait.appendChild(this.detachCustomTxt);
    // put the playlist in the right container
    parent.appendChild(node);  // detach the node from origin and add to a div destination container in DOM
    this.detachWait.style.display = "none";
    this.detachCustomImg.style.display = "none";
    this.detachCustomTxt.style.display = "none";
  }
  drawButtons() {
    /* Create buttons, style.
     */
    this.audioIcon.style.cursor = "pointer";
    this.nextBtn.style.display = "inline-block";
    this.nextBtn.style.cursor = "pointer";
    this.nextBtn.style.fontSize = "150%";
    this.prevBtn.style.display = "inline-block";
    this.prevBtn.style.cursor = "pointer";
    this.prevBtn.style.fontSize = "150%";
    this.playBtn.style.cursor = "pointer";
    this.playBtn.style.fontSize = "150%";
    this.pauseBtn.style.cursor = "pointer";
    this.pauseBtn.style.fontSize = "150%";
  }
  addListenerButtons() {
    /* Moving through playlist. */
    let parent = this.divPlayListShow;
    let id;
    let innerHTML;
    this.playBtn.addEventListener("play", (e) => {  // join play, pause with radio later
      this.playBtn.style.color = "grey";
      this.pauseBtn.style.color = "red";
    });
    this.playBtn.addEventListener("click", (e) => {
      audio.play();
      this.playBtn.style.color = "grey";
    });
    audio.addEventListener("pause", (e) => {
      this.playBtn.style.color = "red";
      this.pauseBtn.style.color = "grey";
    });
    this.pauseBtn.addEventListener("click", (e) => {
      audio.pause();
    });
    this.nextBtn.addEventListener("click", (e) => {
      /*
        The list is rebuild on every click.
      */
      let self = this;  // For me an ordered JS malfunction; Must change context inside an instance!?
      // Looks like flask.current_app, use in a factory app_context(). Change application context. How to debug this mess? Have fun :)
      if (self.trackNumber == (self.playList.length - 1)) { return; }
      if (self.trackNumber < self.playList.length) {
        // clean up div element
        while (parent.firstChild) {
          parent.removeChild(parent.lastChild);
        }
        // redraw the list with remaining titles, first header then titles in loop
        for (let i = self.trackNumber; i < self.playList.length; ++i) {
          id = self.playList[i].name;
          innerHTML = "&#8226; " + self.playList[i].name;
          self.appendDiv({ parent: parent, id: id, innerHTML: innerHTML });
        }
        self.trackNumber++;
        self.playLocalAudio();
      }
    });
    this.prevBtn.addEventListener("click", (e) => {
      let self = this;
      if (self.trackNumber == 0) { return; }
      if ((self.trackNumber <= self.playList.length) && (self.trackNumber > 0)) {
        // clean up div element
        while (parent.firstChild) {
          parent.removeChild(parent.lastChild);
        }
        // redraw the list with remaining titles
        // go back one index num from current and draw original partial list from there
        for (let i = (self.trackNumber - 1); i < self.playList.length; ++i) {
          id = self.playList[i].name;
          innerHTML = "&#8226; " + self.playList[i].name;
          self.appendDiv({ parent: parent, id: id, innerHTML: innerHTML });
        }
        self.trackNumber--;
        self.playLocalAudio();
      }
    });
  }
}
