export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() { }

    create() {
        this.add.text(this.scale.width / 2,
            this.scale.height / 2 - 100,
            "Taxi River",
            {
                fontFamily: "Minecraft",
                fontSize: "48px",
                fill: "#fff",
            }).setOrigin(0.5);

        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 2, "Start Game", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#0f0",
        }).setOrigin(0.5).setInteractive();

        startButton.on("pointerover", () => {
            startButton.setStyle({ fill: "#ff0" });
        });

        startButton.on("pointerout", () => {
            startButton.setStyle({ fill: "0f0" });
        });

        startButton.on("pointerdown", () => {
            this.scene.start("GameScene");
        });
    }
}