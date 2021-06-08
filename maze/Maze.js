import { Grid } from './Grid';
import { VALO2D } from "valo.js"

export default class Maze {
  constructor(divID, options) {
    this.divID = divID;
    this.options = options || {}; // must be atleast an empty object
    this.app;
    this.grid;
  }

  create() {
    this.app = new VALO2D(this.divID, {
      width: window.innerWidth,
      height: window.innerHeight,
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
      transparent: false,
      autoResize: true,
      backgroundColor: [1, 1, 1, 1]
    });
    this.grid = new Grid(this.app, this.options);
    this.createScene();
  };

  destroy() {
    this.app.destroy();
    this.app = null;
    this.grid = null;
  }

  createScene(sceneid) {
    this.app.renderer.runRenderLoop(delta => {
      this.app.scene.render();
      this.grid.update(delta);
    });
  }
}
