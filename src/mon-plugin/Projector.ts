import isoPoint from './isoPoint';
import 'phaser';

export default class IsoProjector {
    public scene : any;
    public _transform : any;
    public origin : any;
    public _projectionAngle : number;

  	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this._transform = null;
		this.initProjectionAngle(Math.atan(0.5));
		this.origin = new Phaser.Geom.Point(0.5, 0.5);
	}

	private initProjectionAngle(angle: number) {
		this._projectionAngle = angle;
		this._transform = [Math.cos(this._projectionAngle), Math.sin(this._projectionAngle)];
	}

	project(point3, out = new Phaser.Geom.Point()) {
		out.x = (point3.x - point3.y) * this._transform[0];
		out.y = ((point3.x + point3.y) * this._transform[1]) - point3.z;
		const { width, height } = this.scene.sys.game.config;
		out.x += width * this.origin.x;
		out.y += height * this.origin.y;
		return out;
	}

	projectXY(point3, out = new Phaser.Geom.Point()) {
		out.x = (point3.x - point3.y) * this._transform[0];
		out.y = (point3.x + point3.y) * this._transform[1];
	//    out.x += this.game.world.width * this.origin.x;
	//    out.y += this.game.world.height * this.origin.y;
		return out;
	}

	unproject(point, out = new isoPoint(), z = 0) {
	//    const x = point.x - this.game.world.x - (this.game.world.width * this.origin.x);
	//   const y = point.y - this.game.world.y - (this.game.world.height * this.origin.y) + z;
	//    out.x = x / (2 * this._transform[0]) + y / (2 * this._transform[1]);
	//    out.y = -(x / (2 * this._transform[0])) + y / (2 * this._transform[1]);
		out.z = z;
		return out;
	}
}
