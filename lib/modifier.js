const random = require('canvas-sketch-util/random');
const SimplexNoise = require('simplex-noise');

class Modifier {
    constructor(seed = 1) {
        random.setSeed(seed);
        this.noise = new SimplexNoise(() => random.value());
    }

    setSeed(seed) {
        random.setSeed(seed);
        this.noise = new SimplexNoise(() => random.value());
    }

    sampleNoise(x, y) {
        const noiseValue = this.noise.noise2D(x, y); // Perlin noise value (-1 to 1)
        return (noiseValue + 1) / 2; // Map to range [0, 1]
    };

    noisePick(x, y, arr) {
        if (!Array.isArray(arr)) {
            arr = Array.from(arr);
        }
    
        const noi = this.sampleNoise(x, y);
        const clampedNoi = Math.max(0, Math.min(1, noi));
    
        return arr[Math.floor(arr.length * clampedNoi)];
    }
}

module.exports = {
    Modifier
}