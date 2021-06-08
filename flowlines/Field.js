import { makeColorGradient } from './color';
import { noise } from "./perlin";
import { Particle } from "./particle";
import { Vec2 } from "./Vector";
import { isMobile } from "valo.js/src/valo2D/utils/mobile"
import Color from 'valo.js/src/valo2D/utils/color';

/**
 * Vector field object
 */
export class Field {
  constructor(app, options, settings) {
    this.app = app;
    this.options = options || {};
    this.settings = settings || {};

    // options
    this.particleAmount = this.options.particleAmount || isMobile() ? 4000 : 14000;
    this.vectorUpdateFreq = this.options.vectorUpdateFreq || 10;
    this.perlinDiff = this.options.perlinDiff || 0.006;
    this.flowSpeed = (this.options.flowSpeed || 0.0001) / this.vectorUpdateFreq;
    this.flowStrength = this.options.flowStrength || Math.min(0.00006 * window.innerWidth, 0.05);
    this.particleMaxSpeed = this.options.particleMaxSpeed || Math.min(0.0020 * window.innerWidth, 2);
    this.colorChangeSpeed = this.options.colorChangeSpeed || 0.025;
    this.particleOpacity = this.options.particleOpacity || isMobile() ? 0.1 : 0.02;
    this.color = new Color(0, 0, 0, 1);
    this.debug = this.options.debug || false;
    this.tileSize = 10; // good as a constant :)

    // advanced settings
    this.dynamicParticleAmount = this.settings.dynamicParticleAmount || false;
    this.targetFps = this.settings.targetFps || 55;

    // main direction of vectors
    this.floatDir = Math.PI / 2;
    // if > 0, main direction of vectors will vary
    this.floatDirChangeSpeed = 0;

    // helpers to reduce calculations
    this.lineLength = this.tileSize / 2;
    this.halfTileSize = this.tileSize / 2;
    this.cols = Math.ceil(this.app.canvas.width / this.tileSize);
    this.rows = Math.ceil(this.app.canvas.height / this.tileSize);

    this.frameCount = 0;
    this.zOff = Math.floor(Math.random() * 100);

    // Elements
    this.vectors = [];
    this.particles = new Array(this.particleAmount);

    // Buffers
    this.positionsBuffer = new Array(this.particleAmount*4);

    // init
    this.createVectors();
    this.createParticles();

    // custom blending function
    // this.setBlendingFunction(this.app.renderer.gl);
  }

  /**
   * Creates the vectors
   */
  createVectors() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const obj = {
          color: 0xFFFFF,
          pos: new Vec2((x * this.tileSize) + this.halfTileSize, (y * this.tileSize) + this.halfTileSize),
          vec: new Vec2(0, 0)
        };

        // according to perlin noise
        const rotation = this.randomDir(obj.pos.x, obj.pos.y, this.zOff) + this.floatDir;
        obj.vec = new Vec2(this.lineLength * Math.cos(rotation), this.lineLength * Math.sin(rotation));

        this.vectors.push(obj);
      }
    }
  }

  /**
   * Creates particles
   */
  createParticles() {
    for (let i = 0; i < this.particleAmount; i++) {
      const part = new Particle(this, new Vec2(this.app.canvas.width, this.app.canvas.height), this.tileSize);
      this.particles.push(part);
    }
  }

  /**
   * Updates vectorfield directions
   * @param {number} delta Change in time between updates
   */
  updateVectors(delta) {
    this.vectors.forEach(obj => {
      const rotation = this.randomDir(obj.pos.x, obj.pos.y, this.zOff) + this.floatDir;
      obj.vec = new Vec2(this.lineLength * Math.cos(rotation), this.lineLength * Math.sin(rotation));
    });

    if (this.debug) {
      this.showVectors();
    }
  }

  /**
   * Updates particle positions
   * @param {number} delta Change in time between updates
   */
  updateParticles(delta) {
    const positions = this.positionsBuffer;
    this.color.a = this.particleOpacity;

    const x = this.app.canvas.width/2;
    const y = this.app.canvas.height/2;

    this.particles.forEach((part, idx) => {
      part.checkEdges();
      part.follow(this.vectors);
      part.update(delta);

      const i = idx * 4;
      positions[i]   = part.prevPos.x - x;
      positions[i+1] = part.prevPos.y - y;
      positions[i+2] = part.pos.x - x;
      positions[i+3] = part.pos.y - y;
    });

    this.app.renderer.drawLines(positions, this.color);

    this.color = makeColorGradient(this.frameCount * /* delta */ this.colorChangeSpeed);
  }

  /**
   * Updates the application
   * @param {number} delta Change in time between updates
   */
  update(delta) {
    if (this.frameCount % this.vectorUpdateFreq === 0) {
      this.updateVectors(delta);
    }
    this.updateParticles(delta);

    this.zOff += this.flowSpeed * delta;
    // if you want to vary yout main flow direction
    // this.floatDir += (this.flowSpeed * this.floatDirChangeSpeed * delta) % (Math.PI / 2);
    this.frameCount++;
  }

  /**
   * Gets a random direction according to 3D perlin noise.
   * Determines vector field.
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  randomDir(x, y, z) {
    const value = Math.abs(noise.perlin3(x * this.perlinDiff, y * this.perlinDiff, z)) * Math.PI * 4;
    return value;
  }

  /**
   * returns a hex decimal color out of r g b values
   */
  rgb(r, g, b) {
    return ((r << 16) + (g << 8) + b);
  }

  /**
   * Blending function that creates a dark color scheme
   * @param {WebGLRenderingContext} gl 
   */
  setBlendingFunction(gl) {
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
  }

  /**
   * Frees the objects used by this
   */
  destroy() {
    this.app = null;
    this.options = null;
    this.settings = null;
    this.color = null;
    this.vectors = null;
    this.particles = null;
    this.positionsBuffer = null;
  }

  // UI METHODS

  toggleDebug() {
    this.debug = !this.debug;
  }
}
