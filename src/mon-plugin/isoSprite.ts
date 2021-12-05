import isoPoint from './isoPoint';
import 'phaser';
import isoCube from './isoCube';


export default class IsoSprite extends Phaser.GameObjects.Sprite {

    private _isoPosition : isoPoint;
    private snap: any;
    public _isoPositionChanged : any;
    private _isoBoundsChanged : any;
    private _isoBounds : any;
    constructor(scene, x, y, z, texture, frame = 0) {
        super(scene, x, y, texture, frame);

        this.type = "IsoSprite";
        this._isoPosition = new isoPoint(x, y, z);
        this.snap = 0;
        this._isoPositionChanged = true;
        this._isoBoundsChanged = true;

        this._prepare();
        this._isoBounds = undefined;
        this._isoBounds = this.resetIsoBounds();
    }

    get isoX() {
        return this._isoPosition.x;
    }

    set isoX(value) {
        this._isoPosition.x = value;
        this._isoPositionChanged = this._isoBoundsChanged = true;
        if (this.body){
          //@ts-ignore
         this.body._reset = true;
        }
    }

    get isoY() {
        return this._isoPosition.y;
    }

    set isoY(value) {
        this._isoPosition.y = value;
        this._isoPositionChanged = this._isoBoundsChanged = true;

        if (this.body){
          //@ts-ignore
          this.body._reset = true;
        }
    }

  get isoZ() {
    return this._isoPosition.z;
  }

  set isoZ(value) {
    this._isoPosition.z = value;
    this._isoPositionChanged = this._isoBoundsChanged = true;
    if (this.body){
          //@ts-ignore
        this.body._reset = true;
    }
  }

  get isoPosition() {
    return this._isoPosition;
  }

  get isoBounds() {
    if (this._isoBoundsChanged || !this._isoBounds) {
      this.resetIsoBounds();
      this._isoBoundsChanged = false;
    }

    return this._isoBounds;
  }

    _prepare() {
        if (this._isoPositionChanged) {
          const name = this.scene.sys.settings.key;
          const projector = this.scene.data.parent.projector;
          const { x, y } = projector.project(this._isoPosition);

        this.x = x;
        this.y = y;
        this.depth = (this._isoPosition.x + this._isoPosition.y) + (this._isoPosition.z * 2);

        if (this.snap > 0) {
          this.x = Phaser.Math.Snap.To(this.x, this.snap); 
          this.y = Phaser.Math.Snap.To(this.y, this.snap); 
        }

        this._isoPositionChanged = this._isoBoundsChanged = true;
        }
    }

    preUpdate(time, delta) {
      super.preUpdate(time, delta);
        this._prepare();
    }

    resetIsoBounds() {
      
        if (typeof this._isoBounds === 'undefined') {
            this._isoBounds = new isoCube();
        }

        var asx = Math.abs(this.scaleX);
        var asy = Math.abs(this.scaleY);

        this._isoBounds.widthX = Math.round(Math.abs(this.width) * 0.5) * asx;
        this._isoBounds.widthY = Math.round(Math.abs(this.width) * 0.5) * asx;
        this._isoBounds.height = Math.round(Math.abs(this.height) - (Math.abs(this.width) * 0.5)) * asy;

        this._isoBounds.x = this.isoX + (this._isoBounds.widthX * -this.originX) + this._isoBounds.widthX * 0.5;
        this._isoBounds.y = this.isoY + (this._isoBounds.widthY * this.originX) - this._isoBounds.widthY * 0.5;
        this._isoBounds.z = this.isoZ - (Math.abs(this.height) * (1 - this.originY)) + (Math.abs(this.width * 0.5));

        return this._isoBounds;
    }
}