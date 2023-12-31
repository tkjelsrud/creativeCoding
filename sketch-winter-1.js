const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');
const risoColor = require('riso-colors');
const { renderPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');


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
    duration: 60,
    fps: 30,
};

const params = {
    images: 'img/winter-128.png,img/winter2-128.png',
    radius: 0.5,
    bgColor: {r: 12, g: 12, b: 12},
    colorMelt: 0,
    displace: 1,
    logg: 'test',
    animate: true,
};

const colorPalette = [
    RGB.hexToRgb("#EAAF47"),
    RGB.hexToRgb("#40280F"),
    RGB.hexToRgb("#94291F"),
    RGB.hexToRgb("#04AB4E"),
];

const createPane = () => {
    const pane = new tweakpane.Pane();
    let folder;
  
    folder = pane.addFolder({title: 'Text'});

    folder.addInput(params, 'displace', {min:0, max: 5, step: 0.5});
    folder.addInput(params, 'radius', {min:0, max: 1, step: 0.1});
    folder.addInput(params, 'colorMelt', {min:0, max: 6800, step: 680});

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
        this.drawSize = setup.drawSize;
        this.sourceSize = setup.sourceSize;
        this.sourceCanvas = document.createElement('canvas');
        this.sourceContext = this.sourceCanvas.getContext('2d');
        this.sourceData = null;
        this.rgbData = null;
        this.colorPalette = setup.colorPalette;
        this.offset = ("offset" in setup ? setup.offset : new Vector(0, 0));
        this.brightestBlocks = null;
    }

    loadSource() {
        this.sourceContext.save();
        this.sourceContext.fillStyle = 'black';
        this.sourceContext.fillRect(0, 0, this.sourceSize.x, this.sourceSize.y);
        this.sourceContext.drawImage(this.image, 0, 0);
        this.sourceData = this.sourceContext.getImageData(this.offset.x, this.offset.y, this.drawSize.x, this.drawSize.y).data;
        this.sourceContext.restore();

        this.rgbData = new Array(this.drawSize.x * this.drawSize.y);
        for(let i = 0; i < (this.drawSize.x * this.drawSize.y); i++) {
            this.rgbData[i] = new RGB(this.sourceData[i * 4 + 0], this.sourceData[i * 4 + 1], this.sourceData[i * 4 + 2]);
            
            if(this.colorPalette != null) {
                this.rgbData[i] = this.rgbData[i].closestColor(this.colorPalette);
            }
        }

        const blockBrightness = [];
        const blocksX = 8;
        const blocksY = 8;

        // Calculate the size of each block
        const blockSizeX = this.drawSize.x / blocksX;
        const blockSizeY = this.drawSize.y / blocksY;

        for (let blockY = 0; blockY < blocksY; blockY++) {
            for (let blockX = 0; blockX < blocksX; blockX++) {
                let totalBrightness = 0;
    
                for (let y = 0; y < blockSizeY; y++) {
                    for (let x = 0; x < blockSizeX; x++) {
                        const pixelX = blockX * blockSizeX + x;
                        const pixelY = blockY * blockSizeY + y;
                        const index = (pixelY * this.drawSize.x + pixelX) * 4;
    
                        const red = this.sourceData[index];
                        const green = this.sourceData[index + 1];
                        const blue = this.sourceData[index + 2];
    
                        // Calculate brightness (you can use a more accurate formula if needed)
                        totalBrightness += (red + green + blue) / 3;
                    }
                }
    
                // Calculate average brightness for the block
                const averageBrightness = totalBrightness / (blockSizeX * blockSizeY);
    
                // Store the block's average brightness and position
                blockBrightness.push({
                    x: blockX * blockSizeX * 10,
                    y: blockY * blockSizeY * 10,
                    brightness: averageBrightness
                });
            }
        }
    
        // Sort the blocks by brightness
        blockBrightness.sort((a, b) => b.brightness - a.brightness);

        // Sort the blocks by brightness
        blockBrightness.sort((a, b) => b.brightness - a.brightness);

        // Pick the top 10 brightest blocks
        this.brightestBlocks = blockBrightness.slice(0, 16);
        //console.log(brightestBlocks);
        //console.log('this.sourceData:', this.sourceData);
        //console.log('this.rgbData:', this.rgbData);

    }

    draw(parentContext, playhead) {

        for(let i = 0; i < (this.drawSize.x * this.drawSize.y); i++) {
            const col = i % this.drawSize.x;
            const row = Math.floor(i / this.drawSize.x);

            //if (col < 5 || col > 15 ) continue;

            const x = col * this.cellSize;
            const y = row * this.cellSize;

            let rgb = this.rgbData[i].copy(); //= new RGB(this.sourceData[i * 4 + 0], this.sourceData[i * 4 + 1], this.sourceData[i * 4 + 2]);
            const n = random.noise2D(x, y);
            //params.logg += n;
            rgb.modify(1.1 + (n / 4));

            parentContext.save();
            parentContext.fillStyle = rgb.toString();
            parentContext.translate(32, 32);

            const displaceX = random.range(-1, 1) * params.displace * (1 - rgb.getIntensity());
            const displaceY = random.range(-1, 1) * params.displace * (1 - rgb.getIntensity());

            parentContext.translate(x + displaceX, y + displaceY);

            // Melting test... if bright, pour down
            params.colorMelt = (0.09 - playhead) * 20000;
            if(params.colorMelt > 0) {
                parentContext.translate(0, rgb.getIntensity() * params.colorMelt);
            }

            parentContext.beginPath();
            const rad = this.cellSize * params.radius;
            parentContext.translate((rad * 0.3), (rad));
            parentContext.arc(0, 0, rad, 0, Math.PI * 2);
            parentContext.fill();
            parentContext.restore();
        }
        
    }
}

class NoiseLayer {
    constructor(setup) {}

    draw(parentContext, playhead) {
        for(let i = 0; i < (settings.dimensions[0] * settings.dimensions[1]); i++) {
            const x = i % settings.dimensions[0] ;
            const y = Math.floor(i / settings.dimensions[1]);

            const n = random.noise2D(x + playhead * 10, y, 0.5);

            const rgb = new RGB(255, 0, 255);

            rgb.addNoise(n);

            parentContext.save();
            parentContext.fillStyle = rgb.toString();
            parentContext.translate(32, 32);
            parentContext.translate(x, y);

            parentContext.beginPath();
            const rad = params.radius;
            parentContext.translate((rad * 0.3), (rad));
            parentContext.arc(0, 0, rad, 0, Math.PI * 2);
            parentContext.fill();
            parentContext.restore();
        }
        
    }
}

class PlotterLayer {
    constructor(setup) {
        this.plotArray = [];
    }

    loadSource(plotArray) {
        this.plotArray = plotArray;
        console.log(this.plotArray );
    }

    draw(parentContext, playhead) {
        parentContext.save();
        for(let i = 1; i < this.plotArray.length; i++) {
            parentContext.strokeStyle = "white";
            parentContext.lineWidth = 2;
            parentContext.moveTo(this.plotArray[i-1].x, this.plotArray[i-1].y);
            parentContext.lineTo(this.plotArray[i].x, this.plotArray[i].y);
            parentContext.stroke();
            parentContext.restore();
        }
        
    }
}

const scenes = {
    a: new Scene({
        image: null, 
        cellSize: 10, 
        drawSize: new Vector(102, 102), 
        sourceSize: new Vector(256, 256),
        offset: new Vector(32, 32),
        colorPalette: [
            RGB.hexToRgb("#EAAF47"),
            RGB.hexToRgb("#40280F"),
            RGB.hexToRgb("#94291F"),
            RGB.hexToRgb("#04AB4E")
        ]}),
    noi: new NoiseLayer(),
    plot: new PlotterLayer(),
};

const currentScene = scenes.a;

const sketch = ({ context, width, height }) => {
    let time = (new Date()).getMilliseconds();

    return ({ context, width, height, playhead }) => {
        
        if(!params.animate) return;

        time = Date.now();

        context.fillStyle = (RGB.from(params.bgColor)).toString();;
        context.fillRect(0, 0, width, height);

        currentScene.draw(context, playhead);

        scenes.plot.draw(context, playhead);

        lfo.next(playhead);
        params.logg = "playhead:" + playhead + "\nms:" + (Date.now() - time);
        
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
    scenes.plot.loadSource(currentScene.brightestBlocks);
    

    lfo = new LFO(1, 1);
    //console.log(img);
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