import { VALO2D } from "valo.js"
import { isMobile } from "valo.js/src/valo2D/utils/mobile"
import { generateMaze } from "./mazegenerator";
import { mapDistances } from "./pathfinding";
import { presets } from "./presets";

export class Grid {
  constructor(app, options) {
    this.app = app;
    this.options = Object.assign(presets(options.preset || "Basic"), options);

    // mobile test
    this.isMobile = isMobile();

    // for maze
    this.blockSize = this.options.blockSize;
    this.cols = Math.ceil(this.app.canvas.width / this.blockSize);
    this.rows = Math.ceil(this.app.canvas.height / this.blockSize);

    // for pathfindig
    this.tilesInBlock = this.options.tilesInBlock;
    this.tileSize = this.blockSize / this.tilesInBlock;
    // this.tileGraphics = new PIXI.Graphics();
    this.tiles = [];

    // root
    this.tileRows = this.rows * this.tilesInBlock;
    this.tileCols = this.cols * this.tilesInBlock;
    this.root = Math.floor(this.tileCols / 2) + this.tileCols * Math.floor(this.tileRows / 2)

    // arrays of elements
    this.points = [];
    this.horizontalWalls = [];
    this.verticalWalls = [];

    // colors
    this.wallColor = this.options.wallColor;
    this.colorAmp = this.options.colorAmp;

    // direction
    this.rootMoving = false
    this.rootDir = null

    // frames
    this.frameCount = 0;

    // start function
    this.init();
  }

  init() {
    this.createPoints();
    this.createWalls();
    generateMaze(this);
    // also draws them
    this.createTiles();

    // walls on top of tiles
    if (this.options.wallColor) {
      this.showWalls();
    }

    // inits event listener
    if (!this.rootMoving) {
      this.updatePointerPos();
    }
  }

  createPoints() {    
    const offX = (this.app.canvas.width - (this.cols * this.blockSize)) / 2 - this.app.canvas.width / 2
    const offY = (this.app.canvas.height - (this.rows * this.blockSize)) / 2 - this.app.canvas.height / 2
    for (let y = 0; y <= this.rows; y++) {
      for (let x = 0; x <= this.cols; x++) {
        const point = new VALO2D.Vec2(
          (x * this.blockSize) + offX,
          (y * this.blockSize) + offY);
        this.points.push(point);
      }
    }
  }

  createWalls() {
    // vertical
    for (let y = 0; y < this.rows; y++) {
      const vRow = [];
      for (let x = 0; x <= this.cols; x++) {
        vRow.push(true);
      }
      this.verticalWalls.push(vRow);
    }

    // horizontal
    for (let y = 0; y <= this.rows; y++) {
      const hRow = [];
      for (let x = 0; x < this.cols; x++) {
        hRow.push(true);
      }
      this.horizontalWalls.push(hRow);
    }
  }

  breakWall(row, column, dir) {
    switch (dir) {
      case "Down":
        if (row == this.rows) {
          console.log("Can't break bottom walls")
        } else if (!this.horizontalWalls[row + 1][column]) {
          console.log("Can't break walls that are already broken")
        } else {
          this.horizontalWalls[row + 1][column] = false
        }
        break;

      case "Up":
        if (row == 0) {
          console.log("Can't break top walls")
        } else if (!this.horizontalWalls[row][column]) {
          console.log("Can't break walls that are already broken")
        } else {
          this.horizontalWalls[row][column] = false
        }
        break;

      case "Left":
        if (column == 0) {
          console.log("Can't break leftmost walls")
        } else if (!this.verticalWalls[row][column]) {
          console.log("Can't break walls that are already broken")
        } else {
          this.verticalWalls[row][column] = false
        }
        break;

      case "Right":
        if (column == this.cols) {
          console.log("Can't break rightmost walls")
        } else if (!this.verticalWalls[row][column + 1]) {
          console.log("Can't break walls that are already broken")
        } else {
          this.verticalWalls[row][column + 1] = false
        }
        break;
    }
  }

  hasWall(row, column, dir) {
    switch (dir) {
      case "Down":
        return this.horizontalWalls[row + 1][column]
      case "Up":
        return this.horizontalWalls[row][column]
      case "Left":
        return this.verticalWalls[row][column]
      case "Right":
        return this.verticalWalls[row][column + 1]
    }
  }

  showWalls() {
    const positions = [];
    for (let y = 0; y <= this.rows; y++) {
      for (let x = 0; x <= this.cols; x++) {
        // get current point
        const point = this.points[x + y * (this.cols+1)]
        // test horizontal walls
        if (this.horizontalWalls[y][x]) {
          positions.push(point.x, -point.y, point.x + this.blockSize, -point.y);
        }
        // test verical walls
        if (this.verticalWalls[y] && this.verticalWalls[y][x]) {
          positions.push(point.x, -point.y, point.x, -point.y - this.blockSize);
        }
      }
    }
    const color = new VALO2D.Color(
      this.options.wallColor[0],
      this.options.wallColor[1],
      this.options.wallColor[2], 
      this.options.wallColor[3]
    )
    this.app.renderer.drawLines(positions, color);
  }

  createTiles() {
    const tileRows = this.rows * this.tilesInBlock;
    const tileCols = this.cols * this.tilesInBlock;
    const offX = (this.app.canvas.width - (this.cols * this.blockSize)) / 2
    const offY = (this.app.canvas.height - (this.rows * this.blockSize)) / 2

    for (let y = 0; y < tileRows; y++) {
      for (let x = 0; x < tileCols; x++) {
        const tile = new VALO2D.Vec2(
          (x * this.tileSize) + offX - this.app.canvas.width / 2 + this.blockSize / 2,
          this.app.canvas.height - (y * this.tileSize) + offY - this.app.canvas.height / 2
        );
        tile.shape = new VALO2D.Rectangle(this.app.scene, { width: this.tileSize, height: this.tileSize })
        tile.shape.position = tile;
        tile.shape.color.r = 0;
        tile.shape.color.g = 1.0;
        tile.shape.color.b = 1.0;
        this.app.scene.addShape(tile.shape);
        this.tiles.push(tile);
      }
    }
    this.updateTiles();
  }

  updateTiles() {
    const dist = mapDistances(this, this.root);
    this.tiles.forEach((tile, i) => {
      const c = dist[i]*this.colorAmp;
      tile.shape.color.a = (255 - c) / 255;
    });
  }

  updatePointerPos() {
    const offX = (this.app.canvas.width - (this.cols * this.blockSize)) / 2
    const offY = (this.app.canvas.height - (this.rows * this.blockSize)) / 2
    document.onpointermove = (e) => {
      const x = e.clientX - offX;
      const y = e.clientY - offY;
      const tileX = (x-x%this.tileSize)/this.tileSize;
      const tileY = (y-y%this.tileSize)/this.tileSize;
      if (x >= 0 && y >= 0 && tileX < this.cols*this.tilesInBlock && tileY < this.rows*this.tilesInBlock) {
        this.root = Math.floor(tileX+this.cols*this.tilesInBlock*tileY);
      }
    }
  }

  updateRootDir(delta) {
    if (Math.floor(delta * this.frameCount) % 1 == 0) {
      const c = this.cols;
      const x = this.root % c; 
      const y = (this.root - x) / c;
      const arr = [
        [y, x-1, "Left"],
        [y+1, x, "Down"],
        [y-1, x, "Up"],
        [y, x+1, "Right"]
      ];
      const legal = arr.filter(d => !this.hasWall(y, x, d[2]));
      const idx = legal.map(x => x[2]).indexOf(x => x == this.rootDir)
      let nextX = x
      let nextY = y

      if (idx != -1) {
        // do not change direction
        nextY = legal[idx][0]
        nextX = legal[idx][1]
      } else if (legal.length > 0) {
        const i = Math.floor(Math.random() * legal.length);
        this.rootDir = legal[i][2];
        nextY = legal[i][0]
        nextX = legal[i][1]
      }

      this.root = nextX + nextY * c;
    }
  }

  update(delta) {
    if (this.frameCount % 1 == 0) {
      this.updateTiles();
      this.showWalls();
    }
    if (this.rootMoving) {
      this.updateRootDir(delta);
    }
    this.frameCount++;
  }
}
