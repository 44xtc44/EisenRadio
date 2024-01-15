// svg-sprite.js
"use strict";

/*
  Clipping with sprites - "cut" a part from the single image file.
  Cut an entire player figure or use it as a slider to move a "view box" over a map.
  Useful for raster images PNG, JPG.
  Vector SVG img groups can be stacked to keep center for rotation, scaling. Use its group <g id's to "cut" the image.

  drawImage() fun has 3 parts in up to 9 arguments:
    (a) image content data (image.src) one arg,
    (b) source chords four args of image on the desk,
    (c) destination chords four args of image writen to canvas

    3 argument sets: 3, 5, 9 args; s is source, d is destination
      (3) Position the image on the canvas:
          context.drawImage(img, sx, sy)
      (5) Position the image on the canvas, and specify width and height of the image:
          context.drawImage(img, sx, sy, sWidth, sHeight)
      (5) Clip the image and position the clipped part on the canvas:
          context.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

    ctx.drawImage(sprite, col*frWidth, row*frHeight, frWidth, frHeight, 10, 30, frWidth, frHeight);
    ctx.drawImage(image , sx         , sy          , sWidth , sHeight , dx, dy, dWidth , dHeight)
      image is the sprite
      sx, sy are source chords, where to start clip, cut the sprite from the src image (upper left corner)
      sWidth, sHeight is the distance from sx,sy; cut length sx-----sWidth
      dx, dy are destination chords to write the image (upper left corner) on canvas
      dWidth and dHeight allow scaling the destination image; dx----------2x org dWidth

  // Define the size of a frame
  let frWidth = 50;
  let frHeight = 61;
  // Rows and columns start from 0
  let row = 1;
  let col = 3;

  ctx.drawImage(sprite, col*frWidth, row*frHeight, frWidth, frHeight, 10, 30, frWidth, frHeight);
*/

class ParticleStars {
  /* Sprite failed. JS animation must do that.
     JS star animation as replacement for failed SVG stars, rotate an image view port over a star map.
     Hundreds of animated small particles, stars as SVG path element slow down the whole system.
     Went from 30 to 80% CPU. Stellarium rip and spray tool of Inkscape also.
     Class can be reused for sea waves and other (pseudo)random moving stuff in larger amounts.
     write(), replace ctx.arc() can be the entry point to paint different geometrics or bezier curves, waves.

     Rotation drawn with 5 args: https://stackoverflow.com/questions/49202103/canvas-image-rotation-not-centered
  */
  constructor(opt) {
    this.canvasId = opt.canvasId;
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.number = opt.number;
    this.partList = [];
    this.partSpeed = opt.partSpeed;  // can be an option; result on screen
    this.partSize = opt.partSize;  // can be an option; result on screen
    this.speed = this.partSpeed * this.canvas.width;
    this.speedX = this.partSpeed * Math.random() * this.randomOne();
    this.speedY = Math.sqrt(Math.pow(this.partSpeed, 2) - Math.pow(this.speedX, 2)) * this.randomOne();
    this.init();
  }
  randomOne() {
    return Math.random() >= 0.5 ? 1 : -1;  // +or-; y up or down, x left or right
  }
  init() {
    for (let i = 0; i < this.number; i++) {
      let speedMod = 1;  // all same speed; else Math.random() * 0.75 + 0.5; thingy
      let size = Math.random() * this.partSize;
      this.partList[i] = {
        rim: Math.random() * size * this.canvas.width / 2,  // reset, width from canvas; full size disappear
        x: Math.floor(Math.random() * this.canvas.width),
        y: Math.floor(Math.random() * this.canvas.height),  // horizon, where to start; can be optimized to save cpu
        speedX: this.speedX * speedMod,
        speedY: this.speedY * speedMod
      }
    }
  }
  update(darkBody) {
    /* firefox freezes if one single shadow blur is on, stroke burdens CPU for nothing

      Taken from animate-canvas.js starField() fun. Rebuild animate-canvas.js!
      Have an animation already with "initStarFieldEnv(), starField()", but it is not class based and needs refac.
    */

    this.clearScreen();
    if(!darkBody) return;

    for (let i = 0; i < this.number; i++) {
      // move next
      let canX = this.partList[i].x + this.partList[i].speedX;
      let canY = this.partList[i].y + this.partList[i].speedY;
      // write move
      this.write( this.partList[i] );
      // move out of screen left/right
      if (canX < 0 - this.partList[i].rim) {
          canX = this.canvas.width + this.partList[i].rim;
      } else if (canX > this.canvas.width + this.partList[i].rim) {
          canX = 0 - this.partList[i].rim;
      }
      // move out of screen up/down
      if (canY < 0 - this.partList[i].rim) {
          canY = this.canvas.height + this.partList[i].rim;
      } else if (canY > this.canvas.height + this.partList[i].rim) {
          canY = 0 - this.partList[i].rim;
      }
      this.partList[i].x = canX;
      this.partList[i].y = canY;  // horizon where to start
    }
  }
  write(listElem) {
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(listElem.x, listElem.y, listElem.rim, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }
  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
;
  window.nightSky = new ParticleStars( {
    canvasId: "cSkyDecor",
    number: 50,
    partSpeed: 0.04,
    partSize: 0.01,
  } );
