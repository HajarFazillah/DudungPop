// CoinBar.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CoinBar {
  constructor(scene, leftX , y) {
    this.scene = scene;
  
    // main bar background from image
    this.bg = scene.add.image(leftX + 220, y, 'coin_bar')
      .setOrigin(0, 0.5)          // left‑aligned
      .setScale(1.2);

    const barWidth = this.bg.displayWidth;
    const barHeight = this.bg.displayHeight;

    // coin icon
    this.icon = scene.add.image((leftX + 225) + barHeight / 2, y, 'coin')
      .setOrigin(0.5)
      .setScale(0.7);

    // amount text
    this.text = scene.add.text(
      (leftX + 330) + barWidth / 2,
      y,
      '000000000',
      { fontFamily: 'DoveMayo', fontSize: 30, color: '#000000' }
    ).setOrigin(0.5);

    this.total = 0;
    this.updateText();
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
