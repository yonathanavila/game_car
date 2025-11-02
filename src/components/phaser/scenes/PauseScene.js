import { SaveScore } from "@/services/payments";

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  preload() {
    this.load.image("background", "images/garage/garage_2.webp");
    this.load.image("button_close", "images/button/button_close.webp");
  }

  // <-- Use init() to receive the score
  init(data) {
    this.score = data.score;
  }

  create() {
    this.mainMenu = this.add.group();

    // background
    const bgPause = this.add.image(0, 0, "background").setOrigin(0, 0);
    bgPause.displayWidth = this.sys.game.config.width;
    bgPause.displayHeight = this.sys.game.config.height;
    bgPause.setDisplaySize(
      this.sys.game.config.width,
      this.sys.game.config.height
    );

    // button close
    const button_close = this.add
      .image(this.sys.game.config.width - 45, 45, "button_close")
      .setOrigin(0.5);
    button_close.displayWidth = 55;
    button_close.displayHeight = 55;
    button_close.setDisplaySize(55, 55);
    button_close.setInteractive({ useHandCursor: true });
    button_close.on("pointerdown", () => {
      this.scene.stop("PauseScene");
      this.scene.resume("GameScene");
    });

    const titleScreen = this.add
      .text(this.scale.width / 2, 70, "Pause", {
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const load = this.add
      .text(this.scale.width / 2, 220, "Save Score", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", async () => {
        try {
          await connectWallet();

          const getNonce = await fetch(
            `/api/db/get-nonce.json?wallet=${window.connectedAccount}`
          );

          if (!getNonce.ok) {
            const saveNonce = await fetch(`/api/db/save-nonce.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                wallet: window.connectedAccount,
                nonce: 1,
              }),
            });

            if (!saveNonce.ok) {
              throw new Error("We cannot create the wallet nonce");
            }

            await SaveScore({
              score: this.score,
              player: window.connectedAccount,
              nonce: 1,
            });

            return;
          }

          const data = await getNonce.json();

          await SaveScore({
            score: this.score,
            player: window.connectedAccount,
            nonce: data.nonce,
          });

          this.showScoreSavedNotification(this);
        } catch (error) {
          console.error("Contract call failed:", error);
          this.showScoreSavedNotification(
            this,
            "We have problems to save your score, be sure you have your wallet already connected!"
          );
        }
      });

    this.mainMenu.add(load);

    const repairScene = this.add
      .text(this.scale.width / 2, 300, "Auto repair shop", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.mainMenu.setVisible(false);
        this.subMenu.setVisible(true);
        this.scene.start("RepairScene");
      });

    this.mainMenu.add(repairScene);

    const mainMenu = this.add
      .text(this.scale.width / 2, 400, "Main Menu", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.scene.stop("GameScene");
        this.scene.stop("UIScene");
        this.scene.stop("PauseScene");
        window.location.reload(); // full page reload
      });

    this.mainMenu.add(mainMenu);

    // const configurationMenu = this.add
    //   .text(this.scale.width / 2, 380, "Configuration", {
    //
    //     fontSize: "38px",
    //     fill: "#fff",
    //   })
    //   .setInteractive({ useHandCursor: true })
    //   .setOrigin(0.5)
    //   .on("pointerdown", () => {
    //     console.log("enter");
    //     this.scene.pause();
    //     this.scene.launch("ConfigurationScene");
    //   });

    // this.mainMenu.add(configurationMenu);

    this.subMenu = this.add.group();

    const partyA = this.add
      .text(this.scale.width / 2, 220, "Party A", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.subMenu.setVisible(false);
        this.mainMenu.setVisible(true);
      });

    this.subMenu.add(partyA);

    const partyB = this.add
      .text(this.scale.width / 2, 300, "Party B", {
        fontSize: "38px",
        fill: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.subMenu.setVisible(false);
        this.mainMenu.setVisible(true);
      });

    this.subMenu.add(partyB);
    this.subMenu.setVisible(false);
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
