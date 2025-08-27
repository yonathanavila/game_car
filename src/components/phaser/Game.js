import Phaser from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";


export default class Game extends Phaser.Game {
    constructor() {

        var config = {
            type: Phaser.AUTO,
            pixelArt: true,

            width: 434,
            height: window.innerHeight + 100,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 300 },
                    debug: false,
                },
            },
            scale: {
                parent: "game-container",
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            scene: {
                preload: preload,
                create: create,
                update: update,
            },
            plugins: {
                scene: [
                    {
                        key: "rexVirtualJoystick",
                        plugin: VirtualJoystickPlugin,
                        mapping: "rexVirtualJoystick",
                    },
                ],
            },
        };
        
        super(config);
    }
}