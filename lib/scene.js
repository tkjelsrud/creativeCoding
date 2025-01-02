class Scene {
    constructor(setup = null) {
        this.colorPalette = ("colorPalette" in setup ? setup.colorPalette : null);
        this.modifiers = ("modifiers" in setup ? setup.layers : []);
        this.layers = ("layers" in setup ? setup.layers : []);
    }

    draw(parentContext) {
        for(let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];

            layer.draw(parentContext);
        }
    }

    next(frame) {
        for(let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            
            layer.next(frame);
        }
    }

    addLayer(layer) {
        //
        //
    }

    addModifier(modifier) {
        this.modifiers.push(modifier);
    }
}

module.exports = {
    Scene
}