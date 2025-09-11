import { damageInfo } from "@/const";
import assetsData from "@/assets/data/assets.json";
import { calculateCurrentLife } from "@/services/Global";
import animationsData from "@/assets/data/animations.json";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.selectedCarKey = "car_taxi";
    this.player = null;
    this.cursors = null;
    this.joystick = null;
    this.isDesktop = true;
    this.player_config = null;

    this.clients = 0;
    this.damage = 0;
    this.damageInfo = damageInfo;
    this.score = 0;

    // params
    this.npcX = [36, 400];
    this.speed = 300;
    this.sidewalkWidth = 100;
    this.carKm = 0;
    this.totalLife = 19700; //
    this.carImageShown = false;

    // money
    this.balance = 0;
    // [minRate, maxRate]
    this.ratePerKm = [20, 80];
  }

  preload() {
    // Find the asset group (folder) that contains the selectedCarKey
    const group = assetsData.find((g) =>
      g.files.some((file) => file.key === this.selectedCarKey)
    );

    if (!group) {
      console.error(`No asset group found for key: ${this.selectedCarKey}`);
      return;
    }

    // Find the specific file info inside that group
    this.player_config = group.files.find(
      (file) => file.key === this.selectedCarKey
    );

    if (!this.player_config) {
      console.error(`No asset file found for key: ${this.selectedCarKey}`);
      return;
    }

    // Load the sprite sheet or image for the selected car only
    if (this.player_config.type === "image" && this.player_config.frameConfig) {
      this.load.spritesheet(
        this.player_config.key,
        this.player_config.path,
        this.player_config.frameConfig
      );
    } else if (this.player_config.type === "image") {
      this.load.image(this.player_config.key, this.player_config.path);
    }

    this.load.spritesheet("motorcycle", "images/motorcycle/motorcycle.png", {
      frameWidth: 63.9,
      frameHeight: 77,
    });
  }

  create() {
    this.bgMusic = this.sound.add("bgAudio", { loop: true, volume: 0.5 });
    this.bgMusic.play();
    this.engineStartSound = this.sound.add("engineStart", {
      loop: false,
      volume: 0.5,
    });
    this.engineStartSound.play();

    this.registry.set("clients", 0);
    this.registry.set("damage", 0);

    const pauseButton = this.add
      .sprite(this.sys.game.config.width - 60, 30, "button_pause", 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // 1️⃣ Calculate score here
        const score = this.carKm * this.clients;

        pauseButton.setFrame(1);
        this.scene.pause();
        this.scene.launch("PauseScene", { score: score });
      })
      .on("pointerup", () => {
        pauseButton.setFrame(2);
      });
    pauseButton.setDepth(2);
    pauseButton.displayHeight = 50;
    pauseButton.displayWidth = 100;

    // registry init
    this.registry.set("clients", 0);
    this.registry.set("damage", 0);
    this.registry.set("balance", 0);
    this.registry.set("carKm", 0);

    // Start the UI scene on top of the GameScene
    this.scene.launch("UIScene");

    // Detect platform
    this.isDesktop = this.sys.game.device.os.desktop;

    if (this.isDesktop) {
      // Desktop: enable keyboard
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      // Mobile: enable joystick
      this.joystick = this.rexVirtualJoystick.add(this, {
        x: this.sys.game.config.width / 2,
        y: this.sys.game.config.height - 100,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 25, 0xcccccc),
      });

      this.joystick.base.setAlpha(0.4); // 50% transparent base
      this.joystick.thumb.setAlpha(0.6); // 70% transparent thumb
      this.joystick.base.setDepth(1);
      this.joystick.thumb.setDepth(1);
      this.joystickForceText = this.add.text(300, 50, "");
    }

    // Create the street
    this.streetTiles = [];
    const streetHeight = this.textures.get("street").getSourceImage().height;
    const screenHeight = this.scale.height;
    for (let i = 0; i < 5; i++) {
      const tile = this.add
        .image(0, screenHeight - (i + 1) * streetHeight, "street")
        .setOrigin(0, 0)
        .setScale(1.24);
      tile.setDepth(-3);
      this.streetTiles.push(tile);
    }

    // Filter animations for selectedCarKey only
    const filteredAnims = animationsData.filter(
      (anim) => anim.assetKey === this.selectedCarKey
    );
    filteredAnims.forEach((anim) => {
      const frames = Array.isArray(anim.frames || anim.frame)
        ? anim.frames || anim.frame
        : [anim.frames || anim.frame];

      this.anims.create({
        key: anim.key,
        frames: this.anims.generateFrameNumbers(this.selectedCarKey, {
          frames,
        }),
        frameRate: anim.frameRate,
        repeat: anim.repeat ?? -1,
      });
    });

    // Potholes Group
    this.potholes = this.physics.add.group();
    for (let i = 0; i < 4; i++) {
      this.spawnPothole.call(this, this.speed);
    }

    // Player
    this.player = this.physics.add.sprite(
      window.innerWidth / 2,
      window.innerHeight,
      this.selectedCarKey
    );
    this.player.setScale(2.5);
    this.player.setCollideWorldBounds(true);

    // Player hitbox
    const hitboxWidth = this.player.width * this.player_config["hitbox"].width;
    const hitboxHeight =
      this.player.height * this.player_config["hitbox"].height;
    const offsetX = (this.player.width - hitboxWidth) / 2;
    const offsetY = (this.player.height - hitboxHeight) / 2;
    this.player.body.setSize(hitboxWidth, hitboxHeight);
    this.player.body.setOffset(offsetX, offsetY);

    // Collisions with potholes
    this.physics.add.overlap(
      this.player,
      this.potholes,
      this.handleCollision,
      null,
      this
    );

    // NPC
    this.npcGroup = this.physics.add.group();
    this.taxiStopGroup = this.physics.add.group();

    // Overlaps added ONCE here
    this.physics.add.overlap(
      this.player,
      this.npcGroup,
      this.handleNPCPickup,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.taxiStopGroup,
      this.handleTaxiStopCollision,
      null,
      this
    );

    // First client
    this.spawnClient(this);

    // Life
    this.currentLife = calculateCurrentLife(this);

    // create a group for motorcycles
    this.motorcycles = this.add.group();

    // collission with motorcycle
    this.physics.add.overlap(
      this.player,
      this.motorcycles,
      this.motorcycleCollision,
      null,
      this
    );

    // spawn motorcycles every 1.5 seconds
    this.time.addEvent({
      delay: Phaser.Math.Between(3000, 12000),
      callback: () => this.spawnMotorcycle(),
      loop: true,
    });
  }

  update(time, delta) {
    if (this.isDesktop) {
      // Desktop movement with keyboard
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-260);
        const leftKey = `${this.selectedCarKey}_left`;
        if (this.player.anims.currentAnim?.key !== leftKey) {
          this.player.anims.play(leftKey, true);
        }
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(260);
        const rightKey = `${this.selectedCarKey}_right`;
        if (this.player.anims.currentAnim?.key !== rightKey) {
          this.player.anims.play(rightKey, true);
        }
      } else {
        this.player.setVelocityX(0);
        const turnKey = `${this.selectedCarKey}_turn`;
        if (this.player.anims.currentAnim?.key !== turnKey) {
          this.player.anims.play(turnKey);
        }
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    } else {
      // Mobile movement with joystick
      let forceX = this.joystick.forceX;
      let forceY = this.joystick.forceY;

      if (forceX < -0.1) {
        this.player.setVelocityX(-260);
        const leftKey = `${this.selectedCarKey}_left`;
        if (this.player.anims.currentAnim?.key !== leftKey) {
          this.player.anims.play(leftKey, true);
        }
      } else if (forceX > 0.1) {
        this.player.setVelocityX(260);
        const rightKey = `${this.selectedCarKey}_right`;
        if (this.player.anims.currentAnim?.key !== rightKey) {
          this.player.anims.play(rightKey, true);
        }
      } else {
        this.player.setVelocityX(0);
        const turnKey = `${this.selectedCarKey}_turn`;
        if (this.player.anims.currentAnim?.key !== turnKey) {
          this.player.anims.play(turnKey);
        }
      }

      if (forceY < -0.5 && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    }
    // increase the pothole velocity

    this.potholes.getChildren().forEach((pothole) => {
      pothole.body.setVelocityY(this.speed);
    });

    // Convert delta to seconds
    const dt = delta / 1000;

    const speedKmPerSec = 20;
    this.carKm += speedKmPerSec * dt;
    this.registry.set("carKm", this.carKm);

    // // Tool button once
    // if (!this.carImageShown) {
    //   this.carImageShown = true;
    //   const carButton = this.add
    //     .sprite(this.sys.game.config.width - 60, 100, "button_tool", 0)
    //     .setInteractive({ useHandCursor: true })
    //     .on("pointerdown", () => {
    //       carButton.setFrame(1);
    //       this.scene.start("RepairScene");
    //     })
    //     .on("pointerup", () => carButton.setFrame(2));
    //   carButton.displayHeight = 50;
    //   carButton.displayWidth = 100;
    // }

    // Scroll street
    this.streetTiles.forEach((tile) => (tile.y += this.speed * dt));
    this.streetTiles.forEach((tile) => {
      if (tile.y >= this.sys.game.config.height) {
        const highest = this.streetTiles.reduce((p, c) => (c.y < p.y ? c : p));
        tile.y = highest.y - tile.height;
      }
    });

    // Recycle obstacles
    this.potholes.getChildren().forEach((pothole) => {
      if (pothole.y > this.sys.game.config.height + 50) {
        // Pick a new random pothole frame
        const potholeFrame = Phaser.Utils.Array.GetRandom([
          "bache_4",
          "bache_5",
        ]);

        // Change the texture
        pothole.setTexture(potholeFrame);

        // Adjust hitbox if needed
        const hitboxWidth = pothole.width * 0.6; // adjust based on scale
        const hitboxHeight = pothole.height * 0.8;
        const offsetX = (pothole.width - hitboxWidth) / 2;
        const offsetY = (pothole.height - hitboxHeight) / 2;
        pothole.body.setSize(hitboxWidth, hitboxHeight);
        pothole.body.setOffset(offsetX, offsetY);

        pothole.y = Phaser.Math.Between(-window.innerHeight, -100);
        pothole.x = Phaser.Math.Between(
          this.sidewalkWidth,
          434 - this.sidewalkWidth
        );
      }
    });

    // Despawn taxi stops off screen
    this.taxiStopGroup.getChildren().forEach((stop) => {
      if (stop.active && stop.y > this.sys.game.config.height + 50)
        stop.destroy();
    });

    // Despawn NPCs off screen
    this.npcGroup.getChildren().forEach((npc) => {
      if (npc.active && npc.y > this.sys.game.config.height + 50) npc.destroy();
    });

    // Sidewalk penalty
    const roadLeft = this.sidewalkWidth;
    const roadRight = 434 - this.sidewalkWidth;
    const playerX = this.player.x;
    if (playerX < roadLeft || playerX > roadRight) {
      this.onSidewalk = true;
      if (this.carLife < 0) this.carLife = 0;
      this.damage += 10 * (delta / 700);
      let displayDamage = Math.round(this.damage);
      this.registry.set("damage", displayDamage);
    } else if (this.onSidewalk) {
      this.onSidewalk = false;
      // console.log("✅ Player returned to the road");
    }

    // check for NPCs that go off-screen (missed)
    this.npcGroup.getChildren().forEach((npc) => {
      if (npc.y > this.sys.game.config.height) {
        npc.destroy();

        // respawn a new NPC after delay
        const delay = Phaser.Math.Between(3000, 12000);
        this.time.delayedCall(delay, () => this.spawnClient());
      }
    });

    // check for Taxi Stop that go off-screen (missed)
    this.taxiStopGroup.getChildren().forEach((taxiStop) => {
      if (taxiStop.y > this.sys.game.config.height) {
        taxiStop.destroy();

        // respawn a new Taxi Stop after delay
        const delay = Phaser.Math.Between(3000, 12000);
        this.time.delayedCall(delay, () => this.spawnClient());
      }
    });

    // Check if damage reached total life
    if (this.damage >= this.totalLife) {
      this.damage = this.totalLife; // optional, clamp value
      this.scene.start("GameOverScene"); // launch Game Over scene
    }
  }

  // ======================
  // Spawn Potholes Function
  // ======================
  spawnPothole(speed) {
    const potholeFrame = this.getRandomFrame(this, ["bache_4", "bache_5"]);
    const x = Phaser.Math.Between(this.sidewalkWidth, 434 - this.sidewalkWidth);
    const y = Phaser.Math.Between(-600, -100);
    const pothole = this.potholes.create(x, y, potholeFrame["randomKey"]);
    pothole.setScale(0.452);

    const hitboxWidth = pothole.width * 0.6;
    const hitboxHeight = pothole.height * 0.8;
    const offsetX = (pothole.width - hitboxWidth) / 2;
    const offsetY = (pothole.height - hitboxHeight) / 2;
    pothole.body.setSize(hitboxWidth, hitboxHeight);
    pothole.body.setOffset(offsetX, offsetY);

    pothole.body.setVelocityY(speed);
    pothole.body.allowGravity = false;
    pothole.body.immovable = true;
  }

  spawnClient() {
    const npcKey = ["npc_1", "npc_2", "npc_3", "npc_4"];
    const randomKey = Phaser.Utils.Array.GetRandom(npcKey);
    let x = Phaser.Utils.Array.GetRandom(this.npcX);

    const npc = this.npcGroup.create(x, 0, randomKey);
    npc.body.allowGravity = false;
    npc.setVelocityY(this.speed);
    npc.setDepth(-1);
  }

  spawnTaxiStop() {
    const x = Phaser.Utils.Array.GetRandom(this.npcX);
    const stop = this.taxiStopGroup.create(x, 0, "taxi_stop");
    stop.setScale(0.53);
    stop.setDepth(-1);
    stop.body.setAllowGravity(false);
    stop.body.setVelocityY(this.speed);
    return stop;
  }

  handleCollision(player) {
    if (player.blinkEvent) {
      player.blinkEvent.remove();
      player.clearTint();
    }

    let elapsed = 0;
    this.carLife -= 100;
    if (this.carLife < 0) this.carLife = 0;

    this.damage += 20;
    let displayDamage = Math.round(this.damage);
    this.registry.set("damage", displayDamage);

    player.blinkEvent = player.scene.time.addEvent({
      delay: 200,
      callback: () => {
        if (player.tintTopLeft === 0xff0000) player.clearTint();
        else player.setTint(0xff0000);

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

  handleNPCPickup(player, npc) {
    if (!npc.active) return;

    npc.destroy();

    // spawn taxi stop after a small random delay (or 0)
    const delayedCall = Phaser.Math.Between(3000, 12000);
    this.time.delayedCall(delayedCall, () => this.spawnTaxiStop());
  }

  handleTaxiStopCollision(player, stop) {
    if (!stop.active) return;

    // increase the game speed
    this.speed += 50;

    // money: use FloatBetween for decimals
    const earned = Phaser.Math.FloatBetween(
      this.ratePerKm[0],
      this.ratePerKm[1]
    );
    this.balance += earned;

    this.clients += 1;
    this.registry.set("clients", this.clients);
    this.registry.set("balance", this.balance);

    stop.destroy();

    // spawn next client after random delay
    const delay = Phaser.Math.Between(3000, 12000);
    this.time.delayedCall(delay, () => this.spawnClient());
  }

  getRandomFrame(context, assets) {
    const randomKey = Phaser.Utils.Array.GetRandom(assets);
    const width = context.textures.get(randomKey).getSourceImage().width;
    return { width, randomKey };
  }

  spawnMotorcycle() {
    // random x position
    const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
    const y = this.cameras.main.height + 50;

    // get an existing motorcycle from the group, or create a new one
    let moto = this.motorcycles.getFirstDead();

    if (!moto) {
      moto = this.physics.add.sprite(x, y, "motorcycle");
      this.motorcycles.add(moto);

      // desactivar gravedad y que no se mueva automáticamente
      moto.body.setAllowGravity(false);
      moto.body.setImmovable(true);
    } else {
      moto.setPosition(x, y);
      moto.setActive(true);
      moto.setVisible(true);
    }

    moto.setSize(35, 65);
    moto.setOffset(0, 0);

    this.bgMusic = this.sound.add("motorcycle", { loop: false, volume: 0.3 });
    this.bgMusic.play();

    // animate motorcycle upward
    this.tweens.add({
      targets: moto,
      y: -50,
      duration: 2500,
      ease: "Linear",
      onComplete: () => {
        moto.setActive(false);
        moto.setVisible(false);
      },
    });
  }

  motorcycleCollision(player) {
    if (player.blinkEvent) {
      player.blinkEvent.remove();
      player.clearTint();
    }

    let elapsed = 0;
    this.carLife -= 200;
    if (this.carLife < 0) this.carLife = 0;

    this.damage += 20;
    let displayDamage = Math.round(this.damage);
    this.registry.set("damage", displayDamage);

    player.blinkEvent = player.scene.time.addEvent({
      delay: 200,
      callback: () => {
        if (player.tintTopLeft === 0xff0000) player.clearTint();
        else player.setTint(0xff0000);

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
}
