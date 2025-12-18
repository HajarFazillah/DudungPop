import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TopButtonBar from '/ui/TopButtonBar.js';
import CollectionPopup from '/ui/CollectionPopup.js';
import StorePopup from '/ui/StorePopup.js';
import BottomNavBar from '/ui/BottomNavBar.js';

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super('InventoryScene');
  }

  preload() {
    // Load sample item images (you can adjust these)
    this.load.image('Char_Cake', 'assets/Char_Cake.png');
    this.load.image('Char_Snow', 'assets/Char_Snow.png');
    this.load.image('Char_Pen', 'assets/Char_Pen.png');
    this.load.image('Char_Happy', 'assets/Char_Happy.png');
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const offsetY = -100;

    // === UI Components ===
    const startX = centerX - 240;
    const startY = 40;

    this.topButtonBar = new TopButtonBar(this, startX, startY);
    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();
    this.storePopup = new StorePopup(this);
    this.bottomNavBar = new BottomNavBar(this, 1100, this.onNavButtonClicked.bind(this));

    // === Inventory Box ===
    const boxWidth = 550;
    const boxHeight = 750;
    const box = this.add.rectangle(centerX, centerY + 20 + offsetY, boxWidth, boxHeight, 0xf5f5f5)
      .setStrokeStyle(2, 0x000000);

    // === Grid of Items ===
    const cols = 3;
    const rows = 7;
    const cellWidth = 150;
    const cellHeight = 100;
    const startGridX = centerX - (cols - 1) * (cellWidth / 2);
    const startGridY = centerY - (rows / 2) * cellHeight + 60 + offsetY;

    const itemKeys = ['Char_Cake', 'Char_Snow', 'Char_Pen', 'Char_Happy'];

    let itemIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startGridX + col * cellWidth;
        const y = startGridY + row * cellHeight;

        // Box frame for each item
        const slot = this.add.rectangle(x, y, 120, 90, 0xffffff)
          .setStrokeStyle(1, 0x999999);

        // Item image
        const key = itemKeys[itemIndex % itemKeys.length];
        const item = this.add.image(x, y, key).setDisplaySize(70, 70);

        itemIndex++;
      }
    }

  }

  onNavButtonClicked(label) {
    console.log(this.scene.key, '- button clicked:', label);

    // hide all popups first (safe reset)
    if (this.collectionPopup) this.collectionPopup.hidePopup();
    if (this.storePopup) this.storePopup.hide();

    switch (label) {
      case '도감':
        if (this.collectionPopup) this.collectionPopup.showPopup();
        break;

      case '상점':
        if (this.storePopup) this.storePopup.show();
        break;

      // other buttons (optional for now)
      case '가방':
      case '장식장':
        break;
    }
  }

} 
