const canvasSketch = require('canvas-sketch');
const tweakpane = require('tweakpane');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const seed = random.getRandomSeed();

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
  name: seed,
  duration: 10,
  fps: 24,
};

const sketch = ({context, width, height, playhead }) => {
  random.setSeed(seed);
  let x, y, w, h, fill, stroke, blend;
  //let radius, angle, rx, ry;
  const num = 30;
  const degrees = -120;

  const rects = [];

  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
  ]

  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * 0.5,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58,
  };

  for(let i = 0; i < num; i++) {
    x = random.range(0, width * 0.4);
    y = random.range(0, height * 0.4);
    w = random.range(600, width * 0.4);
    h = random.range(40, 200);

    fill = random.pick(rectColors).hex;
    stroke = random.pick(rectColors).hex;

    blend = (random.value() > 0.5) ? 'darken' : 'hard-light'; //'source-over'; //'color-burn';
    
    rects.push({x, y, w, h, fill, stroke, blend});
  }

  return ({ context, width, height, playhead }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    // New triangle drawing with clipping mask

    context.save();
    context.translate(mask.x, mask.y);

    drawPolygon({ context, radius: mask.radius, sides: mask.sides});

    context.clip();
    //context.restore();

    rects.forEach(rect => {
      const {x, y, w, h, fill, stroke, blend} = rect;
      let shadowColor;

      let dir = playhead > 0.5 ? -1 : 1;

      context.save();
      context.translate(-mask.x, -mask.y + 300);
      context.translate(x * (3 - random.noise2D(x * playhead/500, y)), y * (1 - random.noise2D(x * playhead/200, y)));
      //context.rotate(random.noise2D(x * playhead/10000, y));
      context.strokeStyle = stroke;
      context.fillStyle = fill;
      context.lineWidth = 10;

      //let wx = w * playhead;

      context.globalCompositeOperation = blend;


      drawSkewedRect({ context, w, h, degrees });

      shadowColor = Color.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5 * (0.5 + playhead);

      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20 * (playhead + 1);

      context.fill();

      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = 'source-over';

      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.stroke();
      
      context.restore();
    });

    context.restore();

    // polygon outline
    context.save();
    context.translate(mask.x, mask.y);
    //context.rotate(playhead * Math.PI);
    context.lineWidth = 20;

    drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides});

    context.globalCompositeOperation = 'darken'; //'color-burn';

    context.strokeStyle = rectColors[0].hex;
    context.stroke();

  };
};

const drawSkewedRect = ({context, w = 600, h = 200, degrees = -45}) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx * -0.5, (ry + h) * -0.5);
  
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + h);
  context.lineTo(0, h);
  context.closePath();
  //context.stroke();

  context.restore();
};

const drawPolygon = ({ context, radius = 100, sides = 3}) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for(let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  context.closePath();
};

canvasSketch(sketch, settings);

const createPane = () => {
  tPane = new tweakpane.Pane();
  let folder;

  folder = tPane.addFolder({title: 'TK Animation'});
  folder.addInput(params, 'crossfade', {min:0, max: 1, step: 0.1});
  folder.addInput(params, 'clear');
  folder.addInput(params, 'newActors',  {min:0, max: 256, step: 1});
  folder.addInput(params, 'baseVel', {min:-10, max: 10, step: 1});
  folder.addInput(params, 'maxActors', {min:0, max: 512, step: 16});
  folder.addMonitor(params, 'actorCount');
  folder.addMonitor(params, 'fps');
  folder.addMonitor(params, 'performance');
  folder.addMonitor(params, 'status', {multiline: true});
  folder.addInput(params, 'animate');
};

createPane();