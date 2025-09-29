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

    this.damageText = this.add.text(16, 16, "Damage: 0", {
      fontSize: "28px",
      fill: "#fff",
    });
    this.clientsText = this.add.text(16, 60, "Clients: 0", {
      fontSize: "32px",
      fill: "#fff",
    });
    // this.carKmText = this.add.text(16, 104, "Car Km: 0", {
    //
    //   fontSize: "32px",
    //   fill: "#fff",
    // });
    // this.balanceText = this.add.text(16, 148, "Balance: $0", {
    //
    //   fontSize: "32px",
    //   fill: "#fff",
    // });

    this.damageText.setScrollFactor(0).setDepth(1);
    this.clientsText.setScrollFactor(0).setDepth(2);
    // this.carKmText.setScrollFactor(0).setDepth(2);
    // this.balanceText.setScrollFactor(0).setDepth(2);

    if (this.registryEventsHandler) {
      // Remove previous listener if exists
      this.registry.events.off("changedata", this.registryEventsHandler);
    }

    this.registryEventsHandler = (parent, key, data) => {
      if (!this.clientsText) return; // safety check
      if (key === "clients") this.clientsText.setText("Clients: " + data);
      if (key === "damage") this.damageText.setText(`Damage: ${data}/19700`);

      // if (key === "carKm") {
      //   this.carKmText.setText("Car Km: " + data);
      // }

      // if (key === "balance") {
      //   this.balanceText.setText("Balance: $" + data);
      // }
    };

    this.registry.events.on("changedata", this.registryEventsHandler);
  }
}
