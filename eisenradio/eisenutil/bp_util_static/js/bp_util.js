/* utils route
 * to add a tools menu:
 *   tools html add header with onclick="...Show() function;"
 *   css: hide #mainDiv under <section>
 *
 * const faderTiming     - fade the display of tools headlines
 * callLoaderAnimation() - show loader animation between tools and server interaction
 * stopLoaderAnimation() - /
 * logHeadLineStyle(divIdTag) - colorize log entries for better reading
 * configEisenradioUpdate()   - check boxes to reduce cpu, gpu for low end (here can disable ALL animations for no gpu)
 * aacRepairPullLog() - log button, print acp repair result on html
 * divConfirmDialog(divId, action) - abstracted function to show/hide all kinds of confirmation dialogs
 * drawFileUploadObjectList(fileUploadInput, divFileListId, listHeadText) - draw a files uploaded list from multi file select dialog
 * divListMaker(parentDiv, divIdTag, listElemText) - the list creator
 * autoClickButton(callerId) - heavyliy used to click hidden default buttons and change text on the caller button
 * divShowExportUrls()       - radio select options use simply show/hide another div, show Export URLs choice
 * divShowExportBlacklists() - /
 * divShowImportUrls()       - /
 * divShowImportBlacklists() - /
 * aacpRepairDivShow()       - /
 * monitorRecordsShow()      - /
 * exportShow()              - onClick un-hide the export div, headlines are clickable,
 * importShow()              - /
 * deleteShow()              - /
 * configEisenradioShow()    - /
 * moveHeadLineToLeftOrMiddle(divElem, headLine) - move a headline after click and animate it
 * showOrHideToolIfHeadlineClicked(showDiv, divHeadLine) - called by functions to do the show/hide, style work
 * delFromBlacklist(counter, radioName) - check boxes tell server to del items or the whole blacklist, returns a colorized log
 */

const div_toolsExportUrl = document.getElementById("div_toolsExportUrl");
const div_toolsExportTracLists = document.getElementById("div_toolsExportTracLists");
const div_toolsImport = document.getElementById("div_toolsImport");
const div_toolsImportTraceLists = document.getElementById("div_toolsImportTraceLists");
const scroll_top = document.getElementById("scroll_top");
const fadeIn = [
    { opacity: 0 },
    { opacity: 1 }
];
const faderTiming = {
    duration: 1000,
    iterations: 1
};
const headLine3backColor = '#C8C8C8';
const fileUploadAcpRepair = document.getElementById("fileUploadAcpRepair");
const fileUploadUrls = document.getElementById("fileUploadUrls");

function callLoaderAnimation() {
    divConfirmDialog('divLoaderAnimationThreeNiceGuys', 'block');
}
;
function stopLoaderAnimation() {
    divConfirmDialog('divLoaderAnimationThreeNiceGuys', 'none');
}
;
function logHeadLineStyle(divIdTag) {
    /* color the important log entries, to better understand what was going on */
    let headLine = document.getElementById(divIdTag);
    headLine.style.backgroundColor = "coral";
    headLine.style.color = "white";
    headLine.style.textAlign = "center";
    headLine.style.marginLeft = "1em";
    headLine.style.marginRight = "1em";
}
;
function configEisenradioUpdate() {
    /* switch settings to reduce energy, cpu, gpu and fun for low end devices
    
    get a nice log response;
    */
    let animationOfEisenRadio = false;
    let styleOfEisenRadio = false;
    let animationOfSpeaker = false;
    let animationOfBalloon = false;
    let animationOfFrontPigs = false;
    // key: elementId, value: bool
    let checkBoxDict = {
        "checkboxConfigAnimation": animationOfEisenRadio,
        "checkboxConfigStyle": styleOfEisenRadio,
        "checkboxConfigFrontPigs": animationOfFrontPigs,
        "checkboxConfigBalloon": animationOfBalloon,
        "checkboxConfigFlatSpeaker": animationOfSpeaker,
        "checkboxConfigStyle": styleOfEisenRadio,
    };

    let categoryMasterAnimation = document.getElementById("checkboxConfigAnimation");
    // all elements set false
    for (let index = 0; index <= Object.keys(checkBoxDict).length - 1; index++) {
        let element = document.getElementById(Object.keys(checkBoxDict)[index]);  // list of all dict index names
        element.disabled = true;                                                  // html checkBoxes disabled, no more input
        if (!categoryMasterAnimation.checked) {
            if ((Object.keys(checkBoxDict)[index] == "checkboxConfigStyle")) {
                if (element.checked) {                                         // checkBox checked
                    checkBoxDict[Object.keys(checkBoxDict)[index]] = true;   // set variable
                }
            }

        } else {
            if (element.checked) {                                         // checkBox checked
                checkBoxDict[Object.keys(checkBoxDict)[index]] = true;   // set variable
            }
        }
    }

    callLoaderAnimation();

    let req = $.ajax({
        type: 'POST',
        url: "/tools_radio_html_settings",
        cache: false,
        data: checkBoxDict
    });
    req.done(function (data) {
        stopLoaderAnimation();

        let response = data.configEisenradioUpdate;
        console.log(response);
        if (response.length == 0) { return; }

        // prepare list writing with each line is a div
        let parentDiv = document.getElementById('configEisenradioCheckBoxDiv');
        let divIdTag = "Webserver (Python Flask) log";
        let fakeListElement = divIdTag;
        divListMaker(parentDiv, divIdTag, fakeListElement);
        let headLine = document.getElementById(divIdTag);
        logHeadLineStyle(divIdTag);

        response.forEach(function (line) {
            divIdTag = line;
            fakeListElement = line;
            divListMaker(parentDiv, divIdTag, fakeListElement);
        })
    });
}
;

function aacRepairPullLog() {
    /* log button, print acp repair result on html */

    // call loader Animation
    callLoaderAnimation();
    let req = $.ajax({
        type: 'GET',
        url: "/tools_aacp_repair_log",
        cache: false
    });
    req.done(function (data) {
        // disable loader Animation
        stopLoaderAnimation();
        let aacLog = data.aacRepairPullLog
        console.log(aacLog)
        if (aacLog.length == 0) { return; }
        // unhidden parent div for list of div
        let resultDialog = document.getElementById("divShowResultAcpRepair");
        resultDialog.style.display = "block";

        // prepare list writing with each line is a div
        let parentDiv = document.getElementById('idDivResultTextAcpRepair');
        let divIdTag = "Webserver (Python Flask) log";
        let fakeListElement = divIdTag;
        divListMaker(parentDiv, divIdTag, fakeListElement);
        let headLine = document.getElementById(divIdTag);
        logHeadLineStyle(divIdTag);

        aacLog.forEach(function (line) {
            divIdTag = line;
            fakeListElement = line;
            divListMaker(parentDiv, divIdTag, fakeListElement);
        })
    });
}
;
function divConfirmDialog(divId, action) {
    document.getElementById(divId).style.display = action;
}
;
function drawFileUploadObjectList(fileUploadInput, divFileListId, listHeadText) {
    /* target: reusable function tool to draw a files uploaded list from multi file select dialog
     * shows a file count and file(s) selected before upload btn press (acp repair, import list, import ini ...)
     *   stack multiple div elements with a text line on each to draw a list of FileUploadObject file names
     *   works like the list view for the local playlist (other route, home)
     *   each div has an id so we can change single text lines on the fly easily if needed
     * - the "change" event listener of [input file upload] element calls this function
     * Event listener for Tools page implemented in
     *     divShowImportUrls()
     *     divShowImportBlacklists()
     *     aacpRepairDivShow()
     * Args
     *     fileUploadInput -  [input file upload] <input type="file" id="fileUploadBlackLists" ...
     *     divFileListId   -  div element used as parent for list of divs <div id="divShowUploadFilesBlackLists"></div>
     *     listHeadText    -  string to set list info, "file name and count: " (plus number of list items)
    */
    const divFileList = document.getElementById(divFileListId);
    // clean up div parent before drawing
    while (divFileList.firstChild) {
        divFileList.removeChild(divFileList.lastChild);
    }
    // show listHeadText
    let showText = listHeadText + fileUploadInput.files.length
    divIdTag = divFileList + "__"
    divListMaker(divFileList, divIdTag, showText);
    // draw all fakeListElement s
    for (let i = 0; i < fileUploadInput.files.length; ++i) {
        divIdTag = divFileList + "_" + i;
        let fakeListElement = "• " + fileUploadInput.files.item(i).name;
        divListMaker(divFileList, divIdTag, fakeListElement)
    }
}
;
function divListMaker(parentDiv, divIdTag, listElemText) {
    /*
     * append child div elements to parent, should contain text; also div.innerHTML possible
     */
    let div = document.createElement('div');
    div.id = divIdTag;
    div.innerText = listElemText;
    parentDiv.appendChild(div);
}
;
function autoClickButton(callerId) {
    /* Click an id, change text of the calling button
     * arg callerId - id of calling button, caller_btnToClickId_done
     */
    let lstCaller = callerId.split("_")
    let clickId = lstCaller[1]
    let btnText = lstCaller[2]
    document.getElementById(clickId).click();
    if (btnText == ".") {
        return;
    } else {
        document.getElementById(callerId).innerText = "press " + btnText;
    }
}
;
function divShowExportUrls() {
    /*Show Export URLs choice*/
    div_toolsExportUrl.style.display = "block";
    div_toolsExportTracLists.style.display = "none";
}
;
function divShowExportBlacklists() {
    /*Show Export blacklists selection*/
    div_toolsExportUrl.style.display = "none";
    div_toolsExportTracLists.style.display = "block";
}
;
function divShowImportUrls() {
    /* Show Import URLs selection
     *
     * INI file with radio urls, show import file upload button and submit (Import) button
     *  add Event Listener to file upload
     */
    div_toolsImport.style.display = "block";
    div_toolsImportTraceLists.style.display = "none";

    fileUploadUrls.addEventListener('change', function () {
        drawFileUploadObjectList(fileUploadUrls, "divShowUploadFilesUrls", "file count: ");
    });
}
;
function divShowImportBlacklists() {
    /* Show Import Blacklists selection
     * Blacklists show import file upload button and submit (Import) button
     * add Event Listener to file upload
     */
    div_toolsImport.style.display = "none";
    div_toolsImportTraceLists.style.display = "block";

    fileUploadBlackLists.addEventListener('change', function () {
        drawFileUploadObjectList(fileUploadBlackLists, "divShowUploadFilesBlackLists", "file count: ");
    });
}
;

function aacpRepairDivShow() {
    /*Show aac plus file repair tool
     * add Event Listener to file upload
     */
    const showDiv = document.getElementById("aacpRepairDiv");
    const headLine = document.getElementById("aacpRepairHeadline");
    const divHeadLine = document.getElementById("divAacpRepairHeadline");
    showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }

    fileUploadAcpRepair.addEventListener('change', function () {
        drawFileUploadObjectList(fileUploadAcpRepair, "divShowUploadFilesAcpRepair", "file count: ");
    });
}
;
function monitorRecordsShow() {
    /* show "Monitor Recordings" Tool
     *  show Blacklist tracking tool enable and button for overview of all blacklist pages available
     */
    const showDiv = document.getElementById("monitorRecordsDiv");
    const headLine = document.getElementById("monitorRecordsHeadline");
    const divHeadLine = document.getElementById("divMonitorRecordsHeadline");
    showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }
}
;
function exportShow() {
    /* Show "Export" tools section */
    const showDiv = document.getElementById("exportDiv");
    const headLine = document.getElementById("exportHeadline");
    const divHeadLine = document.getElementById("divExportHeadline");
    const defaultSelected = document.getElementById("toolsExpURL");
    let visible = showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    if (visible) {
        defaultSelected.checked = "true";
        divShowExportUrls();     // show default div with btn
    }
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }
}
;
function importShow() {
    /*Show "Import" tools section*/
    const showDiv = document.getElementById("importDiv");
    const headLine = document.getElementById("importHeadline");
    const divHeadLine = document.getElementById("divImportHeadline");
    const defaultSelected = document.getElementById("toolsImpURL");
    let visible = showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    if (visible) {
        defaultSelected.checked = "true";
        divShowImportUrls();    // show default div with btn
    }
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }
}
;

function deleteShow() {
    /*Show "Delete" tool*/
    const showDiv = document.getElementById("deleteDiv");
    const headLine = document.getElementById("deleteHeadline");
    const divHeadLine = document.getElementById("divDeleteHeadline");
    showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }
}
;
function configEisenradioShow() {
    /*Show "config" tool */
    const showDiv = document.getElementById("configEisenradioDiv");
    const headLine = document.getElementById("configEisenradioHeadline");
    const divHeadLine = document.getElementById("divConfigEisenradio");
    showOrHideToolIfHeadlineClicked(showDiv, divHeadLine);
    let headLineLocation = moveHeadLineToLeftOrMiddle(showDiv, headLine);
    if (headLineLocation == "left") {
        divHeadLine.style.backgroundColor = headLine3backColor;
    }
}
;

function moveHeadLineToLeftOrMiddle(divElem, headLine) {
    /*Tools menu headlines are moved on click to get better separation and intuitive click experience*/
    if (divElem.style.display == "block") {
        headLine.style.textAlign = "start";
        headLine.animate(fadeIn, faderTiming);
        return "left";
    } else {
        headLine.style.textAlign = "center";
        return "center"
    }
}
;
function showOrHideToolIfHeadlineClicked(showDiv, divHeadLine) {
    /*Tools menu tools are shown or hidden on click on headline*/
    if (showDiv.style.display == "" || showDiv.style.display == "none") {
        showDiv.style.display = "block";
        divHeadLine.scrollIntoView(true);
        divHeadLine.style.marginTop = '6em';
        return true;
    } else {
        showDiv.style.display = "none";
        divHeadLine.style.backgroundColor = '#d9d9d9';
        divHeadLine.style.marginTop = '0em';
        scroll_top.scrollIntoView(true);
        divHeadLine.scrollIntoView(true);
        return false;
    }
}
;
function delFromBlacklist(counter, radioName) {
    /* tell server to del items or the whole blacklist
    */
    // disable delete Button
    const button_radio_blacklist = document.getElementById("button_radio_blacklist");
    button_radio_blacklist.disabled = true;
    // call loader Animation
    callLoaderAnimation();

    const checkbox_whole_radio_blacklist = document.getElementById('checkbox_whole_radio_blacklist');
    var delDictIndexes = {};
    var delAll = false;

    if (checkbox_whole_radio_blacklist.checked) {
        delAll = true;
        for (let i = 1; i <= counter; i++) {
            let checkBox = document.getElementById("check_radio_blacklist_" + i);
            delDictIndexes[i - 1] = checkBox.value;
        }
    } else {
        // loopIndex in template starts with 1
        for (let i = 1; i <= counter; i++) {
            let checkBox = document.getElementById("check_radio_blacklist_" + i);
            if (checkBox.checked) {
                delDictIndexes[i - 1] = checkBox.value;
            }
        }
    }
    let radioInfoDict = {
        'radio_name': radioName,
        'delAll': delAll,
        'del_dict': delDictIndexes
    }
    let req = $.ajax({
        type: 'Post',
        dataType: 'json',
        url: "/tools_radio_blacklist_del_from_list",
        cache: false,
        data: radioInfoDict
    });

    req.done(function (data) {
        // disable loader Animation
        divConfirmDialog('divLoaderAnimationThreeNiceGuys', 'none');

        // unhidden parent div for list of div
        let resultDialog = document.getElementById("divShowResultDeleteBlackList");
        resultDialog.style.display = "block";

        // prepare list writing with each line is a div
        let parentDiv = document.getElementById('idDivResultTextDeleteBlackList');
        let output;
        let divIdTag;
        let fakeListElement;

        if (delAll) {
            //var delAll from select box to delete the whole blacklist
            output = "Webserver (Python Flask) log";
            fakeListElement = output;
            divListMaker(parentDiv, divIdTag, fakeListElement);
            logHeadLineStyle(divIdTag);

            let log = data.logFileDeleteFromBlackList;
            fakeListElement = log;
            divListMaker(parentDiv, divIdTag, fakeListElement);
        }
        else {
            // del selected titles
            // java dict Object.keys is list of key names
            if (Object.keys(delDictIndexes).length > 0) {
                // Index list is not empty
                let message = Object.keys(delDictIndexes).length + " items deleted.";
                divIdTag = output;
                fakeListElement = message;
                divListMaker(parentDiv, divIdTag, fakeListElement);

                let log = data.logFileDeleteFromBlackList;
                // response log data: filter out the id of deleted indexes into a list
                let deletedTitlesIdx = [];
                let split_line;
                log.forEach(function (line) {
                    split_line = line.split(":");
                    if (split_line[0] == "index") {
                        deletedTitlesIdx.push(split_line[1]);
                    }
                }
                );
                output = "Webserver (Python Flask) log";
                divIdTag = output;
                fakeListElement = output;
                divListMaker(parentDiv, divIdTag, fakeListElement);
                logHeadLineStyle(divIdTag);

                log.forEach(function (line) {
                    split_line = line.split("^");
                    // response log data: filter out index id's from original blacklist, marked by "idx"
                    if (split_line[0] == "idx") {
                        // split_line[1] is original index id, match deleted indexes in list deletedTitlesIdx[]
                        if (deletedTitlesIdx.includes(split_line[1])) {
                            // take the whole string from log list as div.id
                            divIdTag = line;
                            // remove the 'idx' prefix from log string to get cleaner look
                            fakeListElement = split_line[1] + " " + split_line[2];
                            // append a div with the log string
                            divListMaker(parentDiv, divIdTag, fakeListElement);
                            // if found matchingIndex, mark div with different color
                            let matchingIndex = document.getElementById(divIdTag);
                            matchingIndex.style.backgroundColor = "DarkSalmon";
                        }
                        else {
                            // log strings not matching any deleted index id
                            divIdTag = line;
                            fakeListElement = split_line[1] + " " + split_line[2];
                            divListMaker(parentDiv, divIdTag, fakeListElement);
                        }
                    }
                    else {
                        // log string not from org. list; a string from removal action (altered list index ...)
                        divIdTag = line;
                        fakeListElement = line;
                        divListMaker(parentDiv, divIdTag, fakeListElement);
                    }
                }
                );
            }
        } // else delAll
    });
}
;

function transparentImageLoad() {
    /**
     * load an transparent svg image on clicking checkbox id=checkboxTransparentImage / bp_util_edit.html
     * server must response with a nice list of idle chitchat
     */
    callLoaderAnimation();
    let divTransparentImageLoad = document.getElementById("divTransparentImageLoad");
    let dataSetRadio = divTransparentImageLoad.dataset.datasetradio;  // small

    let req = $.ajax({
        type: 'POST',
        url: "/tools_transparent_image_load",
        cache: false,
        data: {"radioName": dataSetRadio}

    });
    req.done(function (data) {
        stopLoaderAnimation();

        let response = data.transparentImageLoad;
        console.log(response);

        // prepare list writing with each line is a div
        let parentDiv = document.getElementById('divTransparentImageLoad');
        let divIdTag = "Webserver (Python Flask) response";
        let fakeListElement = divIdTag;
        divListMaker(parentDiv, divIdTag, fakeListElement);
        let headLine = document.getElementById(divIdTag);
        logHeadLineStyle(divIdTag);

        response.forEach(function (line) {
            divIdTag = line;
            fakeListElement = line;
            divListMaker(parentDiv, divIdTag, fakeListElement);
        })

    });



}
;