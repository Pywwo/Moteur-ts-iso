import BoxCollider from './BoxCollider';
import isoPoint from './isoPoint';
import Cube from './isoCube';
import IsoSprite from "./isoSprite";

export default class World {
	private _scene: Phaser.Scene;
	private bodies: Phaser.Structs.Set<BoxCollider>;
	public bounds: Cube;
	public gravity: isoPoint;
	private OVERLAP_BIAS: number = 10;
	private forceXY: boolean = false;
	private _overlap: number = 0;
	private _maxOverlap: number = 0;
	private _velocity1: number = 0;
	private _velocity2: number = 0;
	private _newVelocity1: number = 0;
	private _newVelocity2: number = 0;
	private _average: number = 0;
	private _result: boolean = false;
	private _total: number = 0;
	private _drag;
	public checkCollision = { up: true, down: true, frontX: true, frontY: true, backX: true, backY: true };

	constructor(scene: Phaser.Scene, x_width: number, y_width: number, z_width: number) {
		this._scene = scene;
		this.bodies = new Phaser.Structs.Set();
		this.bounds = new Cube(0, 0, 0, x_width, y_width, z_width);
		this.gravity = new isoPoint();
	}

	public enable(object : IsoSprite, children = true): void {
		this.enableBody(object);
	}

	private enableBody(object: IsoSprite): IsoSprite {
		if (object.body === null) {
			// @ts-ignore
			object.body = new BoxCollider(object);
			// @ts-ignore
			this.bodies.set(object.body);
		}
		return object;
	}

	public setBounds(x: number, y: number, z: number, widthX: number, widthY: number, widthZ: number): void {
		this.bounds.setTo(x, y, z, widthX, widthY, widthZ);
	}

	private computeVelocity(axis, body, velocity, acceleration, drag, max, delta): number {
		max = max || 10000;

		if (axis === 1 && body.allowGravity)
			velocity += ((this.gravity.x + body.gravity.x) * delta);
			if (body.velocity.x !== 0 && body.type === "basic") {
				let multiplicateur : number = 1;
				if (body.velocity.x < 0)
					multiplicateur = -1;
				velocity += (delta * this.gravity.z) * multiplicateur * 0.5;
				if (velocity * multiplicateur <= 0.0)
					velocity = 0.0;
			}
		else if (axis === 2 && body.allowGravity)
			velocity += ((this.gravity.y + body.gravity.y) * delta);
			if (body.velocity.y !== 0 && body.type === "basic") {
				let multiplicateur : number = 1;
				if (body.velocity.y < 0)
					multiplicateur = -1;
				velocity += (delta * this.gravity.z) * multiplicateur * 0.5;
				if (velocity * multiplicateur <= 0.0)
					velocity = 0.0;
			}
		else if (axis === 3 && body.allowGravity)
			velocity += (this.gravity.z + body.gravity.z) * delta;

		if (acceleration) {
			velocity += acceleration * delta;
		}
		else if (drag) {
			this._drag = drag * delta;
			if (velocity - this._drag > 0)
				velocity -= this._drag;
			else if (velocity + this._drag < 0)
				velocity += this._drag;
			else
				velocity = 0;
		}
		if (velocity > max)
			velocity = max;
		else if (velocity < -max)
			velocity = -max;
		return (velocity);
	}

	private separate(body1, body2, processCallback, callbackContext, overlapOnly): boolean {
		if (!body1.enable || !body2.enable || !this.intersects(body1, body2))
			return false;
		if (processCallback && processCallback.call(callbackContext, body1.sprite, body2.sprite) === false)
			return false;
		if (overlapOnly)
			return true;
		if (this.forceXY || Math.abs(this.gravity.z + body1.gravity.z) < Math.abs(this.gravity.x + body1.gravity.x) || Math.abs(this.gravity.z + body1.gravity.z) < Math.abs(this.gravity.y + body1.gravity.y))
			this._result = (this.separateByKey(body1, body2, overlapOnly, "x") || this.separateByKey(body1, body2, overlapOnly, "y") || this.separateByKey(body1, body2, overlapOnly, "z"));
		else
			this._result = (this.separateByKey(body1, body2, overlapOnly, "z") || this.separateByKey(body1, body2, overlapOnly, "x") || this.separateByKey(body1, body2, overlapOnly, "y"));
		return this._result;
	}

	public intersects(body1, body2): boolean {
		if (body1.frontX <= body2.x)
			return false;
		if (body1.frontY <= body2.y)
			return false;
		if (body1.x >= body2.frontX)
			return false;
		if (body1.y >= body2.frontY)
			return false;
		if (body1.top <= body2.z)
			return false;
		if (body1.z >= body2.top)
			return false;
		return true;
	}

	private separateByKey(body1: BoxCollider, body2: BoxCollider, overlapOnly: boolean, whatTo: string): boolean {
		if (body1.immovable && body2.immovable) { return false; }
		this._overlap = 0;
		let body1Delta = (whatTo === "x" ? body1.deltaX() : (whatTo === "y" ? body1.deltaY() : body1.deltaZ()));
		let body2Delta = (whatTo === "x" ? body2.deltaX() : (whatTo === "y" ? body2.deltaY() : body2.deltaZ()));
		let body1front = (whatTo === "x" ? body1.frontX : (whatTo === "y" ? body1.frontY : body1.top));
		let body2pos = (whatTo === "x" ? [body2.x, body2.x] : (whatTo === "y" ? [body2.y, body2.y] : [body2.z, body2.top]));
		let body1pos = (whatTo === "x" ? body1.x : (whatTo === "y" ? body1.y : body1.z));
		let body1checkColFront = (whatTo === "x" ? body1.checkCollision.frontX : (whatTo === "y" ? body1.checkCollision.frontY : body1.checkCollision.down));
		let body1checkColBack = (whatTo === "x" ? body1.checkCollision.backX : (whatTo === "y" ? body1.checkCollision.backY : body1.checkCollision.up));
		let body2checkColBack = (whatTo === "x" ? body2.checkCollision.backX : (whatTo === "y" ? body2.checkCollision.backY : body2.checkCollision.up));
		let body2checkColFront = (whatTo === "x" ? body2.checkCollision.frontX : (whatTo === "y" ? body2.checkCollision.frontY : body2.checkCollision.frontZ));
		let body2width = (whatTo === "x" ? body2.widthX : (whatTo === "y" ? body2.widthY : 0));
		let body1customSeparate = (whatTo === "x" ? body1.customSeparateX : (whatTo === "y" ? body1.customSeparateY : body1.customSeparateZ));
		let body2customSeparate = (whatTo === "x" ? body2.customSeparateX : (whatTo === "y" ? body2.customSeparateY : body2.customSeparateZ));
		let body1velocity = (whatTo === "x" ? body1.velocity.x : (whatTo === "y" ? body1.velocity.y : body1.velocity.z));
		let body2velocity = (whatTo === "x" ? body2.velocity.x : (whatTo === "y" ? body2.velocity.y : body2.velocity.z));
		if (whatTo === "x")
			this._maxOverlap = body1.deltaAbsX() + body2.deltaAbsX() + this.OVERLAP_BIAS;
		else if (whatTo === "y")
			this._maxOverlap = body1.deltaAbsY() + body2.deltaAbsY() + this.OVERLAP_BIAS;
		else if (whatTo === "z")
			this._maxOverlap = body1.deltaAbsZ() + body2.deltaAbsZ() + this.OVERLAP_BIAS;
		if (body1Delta === 0 && body2Delta === 0) {
			body1.embedded = true;
			body2.embedded = true;
		} else if (body1Delta > body2Delta) {
			this._overlap = body1front - body2pos[0];
			if ((this._overlap > this._maxOverlap) || body1checkColFront === false || body2checkColBack === false) {
				this._overlap = 0;
			} else {
				body1.touching.none = false;
				body2.touching.none = false;
				if (whatTo === "x") {
					body1.touching.frontX = true;
					body2.touching.backX = true;
				}
				else if (whatTo === "y") {
					body1.touching.backY = true;
					body2.touching.frontY = true;
				}
				else if (whatTo === "z") {
					body1.touching.down = true;
					body2.touching.up = true;
				}
			}
		} else if (body1Delta < body2Delta) {
			this._overlap = body1pos - body2width - body2pos[1];
			if ((-this._overlap > this._maxOverlap) || body1checkColBack === false || body2checkColFront === false) {
				this._overlap = 0;
			} else {
				body1.touching.none = false;
				body2.touching.none = false;
				if (whatTo === "x") {
					body1.touching.backX = true;
					body2.touching.frontX = true;
				} else if (whatTo === "y") {
					body1.touching.backY = true;
					body2.touching.frontY = true;
				} else if (whatTo === "z") {
					body1.touching.up = true;
					body2.touching.down = true;
				}
			}
		}
		if (this._overlap !== 0) {
			if (whatTo === "x") {
				body1.overlapX = this._overlap;
				body2.overlapX = this._overlap;
			} else if (whatTo === "y") {
				body1.overlapY = this._overlap;
				body2.overlapY = this._overlap;
			} else if (whatTo === "z") {
				body1.overlapZ = this._overlap;
				body2.overlapZ = this._overlap;
			}
			if (overlapOnly || body1customSeparate || body2customSeparate)
				return true;
			this._velocity1 = body1velocity;
			this._velocity2 = body2velocity;
			if (!body1.immovable && !body2.immovable) {
				//test
				// this._overlap *= 0.5;
				if (whatTo === "x") {
					body1.x = body1.x - this._overlap;
					body2.x += this._overlap;
				} else if (whatTo === "y") {
					body1.y = body1.y - this._overlap;
					body2.y += this._overlap;
				} else if (whatTo === "z") {
					body1.z = body1.z - this._overlap;
					body2.z += this._overlap;
				}
				this._newVelocity1 = Math.sqrt((this._velocity2 * this._velocity2 * body2.mass) / body1.mass) * ((this._velocity2 > 0) ? 1 : -1);
				this._newVelocity2 = Math.sqrt((this._velocity1 * this._velocity1 * body1.mass) / body2.mass) * ((this._velocity1 > 0) ? 1 : -1);
				this._average = (this._newVelocity1 + this._newVelocity2) * 0.5;
				this._newVelocity1 -= this._average;
				this._newVelocity2 -= this._average;
				if (whatTo === "x") {
					body1.velocity.x = this._average + this._newVelocity1 * body1.bounce.x;
					body2.velocity.x = this._average + this._newVelocity2 * body2.bounce.x;
				} else if (whatTo === "y") {
					body1.velocity.y = this._average + this._newVelocity1 * body1.bounce.y;
					body2.velocity.y = this._average + this._newVelocity2 * body2.bounce.y;
				} else if (whatTo === "z") {
					body1.velocity.z = this._average + this._newVelocity1 * body1.bounce.z;
					body2.velocity.z = this._average + this._newVelocity2 * body2.bounce.z;
				}
			} else if (!body1.immovable) {
				if (whatTo === "x") {
					body1.x = body1.x - this._overlap;
					body1.velocity.x = this._velocity2 - this._velocity1 * body1.bounce.x;
				} else if (whatTo === "y") {
					body1.y = body1.y - this._overlap;
					body1.velocity.y = this._velocity2 - this._velocity1 * body1.bounce.y;
				} else if (whatTo === "z") {
					body1.z = body1.z - this._overlap;
					body1.velocity.z = this._velocity2 - this._velocity1 * body1.bounce.z;
				}
				//addd moves
			} else if (!body2.immovable) {
				if (whatTo === "x") {
					body2.x += this._overlap;
					body2.velocity.x = this._velocity1 - this._velocity2 * body2.bounce.x;
				} else if (whatTo === "y") {
					body2.y += this._overlap;
					body2.velocity.y = this._velocity1 - this._velocity2 * body2.bounce.y;
				} else if (whatTo === "z") {
					body2.z += this._overlap;
					body2.velocity.z = this._velocity1 - this._velocity2 * body2.bounce.z;
				}
			}
			return true;
		}
		return false;
	}

 	public collide(object1: Phaser.GameObjects.Group, collideCallback = null, processCallback = null, callbackContext): boolean {
		callbackContext = callbackContext || collideCallback;
		this._result = false;
		this._total = 0;

		this.collideGroupVsSelf(object1, collideCallback, processCallback, callbackContext, false);
		return (this._total > 0);
	}

	private collideSpriteVsSprite(sprite1, sprite2, collideCallback, processCallback, callbackContext, overlapOnly): boolean {
		if (!sprite1.body || !sprite2.body) { return false; }
		if (this.separate(sprite1.body, sprite2.body, processCallback, callbackContext, overlapOnly)) {
			if (collideCallback)
				collideCallback.call(callbackContext, sprite1, sprite2);
			this._total++;
		}
		return true;
	}

	private collideGroupVsSelf(group: Phaser.GameObjects.Group, collideCallback, processCallback, callbackContext, overlapOnly): void {
		if (group.children.size === 0) { return; }

		for (let i: number = 0; i < group.children.size; i++) {
			for (let j: number = i + 1; j <= group.children.size; j++) {
				const entries: Phaser.GameObjects.GameObject[] = group.children.entries;
				if (entries[i] && entries[j])
					this.collideSpriteVsSprite(entries[i], entries[j], collideCallback, processCallback, callbackContext, overlapOnly);
			}
		}
 	}

	public updateMotion(body: BoxCollider, delta: number): void {
		body.angularVelocity += this.computeVelocity(0, body, body.angularVelocity, body.angularAcceleration, body.angularDrag, body.maxAngular, delta) - body.angularVelocity;
		body.rotation += (body.angularVelocity * delta);
		body.velocity.x = this.computeVelocity(1, body, body.velocity.x, body.acceleration.x, body.drag.x, body.maxVelocity.x, delta);
		body.velocity.y = this.computeVelocity(2, body, body.velocity.y, body.acceleration.y, body.drag.y, body.maxVelocity.y, delta);
		body.velocity.z = this.computeVelocity(3, body, body.velocity.z, body.acceleration.z, body.drag.z, body.maxVelocity.z, delta);
	}

	public update(time: number, delta: number): void {
		const bodies: BoxCollider[] = this.bodies.entries;

		for (let i: number = 0; i < bodies.length; i++) {
			if (bodies[i].enable)
				bodies[i].update(time, delta);
		}
	}

	public postUpdate(): void {
		const bodies: BoxCollider[] = this.bodies.entries;

		for (let i: number = 0; i < bodies.length; i++) {
			if (bodies[i].enable)
				bodies[i].postUpdate();
		}
	}
}
