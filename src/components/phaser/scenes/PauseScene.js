export default class PauseScene extends Phaser.Scene {
    constructor() {
        super("PauseScene");
    }

    preload() {
        this.load.image("background", "images/garage/garage_2.webp");
        this.load.image("button_close", "images/button/button_close.webp");
    }

    create() {
        // background
        const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);


        // button close
        const button_close = this.add.image(this.sys.game.config.width - 45, 45, "button_close").setOrigin(0.5);
        button_close.displayWidth = 55;
        button_close.displayHeight = 55;
        button_close.setDisplaySize(55, 55)
        button_close.setInteractive({ useHandCursor: true })
        button_close.on("pointerdown", () => {
            this.scene.stop();
            this.scene.resume("GameScene");
        })

        const titleScreen = this.add.text(this.scale.width / 2,
            70,
            "Pause",
            {
                fontFamily: "Minecraft",
                fontSize: "48px",
                fill: "#fff",
            }).setOrigin(0.5);

        const load = this.add.text(this.scale.width / 2,
            120,
            "Load Game",
            {
                fontFamily: "Minecraft",
                fontSize: "48px",
                fill: "#fff",
            }).setOrigin(0.5);
    }
}