// svg-seaWaves.js
"use strict";

/**
* Sea waves go here.
*/

class BackGroundWaves {
  constructor(opt) {
    this.updown = opt.updown;  // change length, rotate or size
    this.waveBox = opt.waveBox;  // max upper left of waves box {x: 10, y: 10}
    this.waveGap = opt.waveGap;  // vertical gap in px between wave rows
    this.dY = 0;  // store current y
    this.scale = 1; // store current scale
  }
  horizontal(opt) {
    let waveList = opt.waveList;
    let updown = this.updown.update();  // delta X 0...40
    let mV = this.updown.maxValue;
    let x = this.waveBox.x;
    let y = this.waveBox.y;
    let offset = 20;  // push next row left

    for (let i = 0; i <= waveList.length - 1; i++) {
      waveList[i].canX = updown + x;
      if(i == 1) waveList[i].canX = ((mV - updown) + x) + (i * offset);
      if(i == 2) waveList[i].canX = (((mV - updown ) * .8) + x) + (i * offset);

      waveList[i].canY = this.dY + y;
      this.dY += this.waveGap;  // push next row down

      if(updown !== 0) this.scale = Math.abs(1 - (1 / updown));
      if( ! (this.scale > 1 || this.scale < 0.9) ) waveList[i].imgScaleX = this.scale;
      svgTC.svgToCanvas({ dict: waveList[i] });  // dict: svgTC.imgDict["WaveRowTwo"]
    }
    this.dY = 0;
  }
}
window.seaWaveUpDown = new CountUpDown(0, 20, .08);
const seaWave = new BackGroundWaves({
  waveBox: { x: 30, y: 270 },
  waveGap: 6,
  updown: seaWaveUpDown
});
