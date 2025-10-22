import { shortenAddress } from "@/lib/utils";

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
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Start Game", {
        fontSize: "32px",
        fill: "#8aebf1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        this.scene.stop("GameScene"); // stop old scene
        this.scene.start("GameScene"); // start fresh
      })
      .on("pointerover", () => {
        startButton.setStyle({ fill: "#ff0" });
      })
      .on("pointerout", () => {
        startButton.setStyle({ fill: "#8aebf1" });
      });

    const leaderBoard = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 70, "Leaderboard", {
        fontSize: "32px",
        fill: "#8aebf1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        this.scene.start("LeaderboardScene");
      })
      .on("pointerover", () => {
        leaderBoard.setStyle({ fill: "#ff0" });
      })
      .on("pointerout", () => {
        leaderBoard.setStyle({ fill: "#8aebf1" });
      });

    this.add
      .text(
        this.scale.width / 2,
        this.sys.game.config.height - 150,
        "Welcome!",
        {
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5)
      .on("pointerdown", () => {
        if (window.connectWalletFarcaster) {
          window.connectWalletFarcaster();
        }
      });

    this.walletText = this.add
      .text(
        this.scale.width / 2,
        this.sys.game.config.height - 80,
        window?.connectedAccount
          ? shortenAddress(window.connectedAccount)
          : "Connect Wallet",
        {
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        const addr = await window.connectWallet();

        if (addr) {
          window.connectedAccount = addr;
          this.updateWalletText(addr);
        }

        console.log("Phaser sees Base Account:", addr);
      });

    this.updateWalletText = (addr) => {
      this.walletText.setText(shortenAddress(addr));
    };

    window.refreshPhaserWalletText = (addr) => {
      this.updateWalletText(addr);
    };
  }

  update() {
    if (window.isFarcaster && window.farcasterProfile && !this.profileShown) {
      this.add.text(
        this.scale.width / 2,
        this.sys.game.config.height - 100,
        `Farcaster info: ${window.farcasterProfile.fid} ${window.farcasterProfile.username}`,
        {
          fontSize: "32px",
          fill: "#fff",
        }
      );
      this.profileShown = true;
    }
  }
}
