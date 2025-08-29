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
        this.lastRepairKm = 40000;
        this.menuItems = [];

        this.damageInfo = [{
            name: "lowerBallJoint",
            repairCost: 1400,
            damageHealth: 5000,
            kmDamage: [60000, 100000],
            comfort: [6, 7],
            security: [9, 10],
        },
        {
            name: "shockAbsorber",
            repairCost: 5000,
            damageHealth: 4000,
            kmDamage: [30000, 50000],
            comfort: [8, 10],
            security: [7, 8],
        },
        {
            name: "bushings",
            repairCost: 1200,
            damageHealth: 2000,
            kmDamage: [40000, 70000],
            comfort: [7, 8],
            security: [7, 8],
        },
        {
            name: "aligmentBalance",
            repairCost: 600,
            damageHealth: 1200,
            kmDamage: [15000, 20000],
            comfort: [7, 8],
            security: [9, 10],
        },
        {
            name: "brakeCheck",
            repairCost: 800,
            damageHealth: 4500,
            kmDamage: [30000, 50000],
            comfort: [5, 6],
            security: [10, 11],
        },
        {
            name: "tires",
            repairCost: 800,
            damageHealth: 2500,
            kmDamage: [50000, 70000],
            comfort: [6, 7],
            security: [9, 10],
        },
        {
            name: "airPressure",
            repairCost: 100,
            damageHealth: 500,
            kmDamage: [5000, 8000],
            comfort: [4, 5],
            security: [8, 9],
        },
        {
            name: "washCar",
            repairCost: 200,
            damageHealth: 0,
            kmDamage: [20000, 70000],
            comfort: [3, 4],
            security: [3, 4],
        }];



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
        const close = this.add.image(this.sys.game.config.width - 125, 50, "close").setOrigin(0, 1);
        close.displayWidth = 100;
        close.displayHeight = 100;
        close.rotation = Phaser.Math.DegToRad(45);


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

        const tool_4 = this.add.image(35, this.sys.game.config.height - 129, "tool_4").setOrigin(0, 0);
        tool_4.displayHeight = 35;
        tool_4.displayWidth = 35;

        // Add title text
        this.add.text(this.scale.width / 2, 100, "Garage", {
            fontFamily: "Minecraft",
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        if (this.lowerBallJointInfo.kmDamage >= this.lastRepairKm) {
            const lowerBallJoint = this.add.text(
                55,
                200,
                "Fix lower ball joints . . . . . . . . . . . . . . . . . . . . . . . . . . . $1400", {
                ...this.baseTextStyle, wordWrap: {
                    width: this.scale.width - 100, // max width of text
                    useAdvancedWrap: true          // better word breaking
                },
            })
                .setOrigin(0, 0)
                .setInteractive();

            // lowerBallJoint.on("pointerdown", () => {
            //     this.balance -= this.lowerBallJointInfo.repairCost;
            //     this.damage -= this.lowerBallJointInfo.damageHelth;
            // });

            this.menuItems.push({
                text: "Fix lower ball joints . . . . . . . . . . . . . . . . . . . . . . . . . . . $1400",
                cost: this.lowerBallJointInfo.repairCost,
                damage: this.lowerBallJointInfo.damageHelth,
            });

        }


        const ShockAbsorber = this.add.text(
            55,
            275,
            "Fix shocks absorbers . . . . . . . . . . . . . . . . . . . . . . . . $5000", {
            ...this.baseTextStyle, wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        })
            .setOrigin(0, 0)
            .setInteractive();

        const Bushings = this.add.text(
            55,
            350,
            "Fix lower control arms bushings . . . . . . . . . . . . $1200", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();

        const AligmentBalance = this.add.text(
            55,
            445,
            "Fix aligment & balance . . . . . . . . . . . . . . . . . . . . . . . . $600", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();

        const BrakeCheckService = this.add.text(
            55,
            520,
            "Brake check service . . . . . . . . . . . . . . . . . . . . . . . . . $800", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();

        const Tires = this.add.text(
            55,
            585,
            "Buy tires . . . . . . . . . . $5200", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();

        const CheckAirPressure = this.add.text(
            55,
            625,
            "Check tire air pressure . . . . . . . . . . . . . . . . . . . . . . . $100", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();


        const WashCar = this.add.text(
            55,
            695,
            "Wash car . . . . . . . . . . . $200", {
            ...this.baseTextStyle,
            wordWrap: {
                width: this.scale.width - 100, // max width of text
                useAdvancedWrap: true          // better word breaking
            },
        }).setOrigin(0, 0)
            .setInteractive();


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

        this.menuItems.forEach((item) => {
            const option = this.add.text(
                0,
                offsetY,
                item.text.AligmentBalance,
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

        })

    }
}