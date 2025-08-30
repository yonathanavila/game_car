import { damageInfo } from "@/const";
import { calculateCurrentLife } from "@/services/Global";

export default class RepairScene extends Phaser.Scene {
    constructor() {
        super({ key: "RepairScene" });

        this.baseTextStyle = {
            fontSize: '25px',
            fontFamily: 'Minecraft',
            color: '#ffffff',
            align: 'left'
        };
        this.balance = 1000000;
        this.damage = 1000000;
        this.lastRepairKm = 30000;
        this.menuItems = [];
        // this.carKm = this.registry.get("carKm") || 0;
        this.damageInfo = damageInfo;
    }

    preload() {

        this.load.image("menu_bg", "/images/garage/chalkboard.webp");
        this.load.image("tool_1", "/images/tools/MechanicTools_1.webp");
        this.load.image("tool_2", "/images/tools/MechanicTools_2.webp");
        this.load.image("tool_3", "/images/tools/MechanicTools_3.webp");
        this.load.image("tool_4", "/images/tools/MechanicTools_4.webp");
        this.load.image("close", "/images/close.webp");

    }

    create() {
        const bg = this.add.image(0, 0, "menu_bg").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;
        // Make background fill screen width while keeping aspect ratio
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // close
        const closeButton = this.add.image(this.sys.game.config.width - 125, 50, "close")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0, 1)
            .on("pointerdown", () => {
                this.scene.start("GameScene");
            });

        closeButton.displayWidth = 100;
        closeButton.displayHeight = 100;
        closeButton.rotation = Phaser.Math.DegToRad(45);


        // tools
        const tool_1 = this.add.image(70, this.sys.game.config.height - 90, "tool_1").setOrigin(0, 0);
        tool_1.displayWidth = 100;
        tool_1.displayHeight = 100;
        tool_1.rotation = Phaser.Math.DegToRad(45);

        const tool_2 = this.add.image(70, this.sys.game.config.height - 90, "tool_2").setOrigin(0, 0);
        tool_2.displayWidth = 100;
        tool_2.displayHeight = 100;

        const tool_3 = this.add.image(370, this.sys.game.config.height - 245, "tool_3").setOrigin(0, 0);
        tool_3.displayHeight = 150;
        tool_3.displayWidth = 30;

        const tool_4 = this.add.image(35, this.sys.game.config.height - 100, "tool_4").setOrigin(0, 0);
        tool_4.displayHeight = 35;
        tool_4.displayWidth = 35;

        // Add title text
        this.add.text(this.scale.width / 2, 100, "Garage", {
            fontFamily: "Minecraft",
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const lowerBallJointInfo = this.damageInfo.find((value) => value.name == "lowerBallJoint");

        if (lowerBallJointInfo.kmDamage[0] >= this.lastRepairKm) {

            // lowerBallJoint.on("pointerdown", () => {
            //     this.balance -= this.lowerBallJointInfo.repairCost;
            //     this.damage -= this.lowerBallJointInfo.damageHelth;
            // });

            this.menuItems.push({
                text: "Fix lower ball joints . . . . . . . . . . . . . . . . . . . . . . . . . . . $1400",
                cost: lowerBallJointInfo.cost,
                damage: lowerBallJointInfo.damageHealth,
            });
        }

        const shockAbsorber = this.damageInfo.find((value) => value.name == "shockAbsorber");

        if (shockAbsorber.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Fix shocks absorbers . . . . . . . . . . . . . . . . . . . . . . . . $5000",
                cost: shockAbsorber.cost,
                damage: shockAbsorber.damageHealth,
            });
        }

        const bushings = this.damageInfo.find((value) => value.name == "bushings");

        if (bushings.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Fix lower control arms bushings . . . . . . . . . . . . $1200",
                cost: bushings.cost,
                damage: bushings.damageHealth,
            });
        }

        const aligmentBalance = this.damageInfo.find((value) => value.name == "aligmentBalance");

        if (aligmentBalance.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Fix aligment & balance . . . . . . . . . . . . . . . . . . . . . . . . $600",
                cost: aligmentBalance.cost,
                damage: aligmentBalance.damageHealth,
            });
        }

        const brakeCheckService = this.damageInfo.find((value) => value.name == "brakeCheck");

        if (brakeCheckService.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Brake check service . . . . . . . . . . . . . . . . . . . . . . . . . $800",
                cost: brakeCheckService.cost,
                damage: brakeCheckService.damageHealth,
            });
        }

        const tires = this.damageInfo.find((value) => value.name == "tires");

        if (tires.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Buy tires . . . . . . . . . . $5200",
                cost: tires.cost,
                damage: tires.damageHealth,
            });
        }

        const checkAirPressure = this.damageInfo.find((value) => value.name == "airPressure");

        if (checkAirPressure.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Check tire air pressure . . . . . . . . . . . . . . . . . . . . . . . $100",
                cost: tires.cost,
                damage: tires.damageHealth,
            });
        }

        const washCar = this.damageInfo.find((value) => value.name == "washCar");

        if (washCar.kmDamage[0] >= this.lastRepairKm) {
            this.menuItems.push({
                text: "Wash car . . . . . . . . . . . $200",
                cost: washCar.cost,
                damage: washCar.damageHealth,
            });
        }

        // Add title text
        this.add.text(300, this.scale.height - 30, "Balance: $" + this.balance, {
            fontFamily: "Minecraft",
            fontSize: "25px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Contenedor principal en X=55, Y=200
        const menuContainer = this.add.container(55, 200);

        // Espaciado vertical
        let offsetY = 0;
        let totalCost = 0;

        this.menuItems.forEach((item, index) => {
            totalCost += item.cost;

            const option = this.add.text(
                0,
                offsetY,
                item.text,
                {
                    ...this.baseTextStyle,
                    wordWrap: {
                        width: this.scale.width - 100,
                        useAdvancedWrap: true,
                    },
                }
            ).setOrigin(0, 0)
                .setInteractive();

            option.on("pointerdown", () => {
                this.balance -= item.cost;
                this.damage -= item.damage;
            });

            // Agregar al contenedor
            menuContainer.add(option);

            // Aumentar Y para la siguiente línea
            offsetY += option.height + 10; // margen de 10px entre textos

            if (index === this.menuItems.length - 1) {
                const totalCostText = this.add.text(
                    0,
                    offsetY,
                    "Total Cost . . . . . . . . $" + totalCost,
                    {
                        ...this.baseTextStyle,
                        wordWrap: {
                            width: this.scale.width - 100,
                            useAdvancedWrap: true,
                        },
                    }
                ).setOrigin(0, 0)
                    .setInteractive();
                // Agregar al contenedor
                menuContainer.add(totalCostText)

                // Aumentar Y para la siguiente línea
                offsetY += totalCostText.height + 10; // margen de 10px entre textos
            }

        })

        this.currentLife = calculateCurrentLife(this);

    }

}