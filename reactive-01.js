const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const {Vector, Paper, RGB} = require('./lib/util.js');

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
  animate: false,
};

const paperDimensions = Paper.getDimensions(Paper.A3);


const elements = new Array();

const sketch = ({context, width, height, frame}) => {
    // Function to convert pixels to centimeters
    //const pxToCm = (px, dpi) => (px /dpi) * 2.54;

    // Function to get the canvas position relative to the window
    const getCanvasPosition = () => {
    const rect = context.canvas.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
        };
    };

    // Function to translate mouse coordinates to cm
    const translateMouseLocation = (event) => {
    // Get the current dots per inch (dpi) from the context
    const dpi = settings.pixelsPerInch;

    // Get the canvas position
    const canvasPos = getCanvasPosition();

    // Calculate the position in cm
    //const xCm = pxToCm(event.clientX - canvasPos.left, dpi);
    //const yCm = pxToCm(event.clientY - canvasPos.top, dpi);
    const xCm = (event.clientX - canvasPos.left) / (width / paperDimensions.width) / 100;
    const yCm = (event.clientY - canvasPos.top) / (height / paperDimensions.height) / 100;


    // Log the position as a Vector
    console.log(`new Vector(${xCm}, ${yCm})`);
    };
    // Function to get the canvas position relative to the window
    /*const getCanvasPosition = () => {
        const rect = context.canvas.getBoundingClientRect();
        return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        };
    };

    // Function to translate mouse coordinates to cm
    const translateMouseLocation = (event) => {
        // Get the canvas position
        const canvasPos = getCanvasPosition();

        // Calculate the position in cm
        const xCm = ((event.clientX - canvasPos.left) / (width / 2)) * context.canvas.width;
        const yCm = ((event.clientY - canvasPos.top) / height) * context.canvas.height;

        // Log the position as a Vector
        console.log(`new Vector(${xCm}, ${yCm})`);
    };*/
    

    // Event listener for mouse click
    window.addEventListener('click', translateMouseLocation);

    return ({ context, width, height, frame }) => {

        for(let i = 0; i < elements.length; i++) {
            let elem = elements[i];
    
            elem.update();
    
            drawClosedShape(context, elem.points, 'blue');
        }
    };
};

class Morph {
    constructor(points, velocity, intensity, lifespan) {
        this.points = points;  // An array of Vector objects representing the points of the shape
        this.velocity = velocity; // A vector of direction
        this.intensity = intensity;
        this.lifespan = lifespan;
    }

    update() {
        // Update each point based on the velocity
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].x += this.velocity.x;
            this.points[i].y += this.velocity.y;
        }

        // Update any collision reaction logic here
        this.lifespan--;

        // Add more logic for handling collisions, shape transformations, etc.
    }
}

function drawClosedShape(context, points, fillColor = null, bendingFactor = 0.5) {
    if (points.length < 3) {
        console.error("A closed shape must have at least 3 points.");
        return;
    }

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;

        const x = (xc + points[i].x) / 2;
        const y = (yc + points[i].y) / 2;

        context.quadraticCurveTo(xc, yc, x, y);
    }

    // Connect the last and first points to close the loop
    const xc = (points[0].x + points[points.length - 1].x) / 2;
    const yc = (points[0].y + points[points.length - 1].y) / 2;

    const x = (xc + points[0].x) / 2;
    const y = (yc + points[0].y) / 2;

    context.quadraticCurveTo(xc, yc, x, y);

    // Set the stroke style
    context.strokeStyle = 'black'; // You can customize the stroke color
    context.lineWidth = 0.1; // You can customize the line width

    // Set the fill style if a fillColor is provided
    if (fillColor) {
        context.fillStyle = fillColor;
        context.fill();
    }

    context.stroke();
    context.closePath();
}

//
// BEGIN
//


elements.push(new Morph([
    new Vector(4.300000000000001, 12.9),
    new Vector(8.000000000000002, 10),
    new Vector(12.7, 11.8),
    new Vector(11.4, 18.3),
    new Vector(6.8, 19.4) ],
    new Vector(0.1, -0.1),
    1,100));

elements.push(new Morph([
        new Vector(3, 3),
        new Vector(4, 4),
        new Vector(4, 3),
        new Vector(4, 6)],
        new Vector(0.1, -0.1),
        1,100));

random.setSeed(random.getRandomSeed());
console.log('Random seed: %s', random.getSeed());

canvasSketch(sketch, settings);

