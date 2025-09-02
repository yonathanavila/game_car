import Phaser from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import UIScene from "@/components/phaser/scenes/UIScene";
import MenuScene from "@/components/phaser/scenes/MenuScene";
import GameScene from "@/components/phaser/scenes/GameScene";
import BootScene from "@/components/phaser/scenes/BootScene";
import PauseScene from "@/components/phaser/scenes/PauseScene";
import RepairScene from "@/components/phaser/scenes/RepairScene";
import LeaderboardScene from "@/components/phaser/scenes/LeaderBoard";
import ConfigurationScene from "@/components/phaser/scenes/ConfigurationScene";

export default class Game extends Phaser.Game {
  constructor() {
    var config = {
      type: Phaser.AUTO,
      pixelArt: true,
      width: 434,
      height: 700,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scale: {
        parent: "game-container",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [
        BootScene,
        MenuScene,
        GameScene,
        UIScene,
        RepairScene,
        PauseScene,
        ConfigurationScene,
        LeaderboardScene,
      ],
      plugins: {
        scene: [
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            mapping: "rexVirtualJoystick",
          },
        ],
      },
    };

    super(config);
  }
}
