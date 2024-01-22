const random = require('canvas-sketch-util/random');

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    getDistance(v) {
        const dx = (this.x - v.x);
        const dy = (this.y - v.y);
        return Math.sqrt(dx * dx + dy * dy);
    }
    getVectorTo(v) {
        return new Vector(v.x - this.x, v.y - this.y);
    }
}

class Paper {
  // Standard ISO paper sizes in millimeters
  static A4 = { width: 210.0, height: 297.0 };
  static A3 = { width: 297.0, height: 420.0 };
  static A3Plus = { width: 330.2, height: 482.6 }; // Approximate size, not standard
  static A2 = { width: 420.0, height: 594.0 };


  // Function to get the dimensions of a paper size in centimeters
  static getDimensions(paperSize) {
    return { width: paperSize.width, height: paperSize.height };
  }
}

class RGB {
    constructor(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
  
    copy() {
      return new RGB(this.r, this.g, this.b);
    }

    modify(value) {
      this.r = Math.round(this.r * value);
      this.g = Math.round(this.g * value);
      this.b = Math.round(this.b * value);
  }
  
    /*modify(factor) {
      this.r = Math.min(255, Math.max(0, Math.round(this.r * factor)));
      this.g = Math.min(255, Math.max(0, Math.round(this.g * factor)));
      this.b = Math.min(255, Math.max(0, Math.round(this.b * factor)));
    }*/
  
    addNoise(f) {
      this.r *= random.range(1-f, 1+f);
      this.g *= random.range(1-f, 1+f);
      this.b *= random.range(1-f, 1+f);
    }
  
    getIntensity() {
      return ((this.r + this.g + this.b) / 3) / 256;
    }
  
    toString() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    distance(color2) {
      return Math.sqrt((color2.r - this.r) ** 2 + (color2.g - this.g) ** 2 + (color2.b - this.b) ** 2);
    }

    closestColor(rgbArray) {
      let minDistance = Infinity;
      let closestColor = null;
  
      for (const paletteColor of rgbArray) {
          const distance = this.distance(paletteColor);
  
          if (distance < minDistance) {
              minDistance = distance;
              closestColor = paletteColor;
          }
      }
  
      return closestColor;
  }
  
    crossfade(toRgb, fact) {
      // Cross between two images (color informations)
      let r = Math.floor(((this.r * (1 - fact)) + (toRgb.r * fact)) / 2);
      let g = Math.floor(((this.g * (1 - fact)) + (toRgb.g * fact)) / 2);
      let b = Math.floor(((this.b * (1 - fact)) + (toRgb.b * fact)) / 2);
  
      return new RGB(r, g, b);
    }
  
    static hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? new RGB(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
    }
  
    static newRandom() {
      return new RGB(random.range(32, 255), random.range(32, 255), random.range(32, 255));
    }

    static from(j) {
      return new RGB(j.r, j.g, j.b);
    }

    toRGBA(a) {
      return new RGBA(this.r, this.g, this.b, a);
    }
}

class RGBA extends RGB {
    constructor(r, g, b, a) {
        super(r, g, b);
        this.a = a;
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}
module.exports = { Vector, Paper, RGB, RGBA }