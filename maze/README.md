MAZE
====

An evolving maze background made with [valo.js](https://github.com/olivermulari/valo.js).

## Features
- a random maze generator where all tiles are reachable.
- utilizes [djikstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) in real time.
- an interactive depth indicator inside maze with color
- custom options (see below)

```javascript
const maze = new Maze();
maze.create();
```

Destroy maze:
```javascript
maze.destroy();
```

## Options
```javascript
const options = {
  blockSize: 30,
  tilesInBlock: 1,
  wallColor: [1, 1, 1, 1],
  colorAmp: 10
}
const maze = new Maze("scene", options);
```

There is also few presets available, with special options:

```javascript
new Maze("scene", {preset: "Basic"});
new Maze("scene", {preset: "Medium"});
new Maze("scene", {preset: "Big"});
new Maze("scene", {preset: "Grey"});
new Maze("scene", {preset: "GreyInvert"});
```
