const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');
const risoColor = require('riso-colors');

// Import my own libraries
const {Vector, RGB, RGBA} = require('./lib/util.js');
const {Anim, AnimLayer} = require('./lib/anim.js');

let manager;
let img;
//let img2;
let lfo;

const settings = {
    dimensions: [ 1080, 1080 ],
    animate: true,
    duration: 300,
    fps: 30,
};

const params = {
    images: 'img/winter-128.png,img/winter2-128.png',
    radius: 0.5,
    bgColor: {r: 12, g: 12, b: 12},
    colorMelt: 0,
    cell: 4,
    cols: 256,
    rows: 256,
    logg: 'test',
    animate: true,
};

const createPane = () => {
    const pane = new tweakpane.Pane();
    let folder;
  
    folder = pane.addFolder({title: 'Text'});

    folder.addInput(params, 'images');
    folder.addInput(params, 'cell');
    folder.addInput(params, 'cols');
    folder.addInput(params, 'rows');
    folder.addInput(params, 'radius', {min:0, max: 1, step: 0.1});
    folder.addInput(params, 'colorMelt', {min:0, max: 2000, step: 100});

    folder.addMonitor(params, 'logg', {
        multiline: true,
        lineCount: 5,
        interval: 100,
    });

    folder.addInput(params, 'bgColor');

    /*folder.addMonitor(lfo, 'itr', {
        interval: 1000,
    });*/

    //folder.addInput(params, 'imgId', {min:1, max: 2, step: 1});
    //folder.addInput(params, 'freq', {min:-1, max: 1});

    folder.addInput(params, 'animate');
  };

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

const sourceCanvas = document.createElement('canvas');
const sourceContext = sourceCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
    

    return ({ context, width, height, playhead }) => {
        
        if(!params.animate) return;

        const cell = params.cell;
        const cols = params.cols; //Math.floor(width / cell);
        const rows = params.rows; //Math.floor(height / cell);
        const numCells = cols * rows;

        params.logg = cols + "/" + rows;
        
        sourceCanvas.width = cols;
        sourceCanvas.height = rows;

        sourceContext.save();

        sourceContext.fillStyle = 'black';
        sourceContext.fillRect(0, 0, cols, rows);
        sourceContext.drawImage(img, 0, 0);
        const sourceData = sourceContext.getImageData(0, 0, cols, rows).data;

        sourceContext.restore();

        context.fillStyle = (RGB.from(params.bgColor)).toString();;
        context.fillRect(0, 0, width, height);

        lfo.next(playhead);
        params.logg = "playhead:" + playhead;

        for(let i = 0; i < numCells; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = col * cell;
            const y = row * cell;

            let rgb  = new RGB(sourceData[i * 4 + 0], sourceData[i * 4 + 1], sourceData[i * 4 + 2]);

            //if(rgb.getIntensity() < 1- (playhead * 3)) continue;

            context.fillStyle = rgb.toString();
            //console.log(rgb.toString());
            //params.logg += rgb.toString();

            context.save();
            context.translate(32, 32);
            context.translate(x, y);

            // Melting test... if bright, pour down
            if(params.colorMelt > 0) {
                context.translate(0, rgb.getIntensity() * params.colorMelt);
            }

            //context.translate(cols * 0.5, rows * 0.5);
     

            context.beginPath();
            const rad = cell * params.radius;
            context.translate((rad * 0.3), (rad));
            context.arc(0, 0, rad, 0, Math.PI * 2);
            context.fill();

            context.restore();
        }
    };
};


  
  


const loadImage = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject();
      img.src = url;
    });
  };
  
  const start = async () => {
    /*const iList = params.images.split(',');

    for(i = 0; i < iList.length; i++) {
        img = await loadImage(iList[i]);
    }*/
    img = await loadImage('img/winter-1-256.png');
    //img2 = await loadImage('img/winter2-128.png');
    lfo = new LFO(1, 1);
    console.log(img);
    manager = await canvasSketch(sketch, settings);
  };

  createPane();
  start();