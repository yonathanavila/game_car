import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
    constructor() {
        super("UIScene");
    }

    create() {
        this.score = 0;
        this.clients = 0;
        this.carLife = 0;

        this.scoreText = this.add.text(16, 16, "Damage: 0", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#fff",
        });
        this.clientsText = this.add.text(16, 60, "Clients: 0", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#fff",
        });
        this.carLifeText = this.add.text(16, 104, "Life: 0", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#fff",
        });

        this.scoreText.setScrollFactor(0).setDepth(1);
        this.clientsText.setScrollFactor(0).setDepth(2);

        this.registry.events.on("changedata", (parent, key, data) => {
            if (key === "clients") {
                this.clientsText.setText("Clients: " + data);
            }
            if (key === "damage") {
                this.scoreText.setText("Damage: " + data);
            }

            if (key === "carLife") {
                this.carLifeText.setText("Life: " + data);
            }
        });
    }
}
