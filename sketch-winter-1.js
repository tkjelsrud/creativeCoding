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

class Scene {
    constructor(setup) {
        this.image = setup.image;
        this.cellSize = setup.cellSize;
        this.cols = setup.cols;
        this.rows = setup.rows;
        this.numCells = this.cols * this.rows;
        this.sourceCanvas = document.createElement('canvas');
        this.sourceContext = this.sourceCanvas.getContext('2d');
        this.sourceData = null;
    }

    loadSource() {
        this.sourceContext.save();
        this.sourceContext.fillStyle = 'black';
        this.sourceContext.fillRect(0, 0, this.cols, this.rows);
        this.sourceContext.drawImage(this.image, 0, 0);
        this.sourceData = this.sourceContext.getImageData(0, 0, this.cols, this.rows).data;
        this.sourceContext.restore();
    }

    draw(parentContext) {
        for(let i = 0; i < this.numCells; i++) {
            const col = i % this.cols;
            const row = Math.floor(i / this.cols);

            const x = col * this.cellSize;
            const y = row * this.cellSize;

            let rgb  = new RGB(this.sourceData[i * 4 + 0], this.sourceData[i * 4 + 1], this.sourceData[i * 4 + 2]);
            
            parentContext.save();
            parentContext.fillStyle = rgb.toString();
            parentContext.translate(32, 32);
            parentContext.translate(x, y);

            // Melting test... if bright, pour down
            //if(params.colorMelt > 0) {
            //    context.translate(0, rgb.getIntensity() * params.colorMelt);
            //}

            parentContext.beginPath();
            const rad = this.cellSize * params.radius;
            parentContext.translate((rad * 0.3), (rad));
            parentContext.arc(0, 0, rad, 0, Math.PI * 2);
            parentContext.fill();
            parentContext.restore();
        }
    }
}

const scenes = {
    a: new Scene({image: null, cellSize: 8, cols: 256, rows: 256}),
};

const currentScene = scenes.a;

const sketch = ({ context, width, height }) => {
    return ({ context, width, height, playhead }) => {
        
        if(!params.animate) return;

        /*const cell = params.cell;
        const cols = params.cols; //Math.floor(width / cell);
        const rows = params.rows; //Math.floor(height / cell);
        const numCells = cols * rows;

        params.logg = cols + "/" + rows;
        
        sourceCanvas.width = cols;
        sourceCanvas.height = rows;

        sourceContext.save();*/

        currentScene.draw(context);

        //context.fillStyle = (RGB.from(params.bgColor)).toString();;
        //context.fillRect(0, 0, width, height);

        lfo.next(playhead);
        params.logg = "playhead:" + playhead;
        
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
    currentScene.image = await loadImage('img/winter-1-256.png');
    currentScene.loadSource();

    lfo = new LFO(1, 1);
    console.log(img);
    manager = await canvasSketch(sketch, settings);
  };

  createPane();
  start();

  /*

  Destination
    A visual style, reusable, content that expresses

  Vechile
    Animations support my music

  Fuel
    Creation is fast and fluid, without stopping
    
  Keys


  */