export class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }
  multiply(num) {
    this.x *= num;
    this.y *= num;
    return this;
  }
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  mag() {
    return Math.sqrt(this.magSq());
  }
  magSq() {
    let x = this.x, y = this.y;
    return x * x + y * y;
  } 
  limit(l) {
    var mSq = this.magSq();
    if(mSq > l*l) {
      this.div(Math.sqrt(mSq));
      this.multiply(l);
    }
    return this;
  }
  normalize() {
    return this.div(this.mag());
  }
  setMag(n) {
    return this.normalize().multiply(n);
  }
  clone() {
    return new Vec2(this.x, this.y);
  }
}
