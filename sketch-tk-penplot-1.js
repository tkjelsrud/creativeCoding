const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const points = [];
const cols = 17;
const rows = 29;
const numCells = cols * rows;
const margin = 2;

const sketch = ({width, height}) => {
  //grid
  const gw = width;
  const gh = height;
  //cell
  const cw = (gw - (margin * 2)) / cols;
  const ch = (gh - (margin * 2)) / rows;
  //margin
  const mx = (width - gw) + margin;
  const my = (height - gh) + margin;

  

  for(let i = 0; i < numCells; i++) {
    let x = (i % cols) * cw;
    let y = Math.floor(i / cols) * ch;
    let n = random.noise2D(x, y, 0.1, 0.1);
    let lineWidth = 0.1 + n;
    let color = '#999';

    points.push(new Point({x, y, lineWidth, color}));
  }
 

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      context.save();

      context.translate(mx + point.x, my + point.y);
      context.translate(cw * 0.5, ch * 0.5);
      context.strokeStyle = point.color;
      context.lineWidth = point.lineWidth;

      context.beginPath();
      context.arc(0, 0, 0.1, 0, Math.PI * 2);
      context.stroke();

      context.restore();

    });

    // Now random walk between points drawing lines, decay until zero
    // Starting in the middle
    context.translate(mx, my);
    context.translate(cw * 0.5, ch * 0.5);
    
    context.beginPath();
    context.lineWidth = 0.1;
    drawWalk(context, Math.floor(cols / 2), Math.floor(rows / 2));
    context.stroke();
    //drawWalk(context, Math.floor(cols / 4), Math.floor(rows / 4));
    //drawWalk(context, Math.floor(cols / 1), Math.floor(rows / 1));
  };
};

canvasSketch(sketch, settings);

function getPointAt(x, y) {
  if(x > (cols - 1) || x < 0 || y > (rows - 1) || y < 0)
    return null;

  let idx = (y * cols) + x;
  
  return points[idx];
}

// Random walk is not a artistic look, its too random
//
//

function drawWalk(context, x, y) {
  //console.log('called');
  let curr = getPointAt(x, y);

  let walkX = Math.round(Math.random()) ? 1 : -1;
  let walkY = Math.round(Math.random()) ? 1 : -1;
  //
  //let walkX = Math.floor(random.noise2D(x, y, 0.1, 1));
  //let walkY = Math.floor(random.noise2D(x, y+1, 0.1, 1));
  let n = random.noise2D(x, y, 0.1, 1);

  //console.log(walkX, walkY);

  let next = getPointAt(x + walkX, y + walkY);

  //console.log(curr, next);

  if(curr && next && (walkX != 0 || walkY != 0)) {
    // Both exists
    const mx = curr.x + (next.x - curr.x) * 0.5;
    const my = curr.y + (next.y - curr.y) * 0.5;

    //context.beginPath();
    //context.lineWidth = curr.lineWidth + n;
    //context.strokeStyle = curr.color;

    context.moveTo(curr.x, curr.y);
    context.quadraticCurveTo(next.x, next.y, mx, my);
    
    //context.stroke();

    return drawWalk(context, x + walkX, y + walkY);
  }

  return null;
}

class Point {
  constructor({x, y, lineWidth, color}) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;

    this.ix = x;
    this.iy = y;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = 'red';

    context.beginPath();
    context.arc(0, 0, 2, 0, Math.PI * 1);
    context.fill();

    context.restore();
  }

}