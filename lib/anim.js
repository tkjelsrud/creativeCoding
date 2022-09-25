const random = require('canvas-sketch-util/random');
const {Vector, RGB, RGBA} = require('./util.js');

class Anim {
    constructor(x, y) {
        this.loc = new Vector(x, y);
        this.dir = new Vector(0, 0);
        this.size = new Vector(1, 1);
        this.time = 999;
        this.age = this.time;
        this.children = new Array();
        this.parent = null;
    }
  
    isActive() {
      return (this.time > 0);
    }
  
    count() {
      let cnt = 1;
      for(let i = 0; i < this.children.length; i++) {
        cnt += this.children[i].count()
      }
      return cnt;
    }
  
    getBounds() {
      return (this.parent ? this.parent.size : null);
    }

    getParentGravity() {

    }
  
    gravity() {
        // TODO FIX THIS.. no "params"
      const gravPoint = new Vector(params.gravity.x, params.gravity.y);
      let gravOff = new Vector((gravPoint.getDistance(this.loc) / (this.getBounds().x)) * params.gravity.ampX, (gravPoint.getDistance(this.loc) / (this.getBounds().y)) * params.gravity.ampY);
      
      if(gravPoint.x < this.loc.x) gravOff.x *= -1;
      if(gravPoint.y < this.loc.y) gravOff.y *= -1;
  
      this.dir.add(gravOff);
    }
  
    checkCollision() {
      let collide = false;
  
      if(this.loc.x <= 0 || this.loc.x >= this.getBounds().x) {
        this.loc.x = (this.loc.x <= 0 ? 0 : this.getBounds().x);
        this.dir.x *= -1;
        collide = true;
      }
      if(this.loc.y <= 0 || this.loc.y >= this.getBounds().y) {
        this.loc.y = (this.loc.y <= 0 ? 0 : this.getBounds().y);
        this.dir.y *= -1;
        collide = true;
      }
      return collide;
    }
    getAge() {
      return (this.time / this.age);
    }
    next() {
        let col = this.checkCollision();
    }
    death() {}
    checkCollisionOthers() {
      return false;
    }
    toString() {
      return "";
    }
}

class AnimLayer extends Anim {
    constructor(x, y, w, h, label = "") {
        super(x, y);
        this.size = new Vector(w, h);
        this.children = new Array();
        this.label = label;
        this.skew = 0;
    }

    isActive() { return true; }

    draw(context) {
        context.save();
        
        if(this.skew != 0)
            context.setTransform(1, Math.tan(this.skew), 0, 1, 0, 0);
        context.translate(this.loc.x, this.loc.y);

        for(let i = 0; i < this.children.length; i++) {
        let c = this.children[i];
        c.draw(context);
        }

        context.restore();
    }

    next(frame) {
        this.loc.add(this.dir);
        for(let i = this.children.length -1; i >= 0; i--) {
            let c = this.children[i];
            c.next(frame);
            if(!c.isActive()) {
                c.death();
                this.children.splice(i, 1);
            }
        }
    }

    add(ao) {
        this.children.push(ao);
        ao.parent = this;
    }

    toString() {
        let str = "L:" + this.label + " # " + this.children.length + "\n"; //" " + this.loc.x + " " + this.loc.y + 
        for(let i = 0; i < this.children.length; i++) {
        str += this.children[i].toString();
        }
        return str;
    }
}

module.exports = {
    Anim, AnimLayer
}