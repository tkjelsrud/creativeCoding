//canvas-sketch sketch-06.js --output=output/05 --stream --open

const canvasSketch = require('canvas-sketch');
//const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');
const {Vector, RGB} = require('./lib/util.js');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  duration: 30,
  fps: 24,
};

let manager;
let img;
let img2;
let lfo;

let animActors = new Array();

const params = {
  freq: 0.3,
  frame: 0,
  lfoFreq: 1,
  lfoAmp: 0.002,
  crossfade: 0,
  noiseFact: 0.5,
  displace: 0.0,
  radius: 1.0,
  colorNoise: 0.25,
  colFilter: 0.1,
  boost: 2.5,
  animate: true,
  lineColor: {r: 140, g: 46, b: 77},
  palette: ["#eaaf47", "#40280f", "#eeeeee", "#472422"],
  actorCount: 0,
  maxActors: 128,
  lastFrame: 0,
  fps: 0,
  clear: true,
  baseVel: 3,
  gravity: {x: 540, y: 540, ampX: 0.2, ampY: 0.2},
  size: {cell: 16, cols: 64, rows: 64, height: 1080, width: 1080},
};

const start = async () => {
  //img = await loadImage('putty-128.png');
  
  lfo = new LFO(params.lfoFreq, params.lfoAmp);
  animActors.push(new AnimStar(64, 64));
  animActors.push(new AnimBar(128, 0));

  manager = await canvasSketch(sketch, settings);
};


const sketch = ({ context, width, height }) => {
  //const numCells = params.size.cols * params.size.rows;
 


  return ({ context, width, height, playhead }) => {
    
    if(!params.animate) {
      animActors = new Array();
      return;
    }
    params.fps = 1000 / (performance.now() - params.lastFrame);
    params.lastFrame = performance.now();

    if(params.clear || playhead < 0.1) {
      context.fillStyle = 'black';
      context.fillRect(0, 0, width, height);
    }
    lfo.next(playhead);

    for(let i = animActors.length - 1; i >= 0; i--) {
      let ia = animActors[i];

      if(!ia.isActive() || ia.color.getIntensity() < params.colFilter) {
        animActors.splice(i, 1);
        continue;
      }

      ia.draw(context);

      r = ia.next(playhead, width, height);
      if(r && animActors.length < params.maxActors)
        animActors.push(r);
    }

    //if(animActors.length > 100) animActors.splice(0, animActors.length-100);
    params.actorCount = animActors.length;

    if(animActors.length == 0) {
      animActors.push(new AnimStar(settings.dimensions[0] / 2, settings.dimensions[1] / 2));
      //animActors.push(new AnimBar(settings.dimensions[0] / 2, 0));
    }

    //context.translate(random.noise2D(playhead, 0) * width, random.noise2D(playhead, 0) * height);
    /*context.translate(width/2, height/2);
    context.translate(random.noise2D(Math.sin(playhead), 0) * 100, random.noise2D(playhead, 0) * 100);
    context.rotate(random.noise2D(playhead, 0) * 100);
    context.fillStyle = `rgb(${params.lineColor.r}, ${params.lineColor.g}, ${params.lineColor.b})`;;
    context.fillRect(0, 0, 98, 98);
    */
    

    /*for(let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      let rgb  = RGB.newRandom();

      //const n = Math.max(params.noiseFact, random.noise2D(x + (Math.sin(playhead * Math.PI) * 3), y, params.freq) + 0.3);

      //rgb.addNoise(random.noise2D(x));
      

      context.fillStyle = rgb.toString();

      if(rgb.getIntensity() < params.colFilter) continue;

      context.save();
      context.translate(x, y);
      context.translate(32, 32);
      //context.translate((params.displace * random.range(-1, 1)) * cols * 2, (params.displace * random.range(-1, 1)) * rows * 2);
      //context.translate(lfo.out * 10, lfo.out * 100);

      //const gravVect = new Vector(params.gravX, params.gravY);
      //const gravDist = width / (new Vector(x, y).getDistance(gravVect) * cell);
      //const move = new Vector(x, y).getVectorTo(gravVect);
      //console.log(gravDist);

      //context.rotate(lfo.out * params.gravAmp * gravDist * 2);
      //context.translate(params.gravAmp * gravDist * move.x * lfo.out, params.gravAmp * gravDist * move.y * lfo.out);
      
      context.beginPath();
      //const rad = cell * params.radius * n;
      //context.translate((rad * 0.3), (rad));
      //context.arc(0, 0, rad, 0, Math.PI * 2);
      //context.rect(x, y, cell, cell);
      context.fillStyle = rgb.toString();
      context.fillRect(0, 0, random.range(4, cell), random.range(4, cell));


      //cos(xy + cos(4y))2 + sin(y) = 0.4x + 0.1y^2

      //context.fillText(glyph, 0, 0);

      context.restore();

      
    }*/
  };
};






class Anim {
  constructor(x, y) {
      this.loc = new Vector(x, y);
      this.dir = new Vector(0, 0);
  }

  gravity() {
    const gravPoint = new Vector(params.gravity.x, params.gravity.y);
    let gravOff = new Vector((gravPoint.getDistance(this.loc) / (params.size.width)) * params.gravity.ampX, (gravPoint.getDistance(this.loc) / (params.size.height)) * params.gravity.ampY);
    
    if(gravPoint.x < this.loc.x) gravOff.x *= -1;
    if(gravPoint.y < this.loc.y) gravOff.y *= -1;

    this.dir.add(gravOff);
  }

  checkCollision() {
    let collide = false;

    if(this.loc.x <= 0 || this.loc.x >= params.size.width) {
      this.loc.x = (this.loc.x <= 0 ? 0 : params.size.width);
      this.dir.x *= -1;
      collide = true;
    }
    if(this.loc.y <= 0 || this.loc.y >= params.size.height) {
      this.loc.y = (this.loc.y <= 0 ? 0 : params.size.height);
      this.dir.y *= -1;
      collide = true;
    }
    return collide;
  }
}


class AnimBar extends Anim {
  constructor(x, y) {
    super(x, y);
    this.loc = new Vector(x, y);
    this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), 0);
    this.color = RGB.hexToRgb(random.pick(params.palette));
    this.time = random.range(150, 15000);
    this.age = this.time;
    this.width = random.range(params.size.cell * -2, params.size.cell * 2);
    this.maxAnim = 32;
    this.rot = 0.0;
    this.rotVel = random.range(0, 0.01);
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
    //this.gravity();
    this.dir.y = 0;

    this.loc.add(this.dir);
    this.time--;

    let collide = this.checkCollision();

    if(collide) {
      let spawn = new AnimBar(this.loc.x, this.loc.y);
      //spawn.time = this.time + 2;
      //spawn.color = this.color;
      spawn.color.addNoise(params.colorNoise);

      return spawn;
    }

    return null;

  }
}

class AnimStar extends Anim {
  constructor(x, y) {
    super();
    this.loc = new Vector(x, y);
    this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), random.range(params.baseVel * -1, params.baseVel));
    this.color = RGB.hexToRgb(random.pick(params.palette));
    //this.color = new RGB(random.range(64, 255), random.range(64, 255), random.range(64, 255));
    this.time = random.range(150, 5000);
    this.age = this.time;
    this.radius = params.radius * random.range(0, 1.0);
    this.maxAnim = 128;
    
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

  next(frame, width, height) {
    this.gravity();

    this.loc.add(this.dir);
    this.time--;

    let collide = this.checkCollision();

    if(collide) {
      let spawn = new AnimStar(this.loc.x, this.loc.y);
      //spawn.time = this.time + 2;
      //spawn.color = this.color;
      spawn.color.addNoise(params.colorNoise);

      return spawn;
    }

    return null;
  }

}




class LFO {
  constructor(freqDiv, amp, wave = "tri") {
    this.freqDiv = freqDiv;
    this.amp = amp;
    this.wave = wave;
    this.out = 0.0;
    this.vel = this.amp;
    this.itr = 0;
  }

  next(frame) {
    if(this.itr++ % this.freqDiv == 0) {
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
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({title: 'TK Animation'});
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
  folder.addInput(params, 'baseVel', {min:0, max: 20, step: 1});
  folder.addInput(params, 'maxActors', {min:0, max: 512, step: 16});
  folder.addMonitor(params, 'actorCount');
  folder.addMonitor(params, 'fps');
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

