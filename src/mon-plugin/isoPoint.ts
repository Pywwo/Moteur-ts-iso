export default class isoPoint {
    public x : number;
    public y : number;
    public z : number;
    
    constructor(x : number = 0, y : number = 0, z : number = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  
    public equals(a: isoPoint): boolean {
      return (a.x === this.x && a.y === this.y && a.z === this.z);
    }
  
    set(x, y?, z?) {
      this.x = x || 0;
      this.y = y || ((y !== 0) ? this.x : 0);
      this.z = z || ((typeof y === 'undefined') ? this.x : 0);
    }
  
    setTo(x, y, z) {
      return this.set(x, y, z);
    }
  
    add(x, y, z) {
      this.x += x || 0;
      this.y += y || 0;
      this.z += z || 0;
  
      return this;
    }

    subtract(x, y, z) {
      this.x -= x || 0;
      this.y -= y || 0;
      this.z -= z || 0;
  
      return this;
    }

    multiply(x, y, z) {
      this.x *= x || 1;
      this.y *= y || 1;
      this.z *= z || 1;
  
      return this;
    }
  
    divide(x, y, z) {
      this.x /= x || 1;
      this.y /= y || 1;
      this.z /= z || 1;
  
      return this;
    }
  
    static add(a, b, out = new isoPoint()) {
      out.x = a.x + b.x;
      out.y = a.y + b.y;
      out.z = a.z + b.z;
  
      return out;
    }
  
    static subtract(a, b, out = new isoPoint()) {
      out.x = a.x - b.x;
      out.y = a.y - b.y;
      out.z = a.z - b.z;
  
      return out;
    }
  
    static multiply(a, b, out = new isoPoint()) {
      out.x = a.x * b.x;
      out.y = a.y * b.y;
      out.z = a.z * b.z;
  
      return out;
    }

    static divide (a, b, out = new isoPoint()) {
      out.x = a.x / b.x;
      out.y = a.y / b.y;
      out.z = a.z / b.z;
  
      return out;
    }

    static equals(a, b) {
      return (a.x === b.x && a.y === b.y && a.z === b.z);
    }
  }
  
  