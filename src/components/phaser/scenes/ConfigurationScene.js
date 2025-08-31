export default class ConfigurationScene extends Phaser.Scene {
  constructor() {
    super({ key: "ConfigurationScene" });
  }

  preload() {
    this.load.image("button_close_a", "images/button/button_close.webp");
    this.load.image("configuration_tool", "images/splasharts/ToolChest.webp");
  }

  create() {
    // button close
    const button_close = this.add
      .image(this.sys.game.config.width - 45, 45, "button_close_a")
      .setOrigin(0.5)
      .setDisplaySize(55, 55)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.stop();
        this.scene.resume("PauseScene");
      });

    button_close.displayWidth = 55;
    button_close.displayHeight = 55;

    // background
    const bg = this.add
      .image(0, 0, "configuration_tool")
      .setOrigin(0, 0)
      .setDepth(-1)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;

    const titleScreen = this.add
      .text(this.scale.width / 2, 70, "Configuration", {
        fontFamily: "Minecraft",
        fontSize: "35px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const MuteMusic = this.add
      .text(this.scale.width / 2, 210, "Mute music", {
        fontFamily: "Minecraft",
        fontSize: "35px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const MuteSoundEffects = this.add
      .text(this.scale.width / 2, 280, "Mute sound effects", {
        fontFamily: "Minecraft",
        fontSize: "35px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const DeleteAccount = this.add
      .text(this.scale.width / 2, 350, "Delete account", {
        fontFamily: "Minecraft",
        fontSize: "35px",
        fill: "#fff",
      })
      .setOrigin(0.5);
  }
}
