import Phaser from "phaser";

import { callReadTopPlayers } from "@/services/Contract";
import { shortenAddress } from "@/lib/utils"; // your web3 helper

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

    const title = this.add.text(100, 48, "Leaderboard", {
      ...this.baseTextStyle,
      fontSize: "34px",
      wordWrap: {
        width: this.scale.width - 100,
        useAdvancedWrap: true,
      },
    });

    const menuContainer = this.add.container(120, 145);

    // ----- Fetch top players from contract -----
    let topPlayers = await callReadTopPlayers(); // array of addresses

    // Filter out empty or zero addresses
    topPlayers = topPlayers[0].filter(
      (addr) => addr && addr !== "0x0000000000000000000000000000000000000000"
    );

    // Take first 5 valid addresses
    this.menuItems = topPlayers.slice(0, 5);

    // Espaciado vertical
    let offsetY = 0;
    this.menuItems.forEach((address, index) => {
      const option = this.add
        .text(0, offsetY, `${index + 1} ${shortenAddress(address)}`, {
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
}
