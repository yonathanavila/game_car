import Phaser from "phaser";

import { callRead } from "@/services/Contract"; // your web3 helper

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
    this.load.image("close", "/images/close.webp");

    this.load.image("background", "images/leaderboard.webp");
  }

  async create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);

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
        this.scene.stop("LeaderboardScene");
        this.scene.start("MenuScene");
      });

    closeButton.displayWidth = 100;
    closeButton.displayHeight = 100;
    closeButton.rotation = Phaser.Math.DegToRad(320);

    const title = this.add.text(97, 48, "Leaderboard", {
      ...this.baseTextStyle,
      fontSize: "34px",
      wordWrap: {
        width: this.scale.width - 100,
        useAdvancedWrap: true,
      },
    });

    const menuContainer = this.add.container(160, 145);

    // ----- Fetch top players from contract -----
    let topPlayers = await callRead(); // array of addresses

    // Filter out empty or zero addresses
    topPlayers = topPlayers[0].filter(
      (addr) => addr && addr !== "0x0000000000000000000000000000000000000000"
    );

    console.log(topPlayers);

    // Take first 5 valid addresses
    this.menuItems = topPlayers.slice(0, 5);

    // Espaciado vertical
    let offsetY = 0;
    this.menuItems.forEach((address) => {
      const option = this.add
        .text(0, offsetY, this.shortenAddress(address), {
          ...this.baseTextStyle,
          wordWrap: {
            width: this.scale.width - 100,
            useAdvancedWrap: true,
          },
        })
        .setOrigin(0, 0)
        .setInteractive();

      // Agregar al contenedor
      menuContainer.add(option);

      // Aumentar Y para la siguiente línea
      offsetY += option.height + 7; // margen de 10px entre textos
    });
  }

  shortenAddress(address) {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
}
