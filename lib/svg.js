const { DOMParser } = require('xmldom'); // Library to parse XML
const { RGBA, Palette } = require('./util.js');
const random = require('canvas-sketch-util/random');
//const fs = require('fs');
//const path = require('path');

class SvgFile {
    constructor(fileName) {
        this.fileName = fileName;
        this.elements = new Array();
        this.rand = undefined;
        this.palette = undefined;
    }

    async load() {
        const response = await fetch(this.fileName);
        const svgString = await response.text();
    
        // Parse the SVG string
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        
        // Extract layers into an array
        const svgElem = svgDoc.getElementsByTagName('svg');
        //console.log();
        this.elements = Array.from(svgElem[0].childNodes);      
        //console.log(this.elements);  
    }

    usePalette(palette) {
        this.palette = palette;
    }

    randomColorInPalette() {
        return random.pick(this.palette.getAll());
    }

    // SVG root groups
    rootGroups() {
        let groups = new Array();

        this.elements.forEach((element) => {
            if(element.tagName === 'g')
                groups.push(Array.from(element.childNodes));
        });

        return groups;
    }

    render(context, targetWidth, targetHeight, elements = this.elements, transformations = {}, modifier = undefined) {
        if (!elements) return;
    
        elements.forEach((element) => {
            const tagName = element.tagName;
            if (!tagName) return;
    
            // Clone transformations to avoid modifying the original object
            let currentTransformations = { ...transformations };
    
            // Parse additional transformations from the element's ID
            currentTransformations = findOperatorsInText(element.getAttribute('id'), currentTransformations);
    
            if (tagName === 'g') {
                // Recursively render group children with inherited transformations
                return this.render(context, targetWidth, targetHeight, Array.from(element.childNodes), currentTransformations);
            }
    
            // Determine the bounding box of the element
            const { originalWidth, originalHeight } = this.getBoundingBox(element, tagName);
    
            // Calculate scaling factors
            const scaleX = targetWidth / originalWidth;
            const scaleY = targetHeight / originalHeight;
    
            // Save the canvas state
            context.save();
    
            // Apply transformations using the random generator
            this.applyTransformations(context, currentTransformations);
    
            // Apply scaling
            context.scale(scaleX, scaleY);
    
            // Extract styles
            const styles = extractSVGStyles(element);
    
            // Render the element
            this.renderElement(context, element, tagName, styles, modifier);
    
            // Restore the canvas state
            context.restore();
        });
    }
    
    applyTransformations(context, transformations) {
        if (transformations.vertical) {
            context.translate(0, transformations.vertical * random.value());
        }
        if (transformations.horizontal) {
            context.translate(transformations.horizontal * random.value(), 0);
        }
        if (transformations.rotate) {
            const rotationAngle = transformations.rotate * random.value();
            context.translate(transformations.centerX, transformations.centerY); // Move to the center
            context.rotate(rotationAngle); // Rotate around the center
            context.translate(-transformations.centerX, -transformations.centerY); // Move back
        }
    }
    
    getBoundingBox(element, tagName) {
        let originalWidth = 1;
        let originalHeight = 1;
    
        if (tagName === 'rect') {
            originalWidth = parseFloat(element.getAttribute('width')) || 1;
            originalHeight = parseFloat(element.getAttribute('height')) || 1;
        } else if (tagName === 'circle') {
            const r = parseFloat(element.getAttribute('r')) || 1;
            originalWidth = r * 2;
            originalHeight = r * 2;
        } else if (tagName === 'ellipse') {
            const rx = parseFloat(element.getAttribute('rx')) || 1;
            const ry = parseFloat(element.getAttribute('ry')) || 1;
            originalWidth = rx * 2;
            originalHeight = ry * 2;
        } else if (tagName === 'path') {
            originalWidth = 100; // Default scaling dimensions for paths
            originalHeight = 100;
        }
    
        return { originalWidth, originalHeight };
    }
    
    renderElement(context, element, tagName, styles, modifier = undefined) {
        if (tagName === 'rect') {
            const x = parseFloat(element.getAttribute('x')) || 0;
            const y = parseFloat(element.getAttribute('y')) || 0;
            context.fillStyle = styles.fill || 'transparent';
            context.fillRect(x, y, parseFloat(element.getAttribute('width')), parseFloat(element.getAttribute('height')));
            context.strokeStyle = styles.stroke || 'black';
            context.lineWidth = styles.strokeWidth || 1;
            context.strokeRect(x, y, parseFloat(element.getAttribute('width')), parseFloat(element.getAttribute('height')));
        } else if (tagName === 'circle') {
            const cx = parseFloat(element.getAttribute('cx')) || 0;
            const cy = parseFloat(element.getAttribute('cy')) || 0;
            const r = parseFloat(element.getAttribute('r')) || 1;
            context.beginPath();
            context.arc(cx, cy, r, 0, Math.PI * 2);
            context.fillStyle = styles.fill || 'transparent';
            context.fill();
            context.strokeStyle = styles.stroke || 'black';
            context.lineWidth = styles.strokeWidth || 1;
            context.stroke();
        } else if (tagName === 'ellipse') {
            const cx = parseFloat(element.getAttribute('cx')) || 0;
            const cy = parseFloat(element.getAttribute('cy')) || 0;
            const rx = parseFloat(element.getAttribute('rx')) || 1;
            const ry = parseFloat(element.getAttribute('ry')) || 1;
            context.beginPath();
            context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            context.fillStyle = styles.fill || 'transparent';
            context.fill();
            context.strokeStyle = styles.stroke || 'black';
            context.lineWidth = styles.strokeWidth || 1;
            context.stroke();
        } else if (tagName === 'path') {
            context.globalCompositeOperation = styles.blendMode;
            const path = new Path2D(element.getAttribute('d'));

            // maintainHue ?
            //
            let fillColor = styles.fill;

            // Random color
            if(this.palette && fillColor) {
                if(modifier) {
                    const matrix = context.getTransform();
                    //console.log('Current Position:', { x: matrix.e, y: matrix.f });
                    fillColor = modifier.noisePick(Math.floor(matrix.e), Math.floor(matrix.f), this.palette.getAll()).toString();
                }
                else {
                    let color = random.pick(this.palette.getAll());
                    fillColor = color.toString();
                }
            }

            // Closest color
            /*if(this.palette && fillColor) {
                let closestColor = this.palette.getClosest(RGBA.rgbStringToRgb(fillColor));
                fillColor = closestColor.toString();
            }*/

            context.fillStyle = fillColor;
            context.fill(path);
            context.strokeStyle = styles.stroke || 'black';
            context.lineWidth = styles.strokeWidth || 1;
            context.stroke(path);
        }
    }

    blendPaths(pathA, pathB, blendFactor = 0.5) {
        const parsePath = (path) => path.match(/[a-zA-Z][^a-zA-Z]*/g); // Split path commands
        const pathACommands = parsePath(pathA);
        const pathBCommands = parsePath(pathB);
      
        const blendedPath = [];
      
        // Blend segments
        for (let i = 0; i < Math.min(pathACommands.length, pathBCommands.length); i++) {
          const commandA = pathACommands[i];
          const commandB = pathBCommands[i];
      
          const commandTypeA = commandA[0];
          const commandTypeB = commandB[0];
      
          // If commands don't match, randomly pick one
          if (commandTypeA !== commandTypeB) {
            blendedPath.push(Math.random() > 0.5 ? commandA : commandB);
          } else {
            // Interpolate numeric values
            const valuesA = commandA.slice(1).trim().split(/\s+|,/).map(Number);
            const valuesB = commandB.slice(1).trim().split(/\s+|,/).map(Number);
      
            const blendedValues = valuesA.map((value, index) => {
              return value * (1 - blendFactor) + (valuesB[index] || 0) * blendFactor;
            });
      
            blendedPath.push(`${commandTypeA} ${blendedValues.join(' ')}`);
          }
        }
      
        return blendedPath.join(' ');
      }
}

function findOperatorsInText(text, oper = {}) {
    text.split('-').forEach((s) => {
        if (s.startsWith('XV')) {
            // Extract the number after 'XV' and convert it to an integer
            oper.vertical = parseInt(s.slice(2), 10);
        } else if (s.startsWith('XH')) {
            // Extract the number after 'XH' and convert it to an integer
            oper.horizontal = parseInt(s.slice(2), 10);
        } else if (s.startsWith('XR')) {
            oper.rotate = parseInt(s.slice(2), 10);
        } else if (s.startsWith('XHUE')) {
            oper.maintainHue = true;
        }

    });

    return oper;
}


function extractSVGStyles(element) {
    let fill = element.getAttribute('fill') && element.getAttribute('fill')  != 'none' ? RGBA.hexToRgb(element.getAttribute('fill')).toString() : undefined;
    let stroke = element.getAttribute('stroke') && element.getAttribute('stroke') != 'none' ? RGBA.hexToRgb(element.getAttribute('stroke')).toString() : undefined;
    let strokeWidth = element.getAttribute('stroke-width') || 1;
    let blendMode = 'source-over';

    // Parse inline styles
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
        const styleMap = styleAttr.split(';').reduce((acc, style) => {
        const [key, value] = style.split(':').map((s) => s.trim());
        if (key && value) {
            acc[key] = value;
        }
        return acc;
        }, {});

        // Extract specific properties
        if (styleMap['mix-blend-mode']) {
            blendMode = styleMap['mix-blend-mode'];
        }
        if (styleMap['fill']) {
            fill = styleMap['fill'];
        }
        if (styleMap['stroke']) {
            stroke = styleMap['stroke'];
        }
        if (styleMap['stroke-width']) {
            strokeWidth = parseFloat(styleMap['stroke-width']);
        }
    }

    return {
        fill,
        stroke,
        strokeWidth: parseFloat(strokeWidth),
        blendMode,
    };
}

module.exports = {
    SvgFile
}