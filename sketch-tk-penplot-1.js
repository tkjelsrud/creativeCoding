const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = ({width, height}) => {
  const cols = 9;
  const rows = 12;
  const numCells = cols * rows;

  //grid
  const gw = width * 0.9;
  const gh = height * 0.9;
  //cell
  const cw = gw / cols;
  const ch = gh / rows;
  //margin
  const mx = (width - gw);
  const my = (height - gh);

  const points = [];

  for(let i = 0; i < numCells; i++) {
    let x = (i % cols) * cw;
    let y = Math.floor(i / cols) * ch;
    let lineWidth = 0.2;
    let color = 'black';

    points.push(new Point({x, y, lineWidth, color}));
  }
 

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      context.save();

      context.translate(mx + point.x, my + point.y);
      context.lineStyle = point.color;
      context.lineWidth = point.lineWidth;

      context.beginPath();
      //context.lineTo()
      context.arc(0, 0, 0.5, 0, Math.PI * 2);
      context.stroke();

      context.restore();

    });
  };
};

canvasSketch(sketch, settings);

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
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

}