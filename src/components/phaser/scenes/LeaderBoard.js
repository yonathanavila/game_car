import Phaser from "phaser";

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super("LeaderboardScene");
    this.baseTextStyle = {
      fontSize: "25px",
      fontFamily: "Minecraft",
      color: "#ffffff",
      align: "left",
    };
    this.menuItems = [];
  }

  preload() {
    this.load.image("background", "images/garage/garage_2.webp");
    this.load.image("close", "/images/close.webp");
  }

  async create() {
    let bg = this.add.image(0, 0, "background").setOrigin(0, 0);

    // Get game width and height
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    // Calculate scale to cover the screen
    const scaleX = gameWidth / bg.width;
    const scaleY = gameHeight / bg.height;
    const scale = Math.max(scaleX, scaleY); // use max to cover the whole screen

    bg.setScale(scale);
    bg.setDepth(-1);

    const closeButton = this.add
      .image(28, 100, "close")
      .setInteractive({ useHandCursor: true })
      .setOrigin(0, 1)
      .on("pointerdown", () => {
        bg.destroy();
        bg = null;
        this.scene.stop("LeaderboardScene");
        this.scene.start("MenuScene");
      });

    closeButton.displayWidth = 100;
    closeButton.displayHeight = 100;
    closeButton.rotation = Phaser.Math.DegToRad(320);

    this.add
      .text(this.sys.game.config.width / 2, 48, "Leaderboard", {
        ...this.baseTextStyle,
        fontSize: "34px",
        wordWrap: {
          width: this.scale.width - 100,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(
        this.sys.game.config.width / 2,
        100,
        `#\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Player\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Score`,
        {
          ...this.baseTextStyle,
          wordWrap: {
            width: this.scale.width - 100,
            useAdvancedWrap: true,
          },
        }
      )
      .setOrigin(0.5, 0);

    const menuContainer = this.add.container(
      this.sys.game.config.width / 2,
      145
    );

    // ----- Fetch top players from contract -----
    const response = await fetch("/api/get-leaderboard.json?offset=0&limit=5");

    const data = await response.json();

    // Espaciado vertical
    let offsetY = 0;
    data.tx.forEach((player, index) => {
      const option = this.add
        .text(
          0,
          offsetY,
          `${
            index + 1
          }\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${
            player.name
          }\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${
            player.score
          }`,
          {
            ...this.baseTextStyle,
            wordWrap: {
              width: this.scale.width - 100,
              useAdvancedWrap: true,
            },
          }
        )
        .setOrigin(0.5, 0)
        .setInteractive();

      // Agregar al contenedor
      menuContainer.add(option);

      // Aumentar Y para la siguiente línea
      offsetY += option.height + 7; // margen de 10px entre textos
    });
  }
}
