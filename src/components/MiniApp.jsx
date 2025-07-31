import Phaser from "phaser";

import assetsData from "../assets/data/assets.json";
import animationsData from "../assets/data/animations.json";

export default function Game() {
  var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
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
  var game = new Phaser.Game(config);

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
    const selectedFile = group.files.find(
      (file) => file.key === selectedCarKey
    );

    if (!selectedFile) {
      console.error(`No asset file found for key: ${selectedCarKey}`);
      return;
    }

    // Load the sprite sheet or image for the selected car only
    if (selectedFile.type === "image" && selectedFile.frameConfig) {
      this.load.spritesheet(
        selectedFile.key,
        `/${group.path}/${selectedFile.url}`,
        selectedFile.frameConfig
      );
    } else if (selectedFile.type === "image") {
      this.load.image(selectedFile.key, `/${group.path}/${selectedFile.url}`);
    }

    // Load other assets you need
    this.load.image("limit", "images/limit.png");
    this.load.image("bache_2", "images/bache_2.webp");
    this.load.image("bache", "images/bache.webp");
  }

  function create() {
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

    this.obstacles = this.physics.add.group();

    // Spawn the first few obstacles
    for (let i = 0; i < 5; i++) {
      spawnObstacle.call(this);
    }

    // make infinite splite white lines
    this.spliteWhiteLine = [];
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(
        this.scale.width / 2,
        i * 80,
        10,
        40,
        0xffffff
      );
      this.spliteWhiteLine.push(dash);
    }

    // make infinite splite yellow lines left
    this.spliteYellowLineLeft = this.physics.add.staticGroup();
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(5, i * 80, 10, 50, 0xffff00);

      this.spliteYellowLineLeft.add(dash, true);
    }

    // make infinite splite yellow lines right
    this.spliteYellowLineRight = this.physics.add.staticGroup();
    for (let i = 0; i < 26; i++) {
      const dash = this.add.rectangle(
        window.innerWidth - 5,
        i * 80,
        10,
        50,
        0xffff00
      );

      this.spliteYellowLineRight.add(dash, true);
    }

    // Create player sprite with selectedCarKey
    player = this.physics.add.sprite(
      window.innerWidth / 2,
      window.innerHeight,
      selectedCarKey
    );
    player.setScale(3.5);
    player.setCollideWorldBounds(true);

    // // Adjust the physics body to match the scaled size:

    player.body.setOffset(
      (player.width * player.scaleX - player.displayWidth) / 2,
      (player.height * player.scaleY - player.displayHeight) / 2
    );

    const carKey = selectedCarKey; // like "car_blue_2"

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, this.spliteWhiteLine);
    // Add collision between player and obstacles
    this.physics.add.overlap(
      player,
      this.obstacles,
      handleCollision,
      null,
      this
    );
  }

  function update(time, delta) {
    if (cursors.left.isDown) {
      player.setVelocityX(-340);
      const leftKey = `${selectedCarKey}_left`;
      if (player.anims.currentAnim?.key !== leftKey) {
        player.anims.play(leftKey, true);
      }
    } else if (cursors.right.isDown) {
      player.setVelocityX(340);

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

    // make infinite road

    const speed = 0.35 * delta;

    this.spliteWhiteLine.forEach((whiteLine) => {
      whiteLine.y += speed;

      if (whiteLine.y > this.sys.game.config.height) {
        whiteLine.y = 0;
      }
    });

    this.spliteYellowLineLeft.getChildren().forEach((dash) => {
      dash.y += speed;

      if (dash.y > this.sys.game.config.height) {
        dash.y = 0;
      }
    });

    this.spliteYellowLineRight.getChildren().forEach((dash) => {
      dash.y += speed;

      if (dash.y > this.sys.game.config.height) {
        dash.y = 0;
      }
    });

    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > this.sys.game.config.height + 100) {
        obstacle.y = Phaser.Math.Between(-600, -100);
        obstacle.x = Phaser.Math.Between(100, window.innerWidth - 100);
      }
    });
  }

  function spliteWhiteLine(positionX, positionY, { width, height, color }) {
    for (let i = 0; i < 10; i++) {
      const dash = this.add.rectangle(
        positionX,
        positionY,
        width,
        height,
        color
      );
      this.dashes.push(dash);
    }
  }

  function spawnObstacle() {
    const bacheFrame = this.textures.get("bache_2").getSourceImage();
    const obstacleWidth = bacheFrame.width;
    const obstacleHeight = bacheFrame.height;

    const x = Phaser.Math.Between(
      obstacleWidth / 2,
      window.innerWidth - obstacleWidth / 2
    );
    const y = Phaser.Math.Between(-600, -100);

    const obstacle = this.obstacles.create(x, y, "bache_2");
    // obstacle.setScale(0.8);
    obstacle.body.setSize(obstacle.displayWidth, obstacle.displayHeight);
    obstacle.body.setOffset(
      (obstacle.width * obstacle.scaleX - obstacle.displayWidth) / 2,
      (obstacle.height * obstacle.scaleY - obstacle.displayHeight) / 2
    );
    obstacle.body.setVelocityY(350);
    obstacle.body.setImmovable(true);
    obstacle.body.allowGravity = false;
  }

  function handleCollision(player, obstacle) {
    console.log("Collision detected!");
    // this.physics.pause();
    player.setTint(0xff0000);
    // player.anims.stop();
    console.log("Game Over!");
  }

  return <></>;
}
