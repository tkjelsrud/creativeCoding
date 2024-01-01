const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = ({width, height}) => {
  const cols = 12;
  const rows = 6;
  const numCells = cols * rows;

  const gw = width * 0.8;
  const gh = height * 0.8;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
  };
};

canvasSketch(sketch, settings);

class Point {
  constructor({x, y, control = false}) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.control ? 'red' : 'black';

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

}