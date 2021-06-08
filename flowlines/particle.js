import { Vec2 } from './Vector';

export class Particle {
  constructor(field, containerVec, tileSize) {
    this.field = field;
    this.container = containerVec;
    this.tileSize = tileSize;
    this.radius = 2;
    this.pos = new Vec2(Math.floor(Math.random() * this.container.x), Math.floor(Math.random() * this.container.y));
    this.prevPos = null;
    this.vel = new Vec2(0, 0);
    this.acc = new Vec2(0, 0);
    this.lifetime = 0;
  }

  update(delta) {
    this.vel.add(this.acc.multiply(delta * 0.2));
    this.vel.limit(this.field.particleMaxSpeed);
    this.prevPos = this.pos.clone();
    this.pos.add(this.vel);
    this.acc.multiply(0);
    this.lifetime++;
  }

  follow(flowField) {
    const x = Math.floor(this.pos.x / this.tileSize);
    const y = Math.floor(this.pos.y / this.tileSize);
    const index = x + y * Math.ceil(this.container.x / this.tileSize);
    if (flowField[index]) {
      const vec = flowField[index].vec;
      this.applyForce(vec);
    }
  }

  applyForce(vec) {
    this.acc.add(vec.setMag(this.field.flowStrength));
  }

  checkEdges() {
    if (this.pos.x > this.container.x) this.pos.x = 0, this.prevPos = null;
    if (this.pos.x < 0) this.pos.x = this.container.x, this.prevPos = null;
    if (this.pos.y > this.container.y) this.pos.y = 0, this.prevPos = null;
    if (this.pos.y < 0) this.pos.y = this.container.y, this.prevPos = null;
  }
}
