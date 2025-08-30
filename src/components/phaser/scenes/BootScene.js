import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Load other assets you need
        this.load.image("bache_4", "images/pothole/bache_4.webp");
        this.load.image("bache_5", "images/pothole/bache_5.webp");
        this.load.image("npc_1", "images/npc/npc_1.webp");
        this.load.image("npc_2", "images/npc/npc_2.webp");
        this.load.image("npc_3", "images/npc/npc_3.webp");
        this.load.image("npc_4", "images/npc/npc_4.webp");

        this.load.image("street", "images/street/street_us.png");
        this.load.image("taxi_stop", "images/signal/taxi_stop.webp");
        this.load.spritesheet("button_tool", "images/button/button_tool.webp", {
            frameWidth: 768,
            frameHeight: 405
        });
        this.load.spritesheet("button_pause", "images/button/button_pause.webp", {
            frameWidth: 770,
            frameHeight: 409
        });
    }

    create() {
        // Once assets are ready, go to menu
        this.scene.start("MenuScene");
    }


}