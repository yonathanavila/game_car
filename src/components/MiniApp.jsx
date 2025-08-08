import Phaser from "phaser";

import assetsData from "../assets/data/assets.json";
import animationsData from "../assets/data/animations.json";

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

  var player;
  let cursors;
  var player_config;
  var game = new Phaser.Game(config);

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
    console.log(this.textures.get(selectedCarKey).frameTotal);

    // Load other assets you need
    this.load.image("bache_2", "images/bache_2.webp");
  }

  function create() {
    var speed = 250; // Speed for obstacles

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
    // 1️⃣ Obstacles Group
    // ======================
    this.obstacles = this.physics.add.group();

    // Spawn the first few obstacles
    for (let i = 0; i < 5; i++) {
      spawnObstacle.call(this, speed);
    }

    // ======================
    // 2️⃣ White center lines (Physics Group)
    // ======================
    this.spliteWhiteLineGroup = this.physics.add.group();
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(
        this.scale.width / 2,
        i * 80,
        10,
        40,
        0xffffff
      );
      this.spliteWhiteLineGroup.add(dash);
      dash.body.setVelocityY(speed);
      dash.body.allowGravity = false;
      dash.body.immovable = true;
    }

    // ======================
    // 3️⃣ Yellow left lines (Physics Group)
    // ======================
    this.spliteYellowLineLeftGroup = this.physics.add.group();
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(5, i * 80, 10, 50, 0xffff00);
      this.spliteYellowLineLeftGroup.add(dash);
      dash.body.setVelocityY(speed);
      dash.body.allowGravity = false;
      dash.body.immovable = true;
    }

    // ======================
    // 4️⃣ Yellow right lines (Physics Group)
    // ======================
    this.spliteYellowLineRightGroup = this.physics.add.group();
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(
        window.innerWidth - 5,
        i * 80,
        10,
        50,
        0xffff00
      );
      this.spliteYellowLineRightGroup.add(dash);
      dash.body.setVelocityY(speed);
      dash.body.allowGravity = false;
      dash.body.immovable = true;
    }

    // ======================
    // 5️⃣ Player
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
  }

  // ======================
  // 6️⃣ Update Loop
  // ======================
  function update() {
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

    // Recycle white lines
    this.spliteWhiteLineGroup.getChildren().forEach((dash) => {
      if (dash.y > this.sys.game.config.height) {
        dash.y = 0;
      }
    });

    // Recycle yellow lines (left)
    this.spliteYellowLineLeftGroup.getChildren().forEach((dash) => {
      if (dash.y > this.sys.game.config.height) {
        dash.y = 0;
      }
    });

    // Recycle yellow lines (right)
    this.spliteYellowLineRightGroup.getChildren().forEach((dash) => {
      if (dash.y > this.sys.game.config.height) {
        dash.y = 0;
      }
    });

    // Recycle obstacles
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > this.sys.game.config.height + 100) {
        obstacle.y = Phaser.Math.Between(-window.innerHeight, -100);
        obstacle.x = Phaser.Math.Between(100, window.innerWidth - 100);
      }
    });
  }

  // ======================
  // 7️⃣ Spawn Obstacle Function
  // ======================
  function spawnObstacle(speed) {
    const bacheFrame = this.textures.get("bache_2").getSourceImage();
    const obstacleWidth = bacheFrame.width;
    const obstacleHeight = bacheFrame.height;

    const x = Phaser.Math.Between(
      obstacleWidth / 2,
      window.innerWidth - obstacleWidth / 2
    );
    const y = Phaser.Math.Between(-600, -100);

    const obstacle = this.obstacles.create(x, y, "bache_2");

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
    // console.log("Collision detected!");
    // // this.physics.pause();
    // player.setTint(0xff0000);
    // // player.anims.stop();
    // console.log("Game Over!");
  }

  return <div id="game-container"></div>;
}
