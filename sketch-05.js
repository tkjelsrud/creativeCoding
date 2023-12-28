const canvasSketch = require('canvas-sketch');
//const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  duration: 20,
  fps: 30,
};

let manager;
let img;
let img2;
let lfo;

const params = {
  freq: 0.3,
  frame: 0,
  lfoFreq: 1,
  lfoAmp: 0.02,
  crossfade: 0,
  noiseFact: 1.0,
  displace: 0.0,
  radius: 0.5,
  colorNoise: 1,
  colFilter: 0.1,
  boost: 2.5,
  animate: true,
  gravX: 32,
  gravY: 32,
  gravAmp: 0,
};

const sourceCanvas = document.createElement('canvas');
const sourceContext = sourceCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  const cell = 8;
  const cols = 128; //Math.floor(width / cell);
  const rows = 128; //Math.floor(height / cell);
  const numCells = cols * rows;
  

  sourceCanvas.width = cols;
  sourceCanvas.height = rows;

  return ({ context, width, height, playhead }) => {
    
    if(!params.animate) return;

    //typeContext.font = `${params.fontSize}px ${params.fontFamily}`;
    //typeContext.textBaseline = 'top';
    
    /*const metrics = typeContext.measureText(params.text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) * 0.5 - mx;
    const ty = (rows - mh) * 0.5 -my;*/

    sourceContext.save();
    //typeContext.translate(tx, ty);
    //typeContext.beginPath();
    //typeContext.rect(mx, my, mw, mh);
    sourceContext.fillStyle = 'black';
    sourceContext.fillRect(0, 0, cols, rows);
    sourceContext.drawImage(img, 0, 0);
    const sourceData = sourceContext.getImageData(0, 0, cols, rows).data;

    sourceContext.fillStyle = 'black';
    sourceContext.fillRect(0, 0, cols, rows);
    sourceContext.drawImage(img2, 0, 0);
    const sourceData2 = sourceContext.getImageData(0, 0, cols, rows).data;

    sourceContext.restore();

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    lfo.next(playhead);

    for(let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      let rgb  = new RGB(sourceData[i * 4 + 0], sourceData[i * 4 + 1], sourceData[i * 4 + 2]);
      const rgb2 = new RGB(sourceData2[i * 4 + 0], sourceData2[i * 4 + 1], sourceData2[i * 4 + 2]);
      //const a = typeData[i * 4 + 3];
      //const glyph = getGlyph(r);
      //r *= random.noise3D(x, y, 1, 1);

      //context.fillStyle = 'black';
      //context.fillRect(0, 0, width, height);

      rgb = rgb.crossfade(rgb2, params.crossfade);
      rgb.modify(params.boost);

      

      if(rgb.getIntensity() < params.colFilter) continue;

      const n = Math.max(params.noiseFact, random.noise2D(x + (Math.sin(playhead * Math.PI) * 3), y, params.freq) + 0.3);

      rgb.addNoise(n * params.colorNoise * lfo.out);

      context.fillStyle = rgb.toString();
      //context.font = `${cell * 2}px ${params.fontFamily}`;
      //if(Math.random() < 0.1)
      //  context.font = `${cell * 6}px ${params.fontFamily}`;

      if(rgb.getIntensity() < params.colFilter) continue;

      context.save();
      context.translate(x, y);
      context.translate(32, 32);
      context.translate((params.displace * random.range(-1, 1)) * cols * 2, (params.displace * random.range(-1, 1)) * rows * 2);
      //context.translate(lfo.out * 10, lfo.out * 10);

      const gravVect = new Vector(params.gravX, params.gravY);
      const gravDist = width / (new Vector(x, y).getDistance(gravVect) * cell);
      const move = new Vector(x, y).getVectorTo(gravVect);
      //console.log(gravDist);

      context.rotate(lfo.out * params.gravAmp * gravDist * 2);
      context.translate(params.gravAmp * gravDist * move.x * lfo.out, params.gravAmp * gravDist * move.y * lfo.out);
      
      // distance becomes velocity


      //context.translate(0, intens * n * 20);
      //context.translate(cell * 0.5, cell * 0.5);
      //context.fillRect(0, 0, cell, cell);
      context.beginPath();
      const rad = cell * params.radius * n;
      context.translate((rad * 0.3), (rad));
      context.arc(0, 0, rad, 0, Math.PI * 2);
      context.fill();

      //context.fillText(glyph, 0, 0);

      context.restore();

      
    }
  };
};

class RGB {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  modify(f) {
    this.r *= f;
    this.g *= f;
    this.b *= f;
  }

  addNoise(f) {
    this.r *= random.range(f, 1);
    this.g *= random.range(f, 1);
    this.b *= random.range(f, 1);
  }

  getIntensity() {
    return ((this.r + this.g + this.b) / 3) / 256;
  }

  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  crossfade(toRgb, fact) {
    // Cross between two images (color informations)
    let r = Math.floor(((this.r * (1 - fact)) + (toRgb.r * fact)) / 2);
    let g = Math.floor(((this.g * (1 - fact)) + (toRgb.g * fact)) / 2);
    let b = Math.floor(((this.b * (1 - fact)) + (toRgb.b * fact)) / 2);

    return new RGB(r, g, b);
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

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  getVectorTo(v) {
    return new Vector(v.x - this.x, v.y - this.y);
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

  folder = pane.addFolder({title: 'Text'});
  //folder.addInput(params, 'fontSize', {min:20, max: 1800, step: 10});
  
  //folder.addInput(params, 'imgId', {min:1, max: 2, step: 1});
  folder.addInput(params, 'freq', {min:-1, max: 1});
  folder.addInput(params, 'lfoFreq', {min:0, max: 100, step: 1});
  folder.addInput(params, 'lfoAmp', {min:-1, max: 1, step: 0.01});
  folder.addInput(params, 'noiseFact', {min:0, max: 1, step: 0.01});
  folder.addInput(params, 'displace', {min:-1, max: 1, step: 0.01});
  folder.addInput(params, 'radius', {min:0, max: 10, step: 0.1});
  folder.addInput(params, 'colorNoise', {min:-1, max: 10, step: 0.1});
  folder.addInput(params, 'colFilter', {min:0, max: 1, step: 0.1});
  folder.addInput(params, 'crossfade', {min:0, max: 1, step: 0.1});
  
  folder.addInput(params, 'gravAmp', {min:-10, max: 20, step: 0.01});
  folder.addInput(params, 'gravX', {min:0, max: 1080});
  folder.addInput(params, 'gravY', {min:0, max: 1080});
  folder.addInput(params, 'animate');
};

createPane();

/*const onKeyUp = (e) => {
  if(e.key == "1") {

  }
  manager.render();
}

document.addEventListener('keyup', onKeyUp);
*/

const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};

const start = async () => {
  img = await loadImage('img/winter-128.png');
  img2 = await loadImage('img/scream-64.png');
  lfo = new LFO(params.lfoFreq, params.lfoAmp);
  //console.log(img);
  manager = await canvasSketch(sketch, settings);
};

start();


//const url = "https://picsum.photos/200/300";


/*
const start = () => {
  loadMeSomeImage(url).then(img => {
    console.log('image width', img.width);
  });
  console.log('this line');
};

const start = async () => {
  const img = await loadMeSomeImage(url);
  console.log('image width', img.width);
  console.log('this line');
};

start();
*/


    //context.textBaseline = 'middle';
    //context.textAlign = 'center';

    //context.drawImage(typeCanvas, 0, 0);

    //console.log(cols + " " + rows + " " + numCells);
    //console.log('trig');