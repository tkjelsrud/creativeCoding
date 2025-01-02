const {Vector, RGB, RGBA} = require('./util.js');

class SpriteSheet {
    constructor(image, w, h, wx, hy) {
      this.image = image;
      this.size = new Vector(w, h);
      this.tileDim = new Vector(w / wx, h / hy);
      this.tileCol = this.size.x / this.tileDim.x;
      this.tileRow = this.size.y / this.tileDim.y;
    }
  
    count() {
      return (this.tileCol * this.tileRow);
    }
  
    getSprite(x, y) {

    }

    drawSprite(context) {
      context.save();
      context.imageSmoothingEnabled = false;
      context.translate(this.loc.x, this.loc.y);
      context.scale(this.scale, this.scale);
      context.drawImage(img, this.modeLoc.x, this.modeLoc.y, AnimSprite.sheet.sw, AnimSprite.sheet.sh, this.drawOff[0], this.drawOff[1], AnimSprite.sheet.sw, AnimSprite.sheet.sh);
      context.restore();
    }

    toString() {
      return "";
    }
}

module.exports = {
  SpriteSheet
}