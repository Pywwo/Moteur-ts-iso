import 'phaser';
import IsoSprite from './mon-plugin/isoSprite';
import IsoProjector from './mon-plugin/Projector';
import tiles from "./variableWorld";
import World from "./mon-plugin/World";

class MyPluginIsoScene extends Phaser.Scene
{
    protected projector : IsoProjector;
    public _isoWorld : World;
    private isoGroup :  Phaser.GameObjects.Group;
    player;
    keys;

    constructor () {
        super({ key: 'MyPluginIsoScene' })
        this.projector = new IsoProjector(this);
        this._isoWorld = new World(this, 12*45, 12*45, 12*45);
    }

    preload() {
    }

    private handleWheelZoom(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (pointer.camera !== undefined) {
            if (deltaY > 0)
                this.cameras.main.zoom -= .1;
            if (deltaY < 0)
                this.cameras.main.zoom += .1;
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#2389DA');
        this.cameras.main.setViewport(0, 0, 1900, 900);
        this.projector.origin.setTo(0, -0.25);
        this.cameras.main.centerOn(0, 0);
        this.input.on('wheel', this.handleWheelZoom, this);
        this._isoWorld.gravity.setTo(0, 0, -500);
        this.sys.events.on('update', this._isoWorld.update, this._isoWorld);
        this.sys.events.on('postupdate', this._isoWorld.postUpdate, this._isoWorld);
        // this._isoWorld.setBounds(0, 0, 0, 12*45, 12*45, 12*45);
        this.spawnTiles();
    }

    update(time: number, delta: number) {
        var speed = 200;

        if (this.keys.up.isDown) {
            this.player.body.velocity.y = -speed;
        }
        else if (this.keys.down.isDown) {
            this.player.body.velocity.y = speed;
        }
        else {
            this.player.body.velocity.y = 0;
        }

        if (this.keys.left.isDown) {
            this.player.body.velocity.x = -speed;
        }
        else if (this.keys.right.isDown) {
            this.player.body.velocity.x = speed;
        }
        else {
            this.player.body.velocity.x = 0;
        }
        // @ts-ignore
        this._isoWorld.collide(this.isoGroup);
    }

    showDepth(sprite, pointer) {
    }

    private spawnTiles() {
        this.isoGroup = this.add.group();
        for (let i = 0; i < tiles.length; i++) {
            let a = new IsoSprite(this, tiles[i].x, tiles[i].y, tiles[i].z, tiles[i].texture);
            this.isoGroup.add(a, true);
            a.setInteractive();
            a.on('pointerdown', this.showDepth.bind(this, a));
            a.on('pointerover', function(pointer) {
                    this.setTint(0x86bfda);
                });
            a.on('pointerout', function() {
                    this.clearTint();
                });
            this._isoWorld.enable(a);
            // @ts-ignore
            a.body.collideWorldBounds = true;
            // @ts-ignore
            a.body.immovable = true;
            if (tiles[i]["test"] !== undefined) {
            // @ts-ignore
            a.body.allowGravity = false;
            }
            if (tiles[i]['bodyType'] !== undefined) {
                // @ts-ignore
                a.body.immovable = false;
                
                // a.body[tiles[i]['bodyType']] = tiles[i].setTo;
            }
            // @ts-ignore
            a.body.setSize(48, 48, 48, 0, 0, 0);
        }
        this.player = new IsoSprite(this, 128, 128, 500, 'tile');
        this.isoGroup.add(this.player, true);
        this.player.tint = 0x86bfda;
        this._isoWorld.enable(this.player);
        this.player.body.setSize(48, 48, 48);
        this.player.body.collideWorldBounds = true;
        this.player.body.setType("player");
        this.keys = this.input.keyboard.addKeys({
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }); 
        this.input.keyboard.on('keydown', event => {
            switch (event.key) {
                case 'a':
                        this.player.body.velocity.z = 400;
                    break;
            }
        });
    }
}

class StarterScene extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'StarterScene' })
    }

    preload () {
        this.load.image('tile', './assets/cube2.png');
        this.load.image('player', './assets/petit_cube.png');
    }

    create () {
        this.scene.start('MyPluginIsoScene');
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#CEDBD8',
    width: 1900,
    height: 900,
    scene: [ StarterScene, MyPluginIsoScene]
};

const game = new Phaser.Game(config);
