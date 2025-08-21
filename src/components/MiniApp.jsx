import Phaser from "phaser";

import assetsData from "@/assets/data/assets.json";
import animationsData from "@/assets/data/animations.json";

export default function Game() {
  var config = {
    type: Phaser.AUTO,
    pixelArt: true,

    width: window.innerWidth,
    height: window.innerHeight,
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
  };

  let selectedCarKey = "car_green"; // or dynamically assigned

  let player;
  let npc;
  let cursors;
  var player_config;
  var game = new Phaser.Game(config);
  var clients = 0;
  var damage = 0;
  var scoreText;
  var damageText;

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
    this.load.image("street", "images/street/street_us.png");
  }

  function create() {
    var speed = 250; // Speed for obstacles

    // Create the street
    this.streetTiles = [];

    const streetHeight = this.textures.get("street").getSourceImage().height;

    // Create 3 vertical tiles
    for (let i = 0; i < 10; i++) {
      const tile = this.add
        .image(0, i * -streetHeight, "street")
        .setOrigin(0, 0)
        .setScale(1.24);
      this.streetTiles.push(tile);
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
    // Obstacles Group
    // ======================
    this.obstacles = this.physics.add.group();

    // Spawn the first few obstacles
    for (let i = 0; i < 5; i++) {
      spawnObstacle.call(this, speed);
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
    const scale = window.innerWidth / 160; // Adjust the scale factor as needed
    player.setScale(scale);
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
      this.obstacles,
      handleCollision,
      null,
      this
    );

    cursors = this.input.keyboard.createCursorKeys();

    // ======================
    // NPC
    // ======================
    // add single sprite
    npc = this.physics.add.sprite(40, 100, "npc_1");

    // disallow gravity
    npc.body.allowGravity = false;

    // add velocity in the axi Y
    npc.setVelocityY(speed);

    // Collisions with NPC
    this.physics.add.overlap(player, npc, handleNPCCollision, null, this);

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
  function update() {
    const scrollSpeed = 2;

    this.streetTiles.forEach((tile) => {
      tile.y += scrollSpeed;
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

    // Player movement
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

    // Recycle obstacles
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > this.sys.game.config.height + 100) {
        obstacle.y = Phaser.Math.Between(-window.innerHeight, -100);
        obstacle.x = Phaser.Math.Between(100, window.innerWidth - 100);
      }
    });
  }

  // ======================
  // Spawn Obstacle Function
  // ======================
  function spawnObstacle(speed) {
    // Pick a random key from the available obstacle textures
    const obstacleKeys = ["bache_4", "bache_5"];

    const randomKey = Phaser.Utils.Array.GetRandom(obstacleKeys);

    const bacheFrame = this.textures.get(randomKey).getSourceImage();

    const obstacleWidth = bacheFrame.width;
    const obstacleHeight = bacheFrame.height;

    const x = Phaser.Math.Between(
      obstacleWidth / 2,
      window.innerWidth - obstacleWidth / 2
    );
    const y = Phaser.Math.Between(-600, -100);

    const obstacle = this.obstacles.create(x, y, randomKey);

    // scale the obstacle to fit the screen width
    obstacle.setScale(window.innerWidth / 850);

    const hitboxWidth = obstacle.width * 0.6;
    const hitboxHeight = obstacle.height * 0.8;

    const offsetX = (obstacle.width - hitboxWidth) / 2;
    const offsetY = (obstacle.height - hitboxHeight) / 2;
    obstacle.body.setSize(hitboxWidth, hitboxHeight);
    obstacle.body.setOffset(offsetX, offsetY);

    // Use physics velocity so it matches lines
    obstacle.body.setVelocityY(speed);
    obstacle.body.allowGravity = false;
    obstacle.body.immovable = true;
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

  function handleNPCCollision(player, npc) {
    if (npc.collided) return;
    console.log("NPC Collision Detected");
    clients += 1;
    scoreText.setText("Clients: " + clients);

    npc.collided = true;
  }

  return <div id="game-container"></div>;
}
