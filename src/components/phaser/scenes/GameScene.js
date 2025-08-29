import assetsData from "@/assets/data/assets.json";
import animationsData from "@/assets/data/animations.json";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });

        this.selectedCarKey = "car_green";
        this.player;
        this.npc;
        this.cursors;
        this.joystick;
        this.isDesktop;
        this.player_config;
        this.clients = 0;
        this.damage = 0;
        this.taxiStop;

        // params
        this.npcX = [36, 400];
        this.speed = 200;
        this.sidewalkWidth = 100;
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
        this.player_config = group.files.find((file) => file.key === this.selectedCarKey);

        if (!this.player_config) {
            console.error(`No asset file found for key: ${this.selectedCarKey}`);
            return;
        }

        // Load the sprite sheet or image for the selected car only
        if (this.player_config.type === "image" && this.player_config.frameConfig) {
            this.load.spritesheet(
                this.player_config.key,
                `/${group.path}/${this.player_config.url}`,
                this.player_config.frameConfig
            );
        } else if (this.player_config.type === "image") {
            this.load.image(this.player_config.key, `/${group.path}/${this.player_config.url}`);
        }

    }

    create() {
        this.registry.set("clients", 0);
        this.registry.set("damage", 0);

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
            (anim) => anim.assetKey === this.selectedCarKey
        );

        // Create animations for selected car
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

        // ======================
        // Potholes Group
        // ======================
        this.potholes = this.physics.add.group();

        // Spawn the first few obstacles
        for (let i = 0; i < 4; i++) {
            this.spawnPothole.call(this, this.speed);
        }

        // ======================
        // Player
        // ======================
        this.player = this.physics.add.sprite(
            window.innerWidth / 2,
            window.innerHeight,
            this.selectedCarKey
        );

        // Set the scale first
        this.player.setScale(2.5);
        this.player.setCollideWorldBounds(true);

        // Player hitbox
        const hitboxWidth = this.player.width * this.player_config["hitbox"].width;
        const hitboxHeight = this.player.height * this.player_config["hitbox"].height;
        const offsetX = (this.player.width - hitboxWidth) / 2;
        const offsetY = (this.player.height - hitboxHeight) / 2;
        this.player.body.setSize(hitboxWidth, hitboxHeight);
        this.player.body.setOffset(offsetX, offsetY);

        // Collisions with obstacles
        this.physics.add.overlap(
            this.player,
            this.potholes,
            this.handleCollision,
            null,
            this
        );

        // ======================
        // NPC
        // ======================
        this.spawnClient(this);

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

        // Convert delta to seconds
        const dt = delta / 1000;

        this.streetTiles.forEach((tile) => {
            tile.y += this.speed * dt;
        });

        // Recycle tiles that move off screen
        this.streetTiles.forEach((tile) => {
            if (tile.y >= this.sys.game.config.height) {

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

                // Adjust hitbox if needed
                const hitboxWidth = pothole.width * 0.6;  // adjust based on scale
                const hitboxHeight = pothole.height * 0.8;
                const offsetX = (pothole.width - hitboxWidth) / 2;
                const offsetY = (pothole.height - hitboxHeight) / 2;
                pothole.body.setSize(hitboxWidth, hitboxHeight);
                pothole.body.setOffset(offsetX, offsetY);

                pothole.y = Phaser.Math.Between(-window.innerHeight, -100);

                const axiX = Phaser.Math.Between(
                    0 + this.sidewalkWidth, 434 - this.sidewalkWidth
                );

                pothole.x = axiX

                // this function applys the pothole change texture (i dont know why, becouse only set the this.speed)
                pothole.body.setVelocityY(this.speed);
            }
        });

        if (this.taxiStop && this.taxiStop.active && this.taxiStop.y > this.sys.game.config.height + 50) {

            const delayedCall = Phaser.Math.Between(3000, 12000);

            // Taxi stop has gone off screen without being picked up
            this.taxiStop.destroy();

            this.time.delayedCall(delayedCall, () => {
                // Spawn a new client since the taxi missed it
                this.spawnClient(this);
            });
        }
    }


    // ======================
    // Spawn Potholes Function
    // ======================
    spawnPothole(speed) {
        // Pick a random key from the available obstacle textures
        const potholeFrame = this.getRandomFrame(this, ["bache_4", "bache_5"]);

        const x = Phaser.Math.Between(
            this.sidewalkWidth,
            434 - this.sidewalkWidth
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

    handleCollision(player) {
        if (player.blinkEvent) {
            player.blinkEvent.remove();
            player.clearTint();
        }

        let elapsed = 0;
        this.damage += 1;
        this.registry.set("damage", this.damage);

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

    handleNPCPickup() {
        if (this.npc.collided) return;

        this.npc.destroy();
        this.npc.collided = true;

        const delayedCall = Phaser.Math.Between(3000, 12000);

        this.time.delayedCall(delayedCall, () => {
            let x = Phaser.Utils.Array.GetRandom(this.npcX);

            // spawmn the taxi stop after 6seconds
            this.taxiStop = this.physics.add.sprite(x, 0, "taxi_stop");
            this.taxiStop.setScale(0.53);
            this.taxiStop.setDepth(-1);
            this.taxiStop.body.setAllowGravity(false);
            this.taxiStop.body.setVelocityY(this.speed);

            // Taxi stop
            this.physics.add.overlap(
                this.player,
                this.taxiStop,
                this.handleTaxiStopCollision,
                null,
                this
            );
        });
    }

    handleTaxiStopCollision() {
        const delayedCall = Phaser.Math.Between(3000, 12000);
        this.clients += 1;

        this.registry.set("clients", this.clients);
        this.taxiStop.disableBody(true, true);

        this.time.delayedCall(delayedCall, () => {

            this.spawnClient(this);
        });
    }

    spawnClient(context) {
        const npcKey = ["npc_1", "npc_2", "npc_3", "npc_4"];
        const npcFrame = this.getRandomFrame(context, npcKey);
        let x = Phaser.Utils.Array.GetRandom(this.npcX);

        this.npc = context.physics.add.sprite(x, 0, npcFrame["randomKey"]);
        this.npc.body.allowGravity = false;
        this.npc.setVelocityY(this.speed);
        this.npc.setDepth(-1);

        // NPC pickup
        context.physics.add.overlap(this.player, this.npc, this.handleNPCPickup, null, context);
    }

    getRandomFrame(context, assets) {
        const randomKey = Phaser.Utils.Array.GetRandom(assets);
        const width = context.textures.get(randomKey).getSourceImage().width;

        return {
            width,
            randomKey,
        };
    }
}