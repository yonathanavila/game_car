import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
    constructor() {
        super("UIScene");
    }

    create() {
        // Example texts
        this.score = 0;
        this.clients = 0;

        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#fff",
        });

        this.clientsText = this.add.text(16, 60, "Clients: 0", {
            fontFamily: "Minecraft",
            fontSize: "32px",
            fill: "#fff",
        });

        // Example listener from GameScene
        this.registry.events.on("changedata", (parent, key, data) => {
            if (key === "damage") {
                this.scoreText.setText("Damage: " + data);
            }
            if (key === "clients") {
                this.clientsText.setText("Clients: " + data);
            }
        });
    }
}
