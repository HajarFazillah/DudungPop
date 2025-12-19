// CoinBar.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CoinBar {
  constructor(scene, leftX, y) {
    this.scene = scene;

    const barWidth = 500;
    const barHeight = 35;
    const left   = 10;
    const right  = left + barWidth;

    // middle rect
    this.mid = scene.add.rectangle(
      left + barWidth / 2,
      y,
      barWidth - 20,
      barHeight,
      0xffffff
    ).setStrokeStyle(2, 0x000000);

    // caps
    this.leftCap = scene.add.circle(left + 10, y, barHeight / 2, 0xffffff)
      .setStrokeStyle(2, 0x000000);
    

    // coin icon
   this.icon = scene.add.image(left + barHeight / 2, y, 'coin')
      .setOrigin(0.5)
      .setDisplaySize(50, 50);

    // amount text
    this.text = scene.add.text(
      left + barWidth / 2,
      y,
      '000000000',
      { fontFamily: 'DoveMayo', fontSize: 25, color: '#000000' }
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
