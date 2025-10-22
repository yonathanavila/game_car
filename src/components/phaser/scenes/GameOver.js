import { SaveScore } from "@/services/payments";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  preload() {
    this.load.image("background", "images/splasharts/taxi_damage.webp");
  }

  // <-- Use init() to receive the score
  init(data) {
    this.score = data.score;
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
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const yourScroe = this.add
      .text(
        this.scale.width / 2,
        140,
        `"Your score": ${Math.round(this.score)}`,
        {
          fontSize: "38px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    const saveScore = this.add
      .text(this.scale.width / 2, 220, "Save Score", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", async () => {
        try {
          const response = await SaveScore({
            score: this.score,
            player: window.connectedAccount,
          });

          console.log(response);
          this.showScoreSavedNotification(this);
        } catch (error) {
          console.error("Contract call failed:", error);
          this.showScoreSavedNotification(
            this,
            "We have problems to save your score, be sure you have your wallet already connected!"
          );
        }
      });

    // TODO: avoid reload the page to try again the game to better the performance
    const tryAgain = this.add
      .text(this.scale.width / 2, 300, "Try again", {
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

  // Inside your Phaser scene
  showScoreSavedNotification(scene, text = "Your score was saved") {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const notification = scene.add
      .text(width / 2, height / 2, text, {
        fontSize: "24px",
        color: "#00ff00",
        fontStyle: "bold",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setAlpha(0); // start invisible

    // Fade in
    scene.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 300,
      ease: "Power1",
      onComplete: () => {
        // Stay visible for 1 second
        scene.time.delayedCall(1000, () => {
          // Fade out
          scene.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 500,
            ease: "Power1",
            onComplete: () => notification.destroy(),
          });
        });
      },
    });
  }
}
