const random = require('canvas-sketch-util/random');

class Anim {
    constructor(x, y) {
        this.loc = new Vector(x, y);
        
    }
}

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


class AnimBar extends Anim {
    constructor(x, y) {
      super(x, y);
      this.loc = new Vector(x, y);
      this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), 0);
      this.color = RGB.hexToRgb(random.pick(params.palette));
      this.time = random.range(150, 5000);
      this.age = this.time;
      this.width = random.range(params.size.cell * -1, params.size.cell);
      this.maxAnim = 32;
    }
  
    isActive() {
      return (this.time > 0);
    }
  
    draw(context) {
      context.save();
      context.beginPath();
      context.translate(this.loc.x, this.loc.y);
      context.fillStyle = this.color.toString();
      
      let shadowColor = this.color.copy();
      shadowColor.modify(-0.3);
      context.shadowColor = shadowColor.toString();
      context.shadowBlur = this.radius * params.size.cell * 20;
  
      context.fillRect(0, 0, this.width, params.size.height);
      context.fill();
      context.closePath();
      context.restore();
    }
  
    next(frame, width, height) {
      this.loc.add(this.dir);
      this.time--;
  
      let collide = false;
  
      if(this.loc.x <= 0 || this.loc.x >= width) {
        this.loc.x = (this.loc.x <= 0 ? 0 : width);
        this.dir.x *= -1;
        collide = true;
      }
      if(this.loc.y <= 0 || this.loc.y >= height) {
        this.loc.y = (this.loc.y <= 0 ? 0 : height);
        this.dir.y *= -1;
        collide = true;
      }
  
      if(collide) {
        let spawn = new AnimBar(this.loc.x, this.loc.y);
        //spawn.time = this.time + 2;
        //spawn.color = this.color;
        spawn.color.addNoise(params.colorNoise);
  
        return spawn;
      }
  
      return null;
  
    }
  }


class AnimStar {
    constructor(x, y) {
      this.loc = new Vector(x, y);
      this.dir = new Vector(random.range(params.baseVel * -1, params.baseVel), random.range(params.baseVel * -1, params.baseVel));
      this.color = RGB.hexToRgb(random.pick(params.palette));
      //this.color = new RGB(random.range(64, 255), random.range(64, 255), random.range(64, 255));
      this.time = random.range(150, 5000);
      this.age = this.time;
      this.radius = params.radius * random.range(0, 1.0);
      this.maxAnim = 128;
    }
  
    isActive() {
      return (this.time > 0);
    }
  
    draw(context) {
      context.save();
      context.beginPath();
      context.translate(this.loc.x, this.loc.y);
      context.fillStyle = this.color.toString();
      
      let shadowColor = this.color.copy();
      shadowColor.modify(-0.3);
      context.shadowColor = shadowColor.toString();
      context.shadowBlur = this.radius * params.size.cell / 2;
  
      context.arc(0, 0, this.radius * this.getAge() * params.size.cell, 0, Math.PI * 2);
      context.fill();
      context.closePath();
      context.restore();
    }
  
    getAge() {
      return (this.time / this.age);
    }
  
    next(frame, width, height) {
      const gravPoint = new Vector(params.gravity.x, params.gravity.y);
      //console.log(gravPoint.getDistance(this.loc));
      let gravOff = new Vector((gravPoint.getDistance(this.loc) / (width)) * this.getAge() * params.gravity.ampX, (gravPoint.getDistance(this.loc) / (height)) * this.getAge() * params.gravity.ampY);
      
      if(gravPoint.x < this.loc.x) gravOff.x *= -1;
      if(gravPoint.y < this.loc.y) gravOff.y *= -1;
  
      //console.log(gravOff);
  
      this.dir.add(gravOff);
      this.loc.add(this.dir);
      //this.loc.add(gravOff);
      //this.loc.add(new Vector(random.range(params.cell * -1, params.cell), random.range(params.cell *-1, params.cell)));
      this.time--;
  
      let collide = false;
  
      if(this.loc.x <= 0 || this.loc.x >= width) {
        this.loc.x = (this.loc.x <= 0 ? 0 : width);
        this.dir.x *= -1;
        collide = true;
      }
      if(this.loc.y <= 0 || this.loc.y >= height) {
        this.loc.y = (this.loc.y <= 0 ? 0 : height);
        this.dir.y *= -1;
        collide = true;
      }
  
      if(collide) {
        let spawn = new AnimStar(this.loc.x, this.loc.y);
        //spawn.time = this.time + 2;
        //spawn.color = this.color;
        spawn.color.addNoise(params.colorNoise);
  
        return spawn;
      }
  
      return null;
    }
  
  }

module.exports = {
    Anim : Anim,
    AnimBar : AnimBar,
    AnimStar : AnimStar,
    Vector: Vector
  }