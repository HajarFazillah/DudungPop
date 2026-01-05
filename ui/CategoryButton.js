export default class CategoryButton {
  constructor(scene, x, y, label, config) {
    this.scene = scene;
    this.label = label;

    // Config = { off, on, disabled?, onClick? }
    this.offTexture = config.off;
    this.onTexture = config.on;
    this.disabled = config.disabled ?? false;
    this.onClick = config.onClick ?? null;

    // Create button image
    this.bg = scene.add.image(x, y, this.offTexture).setOrigin(0.5);
    this.bg.setScale(1.4); // adjust size as needed

    // If NOT disabled → make interactive
    if (!this.disabled) {
      this.bg.setInteractive({ useHandCursor: true });
      this.bg.on("pointerdown", () => {
        if (this.onClick) this.onClick(this);
      });
    }

    // Grey-out disabled
    if (this.disabled) {
      this.bg.setAlpha(1.0);
    }
  }

  activate() {
    if (!this.disabled) {
      this.bg.setTexture(this.onTexture);
    }
  }

  deactivate() {
    this.bg.setTexture(this.offTexture);
  }
}
