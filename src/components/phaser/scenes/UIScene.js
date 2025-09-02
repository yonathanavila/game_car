import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.score = 0;
    this.clients = 0;
    this.carKm = 0;
    this.balance = 0;

    // this.scoreText = this.add.text(16, 16, "Damage: 0", {
    //   fontFamily: "Minecraft",
    //   fontSize: "32px",
    //   fill: "#fff",
    // });
    this.clientsText = this.add.text(16, 16, "Clients: 0", {
      fontFamily: "Minecraft",
      fontSize: "32px",
      fill: "#fff",
    });
    // this.carKmText = this.add.text(16, 104, "Car Km: 0", {
    //   fontFamily: "Minecraft",
    //   fontSize: "32px",
    //   fill: "#fff",
    // });
    // this.balanceText = this.add.text(16, 148, "Balance: $0", {
    //   fontFamily: "Minecraft",
    //   fontSize: "32px",
    //   fill: "#fff",
    // });

    // this.scoreText.setScrollFactor(0).setDepth(1);
    this.clientsText.setScrollFactor(0).setDepth(2);
    // this.carKmText.setScrollFactor(0).setDepth(2);
    // this.balanceText.setScrollFactor(0).setDepth(2);

    this.registry.events.on("changedata", (parent, key, data) => {
      if (key === "clients") {
        this.clientsText.setText("Clients: " + data);
      }
      // if (key === "damage") {
      //   this.scoreText.setText("Damage: " + data);
      // }

      // if (key === "carKm") {
      //   this.carKmText.setText("Car Km: " + data);
      // }

      // if (key === "balance") {
      //   this.balanceText.setText("Balance: $" + data);
      // }
    });
  }
}
