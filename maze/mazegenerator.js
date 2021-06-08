import { Vec2 } from "./Vector";

export function generateMaze(maze) {
  const visited = Array(maze.rows * maze.cols).fill(false);

  const legalNeighbours = (vec) => {
    const x = vec.x; const y = vec.y;
    const arr = [
      [y, x-1, "Left"],
      [y+1, x, "Down"],
      [y-1, x, "Up"],
      [y, x+1, "Right"]
    ];
    return arr.filter(num => (num[0] >= 0) && (num[0] < maze.rows) && (num[1] >= 0) && (num[1] < maze.cols))
  }

  const stack = [];
  stack.push(new Vec2(0, 0))

  while(stack.length > 0) {
    const c = stack.pop()
    visited[c.y * maze.cols + c.x] = true
    
    const nextTo = legalNeighbours(c).filter(x => !visited[x[0] * maze.cols + x[1]])
    
    if (nextTo.length != 0) {
      const r = Math.floor(Math.random() * nextTo.length)
      let i = 0
      while (i < nextTo.length) {
        const x = nextTo[i]
        if (i == r) {
          maze.breakWall(c.y, c.x, x[2])
        }
        stack.push(new Vec2(x[1], x[0]))
        i++;
      } 
    }
  }

  console.log("Maze Generated!")
}
