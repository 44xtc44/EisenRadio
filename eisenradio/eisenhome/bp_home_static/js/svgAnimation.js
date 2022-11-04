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
 *          animateCheckeredBallon(smoothVolume);
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

const htmlColNames = [
                        "#CD5C5C",
                        "#F08080",
                        "#FA8072",
                        "#E9967A",
                        "#FFA07A",
                        "#DC143C",
                        "#FF0000",
                        "#B22222",
                        "#8B0000",
                        "#FFC0CB",
                        "#FFB6C1",
                        "#FF69B4",
                        "#FF1493",
                        "#C71585",
                        "#DB7093",
                        "#FFA07A",
                        "#FF7F50",
                        "#FF6347",
                        "#FF4500",
                        "#FF8C00",
                        "#FFA500",
                        "#FFD700",
                        "#FFFF00",
                        "#FFFFE0",
                        "#FFFACD",
                        "#FAFAD2",
                        "#FFEFD5",
                        "#FFE4B5",
                        "#FFDAB9",
                        "#EEE8AA",
                        "#F0E68C",
                        "#BDB76B",
                        "#E6E6FA",
                        "#D8BFD8",
                        "#DDA0DD",
                        "#EE82EE",
                        "#DA70D6",
                        "#FF00FF",
                        "#FF00FF",
                        "#BA55D3",
                        "#9370DB",
                        "#663399",
                        "#8A2BE2",
                        "#9400D3",
                        "#9932CC",
                        "#8B008B",
                        "#800080",
                        "#4B0082",
                        "#6A5ACD",
                        "#483D8B",
                        "#7B68EE",
                        "#ADFF2F",
                        "#7FFF00",
                        "#7CFC00",
                        "#00FF00",
                        "#32CD32",
                        "#98FB98",
                        "#90EE90",
                        "#00FA9A",
                        "#00FF7F",
                        "#3CB371",
                        "#2E8B57",
                        "#228B22",
                        "#008000",
                        "#006400",
                        "#9ACD32",
                        "#6B8E23",
                        "#808000",
                        "#556B2F",
                        "#66CDAA",
                        "#8FBC8B",
                        "#20B2AA",
                        "#008B8B",
                        "#008080",
                        "#00FFFF",
                        "#00FFFF",
                        "#E0FFFF",
                        "#AFEEEE",
                        "#7FFFD4",
                        "#40E0D0",
                        "#48D1CC",
                        "#00CED1",
                        "#5F9EA0",
                        "#4682B4",
                        "#B0C4DE",
                        "#B0E0E6",
                        "#ADD8E6",
                        "#87CEEB",
                        "#87CEFA",
                        "#00BFFF",
                        "#1E90FF",
                        "#6495ED",
                        "#7B68EE",
                        "#4169E1",
                        "#0000FF",
                        "#0000CD",
                        "#00008B",
                        "#000080",
                        "#191970",
                        "#FFF8DC",
                        "#FFEBCD",
                        "#FFE4C4",
                        "#FFDEAD",
                        "#F5DEB3",
                        "#DEB887",
                        "#D2B48C",
                        "#BC8F8F",
                        "#F4A460",
                        "#DAA520",
                        "#B8860B",
                        "#CD853F",
                        "#D2691E",
                        "#8B4513",
                        "#A0522D",
                        "#A52A2A",
                        "#800000",
                        "#FFFFFF",
                        "#FFFAFA",
                        "#F0FFF0",
                        "#F5FFFA",
                        "#F0FFFF",
                        "#F0F8FF",
                        "#F8F8FF",
                        "#F5F5F5",
                        "#FFF5EE",
                        "#F5F5DC",
                        "#FDF5E6",
                        "#FFFAF0",
                        "#FFFFF0",
                        "#FAEBD7",
                        "#FAF0E6",
                        "#FFF0F5",
                        "#FFE4E1",
];
/* inkscape path id s
 * overcome the order problem of inkscape path elements
 * inkscape order is svg layer order, but sometimes you want colorize, size in a different order
 */
const zeppelinColorOrder = ["z1Body_RearFinUpperRear",
                            "z1Body_01_part",
                            "z1Body_02_part",
                            "z1Body_RearFinUpperFront",
                            "z1Body_03_part",
                            "z1Body_04_part",
                            "z1Body_05_part",
                            "z1Body_06_part",
                            "z1Body_RearFinUnderFront",
                            "z1Body_07_part",
                            "z1Body_RearFinUnderRear",
                            "z1Body_08_part",
                            "z1BodyFinSide",
                            "z1BodyCabin",

]
function toggleAnimalDefaultDivSvG() {
/* html call: toggle between animals */
    eisenStylesDict["eisenRadio_" + activeListenId].updateAnimals();
}
;
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
//console.log(htmlElem);
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
    calcSin(val){
        this.sin = Math.sin(val) * this.step;
        return this.sin;
    }
    calcCos(val){
        this.cos = Math.cos(val) * this.step;
        return this.cos;
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
    moveXRight(elementId){
        let element = document.getElementById(elementId);
        try{
            element.style.transform = "translateX(" + (this.infiniteCounter) + "px)";
        }
        catch (error) {
        /*   console.error(error); */
        }
    }
    moveXLeft(elementId){
        let element = document.getElementById(elementId);
        try{
            element.style.transform = "translateX(" + (-this.infiniteCounter) + "px)";
        }
        catch (error) {
        /*   console.error(error); */
        }
    }
    moveYUp(){

    }
    moveYDown(){

    }
    moveYUpAndDown(elementId){
        let element = document.getElementById(elementId);
        try{
            element.style.transform = "translateY(" + (this.sin) + "px)";
        }
        catch (error) {
        /*   console.error(error); */
        }
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
    updateElement(elementId, moveMethod){
        if(moveMethod == "moveXRight")   {this.moveXRight(elementId);}
        if(moveMethod == "moveXLeft")    {this.moveXLeft(elementId);}
        if(moveMethod == "moveYUp")      {this.moveYUp(elementId);}
        if(moveMethod == "moveYDown")    {this.moveYDown(elementId);}
        if(moveMethod == "moveUpAndDown"){this.moveYUpAndDown(elementId);}
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
function colorizeDefaultSvgStageElements(darkBody){
/* target: colorize the SVG stage at day and night conditions, means dark mode pressed or not
 *  clouds and iceBerg move animated within the svg
 *
 * injected extra gradient in svg (means no use of it by default, copied gradient statement back into the svg file),
 *  because stuff not working, id="lgTuxStageOceanColorStopOne" and offset value via javascript,
 * !!!!!!!!!! have to add this to the svg or <g>, since inkscape throws it away, maybe because it is not used actually? create a ticket and burn it
 *	<linearGradient id="lgTuxStageOceanColorNight" x1="459.32" x2="466.57" y1="501.07" y2="231.73" gradientTransform="matrix(1,0,0,2.7448,0,-375.27)" gradientUnits="userSpaceOnUse" xlink:href="#lgTuxStageOceanNightLight">
 *		<stop id="lgTuxStageOceanColorStopOne" style="stop-color:black" offset="0"/>
 *		<stop id="lgTuxStageOceanColorStopTwo" style="stop-color:DarkSlateGray	" offset="1"/>
 *	</linearGradient>
 */
    let tuxStageSky   = document.getElementById('tuxStageSky');
    let tuxStageOcean = document.getElementById('tuxStageOcean');
    let tuxCloudOne   = document.getElementById('tuxCloudOne');
    let tuxCloudTwo   = document.getElementById('tuxCloudTwo');
    let tuxCloudThree = document.getElementById('tuxCloudThree');
    let tuxCloudFour  = document.getElementById('tuxCloudFour');
    let tuxCloudFive  = document.getElementById('tuxCloudFive');
    let tuxCloudOneBigWhite   = document.getElementById('tuxCloudOneBigWhite');
    let tuxCloudTwoBigWhite   = document.getElementById('tuxCloudTwoBigWhite');
    let tuxCloudThreeBigWhite = document.getElementById('tuxCloudThreeBigWhite');
    let tuxCloudFourBigWhite  = document.getElementById('tuxCloudFourBigWhite');
    let tuxIceBerg_1_Layer  = document.getElementById('tuxIceBerg_1_Layer');
    let tuxIceBerg_2_Layer  = document.getElementById('tuxIceBerg_2_Layer');
    let tuxIceBerg_3_Layer  = document.getElementById('tuxIceBerg_3_Layer');
    let tuxIceBerg_4_Layer  = document.getElementById('tuxIceBerg_4_Layer');
    let tuxStageStarsLeft    = document.getElementById('tuxStageStarsLeft');
    let tuxStageStarsRight   = document.getElementById('tuxStageStarsRight');
    let gTuxStageStars   = document.getElementById('gTuxStageStars');
    let starBackGroundPath  = document.getElementById('starBackGroundPath');

    if(darkBody){

        let bodyStyle = window.getComputedStyle(document.body, null);
        tuxStageSky.style.fill   = bodyStyle.backgroundColor;
        tuxStageOcean.style.fill = "url(#lgTuxStageOceanColorNight)"
        tuxCloudOne.style.fill    = bodyStyle.backgroundColor;
        tuxCloudTwo.style.fill    = bodyStyle.backgroundColor;
        tuxCloudThree.style.fill  = bodyStyle.backgroundColor;
        tuxCloudFour.style.fill   = bodyStyle.backgroundColor;
        tuxCloudFive.style.fill   = bodyStyle.backgroundColor;
        tuxCloudOneBigWhite.style.fill    = bodyStyle.backgroundColor;
        tuxCloudTwoBigWhite.style.fill    = bodyStyle.backgroundColor;
        tuxCloudThreeBigWhite.style.fill  = bodyStyle.backgroundColor;
        tuxCloudFourBigWhite.style.fill   = bodyStyle.backgroundColor;
        tuxCloudFiveBigWhite.style.fill   = bodyStyle.backgroundColor;
        tuxIceBerg_1_Layer.style.fill = "hsl(240, 5%," + tuxIceBerg_1_LayerUpDown.update() + "%)";
        tuxIceBerg_2_Layer.style.fill = "hsl(180, 5%," + tuxIceBerg_2_LayerUpDown.update() + "%)";
        tuxIceBerg_3_Layer.style.fill = "hsl(190, 5%," + tuxIceBerg_3_LayerUpDown.update() + "%)";
        tuxIceBerg_4_Layer.style.fill = "hsl(200, 5%," + tuxIceBerg_4_LayerUpDown.update() + "%)";
        gTuxStageStars.style.display = "inline-block";
        starBackGroundPath.style.display = "inline-block";

    } else {

        tuxStageSky.style.fill   = "url(#lgTuxStageSkyColor)";
        tuxStageOcean.style.fill = "url(#lgTuxStageOceanColor)";
        let bodyStyle = window.getComputedStyle(document.body, null);
        tuxEllipse.style.fill = "hsl(240,50%," + tuxEllipseColorUpDown.update() + "%)";
        tuxIceBerg_1_Layer.style.fill = "hsl(240, 50%," + tuxIceBerg_1_LayerUpDown.update() + "%)";
        tuxIceBerg_2_Layer.style.fill = "hsl(180, 50%," + tuxIceBerg_2_LayerUpDown.update() + "%)";
        tuxIceBerg_3_Layer.style.fill = "hsl(190, 35%," + tuxIceBerg_3_LayerUpDown.update() + "%)";
        tuxIceBerg_4_Layer.style.fill = "hsl(200, 35%," + tuxIceBerg_4_LayerUpDown.update() + "%)";
        tuxCloudOne.style.fill = "hsl(240,50%," + tuxCloudOneUpDow.update() + "%)";
        tuxCloudTwo.style.fill = "hsl(240,50%," + tuxCloudTwoUpDow.update() + "%)";
        tuxCloudThree.style.fill = "hsl(240,50%," + tuxCloudThreeUpDow.update() + "%)";
        tuxCloudFour.style.fill = "hsl(240,50%," + tuxCloudFourUpDow.update() + "%)";
        tuxCloudFive.style.fill = "hsl(240,50%," + tuxCloudFourUpDow.update() + "%)";
        tuxCloudOneBigWhite.style.fill   = "#fff";
        tuxCloudTwoBigWhite.style.fill   = "#fff";
        tuxCloudThreeBigWhite.style.fill = "#fff";
        tuxCloudFourBigWhite.style.fill  = "#fff";
        tuxCloudFiveBigWhite.style.fill  = "#fff";
        gTuxStageStars.style.display = "none";
        starBackGroundPath.style.display = "none";
    }
}
;
function defaultFrontAnimation(smoothVolume, powerLevelDict){
/* default animation, can be switched off in tools menu config */

    let fullPower = false;  // used to show different colors at very high volume; later used for space cat with pink hands and eyes
    let scaleUnifier = powerLevelDict[Object.keys(powerLevelDict)[0]];  // multiply with all volume val to get lower audio ranges up
    if(Object.keys(powerLevelDict)[0] == "fullPower"){fullPower = true;}
    let darkBody = getBodyColor();   // html body
    let animSvg;                     // svg

    try {
        let ypsilonTranslation;  // fine tune position of animal up or down
        // enable animal
        let animalContainer = eisenStylesDict["eisenRadio_" + activeListenId].animal + activeListenId;
        let animSvg = document.getElementById(animalContainer);
        animSvg.style.display = "inline-block";
        // enable ice floe
        let divSvgIceTux = document.getElementById("divSvgIceTux_" + activeListenId); // ice floe  
        divSvgIceTux.style.display = "inline-block";

        if(smoothVolume < 1){smoothVolume = 1;}
        animSvg.style.transformOrigin = "40% center"; // top,center
        animSvg.style.transform      = "translateX(" + animalTranslationUpDown.update() + "px)";
        divSvgIceTux.style.transform = "translateX(" + animalTranslationUpDown.update() + "px)";
        divSvgIceTux.style.transform += "rotateZ(" + animalZRotationUpDown.update() + "deg)";
        ypsilonTranslation = -50;

        animSvg.style.transform += "scaleX(" + (smoothVolume * scaleUnifier) + ")";
        animSvg.style.transform += "scaleY(" + (smoothVolume * scaleUnifier) + ")";
        animSvg.style.transform += "rotateZ(" + animalZRotationUpDown.update() + "deg)";
        animSvg.style.transform += "translateY(" + ypsilonTranslation + "px)";

    } catch (error) {
        console.log(error);
    }
}
;
function defaultStageHtmlElementsShow(){
/* SVG STAGE, HTML decoration */
    try{
        document.getElementById("divMainAnimationContainer_" + activeListenId).style.display = "inline-block";
        document.getElementById("animatedBackGround_" + activeListenId).style.display = "inline-block";   // svg sky, ocean
        document.getElementById("divSvgBuoy_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgIceTux_" + activeListenId).style.display = "inline-block"; // the floe, scholle
        document.getElementById("divSvgScrewHeadTopRight_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadTopLeft_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadBottomRight_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadBottomLeft_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgGlasBreakTopRight_" + activeListenId).style.display = "inline-block";
    }
    catch (error) {}
}
;
function defaultFlatSpeakerAnimation(){
/* speaker are not in the default animation container, in upper left top, should be consolidated, sometimes it feels desperate, human */
    try{
        let speakerDiv = document.getElementById("divSvgFlatSpeaker_" + activeListenId);
        speakerDiv.style.display = "inline-block";
        let speakerRightDiv = document.getElementById("divSvgFlatSpeakerTopRight_" + activeListenId);
        speakerRightDiv.style.display = "inline-block";
    }
    catch (error) {}
}
;
function svgAnimationMain(){
    /* renamed MAIN for svg/html animation
     * function is browser frame based, calls itself, requestAnimationFrame at bottom
     * target: call all animations that have a run status, function decides itself
     * smoothVolume is used as scale multiplier for animations of animals and color differences for speakers
     * AnimationTimer class has run attribute, true if an animation may run;
     * AnimationTimer instance can call functions after reset() to change color, direction ...
     */
    let smoothVolume = smoothOutVolume(128, 0.04);

    /* target: powerLevelDict gets name of the coloring method of PowerSwitch class and a multiplier for the animation level
     *  to artificial raise smoothVolume for low animation levels; is not implemented yet, only no power strikes
     *  to lever scaling of the animals at very low frequency/amplitude to see a movement, {"lowPower":1}
     *  leads to the fact, that at no data input the animal is glued max size to the screen, {"noPower":3}
     * powerLevelAnimation({smoothVolume: smoothVolume, animatedInstance: animatedInstance})
     */
    let powerLevelDict = powerLevelAnimation({smoothVolume: smoothVolume}); // can also send instance as option

    let darkBody = getBodyColor();
    defaultStageHtmlElementsShow();
    colorizeDefaultSvgStageElements(darkBody);
    animateFrontPigs(darkBody, smoothVolume, powerLevelDict); // powerLevelDict
    animateBuoy(darkBody);  // edit button
    animateSpeaker(smoothVolume);
    animateZeppelin(darkBody, smoothVolume);
    animateCheckeredBallon(smoothVolume);
    animateParachuteDrop();
    animateA1AirCraft();
    animateClouds(darkBody);
    animateGpsSat(darkBody);
    animateStars(darkBody);
    animateGenreClickTeaser();

    inflateAnim = window.requestAnimationFrame(svgAnimationMain);
}
;
function animateGenreClickTeaser(){
/* show I am clickable to switch some items on/off, headline, display badge */
    let fpm = 3600;
    let ringTime = 30 * fpm;
    genreSimpleCounter.update(); // 60fps 3600fpm * 30 = half hour
    if(genreSimpleCounter.count >= ringTime){genreShaker.shake("divStationGenre_" + activeListenId, 1);}
    if(genreSimpleCounter.count >= ringTime + 120){genreSimpleCounter.reset();}
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
function animateBuoy(darkBody){
/* BUOY Must not disabled, second EDIT BUTTON */
        let buoySegmentVeryTopLight = document.getElementById("buoySegmentVeryTopLight");
        let divSvgBuoy = document.getElementById("divSvgBuoy_" + activeListenId);
        let flashDayColor   = "hsl(" + 300 + ", 100%, 50%)";
        let flashNightColor = "hsl(" + 10 + ", 100%, 50%)";
        if(darkBody){
            buoyPosLightPSwitch.flashColor = flashNightColor
        } else {
            buoyPosLightPSwitch.flashColor = flashDayColor
        }
        buoyPosLightPSwitch.updateFlashPattern();
        // zRotation and x to swim
        divSvgBuoy.style.transform = "translateX(" + -animalTranslationUpDown.update()/4 + "px)";
        divSvgBuoy.style.transform += "rotateZ(" + buoyZRotationUpDown.update() + "deg)";
}
;
function animateSpeaker(smoothVolume){
    if(htmlSettingsDictGlobal["checkboxConfigFlatSpeaker"]){
    /* SPEAKER */
        defaultFlatSpeakerAnimation();
        powerLevelAnimation({smoothVolume: smoothVolume,
                            animatedInstance: infSpeaker
        });
    }
}
;
function animateClouds(darkBody){
    /* clouds and iceBerg fix for firefox, this is an example to not even think about using smil, svg inbound animation
     * ff is so buggy in relation to animation on canvas html and svg, canvas blur -> crash of ff
     * it is known to them for years, but nobody is interested in, looks like it is a government company
     * <animateTransform attributeName="transform" attributeType="XML" dur="3600s" from="0" repeatCount="indefinite" to="1000" type="translate"/>
     * workaround which does the same as the svg <animation >
     * write a class to remember the start and endpoints of the movement and know where we are in the moment
     */
    if(htmlSettingsDictGlobal["checkboxConfigAnimation"] && htmlSettingsDictGlobal["cpuUtilisation"]){
        tuxIceBergMoveX.update();
        tuxCloudOneMoveX.update();
        tuxCloudTwoMoveX.update();
        tuxCloudThreeMoveX.update();
        tuxCloudFourMoveX.update();
        tuxCloudFiveMoveX.update();
    }
}
;
function animateGpsSat(darkBody){
    /* Satellite */
    if(htmlSettingsDictGlobal["checkboxConfigAnimation"] && htmlSettingsDictGlobal["cpuUtilisation"]){
        if(darkBody){
            tuxGpsSatMoveX.update();
            tuxSatelliteMoveX.update();
            document.getElementById("gGpsSat").style.display = "inline-block";
            document.getElementById("gSatellite").style.display = "inline-block";
        } else {
            document.getElementById("gGpsSat").style.display = "none";
            document.getElementById("gSatellite").style.display = "none";
        }
    } else {
            document.getElementById("gGpsSat").style.display = "none";
            document.getElementById("gSatellite").style.display = "none";
    }

}
;
function animateZeppelin(darkBody, smoothVolume){
    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* Zeppelin */
        let flashDayColor   = "hsl(" + 90 + ", 100%, 50%)";
        let flashNightColor = "hsl(" + 300 + ", 100%, 50%)";
        let divAnimate = "divSvgZ1_" + activeListenId;
        let animationTimerInstance = z1ZeppelinAniTimer;
        let moveSinCosInstance     = z1ZeppelinMoveSinCos;
        // Position lights
        if(darkBody){
            z1ZeppelinPosLightPSwitch.flashColor = flashNightColor;
        } else {
            z1ZeppelinPosLightPSwitch.flashColor = flashDayColor;
        }
        animationTimerInstance.update();
        let checkeredBalloon = b1BalloonAniTimer;
        if(checkeredBalloon.run === true) {
            /* help fireFox to not hang if b1 and paras appear at the same time */
            document.getElementById(divAnimate).style.display = "none";
            return;
        }
        if(animationTimerInstance.run === true){
            z1ZeppelinPosLightPSwitch.updateFlashPattern();
            let extraTransform = "rotateZ(" + z1ZeppelinUpDown.update() + "deg)";
            moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
            powerLevelAnimation({smoothVolume: smoothVolume,
                                animatedInstance: z1ZeppelinPowerSwitch
            });
        }
    }
}
;
function animateCheckeredBallon(smoothVolume){
    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* checkered balloon */
        let divAnimate = "divSvgB1_" + activeListenId;
        let animationTimerInstance = b1BalloonAniTimer;
        let moveSinCosInstance     = b1BalloonMoveSinCos;
        let extraTransform;

        animationTimerInstance.update();
        if(animationTimerInstance.run === true){
            extraTransform = "rotateZ(" + b1BalloonUpDown.update() + "deg)";
            b1BalloonBurnerRedPSwitch.flashColor = "hsl(" + 300 + ", 100%, 50%)";
            b1BalloonBurnerRedPSwitch.updateFlashPattern();
            b1BalloonBurnerYPSwitch.flashColor = "hsl(" + 60 + ", 100%, 50%)";
            b1BalloonBurnerYPSwitch.updateFlashPattern();
            moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
            /*
             * random event can start, from AnimationTimer class
             *  can not animate all four <g> color groups, this looks not good
             */
            if(b1BalloonAniTimer.randomEvent == true){
                powerLevelAnimation({smoothVolume: smoothVolume,
                                     animatedInstance: b1ColorOnePowerSwitch
                });
                powerLevelAnimation({smoothVolume: smoothVolume,
                                     animatedInstance: b1ColorFourPowerSwitch
                });
            }
        }
    }
}
;
function animateParachuteDrop(){
    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* PARACHUTE DROP
     * animate a number of svgs as air drop from elsewhere, aircraft triggers activation
     */
        let animationTimerInstance;
        let moveSinCosInstance;
        let divAnimate;
        let extraTransform;
            for(let index=0;index<=paraMemberCount -1;index++){
                divAnimate = paraUnitDept + (index + 1) + "_" + paraParentDiv + "_" + activeListenId;  // AirDrop2_divDragRopeA1AirCraft_11
                let timerKey  = Object.keys(paraAnimTimerDict)[index];
                let moveKey   = Object.keys(paraMoveSinCosDict)[index];
                let rotateKey = Object.keys(paraUpDownDict)[index];

                animationTimerInstance = paraAnimTimerDict[timerKey];
                animationTimerInstance.update();
                if(animationTimerInstance.run === true){
                    moveSinCosInstance     = paraMoveSinCosDict[moveKey];
                    extraTransform = "rotateZ(" + paraUpDownDict[rotateKey].update() + "deg)";
                    moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
                }
        }
     }
}
;
function animateA1AirCraft(){

    if(htmlSettingsDictGlobal["checkboxConfigBalloon"] && htmlSettingsDictGlobal["cpuUtilisation"]){
    /* AirCraft has set scale Mod for a1AirCraftAniTimer instance
     */
        let flashTail   = "hsl(" + 90 + ", 100%, 100%)";
        let flashRight  = "hsl(" + 360 + ", 100%, 50%)";
        let flashLeft   = "hsl(" + 90 + ", 100%, 50%)";

        let divAnimate  = "divA1AirCraft_" + activeListenId;
        let animationTimerInstance = a1AirCraftAniTimer;
        let moveSinCosInstance = a1AirCraftMoveSinCos;

        animationTimerInstance.update();
        if(animationTimerInstance.run === true){
            a1AirCraftTLightPSwitch.flashColor = flashTail;
            a1AirCraftRLightPSwitch.flashColor = flashRight;
            a1AirCraftLLightPSwitch.flashColor = flashLeft;
            a1AirCraftTLightPSwitch.updateFlashPattern();
            a1AirCraftRLightPSwitch.updateFlashPattern();
            a1AirCraftLLightPSwitch.updateFlashPattern();
            let extraTransform = "rotateZ(" + a1AirCraftUpDown.update() + "deg)";
            moveRandomAngle(animationTimerInstance, moveSinCosInstance, divAnimate, extraTransform);
            /* termination here since moveRandomAngle() looks only for screen borders and y as terminator
             * trigger parachutes drop
             */
            if(animationTimerInstance.scale === animationTimerInstance.scaleMax){
                animationTimerInstance.reset();
                moveSinCosInstance.reset();
                document.getElementById(divAnimate).style.display = "none";

                // ParachuteDrop, force AnimationTimer instances to run
                let parachuteTimerInstance;
                for(let index=0;index<=paraMemberCount -1;index++){
                    let timerKey = Object.keys(paraAnimTimerDict)[index];
                    parachuteTimerInstance = paraAnimTimerDict[timerKey];
                    parachuteTimerInstance.animationWaitTime = 0;
                }
            }
        }
     }

}
;

class MoveX {
/* target: move an element with fireFox jitter correction in x direction by using js (smil svg animation jitters in FireFox <animate>)
 * description:
 *  fFox fix, move x jitter correction with minimal z rotation depends on speed, else rotation is visible
 *  rotation must be up down over time to hide it, use CountUpDown class instance, MUST test values in ff
 * usage:
 *  let tuxIceBergMoveX = new MoveX({
                                    element:"tuxStageIceBerg",
                                    start:0,end:1000,duration:3600,
                                    rotation:0.02,moveBack:false
                                    })
 * tuxIceBergMoveX.update();

 * update:
 * functionality ok, but now we see no jitter in FireFox using js; if we disable z rotation on pure x axis translation, lol
 *
 * to let the satellite fly around we make a translateY with min, max (can move all y)
 */
    constructor(options){
        if(options === undefined) options={};
        if(options.moveBack === undefined) options.moveBack=false;
        if(options.waitTime === undefined) options.waitTime=false;
        if(options.scale === undefined) options.scale=1;
        if(options.direction === undefined) options.direction=1;   // 1 to right, 0 to the left
        if(options.modY === undefined) options.modY=0;             // y modifier to get a curve if needed, satellites
        this.element = options.element;   // html or svg element id
        this.start = options.start;       // start x
        this.end = options.end;           // end x
        this.duration = options.duration; // time frame in seconds must be converted in browser frames, 60/s
        this.durationMax = 125;
        this.durationMin = 85;
        this.frames = this.duration * 60;
        this.speed = (this.end-this.start)/this.frames;  // speed is negative if move from 20 to -10, (-10)-20=-30
        this.moveBack = options.moveBack; // true or false
        this.rotation = options.rotation; // z rotation deg from -deg to +deg
        this.zUpDown = new CountUpDown(-(this.rotation), (this.rotation), this.speed); // CountUpDown(start,end,step)
        this.currentX = this.start;
        this.maxY = 50; // can go down a bit to vary
        this.minY = 0;
        this.currentY = getRandomIntInclusive(this.minY,this.maxY);
        this.modY = options.modY;
        this.waitTime = options.waitTime;
        this.waitCount = 0;
        this.logName = this.element;
        this.scale = options.scale;
        this.direction = options.direction;
    }
    reset(){
    /* next interval */
        if(this.moveBack === true) {
        // move -x or +x
            if(this.speed >= 0) {
                this.speed = -this.speed;
            } else {
                this.speed = +this.speed;}
        } else {
        // jump to origin
            this.currentX = this.start;
            this.currentY = getRandomIntInclusive(this.minY,this.maxY);  // move element up down a bit
            // this.duration = getRandomIntInclusive(this.durationMin,this.durationMax);
            if(! this.waitTime === false) this.waitCount = 0;
            return;
        }
    }
    move(){
        this.currentX += this.speed;
        if(this.direction == 1) {
            if(this.currentX >= this.end) this.reset();
        } else {
            if(this.currentX <= this.end) this.reset();
        }
        let box = document.getElementById(this.element);
        box.style.transform  = "translateX(" + this.currentX + "px)";
        this.currentY += this.modY;
        box.style.transform += "translateY(" + this.currentY + "px)";
        box.style.transform += "rotateZ(" + this.zUpDown + "deg)";
        box.style.transform += "scale(" + this.scale + "," + this.scale + ")";
    }
    update(){
        if(this.waitTime === false) {
             this.move();
             return;
        }
        if(this.waitCount <= this.waitTime) {
            this.waitCount += 1;
            return;
        } else {
            this.move();
        }
    }
}

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
let b1BalloonBurnerRedPSwitch = new PowerSwitch({path: document.querySelectorAll(".b1BurnerFlameRed"),
                                           flashPatternList:  [1,1,1,1,1,0,0,0,0,0,0],
                                           flashPatternMultiplier: 17,
                                          });
let b1BalloonBurnerYPSwitch = new PowerSwitch({path: document.querySelectorAll(".b1BurnerFlameYellow"),
                                           flashPatternList:  [0,0,0,1,1,1,1,1,1,0,0],
                                           flashPatternMultiplier: 10,
                                          });

let b1ColorOnePowerSwitch = new PowerSwitch({path: document.querySelectorAll(".color_One"),  // if class no need to mention element
                                              hue: getRandomIntInclusive(600,800),
                                              step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                              max:12,
                                              maxCount:6,
                                              slider:2,
                                              dropShadow: "",
                                              animatePower:false  // only color change, no on/off
                                               });
let b1ColorFourPowerSwitch = new PowerSwitch({path: document.querySelectorAll(".color_Four"),  // if class no need to mention element
                                              hue: getRandomIntInclusive(600,800),
                                              step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                              max:12,
                                              maxCount:6,
                                              slider:2,
                                              dropShadow: "",
                                              animatePower:false  // only color change, no on/off
                                               });
let b1BalloonAniTimer    = new AnimationTimer({animationWaitTime: 5000,scale:2,speed:5,logName:"b1Balloon",
                              /* target: store an argument function (instance call) in another instance class variable
                               *            and call it on demand
                               *    one: wrap function in anonymous function in the caller,
                               *    two: wrap argument in an anonymous function again, in the called
                               *    store it in a variable (parameter, the implementation inside the subroutine, write to clarify)
                               */
                                            randomEventFunction:function(){
                                                                    b1ColorOnePowerSwitch.applyOrgColor("b1Balloon");   // arg logName
                                                                    b1ColorFourPowerSwitch.applyOrgColor("b1Balloon");
                                                                            },
                            });
let b1BalloonMoveSinCos  = new MoveSinCos();  // calc y for given x and angle
let b1BalloonUpDown      = new CountUpDown(-.2, 1, 1/Math.PI/10/10);  // rotation in the "wind" for firefox stutter browser

let z1ZeppelinAniTimer   = new AnimationTimer({
                                               animationWaitTime: 1800,
                                               logName:"Zeppelin",
                                               speed:12,
                                               externalFunction:function(){
                                                                     let baseColorHue = getRandomIntInclusive(1,360);
                                                                     console.log("z1ZeppelinAniTimer color ",baseColorHue)
                                                                     zeppelinShadesOfColor.update(baseColorHue);
                                                                     /* write to dict timeout */
                                                                     setTimeout(function () {changeColorPathToHsl(zeppelinShadesOfColor)}, 500);
                                                                            },
                                              });
let z1ZeppelinMoveSinCos = new MoveSinCos();
let z1ZeppelinUpDown     = new CountUpDown(-0.5, 1, 1/Math.PI/10/10);  // fix for firefox, stutter if no rotation
let z1ZeppelinPosLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#z1PositionLights path"),  // if id mention path element,
                                           flashPatternList:  [0,0,0,1,1,1,0,0,0,1,0,1],// [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
                                           flashPatternMultiplier: 6
                                          });
let z1ZeppelinPowerSwitch = new PowerSwitch({path: document.querySelectorAll("#z1AnimatedFills path"),
                                  hue: getRandomIntInclusive(600,800),
                                  step:1/getRandomIntInclusive(4,8),   // to get more or less reaction, divider
                                  max:12,
                                  maxCount:6,
                                  slider:2,                            // all elements power on/off interval against the follower
                                  dropShadow: "",
                                  animatePower:false
                                  });

let a1AirCraftAniTimer   = new AnimationTimer({
                                               overrideDefault: true,  // not use all reset options to keep settings
                                               angle: getRandomIntInclusive(240,360),
                                               angleUp: true,
                                               angleMod: 0.05,         // 0.01 default
                                               scale: 0.51,            // min val of constructor
                                               scaleMod: 1/150,
                                               scaleMax: 5,
                                               animationWaitTime: 10800, // 3min 10800
                                               logName:"a1AirCraftParaChuteDropper",
                                               speed:15,
                                               externalFunction:function(){
                                                                    let rnd = getRandomIntInclusive(240,360);
                                                                    //console.log("a1AirCraft, update approach direction ",a1AirCraftAniTimer.lastAngle);
                                                                    a1AirCraftAniTimer.lastAngle = rnd;
                                                                            },
                                              });
let a1AirCraftTLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftTailLightWhite"),  // if id mention path element, but only if multiple
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftRLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftRightWingLightRed"),  // if id mention path element,
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftLLightPSwitch = new PowerSwitch({path: document.querySelectorAll("#a1AirCraftLeftSideWingLightGreen"),  // if id mention path element,
                                           flashPatternList:  [1,0,0,1,0,0,1,0,0,1,0,0,0,0],
                                           flashPatternMultiplier: 10
                                          });
let a1AirCraftMoveSinCos  = new MoveSinCos();  // calc y for given x and angle
let a1AirCraftUpDown      = new CountUpDown(-30, 0, 1/Math.PI/5);  // over wing rotation

let genreShaker           = new Shaker(); // show that genre is clickable
let genreSimpleCounter    = new SimpleCounter();  // teaser to show that genre text is clickable

let animalZRotationUpDown   = new CountUpDown(-7.5, 7.5, 1/Math.PI/10);    // animal Z rotation in deg and step
let animalTranslationUpDown = new CountUpDown(0, 40, 1/Math.PI/10);        // animal X translation in px and step
let buoyZRotationUpDown     = new CountUpDown(-3.5, 4.5, 1/Math.PI/20);    // buoy and buoy as space station (for super cat later),
                                                                           // same as us obama spoke: we fly to moon in 10 years, before 15 years+
let tuxCloudOneUpDow        = new CountUpDown(85, 100, 1/Math.PI/11);      // cloud changes white and grey a bit
let tuxCloudTwoUpDow        = new CountUpDown(85, 100, 1/Math.PI/12);      // cloud changes white and grey a bit
let tuxCloudThreeUpDow      = new CountUpDown(75, 95, 1/Math.PI/13);       // cloud changes white and grey a bit
let tuxCloudFourUpDow       = new CountUpDown(80, 98, 1/Math.PI/10);       // cloud changes white and grey a bit
let tuxEllipseColorUpDown   = new CountUpDown(70, 100, 1/Math.PI);         // Tux ellipse blue 240 to white , here lightness values, surface of Floe
let tuxIceBerg_1_LayerUpDown= new CountUpDown(85, 100, 1/Math.PI/10);      // blue 240 to white , here lightness values
let tuxIceBerg_2_LayerUpDown= new CountUpDown(60, 80, 1/Math.PI/10);       // hsl 180,50%,60-80% hue sat light
let tuxIceBerg_3_LayerUpDown= new CountUpDown(45, 65, 1/Math.PI/10);       // 190,35%,45-65%
let tuxIceBerg_4_LayerUpDown= new CountUpDown(40, 60, 1/Math.PI/10);       // 200,35%,40-60%
/* fFox fix */
let tuxStageAllFFUpDown = new CountUpDown(-0.5, 1, 1/Math.PI/10/10);  // all moving parts must rotate or jitter, worst browser this time

let tuxIceBergMoveX = new MoveX({
                                  element:"tuxStageIceBerg",
                                  start:0,
                                  end:1000,
                                  duration:3600,
                                  rotation:1,
                                 })
let tuxCloudOneMoveX = new MoveX({
                                  element:"gTuxCloudOne",
                                  start:0,
                                  end:1000,
                                  duration:100,
                                  rotation:1,
                                 })
let tuxCloudTwoMoveX = new MoveX({
                                  element:"gTuxCloudTwo",
                                  start:0,
                                  end:1000,
                                  duration:105,
                                  rotation:1,
                                 })

let tuxCloudThreeMoveX = new MoveX({
                                  element:"gTuxCloudThree",
                                  start:0,
                                  end:1000,
                                  duration:115,
                                  rotation:1,
                                 })
let tuxCloudFourMoveX = new MoveX({
                                  element:"gTuxCloudFour",
                                  start:0,end:1000,
                                  duration:125,
                                  rotation:1,
                                 })
let tuxCloudFiveMoveX = new MoveX({
                                  element:"gTuxCloudFive",
                                  start:0,
                                  end:1000,
                                  duration:120,
                                  rotation:1,
                                 })
let tuxGpsSatMoveX = new MoveX({
                                  element:"gGpsSat",
                                  start:700,end:-500,
                                  duration:80,
                                  rotation:0.02,
                                  modY:-0.05,  // modY -
                                  waitTime:7200,
                                  scale:0.3,direction:0,
                                 })
let tuxSatelliteMoveX = new MoveX({
                                  element:"gSatellite",
                                  start:0,end:500,
                                  duration:50,
                                  rotation:0.02,
                                  modY:+0.1,   // modY +
                                  waitTime:7000,
                                  scale:0.6,
                                 })

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

/*  let's make a parachute drop
 * target: animate an unlimited number of divs that belong to one theme create random actions and colors inside the theme;
 * each parachute gets an id for an animated div
 */
let paraAnimTimerDict = {};  // angle and time of appearance
let paraUpDownDict = {};     // angle for partial rotation of div
let paraMoveSinCosDict = {}; // calc the y for given x and angle (tan)
let paraUnitDept = "AirDrop";  // if more drop instances, have log names
let paraParentDiv = "divDragRopeA1AirCraft";  // query class members divRadioFrontPlate_1 to divRadioFrontPlate_10
let airDropDelDict = {};  //  {radioId: [div1,div2,div3]} for cleanup routine to set paraParentDiv child to display none
let paraMemberCount = getRandomIntInclusive(4,6);
    /* paraAnimTimerDict */
    for(let index = 1;index<=paraMemberCount;index++){
        paraAnimTimerDict[paraUnitDept + index] =
            new AnimationTimer({animationWaitTime: 999999,   // changed! now airplane sets run status true for paraAnimTimerDict
                                scale:0.8,scaleMax:1.3,speed:10,angleDown:false,logName:"parachuteDrop_" + index});
    }

    /* paraUpDownDict for partial Z rotation */
    for(let index = 1;index<=paraMemberCount;index++){
        paraUpDownDict[paraUnitDept + index] =
            new CountUpDown(-(getRandomIntInclusive(5,10)), (getRandomIntInclusive(2,10)), 1/Math.PI/10);
    }
    /* paraMoveSinCosDict random direction */
    for(let index = 1;index<=paraMemberCount;index++){
        paraMoveSinCosDict[paraUnitDept + index] = new MoveSinCos();
    }

    /* create a div for each parachute, divRadioFrontPlate parent div with position relative attribute to assign absolute for children
     */
     let htmlCollection = document.getElementsByClassName(paraParentDiv);  // collection of objects not array, can not work with original
     let paraParentDivIds = [...htmlCollection];                           // clone, all div ids of class collection in an array

     for(let index=0;index<=paraParentDivIds.length -1;index++){       // for every radio
        let radioId;
        let divList = new Array();
        for(let memberNum=1;memberNum<=paraMemberCount;memberNum++){   // create num of divs
            let div = document.createElement('div');
            /* pcDrop10_divSvgZ1_10; z1DivNames[index].id is also underscore name_10, so id can id.split[2]*/
            div.id = paraUnitDept + memberNum + "_" + paraParentDivIds[index].id;   // paraParentDivIds[index].id is text name of object
            paraParentDivIds[index].appendChild(div);                           // paraParentDivIds[index]    is (real) object html, element
            divList.push(div.id);
            radioId = div.id.split("_")[2];
            /* An example how to dynamically assemble an svg with external <use> elements to color a particular <g> group,
             *  divided the svg in <g> groups, each group is a <use> in the new <svg> <use>, <use> ... </svg>
             *      this allows to assign a fill attribute to individual groups (<use>)
             *                      NO HARDCODED FILL IN THE PATH tag OR no color ...
             * paras keep their color and add-on (ribbon, star), also if switching back to a radio, one shot action on startup
             *  can be changed in para function for drop animation frame call
             */

            let rndColor = getRandomIntInclusive(0,htmlColNames.length -1);
            let rndEvtNum = getRandomIntInclusive(1,5);  // can show some extra animations seldom
            let starDrop   = "<use href=#gParaDropStar visibility='collapse'></use>";
            let ribbonDrop = "<use href=#gRibbon visibility='collapse'></use>";
            if(rndEvtNum === 1 || rndEvtNum === 2) ribbonDrop = "<use href=#gParaDropStar visibility='visible'></use>";
            if(rndEvtNum === 3) ribbonDrop = "<use href=#gRibbon visibility='visible'></use>";
            div.innerHTML = "<svg id=" + "svg_" + paraUnitDept + memberNum + "_" + paraParentDivIds[index].id + ">"
                                + "<use href=#gParaDropPrimerGroup></use>"
                                + "<use href=#gParachuteInnerHelmet></use>"
                                + "<use href=#gParachuteHelmet fill=" + htmlColNames[rndColor] + "></use>"
                                + "<use href=#gParachuteDots></use>"
                                + "<use href=#gParachuteStrings></use>"
                                + starDrop
                                + ribbonDrop
                            + "</svg>"
            div.style.border = "none";//"5px solid red";
            div.style.position = "absolute";
            div.style.zIndex = "3";
            div.style.display = "none";
            div.style.width = "100%";
            div.style.top = "0em";
            div.style.left = "0em";
            div.style.maxWidth = "1em";
            div.style.maxHeight = "1em";
            div.style.transform = "";    // break transform inheritance scale from aircraft
        }
        airDropDelDict[radioId] = divList;  // help to delete (set display none), function in index.js, deleteInfoExec()
     }
console.log("parachute dicts ",paraAnimTimerDict, paraUpDownDict, paraMoveSinCosDict);
console.log("parachute html collection ",htmlCollection, airDropDelDict);

