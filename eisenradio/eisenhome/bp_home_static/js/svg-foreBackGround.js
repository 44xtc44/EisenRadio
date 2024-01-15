// svg-foreBackGround.js
"use strict";

/* Place to switch the backdrops (ger. Kulissen).
  Can accommodate bloody dark ages or bloody contemporary scenery.
*/

class ForeBackGround {
  // Switch completely On/Off, create day and night.
  constructor() {
    this.cSky = document.getElementById("cSky");  //cSky cSkyDecor;  cSea cSeaDecor
    this.skyCtx = this.cSky.getContext("2d");
    this.cSea = document.getElementById("c_01");
    this.seaCtx = this.cSky.getContext("2d");
  }
  arcticDay() {
  /* stop day sky  rgba(34,152,200,100); start day sky  rgba(232,251,255,100)
     stop day sea  rgba(37,110,152,100); start day sea  rgba(1,168,230,100)

     https://color.adobe.com/de/create/image-gradient; color stops from image
  */
      // sky; start top x,y, to bottom x,y
    this.clearAll();
    svgTC.svgToCanvas( {dict: svgTC.imgDict["landScape"] } );
    svgTC.svgToCanvas( {dict: svgTC.imgDict["teslaCoils"] } );
    stageAnalyzerShow();
    svgTC.imgDict["Buoy"].canX = 30;
    svgTC.imgDict["Buoy"].canY = 450;
    svgTC.svgToCanvas( {dict: svgTC.imgDict["Buoy"] } );

    let daySkyGradient = this.skyCtx.createLinearGradient(100, 0, 100, this.cSky.height);
    let daySeaGradient = this.skyCtx.createLinearGradient(100, this.cSky.height * 0.5, 100, this.cSky.height);
    daySkyGradient.addColorStop(0, "rgba(34,152,200,100)");
    daySkyGradient.addColorStop(1, "rgba(232,251,255,100)");
    this.skyCtx.fillStyle = daySkyGradient;
    this.skyCtx.fillRect(0, 0, this.cSky.width, this.cSky.height);  // sea overwrites a part

    // sea; start top x,y, to bottom x,y
    daySeaGradient.addColorStop(0, "rgba(1,168,230,100)");
    daySeaGradient.addColorStop(1, "rgba(37,110,152,100)");
    this.seaCtx.fillStyle = daySeaGradient;
    this.seaCtx.fillRect(0, this.cSea.height * 0.33, this.cSea.width , this.cSea.height);

  }
  arcticNight() {
    this.clearAll();
    svgTC.svgToCanvas( {dict: svgTC.imgDict["landScape"] } );
    svgTC.svgToCanvas( {dict: svgTC.imgDict["teslaCoils"] } );
    stageAnalyzerShow();
    svgTC.imgDict["Buoy"].canX = 30;
    svgTC.imgDict["Buoy"].canY = 450;
    svgTC.svgToCanvas( {dict: svgTC.imgDict["Buoy"] } );

    svgTC.imgDict["SeaNight"].canX = 0;
    svgTC.imgDict["SeaNight"].canY = 0;
    svgTC.svgToCanvas( {dict: svgTC.imgDict["SeaNight"] } );  // SeaDay  SeaNight

    this.skyCtx.fillStyle = window.getComputedStyle(document.body, null);
    this.skyCtx.fillRect(0, this.cSky.height * 0.33, this.cSky.width , this.cSky.height);
  }
  clear() {
  /* Clear front and background.
  */
    this.skyCtx.clearRect(0, 0, this.cSky.width, this.cSky.height);
    this.seaCtx.clearRect(0, 0, this.cSea.width, this.cSea.height);
  }
  clearAll() {
  /* Clear ALL canvas if switch day mode or feature selection in Tools is OFF.
  */
    let monitorList = document.getElementsByClassName("stageMonitor");
    for(let i = 0; i <= monitorList.length - 1; i++) {
      let monitor = monitorList[i];
      monitor.getContext("2d").clearRect(0, 0, monitor.width, monitor.height);
    }
  }
}

function switchModeSeaSky() {
  let darkBody = getBodyColor();
  if (darkBody) {
    foreBackGround.arcticNight();
  } else {
    foreBackGround.arcticDay();
  }
}
;

