import Phaser from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import assetsData from "@/assets/data/assets.json";
import animationsData from "@/assets/data/animations.json";

export default function Game() {
  var config = {
    type: Phaser.AUTO,
    pixelArt: true,

    width: 434,
    height: window.innerHeight + 100,
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
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
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

  let selectedCarKey = "car_green"; // or dynamically assigned

  let player;
  let npc;
  let cursors;
  let joystick;
  let isDesktop;
  var player_config;
  var game = new Phaser.Game(config);
  var clients = 0;
  var damage = 0;
  var scoreText;
  var damageText;
  let taxiStop;

  // params
  let npcX = [36, 400];
  const speed = 200;
  const sidewalkWidth = 100;


  // Find the asset group (folder) that contains the selectedCarKey
  const group = assetsData.find((g) =>
    g.files.some((file) => file.key === selectedCarKey)
  );

  async function preload() {
    // Find the asset group (folder) that contains the selectedCarKey
    const group = assetsData.find((g) =>
      g.files.some((file) => file.key === selectedCarKey)
    );

    if (!group) {
      console.error(`No asset group found for key: ${selectedCarKey}`);
      return;
    }

    // Find the specific file info inside that group
    player_config = group.files.find((file) => file.key === selectedCarKey);

    if (!player_config) {
      console.error(`No asset file found for key: ${selectedCarKey}`);
      return;
    }

    // Load the sprite sheet or image for the selected car only
    if (player_config.type === "image" && player_config.frameConfig) {
      this.load.spritesheet(
        player_config.key,
        `/${group.path}/${player_config.url}`,
        player_config.frameConfig
      );
    } else if (player_config.type === "image") {
      this.load.image(player_config.key, `/${group.path}/${player_config.url}`);
    }

    // Load other assets you need
    this.load.image("bache_4", "images/pothole/bache_4.webp");
    this.load.image("bache_5", "images/pothole/bache_5.webp");
    this.load.image("npc_1", "images/npc/npc_1.webp");
    this.load.image("npc_2", "images/npc/npc_2.webp");
    this.load.image("npc_3", "images/npc/npc_3.webp");
    this.load.image("npc_4", "images/npc/npc_4.webp");

    this.load.image("street", "images/street/street_us.png");
    this.load.image("taxi_stop", "images/signal/taxi_stop.webp");
  }

  function create() {
    // Detect platform
    isDesktop = this.sys.game.device.os.desktop;

    if (isDesktop) {
      // Desktop: enable keyboard
      cursors = this.input.keyboard.createCursorKeys();
    } else {
      // Mobile: enable joystick
      joystick = this.rexVirtualJoystick.add(this, {
        x: this.sys.game.config.width / 2,
        y: this.sys.game.config.height - 100,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 25, 0xcccccc),
      });

      joystick.base.setAlpha(0.4); // 50% transparent base
      joystick.thumb.setAlpha(0.6); // 70% transparent thumb
      joystick.base.setDepth(1);
      joystick.thumb.setDepth(1);

      // Optional: show velocity vector for debugging
      this.joystickForceText = this.add.text(300, 50, "");
    }

    // Create the street
    this.streetTiles = [];

    const streetHeight = this.textures.get("street").getSourceImage().height;
    const screenHeight = this.scale.height;

    // Create vertical streets
    for (let i = 0; i < 5; i++) {
      const tile = this.add
        .image(0, screenHeight - (i + 1) * streetHeight, "street")
        .setOrigin(0, 0)
        .setScale(1.24);
      this.streetTiles.push(tile);
      tile.setDepth(-3);
    }

    // Filter animations for selectedCarKey only
    const filteredAnims = animationsData.filter(
      (anim) => anim.assetKey === selectedCarKey
    );

    // Create animations for selected car
    filteredAnims.forEach((anim) => {
      const frames = Array.isArray(anim.frames || anim.frame)
        ? anim.frames || anim.frame
        : [anim.frames || anim.frame];

      this.anims.create({
        key: anim.key,
        frames: this.anims.generateFrameNumbers(selectedCarKey, {
          frames,
        }),
        frameRate: anim.frameRate,
        repeat: anim.repeat ?? -1,
      });
    });

    // ======================
    // Potholes Group
    // ======================
    this.potholes = this.physics.add.group();

    // Spawn the first few obstacles
    for (let i = 0; i < 4; i++) {
      spawnPothole.call(this, speed);
    }

    // ======================
    // Player
    // ======================
    player = this.physics.add.sprite(
      window.innerWidth / 2,
      window.innerHeight,
      selectedCarKey
    );

    // Set the scale first
    player.setScale(2.5);
    player.setCollideWorldBounds(true);

    // Player hitbox
    const hitboxWidth = player.width * player_config["hitbox"].width;
    const hitboxHeight = player.height * player_config["hitbox"].height;
    const offsetX = (player.width - hitboxWidth) / 2;
    const offsetY = (player.height - hitboxHeight) / 2;
    player.body.setSize(hitboxWidth, hitboxHeight);
    player.body.setOffset(offsetX, offsetY);

    // Collisions with obstacles
    this.physics.add.overlap(
      player,
      this.potholes,
      handleCollision,
      null,
      this
    );

    // ======================
    // NPC
    // ======================
    spawnClient(this);

    // ======================
    // Score and Damage Text
    // ======================

    // The score text
    scoreText = this.add.text(16, 16, "Clients: 0", {
      fontFamily: "Minecraft",
      fontSize: "32px",
      fill: "#fff",
    });

    // The score text
    damageText = this.add.text(16, 60, "Damage: 0", {
      fontFamily: "Minecraft",
      fontSize: "32px",
      fill: "#fff",
    });
  }

  // ======================
  // Update Loop
  // ======================
  function update(time, delta) {
    if (isDesktop) {
      // Desktop movement with keyboard
      if (cursors.left.isDown) {
        player.setVelocityX(-260);
        const leftKey = `${selectedCarKey}_left`;
        if (player.anims.currentAnim?.key !== leftKey) {
          player.anims.play(leftKey, true);
        }
      } else if (cursors.right.isDown) {
        player.setVelocityX(260);
        const rightKey = `${selectedCarKey}_right`;
        if (player.anims.currentAnim?.key !== rightKey) {
          player.anims.play(rightKey, true);
        }
      } else {
        player.setVelocityX(0);
        const turnKey = `${selectedCarKey}_turn`;
        if (player.anims.currentAnim?.key !== turnKey) {
          player.anims.play(turnKey);
        }
      }

      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
      }
    } else {
      // Mobile movement with joystick
      let forceX = joystick.forceX;
      let forceY = joystick.forceY;

      if (forceX < -0.1) {
        player.setVelocityX(-260);
        const leftKey = `${selectedCarKey}_left`;
        if (player.anims.currentAnim?.key !== leftKey) {
          player.anims.play(leftKey, true);
        }
      } else if (forceX > 0.1) {
        player.setVelocityX(260);
        const rightKey = `${selectedCarKey}_right`;
        if (player.anims.currentAnim?.key !== rightKey) {
          player.anims.play(rightKey, true);
        }
      } else {
        player.setVelocityX(0);
        const turnKey = `${selectedCarKey}_turn`;
        if (player.anims.currentAnim?.key !== turnKey) {
          player.anims.play(turnKey);
        }
      }

      if (forceY < -0.5 && player.body.touching.down) {
        player.setVelocityY(-330);
      }
    }

    // Convert delta to seconds
    const dt = delta / 1000;

    this.streetTiles.forEach((tile) => {
      tile.y += speed * dt;
    });

    // Recycle tiles that move off screen
    this.streetTiles.forEach((tile) => {
      if (tile.y >= this.game.config.height) {

        // Find the tile currently highest (smallest y)
        const highestTile = this.streetTiles.reduce((prev, curr) =>
          curr.y < prev.y ? curr : prev
        );
        tile.y = highestTile.y - tile.height;
      }
    });

    // Recycle obstacles
    this.potholes.getChildren().forEach((pothole) => {
      if (pothole.y > this.sys.game.config.height + 50) {

        // Pick a new random pothole frame
        const potholeFrame = Phaser.Utils.Array.GetRandom(["bache_4", "bache_5"]);

        // Change the texture
        pothole.setTexture(potholeFrame);

        // adjust hitbox if needed
        const hitboxWidth = pothole.width * 0.6;  // adjust based on scale
        const hitboxHeight = pothole.height * 0.8;
        const offsetX = (pothole.width - hitboxWidth) / 2;
        const offsetY = (pothole.height - hitboxHeight) / 2;
        pothole.body.setSize(hitboxWidth, hitboxHeight);
        pothole.body.setOffset(offsetX, offsetY);

        pothole.y = Phaser.Math.Between(-window.innerHeight, -100);

        const axiX = Phaser.Math.Between(
          0 + sidewalkWidth, 434 - sidewalkWidth
        );

        pothole.x = axiX
        pothole.body.setVelocityY(speed);

      }
    });
  }

  // ======================
  // Spawn Potholes Function
  // ======================
  function spawnPothole(speed) {
    // Pick a random key from the available obstacle textures
    const potholeFrame = getRandomFrame(this, ["bache_4", "bache_5"]);
    const potholeWidth = potholeFrame["width"];

    const x = Phaser.Math.Between(
      sidewalkWidth,
      434 - sidewalkWidth
    );
    const y = Phaser.Math.Between(-600, -100);

    const pothole = this.potholes.create(x, y, potholeFrame["randomKey"]);

    // scale the pothole
    pothole.setScale(0.452);

    const hitboxWidth = pothole.width * 0.6;
    const hitboxHeight = pothole.height * 0.8;

    const offsetX = (pothole.width - hitboxWidth) / 2;
    const offsetY = (pothole.height - hitboxHeight) / 2;
    pothole.body.setSize(hitboxWidth, hitboxHeight);
    pothole.body.setOffset(offsetX, offsetY);

    // Use physics velocity so it matches lines
    pothole.body.setVelocityY(speed);
    pothole.body.allowGravity = false;
    pothole.body.immovable = true;
  }

  function handleCollision(player, obstacle) {
    if (player.blinkEvent) {
      player.blinkEvent.remove();
      player.clearTint();
    }

    let elapsed = 0;
    damage += 1;
    damageText.setText("Damage: " + damage);

    player.blinkEvent = player.scene.time.addEvent({
      delay: 200,
      callback: () => {
        if (player.tintTopLeft === 0xff0000) {
          player.clearTint();
        } else {
          player.setTint(0xff0000);
        }

        elapsed += 200;

        if (elapsed >= 2000) {
          player.clearTint();
          player.blinkEvent.remove();
          player.blinkEvent = null;
        }
      },
      loop: true,
    });
  }

  function handleNPCPickup() {
    if (npc.collided) return;

    npc.destroy();
    npc.collided = true;

    const delayedCall = Phaser.Math.Between(3000, 12000);

    this.time.delayedCall(delayedCall, () => {
      let x = Phaser.Utils.Array.GetRandom(npcX);

      // spawmn the taxi stop after 6seconds
      taxiStop = this.physics.add.sprite(x, 0, "taxi_stop");
      taxiStop.setScale(0.53);
      taxiStop.setDepth(-1);
      taxiStop.body.setAllowGravity(false);
      taxiStop.body.setVelocityY(speed);

      // Taxi stop
      this.physics.add.overlap(
        player,
        taxiStop,
        handleTaxiStopCollision,
        null,
        this
      );
    });
  }

  function handleTaxiStopCollision() {
    const delayedCall = Phaser.Math.Between(3000, 12000);
    clients += 1;

    scoreText.setText("Clients: " + clients);
    taxiStop.disableBody(true, true);

    this.time.delayedCall(delayedCall, () => {
      let x = Phaser.Utils.Array.GetRandom(npcX);

      spawnClient(this);
    });
  }

  function spawnClient(context) {
    const npcKey = ["npc_1", "npc_2", "npc_3", "npc_4"];
    const npcFrame = getRandomFrame(context, npcKey);
    let x = Phaser.Utils.Array.GetRandom(npcX);

    npc = context.physics.add.sprite(x, 0, npcFrame["randomKey"]);
    npc.body.allowGravity = false;
    npc.setVelocityY(speed);

    // NPC pickup
    context.physics.add.overlap(player, npc, handleNPCPickup, null, context);
  }

  function getRandomFrame(context, assets) {
    const randomKey = Phaser.Utils.Array.GetRandom(assets);
    const width = context.textures.get(randomKey).getSourceImage().width;

    return {
      width,
      randomKey,
    };
  }

  return <div id="game-container"></div>;
}
