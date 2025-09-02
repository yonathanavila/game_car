export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  preload() {
    this.load.image("background", "images/splasharts/taxi_damage.webp");
  }

  create() {
    // background
    const bgPause = this.add.image(-400, -90, "background").setOrigin(0, 0);

    // Get game width and height
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    // Get image original size
    const imgWidth = bgPause.width;
    const imgHeight = bgPause.height;

    // Calculate scale ratios
    const scaleX = gameWidth / imgWidth;
    const scaleY = gameHeight / imgHeight;

    // Use the smaller scale to fit the image within the screen while maintaining aspect ratio
    const scale = Math.max(scaleX, scaleY); // or Math.min(scaleX, scaleY) depending on fit type

    bgPause.setScale(scale);

    // Optionally, center the image if needed
    bgPause.x = gameWidth / 2;
    bgPause.y = gameHeight / 2;
    bgPause.setOrigin(0.5, 0.5);
    bgPause.setDepth(-1);

    const titleScreen = this.add
      .text(this.scale.width / 2, 70, "Game Over", {
        fontFamily: "Minecraft",
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const saveScore = this.add
      .text(this.scale.width / 2, 220, "Save Score", {
        fontFamily: "Minecraft",
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", async () => {
        try {
          const formData = new FormData();
          formData.append("score", this.score);
          formData.append("address", window.connectedAccount);

          const res = await fetch("/api/set-score.json", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("Server response:", data);
        } catch (error) {
          console.error("Contract call failed:", error);
        }
      });

    const tryAgain = this.add
      .text(this.scale.width / 2, 300, "Try again", {
        fontFamily: "Minecraft",
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", async () => {
        this.scene.stop("GameScene");
        this.scene.stop("UIScene");
        this.scene.stop("GameOverScene");
        window.location.reload(); // full page reload
      });
  }
}
