// svg-teslaCoils.js
"use strict";

/* Animate the two coils with lights and
   try to scale parts of the towers to simulate a pumping flow.

   Update
   Scaling parts failed. Use sprite.
*/

class TeslaCoils {
  constructor() {
    this.tLights = [  // tower lights
      "coilBulbOne", "coilBulbTwo", "coilBulbThree", "coilBulbFour",
      "coilBulbFive", "coilBulbSix", "coilBulbSeven", "coilBulbEight"
    ];
    this.tLightsIdx = 0;
    this.tHeads = ["coilHeadOne", "coilHeadTwo"];  // tower heads
    this.tHeadsIdx = 0;
    this.tLightsWaitCount = 0;
    this.hArrows = [];  // head arrows currently not shown, can make a show at full power?
    this.hArrowsIdx = 0;
    this.scale = 0;  // minimal scaling, try set focus via y translation and use delay
  }
  animateTeslaTowerLights(coilsImg) {
    this.tLightsWaitCount ++;
    if (this.tLightsWaitCount > 24) {

      this.tLightsWaitCount = 0;
      this.tLightsIdx += 1;
      if (this.tLightsIdx > this.tLights.length - 1) { this.tLightsIdx = 0; }
      let dct = {}
      // create dict for path editing with regex  { []: {}, []: {} } variable index notation [], else no key from list member
      for(let i = 0; i <= this.tLights.length - 1; i++) {
        dct[[this.tLights[i]]] = {"fill-opacity": "1", "fill": "hsl(192,46%,70%)" };         // "hsl(192,46%,70%)"
      }
      // overwrite current idx key to enable opacity for one in the list
      dct[[this.tLights[this.tLightsIdx]]] = {"fill-opacity": "1", "fill": "#FFFFFF"};

      svgTC.svgEditPath( dct, coilsImg );  // 2nd argument is image dict with image.src and tagList
      svgTC.svgToCanvas( { dict: coilsImg } );
    }
  }
}
