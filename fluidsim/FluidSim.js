import { VALO2D } from "valo.js"
import { Grid } from './Grid';

/**
 * A fluid simulation object
 */
export default class FluidSim {
  constructor(divID, options) {
    this.divID = divID;
    this.options = options || {}; // must be atleast an empty object
    this.app;
    this.grid;
  }

  /**
   * Creates the application
   */
  create() {
    this.app = new VALO2D(this.divID, {
      width: window.innerWidth,
      height: window.innerHeight,
      fullScreen: true,
      autoResize: true,
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
      transparent: false
    });
    this.grid = new Grid(this.app, this.options);
    this.createScene();
  };

  /**
   * Destroys the simultion
   */
  destroy() {
    this.app.destroy();
    this.grid.destroy();
    this.app = null;
    this.grid = null;

    // delete pointer events
    document.onpointermove = null;
    document.onpointerleave = null;
    document.onmpointerdown = null;
    document.onpointerup = null;
  }

  /**
   * Starts the rendering
   */
  createScene() {
    this.app.renderer.runRenderLoop(delta => {
      this.app.scene.render();
      this.grid.update(delta);
    });
  }

  /**
   * Adds a visual frames per second counter
   */
  addFpsCounter() {
    const style = document.createElement('style');
    style.innerHTML = `
      #fps {
        position: absolute;
        margin: 10px;
        bottom: 0;
        right: 0;
      }
      `;
    document.head.appendChild(style);
    // FPS COUNTER
    const element = document.createElement("p");
    element.setAttribute("id", "fps");
    document.getElementById(this.sceneid).appendChild(element);
    setInterval(() => {
      if (this.app) {
        element.innerHTML = "FPS: " + String(Math.floor(this.app.renderer.frameRate));
      }
    }, 1000);
  }

  /**
   * Adds all the needed resizes to the application
   * 
   * TODO: test that everything works properly
   */
  addResizes() {
    this.addEngineResize();
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }

  /**
   * Adds reszise to the renderer
   * 
   * TODO: make sure there is no better way
   */
  addEngineResize() {
    window.onresize = (event) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.app.canvas.width = w;
      this.app.canvas.height = h;
    };
  }

  /**
   * Adds a style sheet in document head
   * 
   * TODO: see if necessary
   */
  addStyleTags() {
    // add style tags
    const style = document.createElement('style');
    style.innerHTML = `
      #${this.sceneid} {
        height: 100vh;
        height: calc(100 * var(--vh));
        width: 100vw;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        z-index: -10;
      }
      `;
    document.head.appendChild(style);
  }
}
