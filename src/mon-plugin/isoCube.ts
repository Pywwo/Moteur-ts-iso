import isoPoint from './isoPoint';
import BoxCollider from './BoxCollider';

export default class isoCube {
	public x: number;
	public y: number;
	public z: number;
	public widthX: number;
	public widthY: number;
	public height: number;
	public _corners: isoPoint[];
	constructor(x: number = 0, y: number = 0, z: number = 0, widthX: number = 0, widthY: number = 0, height: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.widthX = widthX;
		this.widthY = widthY;
		this.height = height;
		this._corners = [
			new isoPoint(this.x, this.y, this.z),
			new isoPoint(this.x, this.y, this.z + this.height),
			new isoPoint(this.x, this.y + this.widthY, this.z),
			new isoPoint(this.x, this.y + this.widthY, this.z + this.height),
			new isoPoint(this.x + this.widthX, this.y, this.z),
			new isoPoint(this.x + this.widthX, this.y, this.z + this.height),
			new isoPoint(this.x + this.widthX, this.y + this.widthY, this.z),
			new isoPoint(this.x + this.widthX, this.y + this.widthY, this.z + this.height)
		];
	}

	public setTo(x: number, y: number, z: number, widthX: number, widthY: number, height: number): isoCube {
		this.x = x;
		this.y = y;
		this.z = z;
		this.widthX = widthX;
		this.widthY = widthY;
		this.height = height;
		return this;
	}

	public copyFrom(source: isoCube): void {
		this.setTo(source.x, source.y, source.z, source.widthX, source.widthY, source.height);
	}

	public copyTo(dest: isoCube): isoCube {
		dest.x = this.x;
		dest.y = this.y;
		dest.z = this.z;
		dest.widthX = this.widthX;
		dest.widthY = this.widthY;
		dest.height = this.height;

		return dest;
	}

	public size(output: isoPoint): isoPoint {
		return isoCube.size(this, output);
	}

	public contains(x: number, y: number, z: number): boolean {
		return isoCube.contains(this, x, y, z);
	}

	public containsXY(x: number, y: number): boolean {
		return isoCube.containsXY(this, x, y);
	}

	public clone(output: isoCube): isoCube {
		return isoCube.clone(this, output);
	}

	public intersects(b: isoCube): boolean {
		return isoCube.intersects(this, b);
	}

	public getCorners(): isoPoint[] {
		this._corners[0].setTo(this.x, this.y, this.z);
		this._corners[1].setTo(this.x, this.y, this.z + this.height);
		this._corners[2].setTo(this.x, this.y + this.widthY, this.z);
		this._corners[3].setTo(this.x, this.y + this.widthY, this.z + this.height);
		this._corners[4].setTo(this.x + this.widthX, this.y, this.z);
		this._corners[5].setTo(this.x + this.widthX, this.y, this.z + this.height);
		this._corners[6].setTo(this.x + this.widthX, this.y + this.widthY, this.z);
		this._corners[7].setTo(this.x + this.widthX, this.y + this.widthY, this.z + this.height);
		return this._corners;
	}

	public toString(): string {
		return `[{isoCube (x=${this.x} y=${this.y} z=${this.z} widthX=${this.widthX} widthY=${this.widthY} height=${this.height} empty=${this.empty})}]`;
	}

	get halfWidthX(): number {
		return Math.round(this.widthX * 0.5);
	}

	get halfWidthY(): number {
		return Math.round(this.widthY * 0.5);
	}

	get halfHeight(): number {
		return Math.round(this.height * 0.5);
	}

	get bottom(): number {
		return this.z;
	}

	set bottom(value: number) {
		if (value >= this.top) {
			this.height = 0;
		} else {
			this.height = (this.top - value);
		}
		this.z = value;
	}

	get top(): number {
		return this.z + this.height;
	}

	set top(value: number) {
		if (value <= this.z) {
			this.height = 0;
		} else {
			this.height = (value - this.z);
		}
	}

	get backX(): number {
		return this.x;
	}

	set backX(value: number) {
		if (value >= this.frontX) {
			this.widthX = 0;
		} else {
			this.widthX = (this.frontX - value);
		}
		this.x = value;
	}

	get backY(): number {
		return this.y;
	}

	set backY(value: number) {
		if (value >= this.frontY) {
			this.widthY = 0;
		} else {
			this.widthY = (this.frontY - value);
		}
		this.y = value;
	}

	get frontX(): number {
		return this.x + this.widthX;
	}

	set frontX(value: number) {
		if (value <= this.x) {
			this.widthX = 0;
		} else {
			this.widthX = (value - this.x);
		}
	}

	get frontY(): number {
		return this.y + this.widthY;
	}

	set frontY(value: number) {
		if (value <= this.y) {
			this.widthY = 0;
		} else {
			this.widthY = (value - this.y);
		}
	}

	get volume(): number {
		return this.widthX * this.widthY * this.height;
	}

	get centerX(): number {
		return this.x + this.halfWidthX;
	}

	set centerX(value: number) {
		this.x = value - this.halfWidthX;
	}

	get centerY(): number {
		return this.y + this.halfWidthY;
	}

	set centerY(value: number) {
		this.y = value - this.halfWidthY;
	}

	get centerZ(): number {
		return this.z + this.halfHeight;
	}

	set centerZ(value: number) {
		this.z = value - this.halfHeight;
	}

	get randomX(): number {
		return this.x + (Math.random() * this.widthX);
	}

	get randomY(): number {
		return this.y + (Math.random() * this.widthY);
	}

	get randomZ(): number {
		return this.z + (Math.random() * this.height);
	}

	get empty(): boolean {
		return (!this.widthX || !this.widthY || !this.height);
	}

	set empty(value: boolean) {
		if (value === true) {
			this.setTo(0, 0, 0, 0, 0, 0);
		}
	}

	static size(a: isoCube, output: isoPoint) {
		if (typeof output === 'undefined' || output === null)
			output = new isoPoint(a.widthX, a.widthY, a.height);
		else
			output.setTo(a.widthX, a.widthY, a.height);
		return output;
	}

	static clone(a: isoCube, output: isoCube):  isoCube {
		if (typeof output === 'undefined' || output === null)
			output = new isoCube(a.x, a.y, a.z, a.widthX, a.widthY, a.height);
		else
			output.setTo(a.x, a.y, a.z, a.widthX, a.widthY, a.height);
		return output;
	}

	static contains(a: isoCube, x: number, y: number, z: number): boolean {
		if (a.widthX <= 0 || a.widthY <= 0 || a.height <= 0)
			return false;
		return (x >= a.x && x <= a.frontX && y >= a.y && y <= a.frontY && z >= a.z && z <= a.top);
	}

	static containsXY(a: isoCube, x: number, y: number): boolean {
		if (a.widthX <= 0 || a.widthY <= 0)
			return false;
		return (x >= a.x && x <= a.frontX && y >= a.y && y <= a.frontY);
	}

	static containsisoPoint(a: isoCube, isoPoint: isoPoint): boolean {
		return isoCube.contains(a, isoPoint.x, isoPoint.y, isoPoint.z);
	}

	static containsCube(a: isoCube, b: isoCube): boolean {
		//  If the given cube has a larger volume than this one then it can never contain it
		if (a.volume > b.volume) { return false; }
		return (a.x >= b.x && a.y >= b.y && a.z >= b.z && a.frontX <= b.frontX && a.frontY <= b.frontY && a.top <= b.top);
	}

	static intersects(a: isoCube, b: isoCube): boolean {
		if (a.widthX <= 0 || a.widthY <= 0 || a.height <= 0 || b.widthX <= 0 || b.widthY <= 0 || b.height <= 0)
			return false;
		return !(a.frontX < b.x || a.frontY < b.y || a.x > b.frontX || a.y > b.frontY || a.z > b.top || a.top < b.z);
	}
}


