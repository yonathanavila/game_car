import Phaser from "phaser";
import BBCodeTextPlugin from "phaser3-rex-plugins/plugins/bbcodetext-plugin.js";
import TextEditPlugin from "phaser3-rex-plugins/plugins/textedit-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import BootScene from "@/components/phaser/scenes/BootScene";
import ConfigurationScene from "@/components/phaser/scenes/ConfigurationScene";
import GameOverScene from "@/components/phaser/scenes/GameOver";
import GameScene from "@/components/phaser/scenes/GameScene";
import LeaderboardScene from "@/components/phaser/scenes/LeaderBoard";
import MenuScene from "@/components/phaser/scenes/MenuScene";
import PauseScene from "@/components/phaser/scenes/PauseScene";
import RepairScene from "@/components/phaser/scenes/RepairScene";
import UIScene from "@/components/phaser/scenes/UIScene";

export default class Game extends Phaser.Game {
  constructor() {
    var config = {
      type: Phaser.AUTO,
      pixelArt: true,
      width: 434,
      height: 700,
      parent: "game-container",
      dom: {
        createContainer: true,
      },
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
        GameOverScene,
      ],
      plugins: {
        scene: [
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            mapping: "rexVirtualJoystick",
          },
        ],
        global: [
          {
            key: "rexBBCodeTextPlugin",
            plugin: BBCodeTextPlugin,
            start: true,
          },
          {
            key: "rexTextEdit",
            plugin: TextEditPlugin,
            start: true, // so you can call this.plugins.get("rexTextEdit")
          },
        ],
      },
    };

    super(config);
  }
}
