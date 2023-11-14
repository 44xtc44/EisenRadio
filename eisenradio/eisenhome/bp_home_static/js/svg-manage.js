/* SVG Animation
 * animate the inline svg groups in index.html to make a big show with different attractions
 *
 * htmlColNames             - palette of colors that can be called by name in a browser, means those are hand picked nice colors
 * zeppelinColorOrder       - list of element names (svg path id, like html div id), the order to color them;
 *                             sometimes order of elements drawn in inkscape differs from needed order
 *                             used for class ShadesOfColor
 * toggleAnimalDefaultDivSvG() - toggle between animals with AnimalDefaultDivSvG instance
 * class AnimalDefaultDivSvG   - announce new animation for "defaultFrontAnimation()" to show
 * class CountUpDown        - up down count for rotation or color switching, can count fractions of a digit
 * class SimpleCounter      - looks simple, provides masses of counters and can be used to smooth in/out a movement
 * class PowerSwitch        - switch html/svg elements on/off, colorize, flash them and restore original color (Am I a data center backup restore specialist; consultant)
 * toggleWriteToDiskAnimation() - a rotating svg image of a disc shows active record (inkscape image of a unicode symbol, that not liked to rotate)
 * skipRecordShowMessageInABottle() - sipped record!, info by showing a message in a bottle image with 'skip' label for the radio
 * dimRadioForAnimation()   - press genre text as button to hide headline and information badge
 * dimRadioForAnimationExec - called by dimRadioForAnimation() with a timer to prevent bug "need dblClick"
 * class Shaker             - can make micro movements; annoying advertisements; used for animateGenreClickTeaser() after 30min
 * class MoveSinCos         - methods to calculate triangles to move a div, used to create movements if angle is given
 * powerLevelAnimation()    - slice the audio data range into intervals (at will) to apply different colors, one arg is PowerSwitch instance
 * class AnimationTimer     - the director of the show; when to start, stop, how big, random angle, angle correction, variable modification
 * moveRandomAngle(animationTimerInstance, moveSinCosInstance, htmlElement, extraTransform)
 *                          - the mover; moves and scales elements, aborts animation, can apply one extra transformation
 * colorizeDefaultSvgStageElements(darkBody)               - SVG: colors sky, ocean, clouds, iceberg, stars day and night style
 * defaultFrontAnimation(smoothVolume, powerLevelDict)     - the inflated animal show, scaling, rotation
 * defaultStageHtmlElementsShow()                          - HTML: decorates the stage with screw heads, shows the container with animated div
 *                                                           encapsulated <use> svg images, (shows no images, only enables the container)
 * defaultFlatSpeakerAnimation()                           - nails the speaker on the stage
 * svgAnimationMain() - animation frame function, calls all animation functions, which decide itself to run or not
 *          defaultStageHtmlElementsShow()                           - floe, screws, enable div with encapsulated <use>
 *          colorizeDefaultSvgStageElements(darkBody)                - clouds, iceberg
 *          animateFrontPigs(darkBody, smoothVolume, powerLevelDict) - animals at the front line (ger: Frontschweine)
 *          animateBuoy(darkBody);                                   - edit button
 *          animateSpeaker(smoothVolume);
 *          animateZeppelin(darkBody, smoothVolume);
 *          animateCheckeredBalloon(smoothVolume);
 *          animateParachuteDrop();
 *          animateA1AirCraft();
 *          animateClouds(darkBody);
 *          animateGpsSat(darkBody);
 *          animateStars(darkBody);
 *          animateGenreClickTeaser();                                 - uses Shaker instance
 * class MoveX - instances can move +-x, how many pixel in which time, wait timer; clouds,satellite,iceberg
 * smoothOutVolume(reqFftSize, softMod) - return the softened average dB volume over the whole frequency
 *                                        spectrum of current audio piece
 * getAverageVolume (reqFftSize) - get average vol for a set of frequency ranges (currently played milli sec of audio),
 *                                 called samples
 * changeColorPathToHsl(instanceOfShadesOfColor) - colorizes the elements
 * class ShadesOfColor - auto shade a list of elements which share a random base color (zeppelin)
 * touchMoveItemsEventListenerSet () - make some divs touchable for mobile or touchscreen
 *
 * instance initialization
 */
class CountUpDown{
/* target: endless count up, down
 *   count up and down for alternating direction or color fade in out, step is per frame;
 *   starts a rotation clockwise to keep it simple, for ("counter" clockwise) prefix the return value negative;
 *   let animalZRotationUpDown = new CountUpDown(-7.5, 7.5, 0.0075);
 * only if's used
 */
    constructor(minValue,maxValue,step){
        if(minValue <= maxValue) {
            this.minValue = minValue;
            this.maxValue = maxValue;
        } else {
            this.minValue = maxValue;
            this.maxValue = minValue;
        }
        this.step = Math.abs(step);
        this.currentValue = this.minValue;
        this.direction = 0;
    }
    update(){
        if (this.currentValue >= this.maxValue) {this.direction = 0;}
        if (this.currentValue <= this.minValue) {this.direction = 1;}
        if (this.direction == 1) {this.currentValue += this.step;}
        if (this.direction == 0) {this.currentValue -= this.step;}
        return this.currentValue
    }
}
;
class SimpleCounter{
/*
 * target: count and reach a value, reset to zero
 *    update(0.136), update(7);
 *    can add fractions of a digit at each frame or interval to smooth start/end a movement
 *      if way is 100 a function/method can divide in intervals and start getting slower or faster
 * usage:
 * let aSimpleCounter = new SimpleCounter(); aSimpleCounter.update(); x=aSimpleCounter.count; if (full) aSimpleCounter.reset()
 */
    constructor(){
        this.count = 0;
    }
    reset(){
        this.count = 0;
    }
    update(step){
        if(step === undefined){step = 1;}
        this.count += step;
        return this.count;
    }
}
;
class Shaker{
/* target: shake an element, like a vibrating phone
 * could have rotation; only for short time animation, longer leads to brain damage
 */
    constructor(){
        this.shakeStatus = undefined;
        this.counter = 0;
        this.maxCount = 10;
    }
    shake(elementId, step){
        let elem = document.getElementById(elementId);
        this.counter += step;
        if(this.counter > this.maxCount){this.counter = 1}
        if(this.counter === 1 ){elem.style.transform = "translate(1px, 1px)   "}
        if(this.counter === 2 ){elem.style.transform = "translate(-1px, -2px) "}
        if(this.counter === 3 ){elem.style.transform = "translate(-2px, 0px)  "}
        if(this.counter === 4 ){elem.style.transform = "translate(2px, 2px)   "}
        if(this.counter === 5 ){elem.style.transform = "translate(1px, -1px)  "}
        if(this.counter === 6 ){elem.style.transform = "translate(-1px, 2px)  "}
        if(this.counter === 7 ){elem.style.transform = "translate(-2px, 0px)  "}
        if(this.counter === 7 ){elem.style.transform = "translate(2px, 0px)   "}
        if(this.counter === 9 ){elem.style.transform = "translate(-1px, -1px) "}
        if(this.counter === 10){elem.style.transform = "translate(0px, 1px)   "}
    }
}
;

class PowerSwitch{
/* target: SVG path elements show timeDomainData values in different colors (spectrum analyser);
 *         tec target: create a microcontroller light switch in high level language
 * prerequisites:
 * - iterable: resolving must lead to a list of path ids; classes,<g> element
 *    or a simple list with SVG paths Id's (workon) this.elementsList[index].id for objects, this.elementsList[index] for array;
 *     see class "ShadesOfColor" how to implement
 * - each path needs a label, id="path365234623"
 * can do:
 * - coloring unlimited number of path elements in [one] list or <g> container;
 *     caller needs second instance for [second] <g> container;
 * - remembers all original colors of elements in an extra dict
 * - effects: all on/off, runway style forward, blink, runway backwards; Slider can move on/off delay (microcontroller Arduino style)
 * - runs a full animation at full power (overload condition, no more additional paths to animate);
 * - flash effect by providing a pattern list and frame multiplier for each list, show/not show per frame [0,0,1,1,0,0,1,0,1]
 *    multiplier x 5 [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1]
 * color is hue circle, the circle is divided by counting the implemented class methods (this.methodList.length);
 * usage:     let flashAni = new PowerSwitch({path: document.querySelectorAll("#z1PositionLights path"),
 *                                            flashPatternList: [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
 *                                            flashPatternMultiplier: 20});
 *
 * updateOneInAMillion method description:
 *   target: choose a random object out of a list and change the color of it or lightness (stars, water reflections,...)
 *           for a sequence (browser frames)
 */
    constructor(options){
        if (options === undefined) options = {};
        if (options.path === undefined) options.path = console.log("class PowerSwitch: no path defined");
        if (options.step === undefined) options.step = 1/4;
        if (options.strokeWidth === undefined) options.strokeWidth = 0;
        if (options.slider === undefined) options.slider = 2;
        if (options.maxCount === undefined) options.maxCount = 12;
        if (options.max === undefined) options.max = 6;
        if (options.hue === undefined) options.hue = 360 + 40; // can overshoot at full power to max 40 deg yellow section, if add 40 to 360 hue = 400deg
        if (options.dropShadow === undefined) options.dropShadow = ""; // kills ff for sure, tested! "drop-shadow(-.05em .05em .05em #333)"
        if (options.animatePower === undefined) options.animatePower = true;
        if (options.animateColor === undefined) options.animateColor = true;
        if (options.animateThreshold === undefined) options.animateThreshold = false;
        if (options.flashPatternList === undefined) options.flashPatternList = false;
        if (options.flashPatternMultiplier === undefined) options.flashPatternMultiplier = 10;
        if (options.flashColor === undefined) options.flashColor = "#fff";
        if (options.oneInAMillionRun === undefined) options.oneInAMillionRun = false;
        if (options.scale === undefined) options.scale = 1;

        this.dropShadow = options.dropShadow
        this.strokeWidth = options.strokeWidth;
                                                   // can not work directly with object, must make a clone
        this.elementsList = [...options.path];     // list of id names of path elements (id="pathToNoWhereOne"), list in list[0] so far
        this.eFillColorsDict = {};                 // {elementsList elementname: 79} hue color in deg
        this.eMemOrgFillColorsDict = {}
        this.eStrokeColorsDict = {};               // store the original fill color, can restore between animation
        this.ePowerDict = {};                      // {elementsList elementname: inline-block} on/off visibility
        this.counter = 1;           // min value and up counter, status change at full counter possible
        this.step = options.step;   // speed (4 frames) to reach the counter, slow down switching elements on/off, no status change for element
        this.maxCount = options.maxCount;  // end of one continuous cycle in which elements can be switched on and off (here one time on and off)
                             // survives the switching of power (class methods),
        this.min = 1;        // begin of a browser frame (your monitor) interval in which an wave element is shown or not (six frames plus step frames)
        this.max = options.max;              // end of interval
        this.slider = options.slider;        // multiplier (slider alike), can move the frame interval
                                             // for each element inside the 1 to maxCount area to overlap other element on/off state
        this.scale = options.scale;
        this.hue = options.hue;
        this.flashPatternList = options.flashPatternList;// list with flash pattern, flashPatternList:[0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
        this.flashPatternMultiplier = options.flashPatternMultiplier; // stretch the flash pattern; each row multiplied with frames to show
        this.maxSimultaneousFlash = options.maxSimultaneousFlash;     // updateOneInAMillion() max random elements same time
        this.oneInAMillionList = []                                   // can be actually more than one to show a better performance in 1000's
        this.oneInAMillionRun = options.oneInAMillionRun;             // indicates if a list should be build
        this.flashPowerList = [];           // list with multiplied pattern for switching on/off per frame
        this.currentFlashIndex = 0;         // return the current row of flashPowerList
        this.flashColor = options.flashColor;        // avoid stroke color and shadows where possible, it brings ff to the edge of usability
        this.animatePower = options.animatePower;  // can leave element as is, can save calc since no calc if not used
        this.animateColor = options.animateColor;
        this.animateThreshold = options.animateThreshold // threshold level for beginning with animation;
                                                         // needs a way to restore the initial fill or stroke colors if missing
        this.methodFillColorsDict = {};      // save hue start and end value list[0] and list[1] for each method (methods have names);
                                             // AND sequence hue values start at index 2, min max is 0 and 1
        this.methodStrokeColorsDict = {};
        this.methodList = new Array("lowClassic", // list of methods used in this class here to divide power spectrum
                               "midClassic",
                               "fullClassic",
                               "lowPower",
                               "midLowPower",
                               "midPower",
                               "midHighPower",
                               "fullPower",
                               );
        if(options.reverseMethod === "reverse"){this.methodList.reverse();}
        if(options.reverseElement === "reverse"){this.elementsList.reverse();}
        // todo: exception range
        this.mSequence = this.hue/this.methodList.length; // have divided hue circle in methods, now divide methods in sequences
        this.initFillColorsDict();
        this.initStrokeColorsDict();
        this.initElementFillColorsDict();
        this.initElementStrokeColorsDict();
        this.initElementPowerDict();
        if(this.flashPatternList){
            this.initElementFlashList();
            this.initOneInAMillionList();  // small price to pay on construction if no oneInAMillion is used
        }
        this.initElementMemOrgFillColorsDict();  // store the original fill color for each element
    }
    initOneInAMillionList(){
        /* fill list with a max random number of elements,
         * but must be less than elements list,
         * take a dict to store original index number to reapply original color and size
         */

        if(this.oneInAMillionRun === false) return;  // no oneInAMillion instance call set it true
        let maxNumPossible = this.elementsList.length;
        let maxNumDesired = this.maxSimultaneousFlash;
        if(maxNumDesired > maxNumPossible) maxNumDesired = maxNumPossible;
        /* call n times random function to get new element, we can be super duper and ask if we have this element already, but who cares, no impact at all*/
        for(let index = 1; index <= maxNumDesired; index++){
            let flashCandidateIndex = getRandomIntInclusive(0,this.elementsList.length -1);
            let indexPathDict = {};                     // reset dict and write new {355: path488}
            indexPathDict[flashCandidateIndex] = this.elementsList[flashCandidateIndex];
            this.oneInAMillionList.push(indexPathDict); // store dict at next array index
        }
    }
    initElementFlashList(){
    /* FLASH: stretch original flash pattern list by flashPatternMultiplier (frames) */
        let zero = 0;  // just for better reading the loop
        let one = 1;
        for(let index = 0; index <= this.flashPatternList.length -1; index++){
            let off = "none";
            let on = "inline-block";
            for(let k = 1;k <= this.flashPatternMultiplier; k++){
                if(this.flashPatternList[index] == zero){
                    this.flashPowerList.push(off)
                } else if(this.flashPatternList[index] == one){
                    this.flashPowerList.push(on)
                }
            }
        }
    }
    initElementMemOrgFillColorsDict(){
    /* ELEMENTS Remember original fill color, exec at init once */
       for(let index = 0; index <= this.elementsList.length -1; index++){
           let elem = getComputedStyle(this.elementsList[index]);
           this.eMemOrgFillColorsDict[this.elementsList[index].id] = elem.fill;
       }
    }

    initElementFillColorsDict(){
    /* ELEMENT fill color: each element gets an empty object to store the hue color number later */
       for(let index = 0; index <= this.elementsList.length -1; index++){
           // console.log(document.querySelectorAll("#gSvgSpeakerFlatWaves path")[0].id);
           this.eFillColorsDict[this.elementsList[index].id] = new Object();
       }
    }
    initElementStrokeColorsDict(){
    /* ELEMENT stroke color: each element gets an empty object to store the hue color number */
       for(let index = 0; index <= this.elementsList.length -1; index++){
           this.eStrokeColorsDict[this.elementsList[index].id] = new Object();
       }
    }
    initElementPowerDict(){
    /* ELEMENT power on/off visible: each element gets an empty object to store power state */
       for(let index = 0; index <= this.elementsList.length -1; index++){
           this.ePowerDict[this.elementsList[index].id] = new Object();
       }
    }

    initFillColorsDict(){
    /* METHOD fill color: each method will show a part of the hue circle from i.e. 0to40,40to80 ... deg

    first two array elements are min and max
    this.methodFillColorsDict[foo] = [0,60,20,40,60] [min,max,hueNum1,hueNum2,hueNum3,...]
    */

        for(let index = 0; index <= this.methodList.length -1; index++){
            let mArray = new Array();
            let min = (this.mSequence) * (index +1)  - (this.mSequence);
            let max = (this.mSequence) * (index +1);
            mArray.push(min);
            mArray.push(max);
            // split method from min to max in sequences
            let minToMax = max - min;
            for(let index = 0; index <= this.elementsList.length -1; index++){
                let hueNum = min + (minToMax/this.elementsList.length * (index +1));
                mArray.push(hueNum);
            }
            // this.methodFillColorsDict["lowPower"] = [0,60,20,40,60]
            this.methodFillColorsDict[this.methodList[index]] = mArray;
        }
    }
    initStrokeColorsDict(){
    /* stroke color: output list of hue values (sequence) for each class method name (power related, filled in constructor)

    reverse index to show the boundary (stroke color) of the svg element against the normal indexed fill color of element
    */
        for(let index = 0; index <= this.methodList.length -1; index++){
            let mArray = new Array();
            let min = (this.mSequence) * (index +1)  - (this.mSequence);
            let max = (this.mSequence) * (index +1);
            mArray.push(min);
            mArray.push(max);
            // split method from min to max in sequences
            let minToMax = max - min;

            // reverse the index
            for(let index = this.elementsList.length -1; index >= 0; index--){
                let hueNum = min + (minToMax/this.elementsList.length * (index +1));
                mArray.push(hueNum);
            }

            this.methodStrokeColorsDict[this.methodList[index]] = mArray;
        }
    }

    updateOneInAMillion(){
    /* change color of a random <g> member for a given browser frame multiplier sequence (frame x n, time)
     *  can have flash pattern for the flashPatternMultiplier time frame
     *  after flash apply original color to hide it in the crowd again
     *  rewrites the list with animation candidates after a flash sequence
     * reuse flashPowerList (flashPatternList x flashPatternMultiplier) of updateFlashPattern() method
     *
     * let starOneInAMillion = new PowerSwitch({path: document.querySelectorAll("#gTuxStageStars path"),
     *                                      flashColor:"#fff",             // can also be set before updateOneInAMillion() to create randomness
     *                                      maxSimultaneousFlash: 3,       // max elements simultaneous animated
     *                                      flashPatternList: [0,1,0,1],   // each element multiplied by flashPatternMultiplier
     *                                                                     // is overall animation time 4 x 5 = 20 frames, can be [1] on whole time
     *                                      flashPatternMultiplier: 5
     *                                      oneInAMillionRun:true,         // since we reuse all possible methods, this.oneInAMillionList must be created
     *                                       });
     * ! caller can change color before update
     * starOneInAMillion.flashColor = "#yourHex";  starOneInAMillion.updateOneInAMillion();
     *
     */
        this.eAnimateOneInAMillion(this.flashPowerList[this.currentFlashIndex]); // arg is list row with display none or inline-block
        this.currentFlashIndex ++;
        if(this.currentFlashIndex > this.flashPowerList.length -1) {
        /* reset to original size and color, update list with new elements */
            this.currentFlashIndex = 0;
            for(let index=0;index<=this.oneInAMillionList.length -1;index++){
                let rowDict = this.oneInAMillionList[index];  // means that now a dict with one key/val pair is in rowValue {355:pathObject#path485}
                let rowDictKey = Object.keys(rowDict)[0];     // only one key/val pair here so we know start and end of dict is zero
                let rowDictVal = rowDict[rowDictKey].id;      // pathObject#path485, pathObject.id = "path485"
                let svgPathElem = document.getElementById(rowDictVal);
                // svgPathElem.style.transform = "scale(1,1)";
                /* need original index number of this.elementsList, pulled into rowDict to restore color
                 */
                svgPathElem.style.fill = this.eMemOrgFillColorsDict[this.elementsList[rowDictKey].id];
            }
            this.oneInAMillionList = [];      // reset candidate list
            this.initOneInAMillionList();     // get new candidates
        }

    }

    updateFlashPattern(){
    /* flash with one element or a row as one element a pattern, must be a list of svg <g> elements
    let flasheAni = new PowerSwitch({path: document.querySelectorAll("#z1PositionLights path"),
                                           flashPatternList: [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
                                           flashPatternMultiplier: 20});
    this.elementsList is used to animate on/off by this.eAnimateFlashPower()
    */
        this.eAnimateFlashPower(this.flashPowerList[this.currentFlashIndex]);
        this.currentFlashIndex ++;
        if(this.currentFlashIndex > this.flashPowerList.length -1) this.currentFlashIndex = 0;
    }

    noPower(){
        if(this.animatePower) this.ePowerOnOf("noPower");
        if(this.animatePower) this.eAnimatePower();
    }
    lowPower(){
    /* recap: this.methodFillColorsDict[foo] = [0,60,20,40,60] [min,max,hueNum1,hueNum2,hueNum3,...]
       this.eFillColorsDict = {waveOne:20,waveTwo:40,waveThree:60}
     */
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("lowPower");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    midLowPower(){
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("midLowPower");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    midPower(){
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("midPower");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    midHighPower(){
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("midHighPower");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    fullPower(){
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("fullPower");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    lowClassic(){
    // define an interval to raise the animation start level for classic and blues, since there is not much dynamic
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("lowClassic");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    midClassic(){
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("midClassic");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }
    fullClassic(){
    // the normal lowPower() (one wave shown) level begins after this level,
    // contemporary computerized music with high dynamic (high frequency amplitude, high electric pressure)
        if(this.animatePower) this.ePowerOnOf();
        if(this.animateColor) this.eColor("fullClassic");
        if(this.animatePower) this.eAnimatePower();
        if(this.animateColor) this.eAnimateColor();
    }

    ePowerOnOf(overRide){
    /* decide to switch on/off an element */
        if(overRide == "noPower"){
            for(let index=0;index<=Object.keys(this.ePowerDict).length -1;index++){
                let keyName = Object.keys(this.ePowerDict)[index];
                this.ePowerDict[keyName] = "none";
            }
            return;
        }
       // type int is percent of elements cut off power, random effect, first, last, from middle
       // if(overRide == "noPower"){}

        this.counter += this.step;
        if(this.counter > this.maxCount){this.counter = 1}
        for(let index=0;index<=Object.keys(this.ePowerDict).length -1;index++){
            let keyName = Object.keys(this.ePowerDict)[index];
            if(this.counter >= (this.min + this.slider * index) && this.counter <= (this.max + this.slider * index)) {
                this.ePowerDict[keyName] = "inline-block";
            }
            else {
                this.ePowerDict[keyName] = "none";
            }
        }
    }
    eColor(methodPower){
    /* remember: first two values are min and max of selected piece on hue circle in deg, reason for methods */
        let start = 2;
        for(let index=start;index<=this.methodFillColorsDict[methodPower].length-1;index++){
            // transfer the method hue values to the element id's, actually names, to switch fill color
            let keyName = Object.keys(this.eFillColorsDict)[index-start]
            this.eFillColorsDict[keyName]   = this.methodFillColorsDict[methodPower][index];
            this.eStrokeColorsDict[keyName] = this.methodStrokeColorsDict[methodPower][index];
        }
    }
    eAnimateFlashPower(powerState){
    /* just to remember, only path elements work with fill */
        for(let index=0;index<=this.elementsList.length -1;index++){
            let svgPathElem = document.getElementById(this.elementsList[index].id);
            svgPathElem.style.display = powerState;
            svgPathElem.style.fill = this.flashColor;
        }
    }

    eAnimateOneInAMillion(powerState){
    /* not like eAnimateFlashPower()
     * we use a dict per array index row with key:this.elementsList and value element id, {355:path485}
     */
        for(let index=0;index<=this.oneInAMillionList.length -1;index++){
            let rowDict = this.oneInAMillionList[index];  // means that now a dict with one key/val pair is in rowValue {355:pathObject#path485}
            let rowDictKey = Object.keys(rowDict)[0];     // only one key/val pair here so we know start and end of dict is zero
            let rowDictVal = rowDict[rowDictKey].id;      // pathObject#path485, pathObject.id = "path485"
            let svgPathElem = document.getElementById(rowDictVal);
            svgPathElem.style.display = powerState;
            svgPathElem.style.fill = this.flashColor;
            //svgPathElem.style.transform = "scale(" + this.scale + "," + this.scale + ")";
        }
    }

    eAnimatePower(){
    /* svg element on/off */
        for(let index=0;index<=Object.keys(this.ePowerDict).length -1;index++){
            let keyName = Object.keys(this.ePowerDict)[index];
            let eValue = this.ePowerDict[keyName];
            let htmlElem = document.getElementById(keyName);
            htmlElem.style.display = eValue;
        }
    }
    eAnimateColor(){
    /* svg element style */
        for(let index=0;index<=Object.keys(this.eFillColorsDict).length -1;index++){
            let keyName = Object.keys(this.eFillColorsDict)[index];
            let eFill = this.eFillColorsDict[keyName];
            let eStroke = this.eStrokeColorsDict[keyName];
            let htmlElem = document.getElementById(keyName);
            htmlElem.style.fill = "hsl(" + eFill + ", 100%, 50%)";
            htmlElem.style.stroke = "hsl(" + eStroke + ", 100%, 50%)";
            htmlElem.style.strokeWidth = this.strokeWidth + "px";
            htmlElem.style.filter = this.dropShadow;
        }

    }
    applyOrgColor(logName){
    /* the path elements get back their original color, must be the correct instance if called */
         for(let index=0;index<=this.elementsList.length -1;index++){
            let svgPathElem = document.getElementById(this.elementsList[index].id);
            svgPathElem.style.fill = this.eMemOrgFillColorsDict[this.elementsList[index].id];
        }
        console.log("* applyOrgColor() to path elements; Dict, logName *", this.eMemOrgFillColorsDict,logName);
    }
}
;
class MoveSinCos{
/* depends on class CountUpDown;
 * MOVE no other transforms here;
 * animate up/down left/right sin/cos movement of elements;
 *
 * provide simple figures for svg animation;
 * usage:
 * - div element id is "argument" for xxx.updateElement(elementId) method
 * let moveInfo = new MoveSinCos({sin: "true"});
 * moveInfo.updateCount();
 * moveInfo.updateElement("infoBox");
 * moveInfo.updateElement("infoText");
 * advanced:
 * let moveMeDownTheRabbitHole = new MoveSinCos({sin: "true",
 *                                               cos: "false",
 *                                               step:"200", // pixel, makes no sense if full instance is written like below
 *                                               countInstance: "new CountUpDown(0,360,1)"  //0deg,360deg, update add one
 *                                                                                          //overwrite counter
 *                                                                                          //"new SimpleCounter()"
 *                                               });
 */
    constructor(options){
        if (options === undefined) options = {};
        if (options.speed === undefined) options.speed = 100;                                               // .... Math.sin(foo) * 5) + "px)";
        if (options.step === undefined) options.step = 10;
        if (options.countInstance === undefined) options.countInstance = new CountUpDown(0,360, 1);
        this.updateCounter = new SimpleCounter();
        this.step = options.step;       // step or unit to multiply with result of sin/cos; result is for one unit x only
        this.speed = options.speed;     // slows motion, fills x speed steps between one count of 1deg of 360deg
        this.styleTop = options.styleTop;   // override default div location
        this.styleTop = options.styleLeft;
        this.styleTop = options.styleRight;

        this.elementId = options.elementId    // document id
        this.arcUpDown = options.countInstance; // can instantiate a counter class,
                                        // must have "currentValue()", "update()" and "reset()" method implemented

        this.speedCounter = 0;
        this.infiniteCounter = 0;
        this.mileStoneX = 0;          // used to store current x for tan calc with alpha angle
                                      // alpha: angle of triangle point a in x, erected on x axis,
                                      // point b is mileStoneX, perpendicular facing y
        this.sin = options.sin;
        this.cos = options.cos;
    }
    reset(){
        this.mileStoneX = 0;
    }
    calcYForXMileStone(adjacent, angleAlpha){
        /*
         * target: move svg ship like, 12deg starboard, half speed ahead
         *         return y for a given x speed=distance and angle alpha (1/2, 12deg)
         *         instance call can apply a small angle modifier to sail a nice curve
         *     translation movement ALWAYS starts at 0,0 on transform coord system; so current x is known (transform coord)
         *     means one must start transform with this guy here, else call get matrix functions to get current transform x
         *     you do not move directly on screen, rather ON a (before) rotated and moved sheet on the screen (copy of origin)
         *     destination is a projection on the screen, like putting a post card there; (this is the reason mixed svg and html movements fail, other coord system)
         *     every new transform starts ON your last transform (rotated,moved post card);
         *     so, move 2 units in direction x is always movement on the (before moved) post card toward x;
         *     next move starts from a post card moved itself by 2 units;
         *   needed to go random across screen, images facing the direction properly on +-x (-x, scale -)
         *   method called for every frame
         *   can modify speed and angle on instance call
         *   css pseudo code to understand it better (here the translation and a -not related- rotation):
         *     {transform: translate(instMoveSinCos.mileStoneX, instMoveSinCos.calcYForXMileStone(velocity, angleAlpha)) rotate(angleFoo);}
         * needed values: this.speed,     // slice the way from current x position to desired x position in a frame regardless of overall distance
         *                                // x (254,254 + 1/5 = 254,454)
         *                this.mileStoneX // this.mileStoneX + this.speed = current x position
         *                this.tanArcAlpha (substitute angle alpha with arc tan(x))
         * calc stuff:
         * let deg = Math.PI/180;
         * angleDeg = radian * deg;
         *     radian = Math.atan2(y2 - y1, x2 - x1) is deltaY - deltaX; // not needed but more easy to understand tan
         * BUT: We want deg as arg to get it done. Simon says, go x+4 with 5deg and calc y for me.
         *      triangle: tan(x)=opposite side / adjacent (is new x); adjacent * tan(x)=opposite side (new y);
         *                adjacent * tan(x (triangle point a))=y
         *      deg = 180/Math.PI; tan(alpha(x))*deg=opposite side (new y);
         *         caller: move to new x by this.speed; if -x scale -x and translate to go back;
         *                 if x < 0 && x > windows.innerWidth, if y > 0 && y< windows.innerHeight
         * instance: let moveMeRandom = new MoveSinCos();
         *           let angleMod = 0.002;
         *           moveMeRandom.calcYForXMileStone(1/velocity, angleAlpha + angleMod);
         */

        let deg = Math.PI/180;
        this.mileStoneX += adjacent;    /* adjacent=speed=distance, named to have a triangle in mind
                                         * triangle: adjacent side (adjacent = speed, new x) * tan(x)=opposite side (new y);
                                         */
        let y = this.mileStoneX * Math.tan(angleAlpha * deg);
        return y;
    }
    updateCount(){
    /* slow down the 1deg update and add more steps in the movement, either straight or circular if sin and cos */
        this.infiniteCounter += 1/this.speed;
        this.speedCounter += 1/this.speed;
        if(this.speedCounter >= this.speed){
            this.speedCounter = 0;
        }
        let arcVal = this.arcUpDown.currentValue + this.speedCounter;
        this.updateCounter.update(1);
        if(this.updateCounter.count >= this.speed){
            this.updateCounter.reset();
            this.arcUpDown.update();
            this.speedCounter = 0;

        }

        this.calcSin(arcVal);
        this.calcCos(arcVal);
    }
}
;
function powerLevelAnimation({smoothVolume: smoothVolume, animatedInstance: animatedInstance}){
/* target: slice the (estimated) data range into intervals to apply different colors; my Computer shows 0 to 4,5 at HipHop
 *         return the power level of incoming current audio package,
 *         feed the colored audio visuals like speaker and balloon elements by calling a class method by instance
 * smoothVolume     - the overall softened volume
 * animatedInstance - instance of PowerSwitch class
 */
    let powerDict;  // threshold and multiplier for scale transformation, only "noPower" used yet
    try {
        // some action for the speaker output, color and element on/off
        if (smoothVolume < 0.5){
            powerDict = {"noPower": 3};
            if(!(animatedInstance === undefined)){
                // infSpeaker.noPower();
                animatedInstance.noPower();
            }
        }
        if (smoothVolume > 0.5 && smoothVolume <= 0.56){
            powerDict = {"lowClassic":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.lowClassic();
            }
        }
        if (smoothVolume > 0.56 && smoothVolume <= 0.65){
            powerDict = {"midClassic":1}
            if(!(animatedInstance === undefined)){
                animatedInstance.midClassic();
            }
        }
        if (smoothVolume > 0.65 && smoothVolume <= 0.85){
            powerDict = {"fullClassic":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.fullClassic();
            }
        }
        if (smoothVolume > 0.85 && smoothVolume <= 0.95){
            powerDict = {"lowPower":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.lowPower();
            }
        }
        if (smoothVolume > 0.95 && smoothVolume <= 1.4){
            powerDict = {"midLowPower":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.midLowPower();
            }
        }
        if (smoothVolume > 1.4 && smoothVolume <= 1.8){
            powerDict = {"midPower":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.midPower();
            }
        }
        if (smoothVolume > 1.8 && smoothVolume <= 3.0){
            powerDict = {"midHighPower":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.midHighPower();
            }
        }
        if (smoothVolume > 3.0){
            powerDict = {"fullPower":1};
            if(!(animatedInstance === undefined)){
                animatedInstance.fullPower();
            }
        }
        if (smoothVolume > 4){
            powerDict = {"fullPower":1};
        }
    } catch (error) {
       /* console.error(error); */
    }
    return powerDict;
}
;
class AnimationTimer{
    /* target: art director of the show,
     *          provide a counter to set a time frame, start and or run an extra animation within the animation frame;
     *         can further use angle, scale and direction variables if wanted;
     *         randomize variables;
     * usage: let b1Ani = new AnimationTimer({animationWaitTime: 300,scale:2,scaleMod:0.005,angleMod:0.05});
     */
    constructor(options){
    if (options === undefined) options = {};
    if(options.animationWaitTime === undefined) options.animationWaitTime = 600;
    if(options.scale === undefined) options.scale = 1.2;
    if(options.scaleMod === undefined) options.scaleMod = 0.0008;
    if(options.angleMod === undefined) options.angleMod = 0.01;
    if(options.logName === undefined) options.logName = "default";
    if(options.speed === undefined) options.speed = 15;
    if(options.scaleMax === undefined) options.scaleMax = 2;
    if(options.randomEventFunction === undefined) options.randomEventFunction = function (){}; // undefined anonymous if not specified
    if(options.externalFunction === undefined) options.externalFunction = function (){};
    if(options.angleUp === undefined) options.angleUp = false;
    if(options.angleDown === undefined) options.angleDown = false;
    if(options.angle === undefined) options.angle = getRandomIntInclusive(0,360);
    if(options.overrideDefault === undefined) options.overrideDefault = 0;

        this.overrideDefault = options.overrideDefault; // set to true to jump over reset to prevent random var feed
        this.logName   = options.logName;
        this.angle     = options.angle;
        this.angleUp   = options.angleUp;
        this.angleDown = options.angleDown;
        this.angleMod  = options.angleMod;         // the angleMod pushes up in a curve
        if(this.angleUp === true){
            if(this.overrideDefault !== true) {
                this.angle = getRandomIntInclusive(205,340);
            }
        }
        if(this.angleDown === true){
            if(this.overrideDefault !== true) {
                this.angle = getRandomIntInclusive(25,165);
                this.angleMod = 0;
            }
        }
        this.angleCorrect();
        this.lastAngle = this.angle;
        this.speed = 1/options.speed;
        this.scale = options.scale;
        this.archivedScale = this.scale;
        this.scaleMod = options.scaleMod;
        this.scaleMax = options.scaleMax;
        this.scaleMin = "0.5";
        this.animationWaitTime = options.animationWaitTime;      // wait to start animation next time
        this.animationMemoryWaitTime = this.animationWaitTime;
        this.run = false;
        this.direction = getRandomIntInclusive(0,1);
        this.rndNum = getRandomIntInclusive(0,3);
        this.randomEvent = false;
        if((this.rndNum===0)||(this.rndNum===1)||(this.rndNum===2)) {
            this.randomEvent = true; // can ask if should switch some lights on/off or else
        } else {
            this.randomEvent = false;
        }
        this.randomEventFunction = function (){options.randomEventFunction()};   // random execution, store the external method or function
        this.externalFunction = function (){options.externalFunction()};
    }
    angleCorrect(){
    /* define no go areas (of rocket start and abyss)
     * zero deg is 3o'clock, jump start is 12o'clock, abyss is 6o'clock, where angleMod can not bite fast enough
     * two options: not use a section of deg or mod the angleMod to hit hard for a circle;
     */
     if(this.overrideDefault === true){return;}
        if(this.angle <= 120 && this.angle >= 90)  this.angle = 120;
        if(this.angle <= 90 && this.angle >= 60)  this.angle = 60;
        if(this.angle <= 300 && this.angle >= 270) this.angle = 270;
        if(this.angle <= 270 && this.angle >= 240) this.angle = 240;
    }
    reset(){
    /* instance calls reset() to get the wait time again;
     * reset conditions: leaving window or exceed y value
     */

        this.run = false;
        this.scale = this.archivedScale;
        /*  return if override set, used for aircraft
         * this.angleUp and this.angleDown Mods also disabled
         */
        if(this.overrideDefault === true){
            this.externalFunction(); // can write new angle in this.lastAngle
            this.angle = this.lastAngle
            this.animationWaitTime = this.animationMemoryWaitTime;
            return;
        }

        this.angle = this.lastAngle + getRandomIntInclusive(45,90);
        this.lastAngle = this.angle;
        // ANGLE: more than 400 gives same val over and over
        if(this.angle >= 400 || this.angle <= 0) this.lastAngle = getRandomIntInclusive(0,360);
        this.direction = getRandomIntInclusive(0,1);
        this.animationWaitTime = this.animationMemoryWaitTime;
        this.rndNum = getRandomIntInclusive(0,3);
        this.randomEvent = false;
        if((this.rndNum===0)||(this.rndNum===1)||(this.rndNum===2)){
            this.randomEvent = true;
        }  else {
            this.randomEvent = false;
        }
        // this.randomEventFunction(); // execute the external method or function, empty function if not set
        if(this.randomEvent == false) this.randomEventFunction();    // if event not happens call a function (cleanup)
        this.externalFunction();
        console.log("AnimationTimer reset(), name, deg, direction, wait, evt ",
                                                                    this.logName,
                                                                    this.angle,
                                                                    this.direction,
                                                                    this.animationMemoryWaitTime,
                                                                    this.randomEvent,
        )
    }
    update(){
        /* can wait to start and tell animation to end after n frames (not implemented)
         * return if no listen button is pressed, since rec is not animated
         */
        if(activeListenId === "noId") return;
        this.animationWaitTime--;
        if(this.animationWaitTime <= 0){
            this.run = true;
        } else {
            this.run = false;
            return;
        }
        this.angleCorrect();           // check if go 90 (hell) or 270deg (heaven) too fast
        this.angle -= this.angleMod;   // make some circle-ish move, change direction angleMod per frame
        if(this.direction){
            this.scale += this.scaleMod;
            if(this.scale >= this.scaleMax) this.scale = this.scaleMax;
        } else {
            this.scale -= this.scaleMod/5;  // go fast back
            if(this.scale <= this.scaleMin)  {
                this.direction = 1;         // come back to front for the show
            }
        }
    }
}
function moveRandomAngle(animationTimerInstance, moveSinCosInstance, htmlElement, extraTransform){
/* target: move elements from a central location in 360° directions by values of animationTimerInstance,
 *   angle modifier of instance tries to move em upward, but can not always
 *   AnimationTimer class: there are no go areas defined in deg, to minimize suizide in both directions,
 *                          straight up or down (the hyperbolic function slot?)
 * AnimationTimer controls run via this.run = true;
 * moveSinCosInstance: design goal was to use various angle calculations, but tan best fits this small app
 */
    let animTimer = animationTimerInstance;
    let acrCalc = moveSinCosInstance;
/* to get no brain damage calculating +-x, all further sprites facing towards right !!! */

    let divElem;
    if(animTimer.run){
        try{
            let divElem = document.getElementById(htmlElement);
            divElem.style.display = "inline-block";

            let y = acrCalc.calcYForXMileStone(animTimer.speed, animTimer.angle);
            let x = acrCalc.mileStoneX;

            // MOVE: go by angle and speed in x direction, calc y by ( adjacent * tan(x) = opposite = y);
            if(animTimer.angle <= 90 && animTimer.angle >= 270){
                x = +x;
                y = +y;
                animTimer.angleMod = +animTimer.angleMod;
            }
                // tan goes minus between 90 and 270 deg, see hyperbolic curves; means move x<0;
            if(animTimer.angle > 90 && animTimer.angle < 270){
                x = -x;
                y = -y;
                animTimer.angleMod = +animTimer.angleMod;  // press to move upward
            }
            divElem.style.transform  = "translateX(" + x + "px)";
            divElem.style.transform += "translateY(" + y + "px)";

            // SCALE:
           if(animTimer.speed > 0 && x >= 0){
           // left scale up
               divElem.style.transform += "scaleX(" + animTimer.scale + ")";
               divElem.style.transform += "scaleY(" + animTimer.scale + ")";
           } else {
           // scale down, update method of aniTimer, it has 5x speed back and reverses direction on minimum scale, bam come back
               divElem.style.transform += "scaleX(" + -animTimer.scale + ")";
               divElem.style.transform += "scaleY(" +  animTimer.scale + ")";
           }

           /* BORDER: if we touch the window frame or y limit */
           let divElemRect = divElem.getBoundingClientRect();
           if(y <= -500 || y >= 500){
                animTimer.reset();
                acrCalc.reset();
                divElem.style.display = "none";
           }

           if(divElemRect.x > window.innerWidth || divElemRect.x < 0){
                animTimer.reset();
                acrCalc.reset();
                divElem.style.display = "none";
           }
           /* if empty no pb */
           divElem.style.transform += extraTransform;

        } catch (error) {console.log("moveRandomAngle() ", divElem, error)}
    }
}
;
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
function animateStars(darkBody){
/* STARS
 * target: random blink of 1-n stars in dark mode, if full html style selected
 * base: svg <g> element with multiple paths (stars) that have an id="foo1" and no fill attribute at all
 *       create a refreshed list with index 1-n, filled with random id from all avail. id (this.oneInAMillionList) in PowerSwitch class
 *       blink pattern, set at instance creation
 *
 */
    if(htmlSettingsDictGlobal["checkboxConfigAnimation"] && darkBody && htmlSettingsDictGlobal["cpuUtilisation"]){
        starOneInAMillion.flashColor = "orange";
        starOneInAMillion.updateOneInAMillion();
    }
}
;

let softVolumeGlobal = 0;
function smoothOutVolume(reqFftSize, softMod) {
/* return the softened average dB volume over the whole frequency spectrum of current audio piece;

softVolumeGlobal stores the predecessor frame
try soften the difference between this and the following (unknown) audio piece
*/

    let volume = getAverageVolume(reqFftSize);
    // values around 0.9; jitter correction
    softVolumeGlobal = softVolumeGlobal * 0.915 + volume + softMod;
    // animation will be scaled by softVolumeGlobal factor
    return softVolumeGlobal;
}
;
function getAverageVolume (reqFftSize) {
    /* get average vol for a set of frequency ranges (currently played milli sec of audio), called samples */

    analyserNode.fftSize = reqFftSize;
    /* whole frequency spectrum is divided in frequency ranges and put in sets (bins) */
    const bufferLength = analyserNode.frequencyBinCount;
        // could also write (new Uint8Array(reqFftSize/2)) the half of fftSize 128/2
    const dataArray = new Uint8Array(bufferLength);
        // pump actual data sliced into 64 pieces into analyserNode
        //  analyserNode.getByteFrequencyData(dataArray)     analyserNode.getByteTimeDomainData(dataArray)
    analyserNode.getByteTimeDomainData(dataArray);
        // now analyserNode object holds dataArray[64] [56,209,78,..] [134, 78, 98, ...]
    /* convert array data from val(0-255)int to val(1 to -1)float
     standard sin, cos wave amplitude is between 1 and -1, see unit circle
     clone uint array;
     then for each cloned list elem (map returns a list like map in python):
     divide elem by fftSize : (56/128=0.4375) -1=-0.5625 : (209/128=1.6328125) -1=0.6328125
     -1 pushes the result in the 1 to -1 range
     */
    let normalizeSamples = [...dataArray].map(e => e/reqFftSize - 1);
        // normalizeSamples[64] [-0.5625,0.6328125,..], [...], [...]

    let sum = 0;
    /* get statistical value, deviations of mean,
    for each elem (set of frequency ranges (0-100hz) or (101-200hz)) in list[(0-100),(101-200), ...].length is here 64
    target: sum of squares over the whole frequency spectrum
    further: not the sum is the desired result. it is more how far is the sum away from normalized graph up or down, see breakouts
    function draw() uses getByteTimeDomainData(dataArray) in an oscilloscope. a realtime wave form audio graph
    */
        // - * - is +, and there is never a plus AND minus
    for (let i = 0; i < normalizeSamples.length; i++) {
        sum += normalizeSamples[i] * normalizeSamples[i];
    }

    /* large number, large deviation from middle (sss BUM sss); smaller number, lower deviation (SSSSS)

    The variance is the average of the sum of squares
    (i.e., the sum of squares divided by the number of observations).
    https://www.investopedia.com/terms/s/sum-of-squares.asp
    */
        // arithmetic mean of the squares of a set of numbers
    let meanSquares = sum / normalizeSamples.length;
    let volume = Math.sqrt(meanSquares);
        // 0.0x 0.00x
    return volume;
}
;
function changeColorPathToHsl(instanceOfShadesOfColor){
/*
 * this guy colorizes the elements,
 * target: let multiple instances of ShadesOfColor class change color -> change it to be part of the class, remove function
 *   ideally used on AnimationTimer class reset event, can be used as instance creation option
   externalFunction:function(){console.log("Zeppelin aniTimer ",zeppelinShadesOfColor.pathToHueDict);
                           zeppelinShadesOfColor.update({hueColor:getRandomIntInclusive(1,360)});
                           changeColorPathToHsl(zeppelinShadesOfColor);
                            },
 *  this function is called after each AnimationTimer.reset() to paint the zeppelin with fresh color
 * path names for svg elements must be unique in a document, else we colorize a wrong path
 */
    try{
        for(index=0;index <= Object.keys(instanceOfShadesOfColor.pathToHueDict).length -1;index++){
            let path  = Object.keys(instanceOfShadesOfColor.pathToHueDict)[index];
            let color = instanceOfShadesOfColor.pathToHueDict[path];
            //console.log("-> changeColorPathToHsl() ",path,color)
            document.getElementById(path).style.fill = color;
        }
    } catch (error) {console.log("-> error changeColorPathToHsl() ",instanceOfShadesOfColor,error)}
}
;
class ShadesOfColor{
/* target: animation, shade a list of elements which share a random base color (color the zeppelin at first)
 * reason: single colored elements don't suffer from high cpu load like gradients,
 *          avoid the need to recalc gradient at each frame for each html, svg element, same as blur,
 *          stroke color and box shadow can kill your animation, FF crashed
 * needs a start color and the number of svg/html elements to calc an interpolated (values in between high low) list of saturation values
 * need to randomize and convert hex #r g b #ff ff ff (more easy to see the system) to hue, to get comma, float values
 * grey: all base colors share the same number #121212, #3a3a3a, but difference in hex is very hard, #3b3b3b
 * seems need to go to saturation in percent with hsl(baseColor,saturation%,lightness%)
 * lightness: grey is hsl(baseColor,0%,20%) only lightness counts so it is the same hsl(0,0%,20%), see how inkscape reset
 *      from 10% you see grey, else black to 100% is white
 *      color: from 10-80% noticeable, best from 60 light to 20% full range
 * saturation: no impact on grey, lightness must be over 10% else black
 *      noticeable only from 10%, good values start from 50% to crisp 100%
 *
 * usage: let zeppelinShadesOfColor =
 *          new ShadesOfColor({pathCollection:document.querySelectorAll("#z1Body path"),
 *                             saturation:100,
 *                             lightness:50,
 *                             brightestTop:false,  // start from bottom with brightest color
 *                            })
 *          zeppelinShadesOfColor.update(86);  // hue color degree
 *          pseudo; for each in index=0  Object.keys(zeppelinShadesOfColor.pathToHueDict).length -1 ;
 *              let path  = Object.keys(zeppelinShadesOfColor.pathToHueDict)[index]
 *              let color = zeppelinShadesOfColor.pathToHueDict[path]
 * see also, https://mika-s.github.io/javascript/colors/hsl/2017/12/05/generating-random-colors-in-javascript.html
 */

    constructor(options){
        if(options === undefined) options = {};
        if(options.pathCollection === undefined) options.pathCollection = [];
        if(options.reverseList === undefined) options.reverseList = false;
        this.pathCollection = options.pathCollection;
        this.brightestTop = true;
        this.saturation = options.saturation;
        this.lightness = options.lightness;
        this.elementList = [...this.pathCollection];
        this.pathToHueDict = undefined;
        this.hueColor = 300;
        this.pathToHueDict = {};
        this.reverseList = options.reverseList;
         /* make a list with color numbers that give no good contrast with default settings here, like 240 +-5 dict num
          * just to show how it works, blacklisted start, blacklisted stop
          */
        this.forbiddenColors = {1:[215,250],
                                2:[251,275],
                                };
        this.noColorList = [];
        this.noColorListCreate();  // make a list with forbidden colors, if(this.noColorList.includes(255)) {exec = false}
    }
    noColorListCreate(){
    /* js can check if value is in list "includes", pseudo: if list.includes(value)=true, element gets new color
     */
        for(let index=0;index<=Object.keys(this.forbiddenColors).length -1;index++){
            let key = Object.keys(this.forbiddenColors)[index];
            let val = this.forbiddenColors[key];
            let min = val[0];
            let max = val[1];
            for(let k=min;k<=max;k++){
                this.noColorList.push(k);
            }
        }
    }
    update(hueNum, pathListOption){
        /* create list of colors from 100% to min 50%,
         * pathListOption: can write a list with path id to change order of coloring ["gz1Body_5_part","gz1Body_1_part"]
         * must have a range to fit the list in
         *  {"gz1Body_1": "hue(122,50,50)",
         *   "gz1Body_2": "hue(122,51,50)",
         *  }
         */
        this.pathToHueDict = {};    // delete old stuff from dict
        let saturationBright = 50;  // min
        let saturationCrisp = this.saturation;  // option for max
        let lightnessDark = 20;     // min
        let lightnessBright = this.lightness;   // option for max
        /* make a lists of values to assign, best values last to see darker color at the bottom unless
         * this.brightestTop = false
         * keep it simple at first, make another method advanced stuff later
         *     start at 50 lightness and go down hue(112,50,50), hue(112,50,49) smaller is darker
         *     start at 100 saturation and go down hue(112,100,50), hue(112,99,50) smaller is darker
         */
        let updateFromList = true;
        if(pathListOption === undefined)  {
            pathListOption = this.elementList;
            let updateFromList = false;
        } else {
            this.elementList = pathListOption;
        }
        if(this.reverseList == true) pathListOption.reverse();

        let shadesNum = pathListOption.length;
        let _saturation = this.saturation;
        let _lightness = this.lightness;
        let saturationRange = saturationCrisp - saturationBright;
        let lightnessRange = lightnessBright - lightnessDark;
        let saturationStep = saturationRange /shadesNum;
        let lightnessStep = lightnessRange / shadesNum;
        // turn if we get more path elements than range count, [need test]
        if(shadesNum > saturationRange) saturationStep = shadesNum / saturationRange;
        if(shadesNum > lightnessRange) lightnessStep = shadesNum / lightnessRange;
        for(let index = 0;index <= pathListOption.length -1 ; index++){

           if(updateFromList == false){
           // constructor hits, gets path objects: need to ask for id from object, we choose an other color var to better show a different way to the same goal
               if(this.noColorList.includes(this.hueColor)){this.hueColor = getRandomIntInclusive(0,100);}
               this.pathToHueDict[pathListOption[index].id] = "hsl(" + hueNum + "," + _saturation + "%," + _lightness + "%)" ;
           }

            if(updateFromList == true){
            // direct method call provides hard coded list of html element id: simple values, no objects
                if(this.noColorList.includes(hueNum)){hueNum = getRandomIntInclusive(0,100);}
                this.pathToHueDict[pathListOption[index]] = "hsl(" + hueNum + "," + _saturation + "%," + _lightness + "%)" ;
            }
            /* this can be made better, we have exclusion list of colors already (this.forbiddenColors) to avoid color mush
             * color ranges have different lightness and saturation best fit ranges, needs investigation for next project
             */
            _saturation -= saturationStep;
            _lightness  -= lightnessStep;
        }
    }
}
;

/*                      -- Instances --
 */

// class was designed for the speaker with three animated bars and rewritten to be reusable universal in its boundaries
let infSpeaker = new PowerSwitch({path: document.querySelectorAll("#gSvgSpeakerFlatWaves path")});// animate speaker dynamic fake waves

let starOneInAMillion = new PowerSwitch({path: document.querySelectorAll("#gTuxStageStars path"),
                                            flashColor:"#fff",             // can also be set before updateOneInAMillion() to create randomness
                                            maxSimultaneousFlash: 3,       // max elements simultaneous animated
                                            flashPatternList: [0,1,0,1],   // each element multiplied by flashPatternMultiplier
                                                                           // is overall animation time 4 x 5 = 20 frames, can be [1] on whole time
                                            flashPatternMultiplier: 20,
                                            oneInAMillionRun:true,         // this.oneInAMillionList must be created
                                        });
let tuxIceFloeFrontPowerSwitch = new PowerSwitch({path: document.querySelectorAll(".tuxIceFloeFront"),  // if class no need to mention "path" or other element
                                              hue: getRandomIntInclusive(600,800),
                                              step:1/getRandomIntInclusive(4,8),   // to get more or less color reaction, divider
                                              max:12,
                                              maxCount:6,
                                              slider:2,
                                              dropShadow: "",
                                              animatePower:false  // only color change, no on/off
                                               });

/* can animate only fill on a use but here ok, all elements are clones of a rectangle PATH */
let buoyPosLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#buoySegmentVeryTopLight"),
                                           flashPatternList:  [0,0,0,1,1,1,0,0,0,1,0,1,0,1],// [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
                                           flashPatternMultiplier: 6
                                          });

let genreShaker           = new Shaker(); // show that genre is clickable
let genreSimpleCounter    = new SimpleCounter();  // teaser to show that genre text is clickable

let animalZRotationUpDown   = new CountUpDown(-7.5, 7.5, 1/Math.PI/10);    // animal Z rotation in deg and step
let animalTranslationUpDown = new CountUpDown(0, 40, 1/Math.PI/10);        // animal X translation in px and step
let buoyZRotationUpDown     = new CountUpDown(-3.5, 4.5, 1/Math.PI/20);    // buoy and buoy as space station (for super cat later),
                                                                           // same as us obama spoke: we fly to moon in 10 years, before 15 years+

let zeppelinShadesOfColor = new ShadesOfColor({ //pathCollection:zeppelinColorOrder, // pathCollection:document.querySelectorAll("#gZ1BodyHullAndRear path"),
                                                hueColor:112,
                                                saturation:100,
                                                lightness:50,
                                                brightestTop:false,  // start from bottom with brightest color
                                                reverseList:false,
                                               })
zeppelinShadesOfColor.update(getRandomIntInclusive(300,360), zeppelinColorOrder); // a list with order of path id s
/* send the whole instance to function to read dictionary and apply changes
 *   this.pathToHueDict {index of svg group element: hsl(119,50%,67%), indexN: hsl(119,50%,69%),... }
 */
changeColorPathToHsl(zeppelinShadesOfColor);
