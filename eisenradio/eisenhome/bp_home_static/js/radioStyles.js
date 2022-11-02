/* radioStyles
 * Target:
 *      create all styles in CSS, only styles that change should be manipulated here
 * Functions
 * ---------
 *      class EisenRadioStyles   - apply css styles, store info about pressed buttons, instance in ea_indes.js
 *      toggleDegradeAnimation() - show or hide animated divs to save cpu/gpu quickly, total switch off in tools menu
 *      recordRemoveGoldenDisk(radioId) - remove animation for active recording, del function (clean up) is not responsible
 */

class EisenRadioStyles{
/* instances created on window load
 * target: instance to store record, listen action information to reduce displayed animation for recording if listen is deselected
 *          to keep the app acceptable for low end devices by not applying styles, see tools/config check boxes
 * info: button can be
 *   - record
 *   - listen switch on, user pressed listen off, autoclicker off
 *
 * Instance creation: index.js -> eisenRadioCreateStyleInstances(),
 *
 *       create instance: eisenStylesDict["eisenRadio_" + radioId] = new EisenRadioStyles({radioId:radioId,radioName:radioName});
 *         buttons have ids like Listen_12 or Record_1, the digit is the radio db table id
 *         means, the button knows where it belongs to
 */
    constructor(options){
        if(options === undefined) options = {};  // just to remember
        this.radioId = options.radioId;
        this.radioName = options.radioName;
        this.listen = false;
        this.record = false;

        this.defaultAnimal = "divSvgTux_";   // "divSvgTux_" + activeListenId : full div name (div + button num)
        this.animal = this.defaultAnimal;    // update() refresh it
        this.index = 0;
        this.animalDivList = [
            "divSvgTux_",
            "divSvgPolarBear_",
            "divSvglaGata_"
            ];  // child div id have an underscore
    }
    recordStyle(){
        /* return if record switched off;
         * apply style and set true, so listen can see if it must delete the style
         */
        if(this.record === true){
            this.record = false;
            recordRemoveGoldenDisk(this.radioId);
            return;
        } else {
            /* fresh pressed btn */
            this.record = true;
            this.recordApplyStyle();
        }
    }
    listenStyle(){
        let darkBody = getBodyColor();
        if(this.listen === true){
            /* self close or autoclicker, delete all */
            deleteInfoExec(this.radioId, darkBody)
            this.listen = false;
            if(this.record === true){
                /* record is still active */
                this.recordApplyStyle();
            }
            return;
        } else {
            /* fresh pressed listen */
            this.listen = true;
            this.listenApplyStyle();
        }
    }
    basicApplyStyle(){

    console.log("basicApplyStyle..");
        /* target: reduce CPU and GPU to a minimum for low end devices
         * ONLY for checkbox STYLE de-selected, minimal style
         * remove box and text shadows; in conjunction with disabled animation we get a console app like performance again
         */
            let bodyStyle = window.getComputedStyle(document.body, null);
            document.getElementById('divRadioFrontPlate_' + this.radioId).style.minHeight = "40em";  // svg background "underlay" is 1000x1000 no resize problem
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginTop = "1em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginBottom = "1em";
            document.getElementById('gTuxStage').style.display = "none";
            /* screws */
            document.getElementById('gScrewHeadPhillipsBase').style.display = "none";
            document.getElementById('gScrewHeadPhillipsBlur').style.display = "none";
            document.getElementById('gScrewHeadPhillipsSlit').style.display = "none";
            document.getElementById('gGlasBreak').style.display = "none";
            /* pics */
            document.getElementById('divPictureRow_' + this.radioId).style.display = "inline-block";
            document.getElementById('pixies_' + this.radioId).style.display = "inline-block";
            document.getElementById('pixies_' + this.radioId).style.float = "left";
            document.getElementById('divCustomText_' + this.radioId).style.display = "inline-block";
            document.getElementById('pix_' + this.radioId).style.display = "inline-block";
            document.getElementById('pix_' + this.radioId).style.maxWidth = "20em";
            document.getElementById('pix_' + this.radioId).style.maxHeight = "15em";
            /* comment */
            document.getElementById('radioStationComment_' + this.radioId).style.display = "flex";
            /* Metrics */
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.display = "inline-block";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.border = "none";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.boxShadow = "none";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.bottom = "13.2em";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.right = "0em";
                // toggleAnimals switch hide
            document.getElementById('toggleAnimals_' + this.radioId).style.display = "none";
            /* Genre */
            document.getElementById('request_icy_genre_' + this.radioId).style.textShadow = "";
            document.getElementById('request_icy_genre_' + this.radioId).style.fontFamily = "roboto,arial";
            document.getElementById('request_icy_genre_' + this.radioId).style.fontSize = "100%";
            /* title display, moved to reduce empty space*/
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.left = "10em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.display = "inline-block";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.fontSize = "large";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.borderRadius = "1.5em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginTop = "1em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginBottom = "1em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.bottom = "8em";
            /* buttons */
            document.getElementById('divBtnAbsWrapper_' + this.radioId).style.top = "6em";
            document.getElementById('request_icy_genre_' + this.radioId).style.textShadow = "";
    }
    recordApplyStyle(){
        /* only apply changes if no listen is active */

        if(this.listen === false){
            /* record styled */

            /* Metrics, position must be reset in display del clean function */
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.display = "inline-block";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.border = "none";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.boxShadow = "none";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.bottom = "-5em";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.right = "0em";
                // toggleAnimals switch hide
            document.getElementById('toggleAnimals_' + this.radioId).style.display = "none";
            /* Genre */
            document.getElementById('request_icy_genre_' + this.radioId).style.textShadow = "";
            document.getElementById('request_icy_genre_' + this.radioId).style.fontFamily = "roboto,arial";
            document.getElementById('request_icy_genre_' + this.radioId).style.fontSize = "100%";
            /* Display, switch off shadows if listen before */
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.display = "inline-block";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.left = "15em"; // del func back to 5em
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.border = "none";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.boxShadow = "none";
        }
    }
    listenApplyStyle(){
        /* enable animation */
        if(htmlSettingsDictGlobal["checkboxConfigAnimation"]){
            document.getElementById('divAnimationContainer_' + this.radioId).style.display = "inline-block";
        }
        /* basic */
        if(htmlSettingsDictGlobal["checkboxConfigStyle"] === 0){
            this.basicApplyStyle();
        }
        /* advanced: some gpu heavy box-shadows and linear gradients */
        if(htmlSettingsDictGlobal["checkboxConfigStyle"] === 1){
            /* same setting for both dark modes
             * only dynamically changed css in javaScript to keep it as small as possible for cleanup
             */
             document.getElementById('buoyEDIT').style.fill = "#aaa";
            /* buttons must be moved "inside" the svg and later moved back by del function
             * divBtnAbsWrapper css: top0 left2, del must set top0 again
             */
            document.getElementById('divBtnAbsWrapper_' + this.radioId).style.top = "-25em";
            /* svg background "underlay" is saved as w1000xh1000 no size problem, only a piece shown
             * divRadioContainer_ has {height:100%}
             */
            document.getElementById('divMainAnimationContainer_' + this.radioId).style.height = "35em";
            document.getElementById('animatedBackGround_' + this.radioId).style.display = "inline-block";
            document.getElementById('animatedBackGround_' + this.radioId).style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px";
            /* header */
            document.getElementById('divHeaderShadow_' + this.radioId).style.position = "absolute";
            document.getElementById('divHeaderShadow_' + this.radioId).style.display = "inline-block";
            document.getElementById('divHeaderShadow_' + this.radioId).style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px";
            document.getElementById('divHeaderShadow_' + this.radioId).style.borderRadius = "1em";
            document.getElementById('divHeaderShadow_' + this.radioId).style.top = "1em";
            document.getElementById('divHeaderShadow_' + this.radioId).style.left = "5em";
            document.getElementById('divHeaderShadow_' + this.radioId).style.width = "65%";
            /* genre */
            document.getElementById('divStationGenre_' + this.radioId).style.display = "inline-block";
            /* pics */
            document.getElementById('pix_' + this.radioId).style.maxWidth = "20em";
            document.getElementById('pix_' + this.radioId).style.maxHeight = "15em";
            /* comment */
            document.getElementById('divCustomText_' + this.radioId).style.display = "inline-block";
            /* Metrics */
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.display = "inline-block";
                // position      bottom:13.2em; right:-1em;
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.bottom = "13.2em";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.right = "-1em";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.borderRadius = "1.5em";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.border = "2px solid rgba(255,255,255,0.1)";
            document.getElementById('divMeasurementsUpper_' + this.radioId).style.boxShadow = "30px 30px 35px rgba(0,0,0,0.25)";
                // toggleAnimals switch show
            document.getElementById('toggleAnimals_' + this.radioId).style.display = "inline-block";
            /* title display */
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.left = "5em";  // set recorder back
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.display = "inline-block";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.fontSize = "large";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.borderRadius = "1.5em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginTop = "1em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.marginBottom = "1em";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.border = "2px solid rgba(255,255,255,0.1)";
            document.getElementById('divStationDisplayGrid_' + this.radioId).style.boxShadow = "30px 30px 35px rgba(0,0,0,0.25)";

            /* animation degradation options, the switching is in toggleDegradeAnimation() */
            document.getElementById('divGracefulDegradation_' + this.radioId).style.display = "inline-block";
            document.getElementById('spanRed_' + this.radioId).style.color = "#ff6961";
            document.getElementById('spanGreen_' + this.radioId).style.color = "#7abd7e";

            /* timing problem with writing html, use setTimeout */
            if(htmlSettingsDictGlobal["cpuUtilisation"]){
                /* CPU, put a radio button, value from database, row for html CPU utilization for animation */
                setTimeout(function () {document.getElementById("firstClass_" + activeListenId).checked = "checked";}
                , 1000);

            } else {
                setTimeout(function () {document.getElementById("economy_" + activeListenId).checked = "checked";}
                , 1000);
            }
            toggleDegradeAnimation();
            /* darkMode */
            this.listenDarkModeStyle();
        }
    }
    listenDarkModeStyle(){
    /* called directly from dark mode function, location: index.js -> setColor() */
        if(htmlSettingsDictGlobal["checkboxConfigStyle"] === 0) return;
        /* set different shadows for day and night */
        let darkBody = getBodyColor();
        let colorDict;
        /* random angle for gradient, 0 bottom-top */
        let angle = getRandomIntInclusive(10,80);
        let angleDeg = angle + "deg";
        /* set differences */
       if (!darkBody) {
            // console.log('paleRadioStyle ' + styleName);
            document.getElementById('pix_' + this.radioId).style.filter = "drop-shadow(-.5em .5em .5em gray)";
            document.getElementById('radioHeadLine_' + this.radioId).style.color = "white";
            document.getElementById('radioStationComment_' + this.radioId).style.boxShadow = "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset";
            document.getElementById('radioStationComment_' + this.radioId).style.backgroundColor = "BlanchedAlmond";
        }
        else {
            // console.log('darkRadioStyle ' + styleName);
            document.getElementById('pix_' + this.radioId).style.filter = "drop-shadow(0px 6px 6px rgba(0, 0, 0, 1))";
            document.getElementById('radioHeadLine_' + this.radioId).style.color = "#4195fc";
            document.getElementById('radioStationComment_' + this.radioId).style.boxShadow = "";
            document.getElementById('radioStationComment_' + this.radioId).style.backgroundColor = "";
        }
    }
    updateAnimals(){
    /* call next animal from list
     * must disable the old div
     */
     try{
        let divDisable = this.animal + activeListenId;
        document.getElementById(divDisable).style.display = "none";

     } catch (error) {console.log("--> error AnimalDefaultDivSvG() ",error);}

        this.index += 1;
        if (this.index > this.animalDivList.length -1) {this.index = 0;}
        this.animal = this.animalDivList[this.index];  // new animal div from list
    }
}
;
function toggleDegradeAnimation(){
/* CPU RADIO BTN: switch divs and <g> elements of an animation, show/hide, overrides the "normal" styling
 * called if radio listen is pressed and on switching CPU radio buttons
 * each animation function has to look in the "animationsAllowedDict" if run is allowed
 *  animationsAllowedDict {elementName: true/false,elementName n: true/false}
 */
    for(let index=0;index<=Object.keys(animationsAllowedDict).length -1;index++){
        let keyAniName   = Object.keys(animationsAllowedDict)[index];
        let valueAniName = animationsAllowedDict[keyAniName];
        let displayStatus;
        if(valueAniName === true) {
            displayStatus = "inline-block";
        } else {
            displayStatus = "none";
        }
        //console.log("toggleDegradeAnimation. " ,keyAniName,displayStatus,animationsAllowedDict)
        document.getElementById(keyAniName).style.display = displayStatus;
    }
}
;
function recordRemoveGoldenDisk(radioId) {
/* remove the golden disk animation if in listen mode, del function not applied */
    let div = document.getElementById("divWriteToDisk_" + radioId);
    div.style.display = "none";
}
;

