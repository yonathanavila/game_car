export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoginScene" });
  }

  // <-- Use init() to receive the score
  init() {
    const username = localStorage.getItem("playerName");

    if (username) {
      this.scene.start("MenuScene");
    }
  }

  create() {
    // Inside your Phaser scene
    this.add
      .text(70, 90, "What is your username?", {
        fontSize: "24px",
        fill: "#fff",
      })
      .setInteractive();

    this.inputText = this.add
      .rexBBCodeText(70, 180, "...", {
        fontSize: "24px",
        fill: "#fff",
        color: "#000000",
        backgroundColor: "#f59e0b", // Tailwind yellow-500
        padding: {
          left: 16, // px-4 → 16px
          right: 16,
          top: 8, // py-2 → 8px
          bottom: 8,
        },
        fixedWidth: 300, // width: 300px
        backgroundCornerRadius: 20,
      })
      .setInteractive();

    this.add
      .rexBBCodeText(110, 270, "Play", {
        fontSize: "20px",
        fill: "#fff",
        color: "#000000",
        padding: {
          left: 16, // px-4 → 16px
          right: 16,
          top: 8, // py-2 → 8px
          bottom: 8,
        },
        backgroundCornerRadius: 20,
        backgroundColor: "#0B61F5",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        console.log("Enter to the game");

        fetch("/api/wallets/get-create-wallet.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.inputText.text,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            localStorage.setItem("playerName", this.inputText.text);
            this.scene.start("MenuScene");
          })
          .catch((error) => {
            console.error("Error:", error);
            this.showScoreSavedNotification(
              this,
              "Your username already exists, please choose another one."
            );
          });

        // this.scene.start("MenuScene");
      });

    this.plugins.get("rexTextEdit").edit(this.inputText);
  }

  // Inside your Phaser scene
  showNotification(scene, text) {
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
