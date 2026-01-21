import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

import TopButtonBar from '/ui/TopButtonBar.js';
import BottomNavBar from '/ui/BottomNavBar.js';
import PartTimeFrame from '/ui/PartTimeFrame.js';
import HeartButton from '/ui/HeartButton.js';
import LargeClickButton from '/ui/LargeClickButton.js';
import CoinBar from '/ui/CoinBar.js';

// bottom nav bar
import CollectionPopup from '/ui/CollectionPopup.js';
import StorePopup from '/ui/StorePopup.js';
import ThemePopup from '/ui/ThemePopup.js';
import BagPopup from '/ui/BagPopup.js';

export default class PartTimeScene extends Phaser.Scene {
  constructor() {
    super('PartTimeScene');
  }

  preload() {
    this.load.image("LargeClickButton", "assets/LargeClickButton.png");
    this.load.image("LargeClickButton_clicked", "assets/LargeClickButton_clicked.png");
    this.load.image("partTime_img", "assets/partTime_img.png");
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const startX = cx- 240;
    const startY = 40;

    this.cameras.main.setBackgroundColor('#ffffff');

    // === Top UI Bar ===
    new TopButtonBar(this, cx - 240, 40);
    this.coinBar = new CoinBar(this, startX - 700, startY + 25);

    // === Three small boxes ===
    let boxStartX = cx - 190;
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(boxStartX + i * 80, 180, 40, 40, 0xcccccc)
        .setStrokeStyle(2, 0x000000)
        .setOrigin(0.5)
        .setScale(1.5);
    }

    // === Part-time image inside frame ===
    this.partTimeImage = this.add.sprite(cx, cy - 80, 'partTime_img')
      .setOrigin(0.5)
      .setScale(1.8);

    // === Heart in top-right of frame ===
    this.heart = new HeartButton(this, cx + 180, cy - 570);

    // === CLICK Button ===
    this.largeBtn = this.add.sprite(cx, cy + 470, 'LargeClickButton')
      .setOrigin(0.5).setScale(2)
      .setInteractive({ useHandCursor: true });

    this.largeBtn.on('pointerdown', () => {
      this.largeBtn.setTexture('LargeClickButton_clicked');
    });

    this.largeBtn.on('pointerup', () => {
      this.largeBtn.setTexture('LargeClickButton');
    });

    this.largeBtn.on('pointerdown', () => {
      // Your click logic here
    });

    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();

    this.storePopup = new StorePopup(this);

    this.themePopup = new ThemePopup(this);
    this.bagPopup = new BagPopup(this);

    // === Bottom Navigation ===
    this.bottomNav = new BottomNavBar(
      this,
      1390,
      this.onNavButtonClicked.bind(this)
    );
  }

  onNavButtonClicked(label) {
    if (this.collectionPopup) this.collectionPopup.hidePopup();
    if (this.storePopup) this.storePopup.hide();
    if (this.themePopup) this.themePopup.hide();
    if (this.bagPopup) this.bagPopup.hide();

    switch (label) {
      case '도감':
        if (this.collectionPopup) this.collectionPopup.showPopup();
        break;

      case '상점':
        if (this.storePopup) this.storePopup.show();
        break;

      case '가방':
        if (this.bagPopup) this.bagPopup.show();
        break;

      case '장식장':
        if (this.themePopup) this.themePopup.show();
        break;
    }
  }
}
