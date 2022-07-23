const canvasSketch = require('canvas-sketch');
//const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  duration: 10,
  fps: 30,
};

let manager;
let img;

const params = {
  text: 'A',
  fontSize: 54 * 1.2,
  fontFamily: 'serif',
  freq: 0.3,
  frame: 0,
  noiseFact: 1.0,
  displace: 0.0,
  radius: 0.5,
  colorNoise: 1,
  animate: true,
  gravX: 32,
  gravY: 32,
  gravAmp: 0,
  /*cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  animate: true,
  frame: 0,
  lineCap: 'butt',*/
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  const cell = 16;
  const cols = 64; //Math.floor(width / cell);
  const rows = 64; //Math.floor(height / cell);
  const numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;


  return ({ context, width, height, playhead }) => {
    
    if(!params.animate) return;

    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    typeContext.fillStyle = 'white';
    //typeContext.font = `${params.fontSize}px ${params.fontFamily}`;
    //typeContext.textBaseline = 'top';
    
    /*const metrics = typeContext.measureText(params.text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) * 0.5 - mx;
    const ty = (rows - mh) * 0.5 -my;*/

    typeContext.save();
    //typeContext.translate(tx, ty);
    //typeContext.beginPath();
    //typeContext.rect(mx, my, mw, mh);
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);
    //base_image = new Image();
    //base_image.src = 'badger-128.png';
    //img = loadImage('badger-128.png');

    // I dont understand basic async yet...

    typeContext.drawImage(img, 0, 0);
    //typeContext.stroke();

    //typeContext.fillText(params.text, 0, 0);

    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;
    //console.log(typeData);

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    //context.drawImage(typeCanvas, 0, 0);

    //console.log(cols + " " + rows + " " + numCells);
    //console.log('trig');

    for(let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0]; // first RGBA channel
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const intens = r / 256;

      //const glyph = getGlyph(r);
      //r *= random.noise3D(x, y, 1, 1);
      const n = Math.max(params.noiseFact, random.noise2D(x + (Math.sin(playhead * Math.PI) * 5), y, params.freq) + 0.3);
      context.fillStyle = `rgb(${r*n*random.range(params.colorNoise, 1)}, ${g*n*random.range(params.colorNoise, 1)}, ${b*n*random.range(params.colorNoise, 1)})`; //'white'; //`
      //context.font = `${cell * 2}px ${params.fontFamily}`;
      //if(Math.random() < 0.1)
      //  context.font = `${cell * 6}px ${params.fontFamily}`;

      context.save();
      context.translate(x, y);
      context.translate(32, 32);
      context.translate((params.displace * random.range(-1, 1)) * 128, (params.displace * random.range(-1, 1)) * 128);
      
      const gravVect = new Vector(params.gravX, params.gravY);
      const gravDist = width / (new Vector(x, y).getDistance(gravVect) * cell);
      const move = new Vector(x, y).getVectorTo(gravVect);
      //console.log(gravDist);

      context.translate(params.gravAmp * gravDist * move.x, params.gravAmp * gravDist * move.y);
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
  folder.addInput(params, 'freq', {min:-1, max: 1});
  folder.addInput(params, 'noiseFact', {min:0, max: 1, step: 0.01});
  folder.addInput(params, 'displace', {min:-1, max: 1, step: 0.01});
  folder.addInput(params, 'radius', {min:0, max: 10, step: 0.1});
  folder.addInput(params, 'colorNoise', {min:-1, max: 10, step: 0.1});
  folder.addInput(params, 'gravAmp', {min:-10, max: 10, step: 1});
  folder.addInput(params, 'gravX', {min:0, max: 1080});
  folder.addInput(params, 'gravY', {min:0, max: 1080});
  folder.addInput(params, 'animate');
};

createPane();

/*const onKeyUp = (e) => {
  //console.log(e);
  params.text = e.key.toUpperCase();
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
  img = await loadImage('badger-64.png');
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