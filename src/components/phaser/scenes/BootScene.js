import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Load other assets you need
    this.load.image("bache_4", "images/pothole/bache_4.webp");
    this.load.image("bache_5", "images/pothole/bache_5.webp");
    this.load.image("npc_1", "images/npc/npc_1.webp");
    this.load.image("npc_2", "images/npc/npc_2.webp");
    this.load.image("npc_3", "images/npc/npc_3.webp");
    this.load.image("npc_4", "images/npc/npc_4.webp");

    this.load.image("street", "images/street/street_us.png");
    this.load.image("taxi_stop", "images/signal/taxi_stop.webp");
    this.load.spritesheet("button_tool", "images/button/button_tool.webp", {
      frameWidth: 768,
      frameHeight: 405,
    });
    this.load.spritesheet("button_pause", "images/button/button_pause.webp", {
      frameWidth: 770,
      frameHeight: 409,
    });

    // Background music
    // this.load.audio(
    //   "bgMusic",
    //   "audio/music/Akatsuki_Rising_The_Mini_Vandals_compressed.mp3"
    // );
    // Engine start sound
    this.load.audio(
      "engineStart",
      "audio/engine_start/Muscle Car Start Rev and Idle_damage_car_started_compressed-[AudioTrimmer.com].mp3"
    );

    // Motorcycle

    this.load.audio("motorcycle", "audio/effects/Motorcycle.mp3");

    // bg music
    this.load.audio(
      "bgAudio",
      "audio/music/Resolution Or Reflection - The Grey Room _ Clark Sims_compressed.mp3"
    );
    // Game over music
    // this.load.audio("gameOver", "assets/sounds/game_over.mp3");
  }

  create() {
    // Once assets are ready, go to menu
    this.scene.start("MenuScene");
  }
}
