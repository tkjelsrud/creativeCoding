//canvas-sketch sketch-06.js --output=output/05 --stream --open

const canvasSketch = require('canvas-sketch');
const { insideCircle } = require('canvas-sketch-util/random');
//const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');
const {Vector, RGB, RGBA} = require('./lib/util.js');
const {Anim, AnimLayer} = require('./lib/anim.js');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  duration: 30,
  fps: 24,
};

const palette = {
  active: ["#454D66", "#309975", "#58B368", "#DAD873", "#EFEEB4"],
  fall: ["#8FA4B9", "#623633", "#3F3E43", "#841737"],
  lime: ["#454D66", "#309975", "#58B368", "#DAD873", "#EFEEB4"],
  badger: ["#eaaf47", "#40280f", "#eeeeee", "#472422"],
  stars: ["#f7f7e8", "#dcdcd2", "#f5e6dc"],
  tree: ["#765F20", "#579142", "#56C130", "#A6CE63", "#E9EE3B"],
  background: "#000000"
};

let manager;
let img;
let lastFrame = 0;
let tPane = null;

let animLayer = null;

const params = {
  freq: 0.3,
  frame: 0,
  lfoFreq: 1,
  lfoAmp: 0.002,
  crossfade: 0,
  noiseFact: 0.5,
  displace: 0.0,
  radius: 1.0,
  colorNoise: 1.05,
  colFilter: 0.1,
  boost: 2.5,
  animate: true,
  lineColor: {r: 140, g: 46, b: 77},
  actorCount: 0,
  newActors: 128,
  maxActors: 512,
  lastFrame: 0,
  fps: 0,
  clear: true,
  baseVel: -4,
  gravity: {x: 540, y: 540, ampX: 0.2, ampY: 0.2},
  size: {cell: 16, cols: 64, rows: 64, height: 1080, width: 1080},
  performance: "",
  status: "",
};

const start = async () => {
  //img/' + AnimKeen.sheet.sourceImg);
  img = await loadImage('img/' + AnimPeep.sheet.sourceImg);
  
  setupAnim();

  manager = await canvasSketch(sketch, settings);
};

const setupAnim = () => {
  animLayer = new AnimLayer(0, 0, params.size.width, params.size.height, "Base");
  /*
  animLayer.add(new AnimNightSky(0, 0));
  let starLayer = new AnimLayer(-100, -128, params.size.width, params.size.height, "Stars");
  //starLayer.skew = 2.5;

  for(let i = 0; i < params.newActors; i++) {
    starLayer.add(new AnimStar(random.range(-params.size.width, params.size.width), random.range(0, params.size.height)));
  }

  animLayer.add(starLayer);

  animLayer.add(new AnimMoon(800, 128));

  let buildLayer = new AnimLayer(-500, 600, params.size.width + 500, 600, "Builds");
  buildLayer.dir.x = 1.5;
  lastb = null;
  for(let i = 0; i < 32; i++) {
    let b = new AnimBuilding(0, 0);

    if(lastb)
      b.loc.x = lastb.loc.x + lastb.size.x;

    buildLayer.add(b);
    lastb = b;
  }
  animLayer.add(buildLayer);

  let peepLayer = new AnimLayer(0, 805, params.size.width, 324, "Peeps");

  for(let i = 0; i < Math.floor(random.range(17, 27)); i++) {
    peepLayer.add(new AnimPeep(random.range(0, 800), random.range(0, 50)));
  }
  animLayer.add(peepLayer);

  /*let al2 = new AnimLayer(0, 600, 1080, 200, "Balls");
  for(let i = 0; i < 25; i++) {
    al2.add(new AnimBall(random.range(0, 540), random.range(0, 540)));
  }
  animLayer.add(al2);*/
};

const animNoiseLayer = (context, playhead) => {
  for(let i = 0; i < (params.size.cols * params.size.rows); i++) {
    const col = i % params.size.cols;
    const row = Math.floor(i / params.size.cols);
    let noi = random.noise2D(col+playhead*2, row);

    //console.log((col + row) % (palette.active.length+1));
    let rgb  = RGB.hexToRgb(palette.active[(col + row) % (palette.active.length)]); // new RGBA(128, 128, 128, 0.7); //random.range(48, 192), random.range(48, 192), random.range(48, 192), 0.8);
    
    if(rgb == null) continue;
    rgb.modify(params.colorNoise * noi);
    //rgb.modify(noi * Math.sin(playhead));
    if(rgb.getIntensity() < params.colFilter) continue; // || col % 2 == 0 || row % 2 == 0) continue;

    context.save();
    context.translate(-128, -128);
    context.scale(playhead+1 * 4, playhead+1 * 4);
    context.translate(playhead+1 * -8, playhead+1 * -8);
    
    context.translate(col * params.size.cell, row * params.size.cell);
    context.fillStyle = rgb.toString();
    let sColor = rgb.copy();
    sColor.modify(params.colorNoise);
    sColor.r = rgb.getIntensity() * 255;
    sColor.modify(rgb.getIntensity() * 2);
    context.shadowColor = sColor.toString();
    context.shadowBlur = params.size.cell * rgb.getIntensity();
    context.beginPath();
    context.arc(playhead*rgb.getIntensity()*params.size.cell, 0, params.radius * params.size.cell * rgb.getIntensity() * (playhead), 0, Math.PI * 2);
    context.fill();
    context.closePath();
    //context.fillRect(0, 0, params.size.cell, params.size.cell);

    context.restore();
  }
};

const drawFractal = (context, x, y, len, angle, branchWidth) => {
  //function draw(startX, startY, len, angle, branchWidth) {
    context.lineWidth = branchWidth;

    context.beginPath();
    context.save();

    context.translate(x, y);
    context.rotate(angle * Math.PI/180);
    context.moveTo(0, 0);
    context.lineTo(0, -len);
    //context.shadowColor = palette.tree[3];
    //context.shadowBlur = 3;
    context.strokeStyle = palette.tree[Math.floor((len/255) * palette.tree.length)];
    context.stroke();

    if(len < 10) {
      context.restore();
        return;
    }

    drawFractal(context, 0, -len, len*0.8, angle-15, branchWidth*0.8);
    drawFractal(context, 0, -len, len*0.8, angle+15, branchWidth*0.8);

    context.restore();
//}
//draw(400, 600, 120, 0, 10) 

};

// MAIN FUNCTION
//
const sketch = ({ context, width, height }) => {
  return ({ context, width, height, playhead, frame }) => {
    
    if(frame == lastFrame) return;

    //

    if(!params.animate) {
      //animActors = new Array();
      return;
    }

    params.fps = 1000 / (performance.now() - params.lastFrame);
    params.lastFrame = performance.now();
    let msBeforeNext = performance.now();

    if(params.clear || playhead < 0.1) {
      context.fillStyle = "white";  //palette.background;
      context.fillRect(0, 0, width, height);
    }

    context.scale(2*playhead, 2*playhead);
    //context.rotate(-Math.PI*playhead);
    drawFractal(context, 540, 600, 360 * playhead, 0, 10);
    
    animLayer.next(frame);


    let msBeforeDraw = performance.now();
    animLayer.draw(context);
    
    params.performance = "NEXT:" + Math.floor(msBeforeDraw - msBeforeNext) + "ms DRAW:" + Math.floor(performance.now() - msBeforeDraw) + "ms";

    params.actorCount = animLayer.count();

    params.status = animLayer.toString();

    lastFrame = frame;
  };
};


class AnimSprite extends Anim {
  static sheet = {sourceImg: "", w: 192, h: 96, sw: 32, sh: 32};

  constructor(x, y) {
    super(x, y); 
    this.scale = 1;
    this.drawOff = [0, 0];
    this.frameDiv = 1;
    this.modeLoc = new Vector(0, 0);
  }

  draw(context) {
    // TODO: fix this "img" global variable thingy
    //
    context.save();
    context.imageSmoothingEnabled = false;
    context.translate(this.loc.x, this.loc.y);
    context.scale(this.scale, this.scale);
    context.drawImage(img, this.modeLoc.x, this.modeLoc.y, AnimSprite.sheet.sw, AnimSprite.sheet.sh, this.drawOff[0], this.drawOff[1], AnimSprite.sheet.sw, AnimSprite.sheet.sh);
    context.restore();
  }

  next(frame) {}
}

class AnimKeen extends AnimSprite {
  static sheet = {sourceImg: "commander_keen_sprites.png", w: 192, h: 96, sw: 24, sh: 32};
  static mode = {
    walkLeft: [8, 9, 10, 11],
    walkRight: [12, 13, 14, 15]
  };

  constructor(x, y) {
    super(x, y); 
    this.scale = 3;
    this.frameDiv = 3;
    this.time = random.range(120, 360);
    this.dir = new Vector(random.range(12, 18), 0);
    this.mode = AnimKeen.mode.walkRight;
    this.modeI = 0;
    this.modeLoc = new Vector(0, 0);
    this.drawOff = [-16, -16];
  }

  checkCollisionOthers(loc) {
    if(loc.x >= (this.loc.x + this.drawOff[0]) && loc.x <= this.loc.x + AnimKeen.sheet.sw &&
      loc.y >= this.loc.y + this.drawOff[1] && loc.y <= this.loc.y + AnimKeen.sheet.sh)
        return true;
    return false;
  }

  changeDir() {
    if(this.mode == AnimKeen.mode.walkRight)
      this.mode = AnimKeen.mode.walkLeft;
    else
      this.mode = AnimKeen.mode.walkRight;
  }

  next(frame) {
    this.time--;
    //ASSume frame increases pr frame, duh, 
    if(frame % this.frameDiv == 0) {
      // Switch image
      this.loc.add(this.dir);
      let collide = this.checkCollision();

      this.modeI = (this.modeI < (this.mode.length - 1) ? this.modeI + 1 : 0);
      let fImg = this.mode[this.modeI];
      let row = Math.floor(fImg / (AnimKeen.sheet.w / AnimKeen.sheet.sw));
      let col = fImg % Math.floor(AnimKeen.sheet.w / AnimKeen.sheet.sw);
      this.modeLoc.x = col * AnimKeen.sheet.sw;
      this.modeLoc.y = row * AnimKeen.sheet.sh;

      if(collide) this.changeDir();
      //console.log(frame + " " + (frame % this.frameDiv));
      //console.log(fImg + " " + this.modeLoc.x + " " + this.modeLoc.y + " WW " + Math.floor(AnimKeen.sheet.w / AnimKeen.sheet.sw));
    }
  }
}

class AnimPeep extends AnimSprite {
  static sheet = {sourceImg: "open-peeps-sheet.png", w: 3600, h: 2268, sw: 3600/15, sh: 2268/7};

  constructor(x, y) {
    super(x, y);
    this.dir.x = random.range(2, 7);
    this.index = Math.floor(random.range(0, Math.floor((AnimPeep.sheet.w / AnimPeep.sheet.sw)) * Math.floor((AnimPeep.sheet.h / AnimPeep.sheet.sh)) ));
    this.flip = 1;
    this.drawOff = [-128, 0];

  }

  draw(context) {
    // TODO: fix this "img" global variable thingy
    //
    context.save();
    context.imageSmoothingEnabled = false;
    context.translate(this.loc.x, this.loc.y);
    context.scale(this.scale * this.flip, this.scale);
    context.drawImage(img, this.modeLoc.x, this.modeLoc.y, AnimPeep.sheet.sw, AnimPeep.sheet.sh, this.drawOff[0], this.drawOff[1], AnimPeep.sheet.sw, AnimPeep.sheet.sh);
    context.restore();
  }

  changeDir() {
    // Flip image
    this.flip *= -1;
  }

  next(frame) {
    //ASSume frame increases pr frame, duh, 
    if(frame % this.frameDiv == 0) {
      // Switch image
      this.loc.add(this.dir);
      this.loc.y += Math.sin(this.loc.x / 4);
      let collide = this.checkCollision();

      //this.modeI = (this.modeI < (this.mode.length - 1) ? this.modeI + 1 : 0);
      let fImg = this.index;
      let row = Math.floor(fImg / (AnimPeep.sheet.w / AnimPeep.sheet.sw));
      let col = fImg % Math.floor(AnimPeep.sheet.w / AnimPeep.sheet.sw);
      this.modeLoc.x = col * AnimPeep.sheet.sw;
      this.modeLoc.y = row * AnimPeep.sheet.sh;

      if(collide) this.changeDir();
      //console.log(frame + " " + (frame % this.frameDiv));
      //console.log(row + " / " + col + " . fImg:" + fImg + " " + this.modeLoc.x + " " + this.modeLoc.y + " WW " + Math.floor(AnimPeep.sheet.w / AnimPeep.sheet.sw));
    }
  }
}

class AnimBar extends Anim {
  constructor(x, y) {
    super(x, y);
    this.loc = new Vector(x, y);
    this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), 0);
    this.color = RGB.hexToRgb(random.pick(palette.active));
    this.time = random.range(150, 15000);
    this.age = this.time;
    this.width = random.range(params.size.cell * -2, params.size.cell * 2);
    this.maxAnim = 32;
    this.rot = 0.0;
    this.rotVel = 0; // random.range(0, 0.01);
  }

  isActive() {
    return (this.time > 0);
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.translate(this.loc.x, this.loc.y);
    context.fillStyle = this.color.toString();
    
    let shadowColor = this.color.copy();
    shadowColor.modify(0.8);
    context.shadowColor = shadowColor.toString();
    context.shadowBlur = params.size.cell * 10;
    
    this.rot += this.rotVel;
    context.rotate(this.rot * Math.PI);


    context.fillRect(0, 0, this.width, params.size.height);
    context.fill();
    context.closePath();
    context.restore();
  }

  checkCollision() {
    let collide = false;

    if(this.loc.x <= 0 || this.loc.x >= params.size.width) {
      this.loc.x = (this.loc.x <= 0 ? 0 : params.size.width);
      this.dir.x *= -1;
      collide = true;
    }
    
    return collide;
  }

  next(frame, width, height) {
    this.dir.y = 0;

    this.loc.add(this.dir);
    this.time--;

    let collide = this.checkCollision();

    if(collide) {
      let spawn = new AnimBar(this.loc.x, this.loc.y);
      spawn.color.addNoise(params.colorNoise);
      this.children.add(spawn);
    }

    return null;

  }
}

class AnimBarPar extends AnimBar {
  constructor(x, y) {
    super(x, y); 
    this.height = params.size.cell * 2; //params.size.height;
    //this.color.addNoise(params.colorNoise);
    this.width = params.size.cell * random.range(1, params.baseVel);
    this.dir = new Vector(random.range(params.baseVel * -0.5, params.baseVel * 0.5), 0);
  }

  isActive() {
    return (this.time > 0 && this.height > 0);
  }

  death() {
    return new AnimBarPar(random.range(0, params.size.width), 0);
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.translate(this.loc.x, this.loc.y);
    context.fillStyle = this.color.toString();
    
    let shadowColor = this.color.copy();
    shadowColor.modify(0.8);
    context.shadowColor = shadowColor.toString();
    context.shadowBlur = params.size.cell * 10;

    context.fillRect(0, 0, this.width, this.height);
    context.fill();
    context.closePath();
    context.restore();
  }

  next(frame) {
    this.gravity();
    this.dir.y = 0;

    this.loc.add(this.dir);
    this.loc.y -= params.baseVel;
    this.height -= (params.baseVel * 2);
    this.time--;
    this.color.modify(0.985);

    /*let collide = this.checkCollision();

    if(collide) {
      this.time = 0;
      let spawn = new AnimBarStar(this.loc.x, this.loc.y);

      return spawn;
    }*/

    return null;
  }
}

class AnimBall extends Anim {
  constructor(x, y) {
    super();
    this.loc = new Vector(x, y);
    this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), random.range(params.baseVel * -1, params.baseVel));
    this.color = RGB.hexToRgb(random.pick(palette.active));
    this.time = random.range(1500, 5000);
    this.age = this.time;
    this.radius = params.radius * random.range(0, 1.0);
    this.maxAnim = 128;
    this.frameDiv = 1;
  }

  isActive() {
    return true; // (this.time > 0 && this.color.getIntensity() < params.colFilter);
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.translate(this.loc.x, this.loc.y);
    context.fillStyle = this.color.toString();
    
    let shadowColor = this.color.copy();
    shadowColor.modify(-0.3);
    context.shadowColor = shadowColor.toString();
    context.shadowBlur = this.radius * params.size.cell / 2;

    context.arc(0, 0, this.radius * this.getAge() * params.size.cell, 0, Math.PI * 2);
    context.fill();
    context.closePath();
    context.restore();
    
  }

  getAge() {
    return (this.time / this.age);
  }

  next(frame) {
    if(frame % this.frameDiv == 0) {
      //console.log("next ball at " + this.loc);
      //this.gravity();

      this.loc.add(this.dir);
      this.time--;
    }

    let collide = this.checkCollision();
    /*
    if(collide) {
      let spawn = new AnimBall(this.loc.x, this.loc.y);
      spawn.color.addNoise(params.colorNoise);
      this.children.push(spawn);
    }*/
  }

}

class AnimStar extends Anim {
  constructor(x, y) {
    super(x, y);
    this.dir = new Vector(0.2, -0.001);
    this.color = RGB.hexToRgb(random.pick(palette.stars));
    this.color.modify(params.colorNoise);
    this.radius = random.range(0.03, 0.3);
    this.color.modify(random.range(0.3, 1.0));
    this.intensity = 0.5;
    this.intVel = random.range(random.range(0.01, 0.04), 0.05);
    this.intBounds = [0.2, 1.1];
    this.frameDiv = Math.floor(random.range(1, 20));
  }

  isActive() {
    return this.loc.x < params.size.width;
  }

  draw(context) {
    //context.imageSmoothingEnabled = true;
    context.save();
    context.beginPath();
    context.translate(this.loc.x, this.loc.y);
    
    
    let fillColor = this.color.copy();
    fillColor.modify(this.intensity);
    let shadowColor = RGB.hexToRgb("#FFFFFF"); // fillColor.copy();
    shadowColor.modify(1.3);
    context.shadowColor = shadowColor;
    context.shadowBlur = 10; // this.radius * params.size.cell *  this.intensity * 100;

    context.fillStyle = fillColor.toString();
    context.arc(0, 0, this.radius * this.getAge() * params.size.cell * this.intensity, 0, Math.PI * 2);
    context.fill();
    context.closePath();
    context.restore();
  }

  next(frame) {
    if(frame % this.frameDiv == 0) {
      this.intensity += this.intVel;
      if(this.intensity >= this.intBounds[1] || this.intensity <= this.intBounds[0]) this.intVel *= -1;
    }
    this.loc.add(this.dir);
  }
}

class AnimMoon extends Anim {
  constructor(x, y) {
    super(x, y);
    this.dir = new Vector(0, 0);
    this.radius = 100;
    this.color = RGB.hexToRgb("#FCF9C5");
    this.craters = new Array(Math.floor(random.range(3, 8)));
    for(let i = 0; i < this.craters.length; i++) {
      this.craters[i] = new Vector(random.range(-50, 50), random.range(-50, 50));
    }
  }

  draw(context) {
    context.save();
    context.translate(this.loc.x, this.loc.y);
    context.beginPath();
    let fillColor = this.color.copy();
    let shadowColor = RGB.hexToRgb("#FFFFFF"); // fillColor.copy();
    shadowColor.modify(1.3);
    context.shadowColor = shadowColor;
    context.shadowBlur = 20; // this.radius * params.size.cell *  this.intensity * 100;

    context.fillStyle = fillColor.toString();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    for(let i = 0; i < this.craters.length; i ++) {
      context.shadowColor = "#CCCCCC";
      context.shadowBlur = 3;
      context.beginPath();
      context.fillStyle = RGB.hexToRgb("#DDDDDD").toRGBA(0.3);
      context.arc(this.craters[i].x, this.craters[i].y, this.radius / 15, 0, Math.PI * 2);
      context.fill();
      context.closePath();
    }

    
    context.restore();
  }
}

class AnimNightSky extends Anim {
  constructor(x, y) {
    super(x, y);
    this.frameDiv = Math.floor(random.range(32, 128));
    let start = random.range(1, params.size.width);
    this.gradient = [start, start + params.size.width];
    this.intensity = 0.1;
    this.intVel = random.range(0.005, 0.02);
    this.intBounds = [0.01, 0.7];
  }

  draw(context) {
    context.save();
    const gradient = context.createLinearGradient(this.gradient[0], params.size.width, this.gradient[1], params.size.width);

    // Add three color stops
    let color = RGB.hexToRgb("#444444");
    color.modify(this.intensity);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.5, color.toString());
    gradient.addColorStop(1, "#000000");
    context.rotate(Math.PI * this.intVel * 2);
    context.shadowColor = color.toString();
    context.shadowBlur = params.size.cell * 100;
    // Set the fill style and draw a rectangle
    context.fillStyle = gradient;
    context.fillRect(-540, -540, params.size.width * 2, params.size.height * 2);
    context.restore();
  }
  next(frame) {
    if(frame % this.frameDiv == 0 && this.intensity < 0.1) {
      let start = random.range(1, params.size.width);
      this.gradient = [start, start + random.range(1, params.size.width)];
      
    }
    this.intensity += this.intVel;
    if(this.intensity >= this.intBounds[1] || this.intensity <= this.intBounds[0]) this.intVel *= -1;
  }
}

class AnimBuilding extends Anim {
  constructor(x, y) {
    super(x, y);
    this.color = RGB.hexToRgb("#333333");
    this.color.addNoise(1.0 - params.colorNoise);
    this.frameDiv = Math.floor(random.range(32, 128));
    this.intensity = 0.1;
    this.intVel = random.range(0.005, 0.02);
    this.intBounds = [0.01, 0.7];
    this.size = new Vector(random.range(50, 180), random.range(380, 580));
    this.windows = [Math.floor(random.range(1, 3)), Math.floor(random.range(5, 9))];
    this.windowOff = [12, 20];
  }

  checkCollision() {
    let collide = false;

    if(this.loc.x >= this.getBounds().x) {
      this.loc.x = 0;
      collide = true;
    }
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.translate(this.loc.x, this.loc.y);
    context.fillStyle = this.color.toString();
    
    let shadowColor = this.color.copy();
    shadowColor.modify(0.8);
    context.shadowColor = shadowColor.toString();
    context.shadowBlur = params.size.cell;

    
    //winColor.addNoise(1.0 - params.colorNoise);

    context.fillRect(0, this.parent.loc.y - this.size.y, this.size.x, this.size.y);
    context.fill();
    context.closePath();

    let winColor = RGBA.hexToRgb("#FCF9C5").toRGBA(0.3);
    context.fillStyle = winColor.toString();

    for(let i = 0; i < this.windows[0] * this.windows[1]; i++) {
      let row = Math.floor(i / this.windows[0]);
      let col = i % this.windows[0];
      let dx = Math.floor(this.size.x / this.windows[0] / 2);
      let dy = Math.floor(this.size.y / this.windows[1] / 2);
      
      context.fillRect(this.windowOff[0] + (dx * col) + (col * 6), this.windowOff[1] + this.parent.loc.y - this.size.y + (dy * row) + (row * 12), dx, dy);
    }
    
    //this.rot += this.rotVel;
    //context.rotate(this.rot * Math.PI);


    
    context.restore();
  }
}


class LFO {
  constructor(div = 2, amp = 1.0, time = 30, wave = "tri") {
    this.freqDiv = div;
    this.amp = amp;
    this.wave = wave;
    this.out = 0.0;
    this.vel = this.amp / time;
    this.itr = 0;
  }

  next(frame) {
    if(frame % this.freqDiv == 0) {
      this.out += this.vel;
      if(this.out >= 1.0 || this.out <= 0.0)
        this.vel *= -1;
    }
  }
}



const getGlyph = (v) => {
  if (v < 50) return '';
  if (v < 100) return '.';
  if (v < 150) return '-';
  if (v < 200) return '+';
  
  const glyph = '_*/'.split('');

  return random.pick(glyph);
};

const createPane = () => {
  tPane = new tweakpane.Pane();
  let folder;

  folder = tPane.addFolder({title: 'TK Animation'});
  folder.addInput(params, 'freq', {min:-1, max: 1});
  folder.addInput(params, 'lfoFreq', {min:0, max: 100, step: 1});
  folder.addInput(params, 'lfoAmp', {min:-1, max: 1, step: 0.01});
  folder.addInput(params, 'noiseFact', {min:0, max: 1, step: 0.01});
  folder.addInput(params, 'displace', {min:-1, max: 1, step: 0.01});
  folder.addInput(params, 'radius', {min:0, max: 10, step: 0.1});
  folder.addInput(params, 'colorNoise', {min:-1, max: 10, step: 0.1});
  folder.addInput(params, 'colFilter', {min:0, max: 1, step: 0.1});
  folder.addInput(params, 'crossfade', {min:0, max: 1, step: 0.1});
  folder.addInput(params, 'clear');
  folder.addInput(params, 'newActors',  {min:0, max: 256, step: 1});
  folder.addInput(params, 'baseVel', {min:-10, max: 10, step: 1});
  folder.addInput(params, 'maxActors', {min:0, max: 512, step: 16});
  folder.addMonitor(params, 'actorCount');
  folder.addMonitor(params, 'fps');
  folder.addMonitor(params, 'performance');
  folder.addMonitor(params, 'status', {multiline: true});
  folder.addInput(params, 'animate');
};

createPane();


const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};


start();

