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
        fontFamily: "Minecraft",
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const load = this.add
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

    this.mainMenu.add(load);

    // const load = this.add
    //   .text(this.scale.width / 2, 220, "Load Game", {
    //     fontFamily: "Minecraft",
    //     fontSize: "38px",
    //     fill: "#fff",
    //   })
    //   .setInteractive({ useHandCursor: true })
    //   .setOrigin(0.5)
    //   .on("pointerdown", () => {
    //     this.mainMenu.setVisible(false);
    //     this.subMenu.setVisible(true);
    //   });

    // this.mainMenu.add(load);

    const mainMenu = this.add
      .text(this.scale.width / 2, 300, "Main Menu", {
        fontFamily: "Minecraft",
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
    //     fontFamily: "Minecraft",
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
        fontFamily: "Minecraft",
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
        fontFamily: "Minecraft",
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
}
