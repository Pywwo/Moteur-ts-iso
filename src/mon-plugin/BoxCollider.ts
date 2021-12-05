import isoPoint from './isoPoint';
import World from './World';
import './isoSprite';
import IsoSprite from './isoSprite';
import 'phaser';

const UP = 0;
const DOWN = 1;
const FORWARDX = 2;
const FORWARDY = 3;
const BACKWARDX = 4;
const BACKWARDY = 5;

export default class BoxCollider {
	private sprite: IsoSprite;
	private scene: Phaser.Scene;
	public type: string;
	public enable: boolean;
	private offset: isoPoint;
	private position: isoPoint;
	private prev: isoPoint;
	private allowRotation: boolean;
	public rotation: number;
	private preRotation: number;
	private sourceWidthX: number;
	private sourceWidthY: number;
	private sourceHeight: number;
	public widthX: number;
	public widthY: number;
	public height: number;
	private halfWidthX: number;
	private halfWidthY: number;
	private halfHeight: number;
	private center: isoPoint;
	public velocity: isoPoint;
	private newVelocity: isoPoint;
	private deltaMax: isoPoint;
	public acceleration: isoPoint;
	public drag: isoPoint;
	private allowGravity: boolean;
	public bounce: isoPoint;
	private gravity: isoPoint;
	public maxVelocity: isoPoint;
	public angularVelocity: number;
	public angularAcceleration: number;
	public angularDrag: number;
	public maxAngular: number;
	public mass: number;
	private angle: number;
	private speed: number;
	private facing: number;
	public immovable: boolean;
	private moves: boolean;
	public customSeparateX: boolean;
	public customSeparateY: boolean;
	public customSeparateZ: boolean;
	public overlapX: number;
	public overlapY: number;
	public overlapZ: number;
	public embedded: boolean;
	private collideWorldBounds: boolean;
	public checkCollision: any;
	public touching: any;
	private wasTouching: any;
	private blocked: any;
	private phase: number;
	private _reset: boolean;
	private _sx: number;
	private _sy: number;
	private _dx: number;
	private _dy: number;
	private _dz: number;
	private _corners: isoPoint[];

  	constructor(sprite: IsoSprite) {
		this.sprite = sprite;
		this.scene = sprite.scene;
		this.type = "basic";
		this.enable = true;
		this.offset = new isoPoint();
		this.position = new isoPoint(sprite.isoX, sprite.isoY, sprite.isoZ);
		this.prev = new isoPoint(this.position.x, this.position.y, this.position.z);
		this.allowRotation = true;
		this.rotation = sprite.rotation;
		this.preRotation = sprite.rotation;
		this.sourceWidthX = sprite.width / sprite.scaleX;
		this.sourceWidthY = sprite.width / sprite.scaleX;
		this.sourceHeight = sprite.height / sprite.scaleY;
		this.widthX = Math.ceil(sprite.width * 0.5);
		this.widthY = Math.ceil(sprite.width * 0.5);
		this.height = sprite.height - Math.ceil(sprite.width * 0.5);
		this.halfWidthX = Math.abs(this.widthX * 0.5);
		this.halfWidthY = Math.abs(this.widthY * 0.5);
		this.halfHeight = Math.abs(this.height * 0.5);
		this.center = new isoPoint(sprite.isoX + this.halfWidthX, sprite.isoY + this.halfWidthY, sprite.isoZ + this.halfHeight);
		this.velocity = new isoPoint();
		this.newVelocity = new isoPoint();
		this.deltaMax = new isoPoint();
		this.acceleration = new isoPoint();
		this.drag = new isoPoint();
		this.allowGravity = true;
		this.gravity = new isoPoint();
		this.bounce = new isoPoint();
		this.maxVelocity = new isoPoint(10000, 10000, 10000);
		this.angularVelocity = 0;
		this.angularAcceleration = 0;
		this.angularDrag = 0;
		this.maxAngular = 1000;
		this.mass = 1;
		this.angle = 0;
		this.speed = 0;
		this.facing = Phaser.NONE;
		this.immovable = false;
		this.moves = true;
		this.customSeparateX = false;
		this.customSeparateY = false;
		this.customSeparateZ = false;
		this.overlapX = 0;
		this.overlapY = 0;
		this.overlapZ = 0;
		this.embedded = false;
		this.collideWorldBounds = false;
		this.checkCollision = {
			none: false,
			any: true,
			up: true,
			down: true,
			frontX: true,
			frontY: true,
			backX: true,
			backY: true
		};
		this.touching = {
			none: true,
			up: false,
			down: false,
			frontX: false,
			frontY: false,
			backX: false,
			backY: false
		};
		this.wasTouching = new Object({
			none: true,
			up: false,
			down: false,
			frontX: false,
			frontY: false,
			backX: false,
			backY: false
		});
		this.blocked = {
			up: false,
			down: false,
			frontX: false,
			frontY: false,
			backX: false,
			backY: false
		};
		this.phase = 0;
		this._reset = true;
		this._sx = sprite.scaleX;
		this._sy = sprite.scaleY;
		this._dx = 0;
		this._dy = 0;
		this._dz = 0;
		this._corners = [new isoPoint(this.x, this.y, this.z),
			new isoPoint(this.x, this.y, this.z + this.height),
			new isoPoint(this.x, this.y + this.widthY, this.z),
			new isoPoint(this.x, this.y + this.widthY, this.z + this.height),
			new isoPoint(this.x + this.widthX, this.y, this.z),
			new isoPoint(this.x + this.widthX, this.y, this.z + this.height),
			new isoPoint(this.x + this.widthX, this.y + this.widthY, this.z),
			new isoPoint(this.x + this.widthX, this.y + this.widthY, this.z + this.height)
		];
	  }

  	private updateBounds(): void {
		let asx: number = Math.abs(this.sprite.scaleX);
		let asy: number = Math.abs(this.sprite.scaleY);

		if (asx !== this._sx || asy !== this._sy) {
			this.widthX = Math.ceil(this.sprite.width * 0.5);
			this.widthY = Math.ceil(this.sprite.width * 0.5);
			this.height = Math.ceil(this.sprite.height - (this.sprite.width * 0.5));
			this.halfWidthX = Math.floor(this.widthX * 0.5);
			this.halfWidthY = Math.floor(this.widthY * 0.5);
			this.halfHeight = Math.floor(this.height * 0.5);
			this._sx = asx;
			this._sy = asy;
			this.center.setTo(this.position.x + this.halfWidthX, this.position.y + this.halfWidthY, this.position.z + this.halfHeight);
			this._reset = true;
		}
 	}

  	public update(time: number, delta: number): void {
		if (!this.enable) { return; }
		this.phase = 1;
		this.wasTouching.none = this.touching.none;
		this.wasTouching.up = this.touching.up;
		this.wasTouching.down = this.touching.down;
		this.wasTouching.backX = this.touching.backX;
		this.wasTouching.backY = this.touching.backY;
		this.wasTouching.frontX = this.touching.frontX;
		this.wasTouching.frontY = this.touching.frontY;
		this.touching.none = true;
		this.touching.up = false;
		this.touching.down = false;
		this.touching.backX = false;
		this.touching.backY = false;
		this.touching.frontX = false;
		this.touching.frontY = false;
		this.blocked.up = false;
		this.blocked.down = false;
		this.blocked.frontY = false;
		this.blocked.frontX = false;
		this.blocked.backY = false;
		this.blocked.backX = false;
		this.embedded = false;
		this.updateBounds();
		this.position.x = this.sprite.isoX + ((this.widthX * -this.sprite.originX) + this.widthX * 0.5) + this.offset.x;
		this.position.y = this.sprite.isoY + ((this.widthY * this.sprite.originX) - this.widthY * 0.5) + this.offset.y;
		this.position.z = this.sprite.isoZ - (Math.abs(this.sprite.height) * (1 - this.sprite.originY)) + (Math.abs(this.sprite.width * 0.5)) + this.offset.z;
		this.rotation = this.sprite.angle;
		this.preRotation = this.rotation;
		if (this._reset) {
			this.prev.x = this.position.x;
			this.prev.y = this.position.y;
			this.prev.z = this.position.z;
		}
		if (this.moves) {
			let world : World = this.scene.data.parent._isoWorld;
			if (world === undefined)
				return;
			delta /= 1000;
			world.updateMotion(this, delta);
			this.newVelocity.set(this.velocity.x * delta, this.velocity.y * delta, this.velocity.z * delta);
			this.position.x += this.newVelocity.x;
			this.position.y += this.newVelocity.y;
			this.position.z += this.newVelocity.z;
			if (this.position.x !== this.prev.x || this.position.y !== this.prev.y || this.position.z !== this.prev.z) {
				this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y + this.velocity.z * this.velocity.z);
				this.angle = Math.atan2(this.velocity.y, this.velocity.x);
			}
			if (this.collideWorldBounds)
				this.checkWorldBounds();
			if (!world.bounds.intersects(this.sprite.isoBounds))
				this.sprite.destroy();
		}
		this._dx = this.deltaX();
		this._dy = this.deltaY();
		this._dz = this.deltaZ();
		this._reset = false;
  	}

	public postUpdate(): void {
		if (!this.enable || this.phase === 2) { return; }
		this.phase = 2;
		if (this._reset) {
			this.prev.x = this.position.x;
			this.prev.y = this.position.y;
			this.prev.z = this.position.z;
		}
		if (this.deltaAbsX() >= this.deltaAbsY() && this.deltaAbsX() >= this.deltaAbsZ()) {
			if (this.deltaX() < 0)
				this.facing = BACKWARDX;
			else if (this.deltaX() > 0)
				this.facing = FORWARDX;
		} else if (this.deltaAbsY() >= this.deltaAbsX() && this.deltaAbsY() >= this.deltaAbsZ()) {
			if (this.deltaY() < 0)
				this.facing = BACKWARDY;
			else if (this.deltaY() > 0)
				this.facing = FORWARDY;
		} else {
			if (this.deltaZ() < 0)
				this.facing = DOWN;
			else if (this.deltaZ() > 0)
				this.facing = UP;
		}
		if (this.moves) {
			this._dx = this.deltaX();
			this._dy = this.deltaY();
			this._dz = this.deltaZ();
			if (this.deltaMax.x !== 0 && this._dx !== 0) {
				if (this._dx < 0 && this._dx < -this.deltaMax.x) {
					this._dx = -this.deltaMax.x;
				} else if (this._dx > 0 && this._dx > this.deltaMax.x) {
					this._dx = this.deltaMax.x;
				}
			}
			if (this.deltaMax.y !== 0 && this._dy !== 0) {
				if (this._dy < 0 && this._dy < -this.deltaMax.y) {
					this._dy = -this.deltaMax.y;
				} else if (this._dy > 0 && this._dy > this.deltaMax.y) {
					this._dy = this.deltaMax.y;
				}
			}
			if (this.deltaMax.z !== 0 && this._dz !== 0) {
				if (this._dz < 0 && this._dz < -this.deltaMax.z) {
					this._dz = -this.deltaMax.z;
				} else if (this._dz > 0 && this._dz > this.deltaMax.z) {
					this._dz = this.deltaMax.z;
				}
			}
			this.sprite.isoX += this._dx;
			this.sprite.isoY += this._dy;
			this.sprite.isoZ += this._dz;
		}
		this.center.setTo(this.position.x + this.halfWidthX, this.position.y + this.halfWidthY, this.position.z + this.halfHeight);
		if (this.allowRotation)
			this.sprite.angle += this.deltaR();
		this.prev.x = this.position.x;
		this.prev.y = this.position.y;
		this.prev.z = this.position.z;
		this._reset = false;
	}

	public destroy(): void {
		this.sprite = null;
	}

	public checkWorldBounds(): void {
		let world : World = this.scene.data.parent._isoWorld;;
		if (world === undefined)
			return;
		if (this.position.x < world.bounds.x && world.checkCollision.backX) {
			this.position.x = world.bounds.x;
			this.velocity.x *= -this.bounce.x;
			this.blocked.backX = true;
		} else if (this.frontX > world.bounds.frontX && world.checkCollision.frontX) {
			this.position.x = world.bounds.frontX - this.widthX;
			this.velocity.x *= -this.bounce.x;
			this.blocked.frontX = true;
		}
		if (this.position.y < world.bounds.y && world.checkCollision.backY) {
			this.position.y = world.bounds.y;
			this.velocity.y *= -this.bounce.y;
			this.blocked.backY = true;
		} else if (this.frontY > world.bounds.frontY && world.checkCollision.frontY) {
			this.position.y = world.bounds.frontY - this.widthY;
			this.velocity.y *= -this.bounce.y;
			this.blocked.frontY = true;
		}

		if (this.position.z < world.bounds.z && world.checkCollision.down) {
			this.position.z = world.bounds.z;
			this.velocity.z *= -this.bounce.z;
			this.blocked.down = true;
		} else if (this.top > world.bounds.top && world.checkCollision.up) {
			this.position.z = world.bounds.top - this.height;
			this.velocity.z *= -this.bounce.z;
			this.blocked.up = true;
		}
  	}

	public setType(toSet: string): void {
		this.type = toSet;
	}

	public setSize(widthX: number, widthY: number, height: number, offsetX?: number, offsetY?: number, offsetZ?: number): void {
		if (typeof offsetX === 'undefined')
			offsetX = this.offset.x;
		if (typeof offsetY === 'undefined')
			offsetY = this.offset.y;
		if (typeof offsetZ === 'undefined')
			offsetZ = this.offset.z;
		this.sourceWidthX = widthX;
		this.sourceWidthY = widthY;
		this.sourceHeight = height;
		this.widthX = (this.sourceWidthX) * this._sx;
		this.widthY = (this.sourceWidthY) * this._sx;
		this.height = (this.sourceHeight) * this._sy;
		this.halfWidthX = Math.floor(this.widthX * 0.5);
		this.halfWidthY = Math.floor(this.widthY * 0.5);
		this.halfHeight = Math.floor(this.height * 0.5);
		this.offset.setTo(offsetX, offsetY, offsetZ);
		this.center.setTo(this.position.x + this.halfWidthX, this.position.y + this.halfWidthY, this.position.z + this.halfHeight);
  	}

  	public reset(x: number, y: number, z: number): void {
		this.velocity.set(0);
		this.acceleration.set(0);
		this.angularVelocity = 0;
		this.angularAcceleration = 0;
		this.position.x = x + ((this.widthX) + this.widthX * 0.5) + this.offset.x;
		this.position.y = y + ((this.widthY) - this.widthY * 0.5) + this.offset.y;
		this.position.z = z - (Math.abs(this.sprite.height)) + (Math.abs(this.sprite.width * 0.5)) + this.offset.z;
		this.prev.x = this.position.x;
		this.prev.y = this.position.y;
		this.prev.z = this.position.z;
		this.rotation = this.sprite.angle;
		this.preRotation = this.rotation;
		this._sx = this.sprite.scaleX;
		this._sy = this.sprite.scaleY;
		this.center.setTo(this.position.x + this.halfWidthX, this.position.y + this.halfWidthY, this.position.z + this.halfHeight);
		this.sprite._isoPositionChanged = true;
  	}

	// public hitTest(x: number, y: number, z: number): boolean {
	// 	return isoCube.contains(this, x, y, z);
	// }

	public onFloor(): any {
		return this.blocked.down;
	}

	public onWall(): boolean {
		return (this.blocked.frontX || this.blocked.frontY || this.blocked.backX || this.blocked.backY);
	}

	public deltaAbsX(): number {
		return (this.deltaX() > 0 ? this.deltaX() : -this.deltaX());
	}

	public deltaAbsY(): number {
		return (this.deltaY() > 0 ? this.deltaY() : -this.deltaY());
	}

	public deltaAbsZ(): number {
		return (this.deltaZ() > 0 ? this.deltaZ() : -this.deltaZ());
	}

	public deltaX(): number {
		return this.position.x - this.prev.x;
	}

	public deltaY(): number {
		return this.position.y - this.prev.y;
	}

	public deltaZ(): number {
		return this.position.z - this.prev.z;
	}

	public deltaR(): number {
		return this.rotation - this.preRotation;
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

	public get top(): number {
		return this.position.z + this.height;
	}

	public get frontX(): number {
		return this.position.x + this.widthX;
	}

	public get right(): number {
		return this.position.x + this.widthX;
	}

	public get frontY(): number {
		return this.position.y + this.widthY;
	}

	public get bottom(): number {
		return this.position.y + this.widthY;
	}

	public get x(): number {
		return this.position.x;
	}

	public set x(value) {
		this.position.x = value;
	}

	public get y(): number {
		return this.position.y;
	}

	public set y(value) {
		this.position.y = value;
	}

	public get z(): number {
		return this.position.z;
	}

	public set z(value) {
		this.position.z = value;
	}
}

