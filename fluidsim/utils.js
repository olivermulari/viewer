// global variables
let W;
let H;
let iter = 16;

export function setGlobalVariables(x, y) {
  W = x;
  H = y;
}

export function I(x, y) {
  return x + y * W;
}

export function diffuse(b, x, x0, diff, dt) {
  const a = dt * diff * (W - 2) * (H - 2);
  lin_solve(b, x, x0, a, 1 + 6 * a);
}

// new value of a cell is based on its neighbours
function lin_solve(b, x, x0, a, c) {
  const cRecip = 1.0 / c;
  for (let t = 0; t < iter; t++) {
    for (let j = 1; j < H - 1; j++) {
      for (let i = 1; i < W - 1; i++) {
        x[I(i, j)] = (x0[I(i, j)]
                    + a*(x[I(i+1, j)] + x[I(i-1, j)]
                    + x[I(i, j+1)] + x[I(i, j-1)])) * cRecip;
      }
    }
    set_bnd(b, x);
  }
}

export function project(velocX, velocY, p, div) {
  for (let j = 1; j < H - 1; j++) {
    for (let i = 1; i < W - 1; i++) {
      div[I(i, j)] = -0.5*(velocX[I(i+1, j)] - velocX[I(i-1, j)]
      + velocY[I(i, j+1)] - velocY[I(i, j-1)])/W;
      p[I(i, j, W)] = 0;
    }
  }

  set_bnd(0, div); 
  set_bnd(0, p);
  lin_solve(0, p, div, 1, 6);

  for (let j = 1; j < H - 1; j++) {
    for (let i = 1; i < W - 1; i++) {
      velocX[I(i, j)] -= 0.5 * (  p[I(i+1, j)] - p[I(i-1, j)]) * W;
      velocY[I(i, j)] -= 0.5 * (  p[I(i, j+1)] - p[I(i, j-1)]) * H;
    }
  }
  
  set_bnd(1, velocX);
  set_bnd(2, velocY);
}

export function advect(b, d, d0, velocX, velocY, dt) {
  let i0, i1, j0, j1;

  let dtx = dt * (W - 2);
  let dty = dt * (H - 2);

  let s0, s1, t0, t1;
  let tmp1, tmp2, x, y;

  let ifloat, jfloat;
  let i, j;
  

  for (j = 1, jfloat = 1; j < H - 1; j++, jfloat++) { 
    for (i = 1, ifloat = 1; i < W - 1; i++, ifloat++) {
      tmp1 = dtx * velocX[I(i, j)];
      tmp2 = dty * velocY[I(i, j)];
      x = ifloat - tmp1; 
      y = jfloat - tmp2;

      if (x < 0.5) x = 0.5; 
      if (x > W + 0.5) x = W + 0.5; 
      i0 = Math.floor(x);
      i1 = i0 + 1;
      if (y < 0.5) y = 0.5; 
      if (y > H + 0.5) y = H + 0.5; 
      j0 = Math.floor(y);
      j1 = j0 + 1;

      s1 = x - i0; 
      s0 = 1.0 - s1; 
      t1 = y - j0; 
      t0 = 1.0 - t1;

      let i0i = parseInt(i0);
      let i1i = parseInt(i1);
      let j0i = parseInt(j0);
      let j1i = parseInt(j1);

      d[I(i, j, W)] = 
      s0 * (t0 * d0[I(i0i, j0i)] + t1 * d0[I(i0i, j1i)]) +
      s1 * (t0 * d0[I(i1i, j0i)] + t1 * d0[I(i1i, j1i)]);
    }
  }

  set_bnd(b, d);
}

function set_bnd(b, x) {
  for (let i = 1; i < W - 1; i++) {
    x[I(i, 0  )] = b == 2 ? -x[I(i, 1  )] : x[I(i, 1 )];
    x[I(i, H-1)] = b == 2 ? -x[I(i, H-2)] : x[I(i, H-2)];
  }
  for (let j = 1; j < H - 1; j++) {
    x[I(0, j)] = b == 1 ? -x[I(1, j)] : x[I(1, j)];
    x[I(W-1, j)] = b == 1 ? -x[I(W-2, j)] : x[I(W-2, j)];
  }

  x[I(0, 0)] = 0.5 * (x[I(1, 0)] + x[I(0, 1)]);
  x[I(0, H-1)] = 0.5 * (x[I(1, H-1)] + x[I(0, H-2)]);
  x[I(W-1, 0)] = 0.5 * (x[I(W-2, 0)] + x[I(W-1, 1)]);
  x[I(W-1, H-1)] = 0.5 * (x[I(W-2, H-1)] + x[I(W-1, H-2)]);
}