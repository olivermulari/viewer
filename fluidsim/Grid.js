import { VALO2D } from "valo.js"
import { setGlobalVariables, I, diffuse, advect, project } from "./utils";

/**
 * Grid object for fluid simulation
 */
export class Grid {
  constructor(app, options) {
    this.app = app;

    // initial options that gets filled with parameter
    this.options = Object.assign({
      dt: 0.001,
      diffusion: 0.0001,
      viscosity: 0.0000001
    }, options);

    // for pathfindig
    this.tileSize = 5;

    // dimentions
    this.W = Math.ceil(this.app.canvas.width / this.tileSize);
    this.H = Math.ceil(this.app.canvas.height / this.tileSize);

    // time step
    this.dt = this.options.dt;
    // fluid properties
    this.diff = this.options.diffusion;
    this.visc = this.options.viscosity;

    this.s = new Array(this.W*this.H).fill(0);
    this.density = new Array(this.W*this.H).fill(0);

    // current velocities
    this.Vx = new Array(this.W*this.H).fill(0);
    this.Vy = new Array(this.W*this.H).fill(0);

    // previous velocities
    this.Vx0 = new Array(this.W*this.H).fill(0);
    this.Vy0 = new Array(this.W*this.H).fill(0);

    // buffers
    this.pointsBuffer = new Array(this.W*this.H*2).fill(0);
    this.colorsBuffer = new Array(this.W*this.H*4).fill(0);

    // pointer object
    this.pointer = {
      update: true,
      pos: new VALO2D.Vec2(0, 0),
      vel: new VALO2D.Vec2(0, 0),
    }

    this.frameCount = 0;

    this.init();
  }

  /**
   * Initial unction
   */
  init() {
    setGlobalVariables(this.W, this.H);
    this.initPointerEvents(false);
  }

  /**
   * Adds density for one block
   * @param {number} x 
   * @param {number} y 
   * @param {number} amount 
   */
  addDensity(x, y, amount) {
    const i = I(x, y);
    this.density[i] += amount;
  }

  /**
   * Adds velocity for one block
   * @param {number} x 
   * @param {number} y 
   * @param {number} amountX 
   * @param {number} amountY 
   */
  addVelocity(x, y, amountX, amountY) {
    const i = I(x, y);
    this.Vx[i] += amountX;
    this.Vy[i] += amountY;
  }

  /**
   * Moves simulation one timestep ahead
   */
  step() {
    let visc = this.visc;
    let diff = this.diff;
    let dt = this.dt;
    let Vx = this.Vx;
    let Vy = this.Vy;
    let Vx0 = this.Vx0;
    let Vy0  = this.Vy0;
    let s = this.s;
    let density = this.density;

    diffuse(1, Vx0, Vx, visc, dt);
    diffuse(2, Vy0, Vy, visc, dt);

    project(Vx0, Vy0, Vx, Vy);

    advect(1, Vx, Vx0, Vx0, Vy0, dt);
    advect(2, Vy, Vy0, Vx0, Vy0, dt);

    project(Vx, Vy, Vx0, Vy0);
    diffuse(0, s, density, diff, dt);
    advect(0, density, s, Vx, Vy, dt);
  }

  /**
   * Renders amount of density per block
   */
  render() {
    const points = this.pointsBuffer;
    const colors = this.colorsBuffer;

    const SCALE = this.tileSize;
    for (let i = 0; i < this.W; i++) {
      for (let j = 0; j < this.H; j++) {
        let x = i * SCALE;
        let y = j * SCALE;
        let d = this.density[I(i, j)];
        const c = Math.min(1.0, d/256);
        let idx = I(i, j) * 2;
        points[idx] = x - this.W*SCALE/2 + SCALE/2;
        points[idx+1] = y - this.H*SCALE/2 + SCALE/2;
        //points.push(x - this.W*SCALE/2 + SCALE/2, y - this.H*SCALE/2 + SCALE/2);
        idx *= 2;
        colors[idx] = 0;
        colors[idx+1] = c;
        colors[idx+2] = 0;
        colors[idx+3] = 1;
        //colors.push(0, c, 0, 1)
      }
    }

    this.app.renderer.drawPoints(points, colors, this.tileSize);
  }

  /**
   * Adds pointer event to the dom
   * @param {boolean} clickingNeeded If in order to add density needs click
   */
  initPointerEvents(clickingNeeded) {
    document.onpointermove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      this.updatePointer(x, y);
    }
    if (clickingNeeded) {
      this.pointer.update = false;

      document.onpointerleave = () => {
        this.pointer.update = false;
      }
      document.onmpointerdown = () => {
        this.pointer.update = true;
      }
      document.onpointerup = () => {
        this.pointer.update = false;
      }
    }
  }

  /**
   * Updates the pointer data
   * @param {number} x x-coordinate of the pointer
   * @param {number} y y-coordinate of the pointer
   */
  updatePointer(x, y) {
    if (!this.pointer.update) return;

    if (x >= 0 && y >= 0 && y < this.app.canvas.height && x < this.app.canvas.width) {

      const vel = this.pointer.pos.negate().addInPlace(x, this.app.canvas.height - y);
      this.pointer.vel = this.pointer.vel.add(vel);
      this.pointer.vel.limit(this.tileSize*15);

      this.pointer.pos.x = x; this.pointer.pos.y = this.app.canvas.height - y;
    }
  }

  rgb(r, g, b) {
    return ((r << 16) + (g << 8) + b);
  }

  /**
   * Updates the simulation with one time step
   * @param {number} delta The change in time
   * 
   * TODO: Add density and velocity with a brush ( multiple points at the time )
   */
  update(delta) {
    const mx = this.pointer.pos.x;
    const my = this.pointer.pos.y;
    const tileX = (mx-mx%this.tileSize)/this.tileSize;
    const tileY = (my-my%this.tileSize)/this.tileSize;

    // adds velocity and density
    this.addVelocityAndDensityWithBrush(tileX, tileY);

    if (this.frameCount % 1 == 0) {
      this.step();
    }
    this.render();

    // if pointer stays still its velocity lovers
    this.pointer.vel.multiply(0.8);

    this.frameCount++;
  }

  /**
   * Adds velocyty and density in multiple blocks at the time
   * @param {number} x 
   * @param {number} y 
   */
  addVelocityAndDensityWithBrush(x, y) {
    const vel = this.pointer.vel.mag() * 30;
    const dx = this.pointer.vel.x;
    const dy = this.pointer.vel.y;

    if (x > 0) {
      this.addDensity(x-1, y, vel);
      this.addVelocity(x-1, y, dx, dy);
    }

    if (y > 0) {
      this.addDensity(x, y-1, vel);
      this.addVelocity(x, y-1, dx, dy);
    }

    if (x < this.W) {
      this.addDensity(x+1, y, vel);
      this.addVelocity(x+1, y, dx, dy);
    }

    if (y < this.H) {
      this.addDensity(x, y+1, vel);
      this.addVelocity(x, y+1, dx, dy);
    }
  }

  /**
   * Destroys the Grid and frees memory
   */
  destroy() {
    this.app = null;
    this.options = null;
    this.s = null;
    this.density = null;
    this.Vx = null;
    this.Vy = null;
    this.Vx0 = null;
    this.Vy0 = null;
    this.pointsBuffer = null;
    this.colorsBuffer = null;
    this.pointer = null;
  }
}
