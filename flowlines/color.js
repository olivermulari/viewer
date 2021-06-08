import { VALO2D } from "valo.js";

export function makeColorGradient(i,
  frequency1, frequency2, frequency3,
  phase1, phase2, phase3,
  center, width, len) {
  
  if (frequency1 == undefined) frequency1 = .3;
  if (frequency2 == undefined) frequency2 = .3;
  if (frequency3 == undefined) frequency3 = .3;

  if (phase1 == undefined) phase1 = 0;
  if (phase2 == undefined) phase2 = 2;
  if (phase3 == undefined) phase3 = 4;

  if (center == undefined)   center = 128;
  if (width == undefined)    width = 127;
  if (len == undefined)      len = 50;

  const red = Math.sin(frequency1*i + phase1) * width + center;
  const grn = Math.sin(frequency2*i + phase2) * width + center;
  const blu = Math.sin(frequency3*i + phase3) * width + center;

  return new VALO2D.Color(red/256, grn/256, blu/256);
}
