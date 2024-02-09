// svg-toCanvas.js  fold selection in Pycharm is ctrl + .
"use strict";

/*
  This script is heavily under construction. Especially the edit SVG method.
  Absolute prerequisite to move to Java on Android. Must edit XML path, can not use HTML DOM element.
  Search "android svg+xml;utf8"
  XML. https://androidbycode.wordpress.com/2015/03/18/vector-graphics-in-android-converting-svg-to-vectordrawable/

  Update.
  No need to fix Edit fun to use CSS style attributes also, CSS has precedence over stand alone attributes.
  Android does not support CSS style, so far.
  "fillColor", "pathData" attributes, no gradient allowed. Can be faked by Shader class.
*/

/* Welcome to RegEx hell! No SVG parser allowed in this project. Let's demonstrate some regex skills.
  Regex the initial XML Serializer to text output. Attach SVG tag and a header.
  We save two steps.
  (a) Our text to object (DOMparser), (b) to text (XMLSerializer) again.

  Task. Create a one fits all solution to move an SVG image, or SVG sprites, super smooth over the screen per Browser Frame.
    A method or more to change color and visibility. Work package: use txt, list approach to apply changes over parser
    A method or more to move, rotate and distort the image. Work package: master transform, translate, rotate fun; it is NOT same as DOM css, JS moves a div
    A method to paint the whole mess onto the canvas. Work package: create a robust template (incl. empty steps), we go through every frame, to apply changes

  Update:
    It's revealed that we need to load all img or one image with multiple groups before action. Like a PNG sprite.
    Else getting unreliable loads, missing images.
    Now load one SVG with groups, which represent images. All groups (img) will be named as option in a list.
    Means, loading multiple images with multiple groups in a class, instance is possible.
    See constants.js for the actual list of dicts (image instances). There are also images only used as click area.

    Each img (svg group) will be connected to one "default" canvas DOM element.
    The group must use the width and height of the parent SVG in the loader dictionary.
    The group is then assigned to, or better, surrounded by an <svg tag with the correct width and height.
    This SVG gets the correct header [image/svg+xml;utf8,] + a Payload [SVG_as_a_string].
    The ctx.drawImage() input is ready!
    This is stored as .src attribute of the in mem image instance and can be "also" connected to <image src= elsewhere.
    No need to base64 encode/decode, as I did partially in GhettoRecorder.

     window.svgTC = new SvgToCanvas( { svg: ["aCircle", "theTux", "thePolarBear", "theBuoy", "eisenradioSVG"] ,
      useSprite:true,  // tell the multi image loader to use stacked groups; a group can be a sprite [img,img] also
      spriteList:[ {"testCircle":   {"grp": "testCircle", "cvs": "c_00", "w": "100", "h": "100"  }},  // group,canvas,svg width,height

    Each img is loaded in the instance as a list of tags <g, <p... . Tag list can be manipulated in svgEditPath(). todo use one txt file

    To draw, we call the instance with the name of the group (image) and canvas.
    Means, we do not have multiple instances, but use one instance of SvgToCanvas class with all images loaded.
*/

class TransCanvas {
  /* Helper; preset all possible properties for translation, rotation stuff
    Called by SvgToCanvas

    ctx.fillStyle = somePattern;    |---------------------------------------- Canvas, static, Desk we paint onto
    ctx.beginPath();                |  |------------------------------------ Context, dynamic, Desk protector we move with the paperwork
                                    |  | ctx (a position)                    on the desk translateX (a) AND can move upper edge under the
                                    |  |                                     image (e.g. center) to (b) ctx.rotate(-1 * Math.PI / 4);
    ctx.moveTo(20, 20);             |  |  |-------------------------------| image, static, Velcro fastened to ctx, stamp on a postcard,
    ctx.lineTo(180, 180);           |  |  | (ಠ_ಠ)                        |    we distort, rotate, move context first, then paint image on it,
    ctx.save();  // backup ctx      |  |  |                               |   image ALWAYS follows the context, distorted postcard = distorted stamp
    ctx.translate(offset, offset);  |  |  |               |-----          |
    ctx.stroke();                   |                       ctx (b pos); first translated (teleported) to pos, then rotate ctx with image by angle)
    ctx.restore();  // restore ctx; we painted, from save() position, one layer paint "over" previous img or line, see sketch, and put now ctx in org. position

  */
  constructor() {
    this.testImageShow = false;  // moved from SvgToCanvas class, let's see if it is working
    this.imgScaleX = 1;  // scale x
    this.imgScaleY = 1;
    this.spriteX = 0;  // x coord upper left corner of image or in-image[sprite x pos]; shall proven img is ON context
    this.spriteY = 0;  // sprite, useful for drawImage() fun select pic in pic; currently I stack my SVGs as groups
    this.ctxTranslateX = 0;  // x coordinate of context on canvas; use on translate() fun
    this.ctxTranslateY = 0;  // can move to head of player and start scale to get more y at bottom or feet, more y at head
    this.canX = 0;  // x coordinate on canvas; use on translate() and drawImage()
    this.canY = 0;
    this.originX = 0;  // !! do it yourself; can remember initial x pos
    this.originY = 0;
    this.rotate = 0;  // simple rotation 2D --- CANVAS
    this.direction = true;  // true is right, false is left -x

    this.speedX = 1;
    this.speedY = 0;

    this.clearScreen = true;  // clear between writes
    this.image = undefined;  // can save an image instance, this.image = new Image()
    this.tagList = undefined;  // image text to tag list <svg, <g, <path
    this.canvas = undefined;  // image instance custom canvas
    this.groupName = undefined;
    this.canvasName = undefined;
    this.groupInstance = undefined;
    // MUST hardcode a value in html <canvas, else interesting behavior!!! can be width=0, -->testCanvas ok
    this.canvasDim = { "width": 720, "height": 576 }   // old TV, SD format
  }
  update() {
    if (this.direction) {
      this.canX += this.speedX;
    } else {
      this.canX -= this.speedX;
    }
    this.canY += this.speedY;
  }
}

class SvgToCanvas {
  /* SVG
     header <svg must be super clean, sample
     <svg id="aCircle" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" height="100px" width="100px">
     and relevant paths must be consistently named to allow key word search, regex
     Attributes to manipulate should exist. See opacity on groups and paths. Different attribute names and behaviour.

    Each SVG image will be bound to an own canvas to avoid additional existing img overwrite time (2nd paint level on a canvas)
    <img id="fooSvg" src=<svg ....  <canvas id="fooCanvas"
    window.fooSTC = new SvgToCanvas( {svg: "fooSvg", canvas: "fooCanvas"} );
    For usage use "find in files" of Pycharm. Check index.js, follow how to manipulate paths and re-serialize images of other instances as your own.
  */
  constructor(opt) {
    if (opt === undefined) opt = {};
    if (opt.useSprite === undefined) opt.useSprite = false;
    this.useSprite = opt.useSprite;  // if disabled, we can use multiple instances, but this is unreliable
    this.imgDict = {};  // image src and instance of TransCanvas for rotation and translation
    this.spriteList = []; // list of groups we need to read and make to SVGs, from multiple (this.svg) SVG images sources
    this.svg = opt.svg;
    this.svgWidth = undefined;  // ----> check this.image.naturalWidth
    this.svgHeight = undefined;

    if (opt.canvas === undefined) opt.canvas = "testCanvas";
    this.canvas = document.getElementById(opt.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.serXML = undefined;
    this.svgTagList = []; // split serXML tags <foo and regex replace values as text to avoid DOM parser object conversion and re-serialization
    this.image = new Image();  // altered svg img in mem; parser attached to img.src is projected -->| canvas
    this.transCanvas = new TransCanvas();  // set translation values during animation loop, up, down, rotate

    if (this.useSprite) {
      this.spriteList = opt.spriteList;  // see sample in project, subject to change more often
      this.appendSVGs();  // create a mega SVG from all SVGs in the list to pull the groups we mentioned in spriteList
      this.spriteToDict();  //
    } else {
      this.serializeImg({ svg: this.svg });
    }
  }
  appendSVGs() {
    // Stack all SVG in the first mentioned, just see if it is possible to have inline and outline SVG together, easy peasy
    let container = document.getElementById(this.svg[0]);
    for (let i = 1; i <= this.svg.length - 1; i++) {  // index[0] already at work
      let node = document.getElementById(this.svg[i])
      container.appendChild(node);  // If inline SVG, we detach the node from and add to a container "somewhere" in DOM; disappears
    }
  }

  spriteToDict() {
    /* Create a dict of SVG images from a source SVG with images as groups (inkscape can also use layer for better overview).
       "uniqueKey" can be used to create multiple identical images to show on different canvas. Should be a reference to img group later.

       The SVGs are groups <g from initial SVG. We attach head and tail <svg id="" </svg>.
       Use the same instance to dict technique as for Python "GhettoRecorder". dict[key].x = foo.
    */

    // "list[]" of dicts; first key in this dict will be the instance key name of a new dict
    for (let i = 0; i <= this.spriteList.length - 1; i++) {
      let keyOuter;  // unique str to create an instance
      let oKeys = Object.keys;
      let uniqueKey = keyOuter = oKeys(this.spriteList[i])[0];
      //cl("spriteToDict() keys: ", oKeys(this.spriteList[i][keyOuter]).toString());  // list of strings to str
      let canvasName = this.spriteList[i][keyOuter]["cvs"];
      let groupName = this.spriteList[i][keyOuter]["grp"];
      let width = this.spriteList[i][keyOuter]["w"];
      let height = this.spriteList[i][keyOuter]["h"];

      let tagText = new XMLSerializer().serializeToString(document.getElementById(groupName));  // plain text string of group tags
      let tagList = [];

      // Create a list of SVG tag elements from the current SVG group
      let lst = tagText.split("<"); // attach the "<" again, split() steals it
      for (let i = 1; i <= lst.length - 1; i++) {  // index[0] is empty
        tagList.push("<" + lst[i].replace(/#/, "%23"));  // replace hex color sign if any for firefox canvas
      }
      // Create an invalid SVG with id, width and height. Invalid because it is a list.
      let svgName = groupName + "_SVG";  // play safe, distinguish from group name, normally only needed for drawImage()
      // head and tail svg tag to get a valid SVG image;
      tagList.unshift('<svg id="' + svgName + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" height="' + height + 'px" width="' + width + 'px">');
      tagList.push('</svg>');

      // fill next dict with TransCanvas class attributes in this loop cycle for {"str instance name": object instance}
      this.imgDict[uniqueKey] = new TransCanvas(); // to update x, y values
      this.imgDict[uniqueKey].image = new Image(); // also a TransCanvas class attribute
      this.imgDict[uniqueKey].image.src = "data:image/svg+xml;utf8," + tagList.toString();  // write from list, initial img for canvas
      this.imgDict[uniqueKey].tagList = tagList;  // edit group or path attributes, color; edited imgDict[groupName].image.src
      this.imgDict[uniqueKey].canvas = document.getElementById(canvasName);
      this.imgDict[uniqueKey].ctx = document.getElementById(canvasName).getContext("2d");   // collect context ref now, not in each draw cycle
      this.imgDict[uniqueKey].logTag = groupName;  // original <g group name; if(logTag) console.log
      this.imgDict[uniqueKey].canvasName = canvasName;
      this.imgDict[uniqueKey].groupInstance = this;  // can access all attributes and properties, groups, paths of container SVG, image can manipulate other image
    }
  }
  serializeImg(opt) {
    /* Load/reload image for image.src. Dark mode or scene change.
       usage: fooInstance.serializeImg( {svg:"tuxAtNight"} ); <svg id="tuxAtNight"
    */
    if (opt === undefined) opt = {};
    this.svg = document.getElementById(opt.svg);
    this.svgTagList = [];  // remove previous content from our list if any; text rows we regex search/replace

    try {  // can be "null" sometimes, if we try to import <g tag elements of SVG
      this.svgWidth = parseFloat(this.svg.getAttribute('width'));
      this.svgHeight = parseFloat(this.svg.getAttribute('height'));
    } catch (e) { }
    this.serXML = new XMLSerializer().serializeToString(this.svg);  // plain text
    this.svgToList();
    this.cleanupListWriteSource();  // remove # and replace %23, FireFox intellectuals show us what is right; write "new Image()" source
  }
  svgToList(opt) {
    /* create a list to store each <> tag line
      test naked (no surrounding svg tags)
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    */
    // head can be improved (work always) if we can calc the dimensions (proportions) of an element, or <g tag, of the SVG, adapt width and height
    let head = '<svg id="fooBar" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" height="100px" width="100px">'
    let tail = '</svg>'

    let lst = this.serXML.split("<"); // need to attach the "<" again, split() steals it
    for (let i = 1; i <= lst.length - 1; i++) {  // index[0] is empty
      this.svgTagList.push("<" + lst[i]);
    }
    // Did we got an <svg or a <g, or naked; a <g tag needs a surrounding valid <svg;
    if (this.svgTagList[0].includes("<svg")) {
      return;
    } else {
      this.svgTagList.unshift(head);
      this.svgTagList.push(tail);
    }
  }
  cleanupListWriteSource() {
    for (let i = 0; i <= this.svgTagList.length - 1; i++) {
      this.svgTagList[i] = this.svgTagList[i].replace(/#/, "%23");  // replace svg fill # -> %23 FireFox
    }
    this.writeImageSource(this.svgTagList);
  }
  writeImageSource(tagList) {
    /*

       Write Test image and source.

    */
    let imgData = "data:image/svg+xml;utf8," + tagList.toString();  // this.serXML
    this.image.src = imgData;  // img we show on canvas

    if (this.transCanvas.testImageShow) {
      document.getElementById("testImage").src = imgData;  // test if we see something at all, at least an image
    }
  }
  svgEditGroup(opt) {
    /* Edit ALL paths in a group.  <g tag [num list indexes of this.svgTagList] /g>
       To collect member id's of a group for random use - document.querySelectorAll("#z1PositionLights path")
       and use svgEditPath(opt) to switch attributes

      opt = { "gAirOne_motor_drops":{"opacity": "0"} };
    */
  }
  svgEditPath(opt) {
    /*
      ALL animation edits one of 60fps frame here, requestAnimationFrame.
      usage:
      fooSTC.svgEditPath({ tag id name (keyword, part):{attribute: value} })
      fooSTC.svgEditPath({"pathFoo":{"fill": "%23FF0023"}, "pathBar": {"opacity": "0"}})

      manipulate <path id="pathFoo" fill:"#ff00ff" ... and <path id="pathBar" opacity:"1"
      this.image.src = changed list text to string
      REGEX https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
      opt = {"pathFoo":{"fill": "#FF0023", "opacity":"0"}, "pathBar":{"fill": "%232300FF"}, "greyThree":{"fill": "#23aaFF"}}

      Update
      * https://regex101.com/  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
      * Regular Expressions The Complete Tutorial by Jan Goyvaerts https://gotellilab.github.io/Bio381/Scripts/Feb07/RegularExpressionsTutorial.pdf
      "style" attribute has precedence over single attributes and css style scripts; CSS property/value pairs divided by semicolon;
      style="fill:#cdefef;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
      boundaries are double quotes, semicolon; single attribute has -> '"(.*?)"' <-match all between and inclusive double quotes
        The same: if (str.matches("\".*\"")) {// this string starts and end with a double quote}
      * (a) find id, find 'style="' found.split(;) replace, found[2] = #ff0000 , found.toString(); ? if not found create/append to 'style="'


    */
    if (opt === undefined) {
      cl("svgEditPath->no option");
      return;
    }

    let tagList = this.svgTagList;
    if (arguments.length === 2) {
      // 2nd argument is instance with sprite dict, svgTC.imgDict["gUfo"]
      tagList = arguments[1].tagList;
    }
    let keyOuter, keyInner, attribute, value // opt key val
    let valTargetPattern = '"(.*?)"';  // match all between and inclusive double quotes
    let oKeys = Object.keys;

    // svg as tag list
    for (let i = 0; i <= tagList.length - 1; i++) {

      // opt arguments list
      for (let idx = 0; idx <= oKeys(opt).length - 1; idx++) {
        keyOuter = oKeys(opt)[idx];
        let attrLst = oKeys(opt[keyOuter]);  // list of attribute key val pairs  { "fill":"blue", "opacity":"0" }

        // exec attribute list for one tag line
        for (let index = 0; index <= oKeys(attrLst).length - 1; index++) {
          attribute = keyInner = oKeys(opt[keyOuter])[index];
          value = opt[keyOuter][keyInner];
          let attrArgsPattern = attribute + "=";  // fill=
          let regex = new RegExp(attrArgsPattern + valTargetPattern, 'i');  //  regex: /fill="(.*?)"/i
          let replace = attribute + '=' + '"' + value + '"';

          if (tagList[i].toLowerCase().includes(keyOuter.toLowerCase())) {  // match id name, do work
            tagList[i] = tagList[i].replace(regex, replace);  // replace attribute with our val; SVG optimizer removes sometimes attributes to group level

            // todo improve insert attribute and value if not exists - creation at the original file and read/change it is more robust (<g opacity) <path fill-opacity
            // insert, change multiple values to a string we iterate over , this if() will lead to a new project
            //  if (!tagList[i].toLowerCase().includes(attribute.toLowerCase())) {  // if id ok, but attribute not found
            //  // if(arguments[1].logTag="gUfo") cl("gUfo->", tagList[i]); // design error, no clean separation of in mem svg, -> all path need unique identifier num plus string :(
            //    let newAttribute = ' ' + attribute + '="' + value + '"'
            //    let position = tagList[i].length - 2;  //   />  for .slice(
            //    // crowbar now, split and rebuild attempt, slice sucks not good
            //    // tagList[i] = [tagList[i].slice(0, position), insert, tagList[i].slice(position)].join('');  // seems error is here
            //    let strList = tagList[i].split("/>");  // removes
            //    strList.push(newAttribute);
            //    strList.push("/>");
            //    if(arguments[1].logTag="gUfo") cl("gUfo->", strList.toString());  // commas? why?
            //    // tagList[i] = strList;
            //  }
          }
        }
        tagList[i] = tagList[i].replace(/#/, "%23");  // replace svg fill # -> %23 FireFox
      } // 1st
    }
    if (arguments.length === 2) {
      // 2nd argument is instance with sprite dict, svgTC.imgDict["gUfo"]
      arguments[1].image.src = "data:image/svg+xml;utf8," + tagList.toString();
    } else {
      this.writeImageSource(tagList);  // write "normal" instance
    }
  }
  svgToCanvas(opt) {
    /* Load the image "new Image()"
       Tried the whole mess of async, promise Mumpitz
    */
    let image = this.image;  // normal instance

    if (!(opt === undefined)) {
      image = opt.dict.image;  // sprite
    }

    if (image.complete) {
      // cl("-->complete drawImageActualSize ");
      this.drawSvG(opt);
    } else {
      image.onload = () => {
        // cl("-->onload drawImageActualSize ");
        this.drawSvG(opt);
      }
    }
  }

  drawSvG(opt) {
    /*  */
    let deg = Math.PI / 180;
    let x = opt.dict.canX;
    let y = opt.dict.canY;
    let scaleX = opt.dict.imgScaleX;
    let scaleY = opt.dict.imgScaleY;

    // !order is: translate, scale, rotate!   opt.dict.ctx.translate(opt.ctxTranslateX, opt.ctxTranslateY);
    // --->>> https://stackoverflow.com/questions/36859472/html-5-canvas-rotate-scale-translate-and-drawimage
    // --->>> https://stackoverflow.com/questions/23280530/how-would-i-rotate-a-image-on-a-canvas-to-face-its-direction-of-movement
    if (opt.dict.clearScreen) opt.dict.ctx.clearRect(0, 0, opt.dict.canvasDim["width"], opt.dict.canvasDim["height"]);
    // rotation only around center and back is free
    let rot = opt.dict.rotate;  // full control move to x and rotate player is problem try --> arctan 23280530
    let imgWidth = opt.dict.image.naturalWidth;
    let imgHeight = opt.dict.image.naturalHeight;
    let translateX = opt.dict.ctxTranslateX;  // deviation from center of transl. normally upper left corner
    let translateY = opt.dict.ctxTranslateY;
    //opt.dict.ctx.translate((-imgWidth)/2, (-imgHeight)/2);  // rotation and scale of ctx is not set back
    // include deviation for x,y to set the center of scaling and rotation slightly different in some situations
    opt.dict.ctx.translate((x + imgWidth / 2) + translateX, (y + imgHeight / 2) + translateY);  // remap the x,y position; can translate(0,0) to default after a move loop cycle; workhorse
    opt.dict.ctx.scale(scaleX, scaleY);  // scaling starts also from translate() coord.
    //if(opt.dict.canX <= 0) opt.dict.ctx.scale(-scaleX, scaleY);
    opt.dict.ctx.rotate(opt.dict.rotate * deg);
    opt.dict.ctx.translate((-x - imgWidth / 2) - translateX, (-y - imgHeight / 2) - translateY);
    // absolute minimum; for rotation ctx.drawImage() see svg-front-man.js
    // https://eloquentjavascript.net/17_canvas.html  sprites
    opt.dict.ctx.drawImage(opt.dict.image, x, y); //https://stackoverflow.com/questions/10841532/canvas-drawimage-scaling  // tux rotation differs in svg-front-man.js
    opt.dict.ctx.setTransform(1, 0, 0, 1, 0, 0);  // reset transforms (identity matrix), = save, restore
  }
}
;
