// ui/CoinBar.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CoinBar {
  constructor(scene, x = 0, y = 0) {
    this.scene = scene;

    // Root container (move this to reposition the whole bar)
    this.container = scene.add.container(x, y);

    // --- Visual config (same feel as your current offsets) ---
    this.bgScale = 1;
    this.iconScale = 0.5;

    // Background image (anchor left)
    this.bg = scene.add.image(0, 0, 'coin_bar')
      .setOrigin(0, 0.5)
      .setScale(this.bgScale);

    // After scaling, we can use display sizes
    const barWidth = this.bg.displayWidth;
    const barHeight = this.bg.displayHeight;

    // Coin icon (placed relative to bg)
    this.icon = scene.add.image(barHeight / 2 + 5, 0, 'coin')
      .setOrigin(0.5)
      .setScale(this.iconScale);

    // Amount text (placed relative to bg)
    this.text = scene.add.text(
      barWidth * 0.55,   // tune this if you want it more left/right
      0,
      '000000000',
      { fontFamily: 'DoveMayo', fontSize: 30, color: '#000000' }
    ).setOrigin(0.5);

    this.container.add([this.bg, this.icon, this.text]);

    this.total = 0;
    this.updateText();
  }

  // Public API for responsive layout
  setPosition(x, y) {
    this.container.setPosition(x, y); // Containers move as a group [web:264]
  }

  setScale(s) {
    this.container.setScale(s);
  }

  destroy() {
    this.container.destroy(true);
  }

  add(amount) {
    this.total += amount;
    this.updateText();
  }

  spend(amount) {
    this.total = Math.max(0, this.total - amount);
    this.updateText();
  }

  updateText() {
    this.text.setText(this.total.toString().padStart(9, '0'));
  }
}
