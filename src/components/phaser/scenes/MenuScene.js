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

        const loginButton = this.add.text(
            this.scale.width / 2,
            this.sys.game.config.height - 70,
            "Google",
            {
                fontFamily: "Minecraft",
                fontSize: "32px",
                fill: "#0f0",
            })
            .setOrigin(0.5)
            .setInteractive();

        loginButton.on("pointerdown", async () => {

            // await startGame();
            // this.scene.start("GameScene");
        });


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

// async function startGame() {
//     try {

//         console.log('enter')
//         const response = await fetch("/api/get-user?68b255b8d7df03c60accfd46");
//         const user = await response.json();

//         const config = {
//             type: Phaser.AUTO,
//             width: 800,
//             height: 600,
//             scene: new MyGame(),
//         };

//         const game = new Phaser.Game(config);

//         // Pass user data to the scene
//         game.scene.scenes[0].user = user;
//     } catch (err) {
//         console.error("Failed to fetch user:", err);
//     }
// }