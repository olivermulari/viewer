export function mapDistances(maze, source) {
  const T = maze.tilesInBlock
  const H = maze.rows * T;
  const W = maze.cols * T;

  const distances = Array(H * W).fill(-1);

  const queue = [];

  queue.unshift(source);
  distances[source] = 0

  const neighbours = (num) => {
    const x = num % W; 
    const y = (num - x) / W;
    const arr = [];
    if (x-1 >= 0 && (x % T != 0   || !maze.verticalWalls[(y-y%T)/T][x/T])      ) arr.push((x-1)+W*y);
    if (x+1 < W  && (x % T != T-1 || !maze.verticalWalls[(y-y%T)/T][(x+1)/T])  ) arr.push((x+1)+W*y);
    if (y-1 >= 0 && (y % T != 0   || !maze.horizontalWalls[y/T][(x-x%T)/T])    ) arr.push((y-1)*W+x);
    if (y+1 < H  && (y % T != T-1 || !maze.horizontalWalls[(y+1)/T][(x-x%T)/T])) arr.push(x+(y+1)*W);
    return arr;
  }

  let depth = 1;
  while(distances.find(x => x == -1)) {
    const n = queue.length;
    let i = 0;
    while(i < n) {
      const c = queue.pop();
      neighbours(c).filter(v => distances[v] == -1).forEach(v => {distances[v] = depth; queue.unshift(v)});
      i++;
    }
    depth++;
  }

  return distances;
}