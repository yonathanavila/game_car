export default class RepairScene extends Phaser.Scene {
    constructor() {
        super({ key: "RepairScene" });

        this.baseTextStyle = {
            fontSize: '25px',
            fontFamily: 'Minecraft',
            color: '#ffffff',
            align: 'left'
        };
    }

    preload() {

        this.load.image("menu_bg", "/images/garage/chalkboard.webp");
        this.load.image("tool_1", "/images/tools/MechanicTools_1.webp");
        this.load.image("tool_2", "/images/tools/MechanicTools_2.webp");
        this.load.image("tool_3", "/images/tools/MechanicTools_3.webp");
        this.load.image("tool_4", "/images/tools/MechanicTools_4.webp");
    }

    create() {
        const bg = this.add.image(0, 0, "menu_bg").setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.displayHeight = this.sys.game.config.height;
        // Make background fill screen width while keeping aspect ratio
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

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
        this.add.text(300, this.scale.height - 30, "Balance: $0", {
            fontFamily: "Minecraft",
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

    }
}