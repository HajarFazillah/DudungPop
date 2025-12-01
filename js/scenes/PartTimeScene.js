import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

import TopButtonBar from '/ui/TopButtonBar.js';
import BottomNavBar from '/ui/BottomNavBar.js';
import PartTimeFrame from '/ui/PartTimeFrame.js';
import HeartButton from '/ui/HeartButton.js';
import LargeClickButton from '/ui/LargeClickButton.js';
import CollectionPopup from '/ui/CollectionPopup.js';

export default class PartTimeScene extends Phaser.Scene {
  constructor() {
    super('PartTimeScene');
  }

  preload() {
    this.load.image("LargeClickButton", "assets/LargeClickButton.png");
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.cameras.main.setBackgroundColor('#ffffff');

    // === Top UI Bar ===
    new TopButtonBar(this, cx - 240, 40);

    // === Three small boxes ===
    let boxStartX = cx - 155;
    for (let i = 0; i < 3; i++) {
      // i * gap, up/down, size 40x40
      this.add.rectangle(boxStartX + i * 60, 300, 40, 40, 0xcccccc)
        .setStrokeStyle(2, 0x000000)
        .setOrigin(0.5);
    }

    // === Large Image Frame ===
    this.frame = new PartTimeFrame(this, cx, cy - 100, 350, 500);

    // === Heart in top-right of frame ===
    this.heart = new HeartButton(this, cx + 160, cy - 330);

    // === CLICK Button ===
    this.largeBtn = new LargeClickButton(this, cx, cy + 230, () => {
      console.log("Large button clicked!");
    });

    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();

    // === Bottom Navigation ===
    this.bottomNav = new BottomNavBar(
      this,
      1100,
      this.onNavButtonClicked.bind(this)
    );
  }

  onNavButtonClicked(label) {
  console.log('PartTimeScene - button clicked:', label);

  if (label === '도감') {
    if (this.collectionPopup) {
      this.collectionPopup.showPopup();   // open in this scene
    }
  } else {
    if (this.collectionPopup) {
      this.collectionPopup.hidePopup();   // optional: hide for other buttons
    }
  }
}

  
}
