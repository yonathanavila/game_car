export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    this.load.image("splashart", "images/splasharts/taxi.webp");
  }

  create() {
    // splashart
    const bg = this.add.image(0, 0, "splashart").setOrigin(0, 0).setDepth(-1);
    bg.displayHeight = this.sys.game.config.height;
    bg.displayWidth = this.sys.game.config.width;
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.add
      .text(this.scale.width / 2, 90, "Taxi Driver", {
        fontFamily: "Minecraft",
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Start Game", {
        fontFamily: "Minecraft",
        fontSize: "32px",
        fill: "#8aebf1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        this.scene.start("GameScene");
      })
      .on("pointerover", () => {
        startButton.setStyle({ fill: "#ff0" });
      })
      .on("pointerout", () => {
        startButton.setStyle({ fill: "#8aebf1" });
      });

    this.add
      .text(
        this.scale.width / 2,
        this.sys.game.config.height - 50,
        "Metamask",
        {
          fontFamily: "Minecraft",
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (window.connectWalletMetamask) {
          window.connectWalletMetamask();
        }
      });

    this.add
      .text(
        this.scale.width / 2,
        this.sys.game.config.height - 100,
        "Farcaster",
        {
          fontFamily: "Minecraft",
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (window.connectWalletFarcaster) {
          window.connectWalletFarcaster();
        }
      });
  }
}
