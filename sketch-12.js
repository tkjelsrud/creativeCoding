const canvasSketch = require('canvas-sketch');
const { Paper, RGBA, Palette } = require('./lib/util.js');
const { SvgFile } = require('./lib/svg.js');
const { Modifier } = require('./lib/modifier.js');
const tweakpane = require('tweakpane');

// Sketch settings
const settings = {
  dimensions: Paper.getPt(Paper.A3Plus),
  units: 'mm',
  pixelsPerInch: 600,
  animate: true,
};

const params = {
  seed: 1,
  blank: false,
  cols: 13*2,
  rows: 22*2,
  palette: 0,
  scale: 1,
  animate: true,
  frame: 0,
  offset: 0,
};

const colorArrays = [
  ["#99a1a6", "#a8c69f", "#cce2a3", "#00a896", "#DAD873", "#EFEEB4"], //#5c5d8d
  ["#fb6107", "#f3de2c", "#7cb518", "#5c8001", "#fbb02d"],
  ["#028090", "#00a896", "#02c39a", "#f0f3bd"], //#05668d
  ["#7bdff2", "#b2f7ef", "#eff7f6", "#f7d6e0", "#f2b5d4"],
  ["#b0c4b1", "#dedbd2", "#edafb8", "#f7e1d7"]
];



const s = new SvgFile('svg-input/tiles.svg');


const mod = new Modifier();

const sketch = async () => {
  await s.load();

  return ({ context, width, height }) => {
    mod.setSeed(params.seed);

    const palette = new Palette(colorArrays[params.palette]);

    s.usePalette(palette);

    if(params.blank) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
    }

    allocateAreas(context, width, height, params.cols, params.rows, drawArea);
  };
};

function drawArea(context, { x, y, width, height }) {
  context.save();
  context.translate(x, y);

  const group = mod.noisePick(x, y, s.rootGroups());

  s.render(context, width * params.scale, height * params.scale, group, {}, mod);

  context.restore();
}

function allocateAreas(context, width, height, gridColumns, gridRows, drawCallback) {
  const cellWidth = width / gridColumns;
  const cellHeight = height / gridRows;

  const usedCells = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridColumns }, () => false)
  );

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridColumns; col++) {
      // Skip already used cells
      if (usedCells[row][col]) continue;

      // Sample Perlin noise at this grid position
      const xNorm = col / gridColumns; // Normalize x-coordinate
      const yNorm = row / gridRows; // Normalize y-coordinate
      const noiseValue = mod.sampleNoise(xNorm + params.offset, yNorm);
      
      // Determine the size of the merged area based on noise
      const mergeWidth = Math.floor(1 + noiseValue * 5); // Map noise to 1-3 cells wide
      const mergeHeight = Math.floor(1 + (1 - noiseValue) * 5); // Map noise to 1-3 cells tall

      const maxWidth = Math.min(mergeWidth, gridColumns - col); // Constrain to grid
      const maxHeight = Math.min(mergeHeight, gridRows - row); // Constrain to grid

      // Mark the merged area as used
      for (let i = 0; i < maxHeight; i++) {
        for (let j = 0; j < maxWidth; j++) {
          usedCells[row + i][col + j] = true;
        }
      }

      // Calculate the merged area dimensions
      const x = col * cellWidth;
      const y = row * cellHeight;

      drawCallback(context, { x, y, width: cellWidth, height: cellHeight, noiseValue });
    }
  }
}

const createPane = () => {
  const pane = new tweakpane.Pane();
  let folder;

  folder = pane.addFolder({title: 'Canvas'});
  folder.addInput(params, 'cols', {min:2, max: 50, step: 1});
  folder.addInput(params, 'rows', {min:2, max: 50, step: 1});
  folder.addInput(params, 'scale', {min:0.1, max: 10, step: 0.1});
  folder.addInput(params, 'palette', {min:0, max: colorArrays.length -1, step: 1});
  folder.addInput(params, 'blank');

  folder = pane.addFolder({title: 'Noise'});
  folder.addInput(params, 'seed', {min:1, max: 1000, step: 1});
  folder.addInput(params, 'offset', {min:1, max: 100, step: 1});
};

createPane();

canvasSketch(sketch, settings);