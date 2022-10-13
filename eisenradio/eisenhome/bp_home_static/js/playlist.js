/* Playlist
 * works if a browser can play a file type, also mixed files
 * Functions
 * ---------
 *      playLocalSkipForward() - set event listener on forward tab, redraw list, call next title
 *      playLocalSkipBack()    -                       backward tab
 *      nextPlayListTitle(localPlayList) - player function, show title, waits and load next title on end
 *      displayLocalPlayListEnableDeactivateListenBtn() - disable an active radio listen connection
 *      displayLocalPlayListEnable()  - draws playlist elements
 *      displayLocalPlayListDisable() - removes all drawn playlist elements and clears variables to default
 *      playLocalAudio() - creates the playlist list and call nextPlayListTitle() to play the first title
 *      playListAnimationStop() - calls stopVisualise() to stop all animation frames, hides playlist
 *      removeElementFromParent(elementId) - remove playlist title div element
 *      divListMaker(parentDiv, divIdTag, listElemText) - create a title list item as a div to be able to colorize it
 *      markPlayedFileOfPlayList(searchedFileName) - mark last title and remove it from playlist
 *      update_file_list = function () {} - HTML called: delete old list and calls divListMaker() to draw the list
 *      shuffle_array(array) - /
 */

function playLocalSkipForward(){
        $("#nextBtn").on('click', function () {
            if(trackGlobalNumber == (localPlayList.length - 1)){return;}

            const divFileList = document.getElementById('file_list');
            deactivateAudioElement();

            if(trackGlobalNumber < localPlayList.length){
                // clean up div element
                while (divFileList.firstChild) {
                    divFileList.removeChild(divFileList.lastChild);
                }
                // redraw the list with remaining titles
                let showText = "Track count and titles (if shuffled, in that order): "  + localPlayList.length;
                divIdTag = playListHeadText;
                divListMaker(divFileList, divIdTag, showText);
                for (let i = trackGlobalNumber; i < localPlayList.length; ++i) {
                    divIdTag = localPlayList[i].name;
                    let fakeListElement = "• " + localPlayList[i].name;
                    divListMaker(divFileList, divIdTag, fakeListElement);
                }

                markPlayedFileOfPlayList(localPlayList[trackGlobalNumber].name);
                trackGlobalNumber++;
                nextPlayListTitle(localPlayList);
            }
        });
}
;
function playLocalSkipBack(){
        $("#prevBtn").on('click', function () {
            if(trackGlobalNumber == 0){return;}

            const divFileList = document.getElementById('file_list');
            deactivateAudioElement();

            if((trackGlobalNumber <= localPlayList.length) && (trackGlobalNumber > 0)){
                // clean up div element
                while (divFileList.firstChild) {
                    divFileList.removeChild(divFileList.lastChild);
                }
                // redraw the list with remaining titles
                let showText = "Track count and titles (if shuffled, in that order): " + localPlayList.length;
                divIdTag = playListHeadText;
                divListMaker(divFileList, divIdTag, showText);
                // must go back one index num from current and draw original partial list from there
                for (let i = (trackGlobalNumber - 1); i < localPlayList.length; ++i) {
                    divIdTag = localPlayList[i].name;
                    let fakeListElement = "• " + localPlayList[i].name;
                    // divListMaker(parentDiv, divIdTag, listElemText)
                    divListMaker(divFileList, divIdTag, fakeListElement);
                }
                trackGlobalNumber--;
                nextPlayListTitle(localPlayList);
            }
        });


}
;
function nextPlayListTitle(localPlayList){
/* the player
 * plays one after another, until end
 * shows an icon to identify title (file) in the list
 * calls markPlayedFileOfPlayList() to remove played title from list
 */
        const locPlayListCurTitleDisplay = document.getElementById("playlist_title");
        var playedTitleListText;
        if (trackGlobalNumber < localPlayList.length) {

            playedTitleListText = document.getElementById(localPlayList[trackGlobalNumber].name);
            /* a hand icon helps finding the current line in a big list, also to show that is is 'really' shuffled */
            playedTitleListText.innerText = "👉️ " + localPlayList[trackGlobalNumber].name

            // show title in input type="text"
            locPlayListCurTitleDisplay.value = localPlayList[trackGlobalNumber].name;
            // the (only) way to load the stuff without dumping it into a buffer
            audio.src = URL.createObjectURL(localPlayList[trackGlobalNumber]);
            let isPlayList = true;
            // sit in until finished playing
            reloadAudioElement(audio.src, isPlayList);
        } else {
            displayLocalPlayListDisable();
            return;
            }
        audio.onended = function () {
            // get rid of the hand
            playedTitleListText.innerText = localPlayList[trackGlobalNumber].name
            //change color of played filename
            markPlayedFileOfPlayList(localPlayList[trackGlobalNumber].name);
            trackGlobalNumber++;
            nextPlayListTitle(localPlayList);
        }
}
;

function displayLocalPlayListEnableDeactivateListenBtn() {
/* get listen button id and press button to deactivate it, if it is active
 * can not split function, async call, one action
 */
    let req = $.ajax({
        type: 'GET',
        url: "/listen_info",
        cache: false
    });
    req.done(function (data) {
        if (data.listen_btn_id.length > 0) {
            let btn = data.listen_btn_id;
            console.log('playlist - stop active button: ' + btn);
            $("#" + btn).click();
            currentRadioName.innerText = "local playlist";
        }
    });
}
;

function displayLocalPlayListEnable(){
/* draws all elements of the playlist player
 * set eventListener on drawn buttons, call displayLocalPlayListEnableDeactivateListenBtn()
 */
    trackGlobalNumber = 0;
    localPlayList.splice(0,localPlayList.length);
    lastAudioSrcGlobal = audio.src;
    lastAudioRadioGlobal = currentRadioName.innerText;

    displayLocalPlayListEnableDeactivateListenBtn();

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    nextBtn.style.display = "block";
    nextBtn.style.cursor = "pointer";
    prevBtn.style.display = "block";
    prevBtn.style.cursor = "pointer";

    const locPlayListCurTitleDisplay = document.getElementById("playlist_title");
    const hrElemPlayListSection = document.getElementById("playlist_section");
    locPlayListCurTitleDisplay.style.display = "block";
    hrElemPlayListSection.style.display = "block";

    currentRadioName.style.cursor = "pointer";
    currentRadioName.style.cursor = "hand";

    $("#currentRadioName").on('click', function () {
        document.getElementById('file_list').scrollIntoView({ behavior: "smooth" });
    });
    playLocalSkipForward(false);
    playLocalSkipBack(false);
}
;

function displayLocalPlayListDisable(){
/* removes all drawn playlist elements and clears variables to default */
    if(lastAudioRadioGlobal === undefined){return false;}

    const divFileList = document.getElementById('file_list');
    // clean up div element
    while (divFileList.firstChild) {
        divFileList.removeChild(divFileList.lastChild);
    }
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";

    const locPlayListCurTitleDisplay = document.getElementById("playlist_title");
    const hrElemPlayListSection = document.getElementById("playlist_section");
    locPlayListCurTitleDisplay.style.display = "none";
    hrElemPlayListSection.style.display = "none";

    $("#nextBtn").unbind()
    $("#prevBtn").unbind()
    markPlayedFileOfPlayList(playListHeadText);

    lastAudioSrcGlobal = undefined;
    lastAudioRadioGlobal = undefined;
    return true;
}
;


function playLocalAudio() {
/* called by event listener of file upload input
 * clones the upload file list, can not work with the original is not an array, object foo bar stuff
 * creates the playlist list and call nextPlayListTitle() to play the first title
 */
        displayLocalPlayListEnable();

        const files = this.files;
        const clone_files = [...files];
        const audio = document.getElementById("audioWithControls");
        const checkbox_shuffle = document.getElementById('checkbox_shuffle');

        let fileListOrgIndexOrder = [];
        for (let i = 0; i < fileUpload.files.length; i++) {
            fileListOrgIndexOrder.push(fileUpload.files[i]);
        }

        localPlayList = fileListOrgIndexOrder // for non shuffled
        if (checkbox_shuffle.checked) {
            // localPlayList = shuffle_array(fileListOrgIndexOrder);    // destroys fileListOrgIndexOrder org.
            localPlayList = shuffle_array(clone_files);
        }
        // console.log(fileListOrgIndexOrder);
        // console.log(localPlayList);
        nextPlayListTitle(localPlayList, true);
}
;

function playListAnimationStop(){
    // stop all animations
    stopVisualise();
    // hide div and canvas
    divPl = document.getElementById('divPlayListAnimation');
    divPl.style.display = "none";
}
;

function removeElementFromParent(elementId){
/* catch error if div is in state of being deleted, means div with desired name exists yet */
    try {
        elementId.parentNode.removeChild(elementId);
    } catch (error) {}
}
;

function divListMaker(parentDiv, divIdTag, listElemText){
/* append child div elements to parent
 * Important: createTextNode is NOT useful, an urban tale from StackUnderFlow and many tutorial sites
 *   we can append whatever elements we need, p, innerHTML, innerText, table
 */
    let div = document.createElement('div');
    div.id = divIdTag;
    parentDiv.appendChild(div);
    div.appendChild(document.createTextNode(listElemText)); // this line works, that is all
}
;

function markPlayedFileOfPlayList(searchedFileName){
/* mark played files and delete them from play list, remove the whole div with text to generate some visual action */
    let divWithFileName = document.getElementById(searchedFileName);
    try {
        divWithFileName.style.color = "red";
    } catch (error) {return;}
    divWithFileName.animate(fadeIn, faderPulseTiming);
    setTimeout(function () {
        removeElementFromParent(divWithFileName);
    }, 10000);
}
;

update_file_list = function () {
/* target: stack multiple div elements with a text line on each to draw a list of FileUploadObject file names
 *   as a playlist
 * HTML to have the (not so good) names:
 * Todo rename elements on playlist rewrite
 *         <form id="form_play_local" enctype="multipart/form-data">
 *         <label class="secondary_action_buttons">
 *             <input type="file"
 *                    id="fileUpload"
 *                    onchange="update_file_list()"
 *
 * shown in html (init, display: none)
 * <div class="playlist_title">
 *     <div class="divStationDisplay">
 *
 * make named div with fake list elem to preserve old layout
 * a dict is used to preserve the index numbers of audio file list,
 *   same strategy used in Python with blacklists
 * if playlist shuffle is chosen we can read the div id from dict value field
 * if compared with the current loaded audio file, remove played files from fake list, then remove the whole div
 *  to keep the display cleaner if large amount of files are displayed
*/

    var fileUploadInput = document.getElementById('fileUpload');
    const divFileList = document.getElementById('file_list');
    // clean up div element
    while (divFileList.firstChild) {
        divFileList.removeChild(divFileList.lastChild);
    }

    // show playListHeadText
    let showText = "Track count: " + fileUploadInput.files.length;
    divIdTag = playListHeadText;
    divListMaker(divFileList, divIdTag, showText);
    // draw all fakeListElement s
    for (let i = 0; i < fileUploadInput.files.length; ++i) {
        divIdTag = fileUpload.files.item(i).name;
        let fakeListElement = "• " + fileUploadInput.files.item(i).name;
        divListMaker(divFileList, divIdTag, fakeListElement);
    }
}
;

function shuffle_array(array) {
/*
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
;