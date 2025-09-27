export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoginScene" });
  }

  create() {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "What is your name?", {
        fontFamily: "Minecraft",
        fontSize: "24px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    // Add the editable text object
    let nameText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Click to type...", {
        fontFamily: "Minecraft",
        fontSize: "24px",
        fill: "#0f0",
      })
      .setOrigin(0.5)
      .setInteractive();

    // Make it editable
    nameText.on("pointerdown", () => {
      this.plugins.get("rexTextEdit").edit(nameText, {
        onClose: (textObject) => {
          console.log("Final name:", textObject.text);
        },
      });
    });
  }
}
