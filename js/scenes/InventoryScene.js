import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TopButtonBar from '/ui/TopButtonBar.js';
import CollectionPopup from '/ui/CollectionPopup.js';
import StorePopup from '/ui/StorePopup.js';
import BottomNavBar from '/ui/BottomNavBar.js';
import ThemePopup from '/ui/ThemePopup.js';
import BagPopup from '/ui/BagPopup.js';
import CoinBar from '/ui/CoinBar.js';

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super('InventoryScene');
  }

  preload() {
    // Inventory UI images
    this.load.image('inventory_frame', 'assets/inventory_frame.png');
    this.load.image('inv_itembg', 'assets/inv_itembg.png');
    this.load.image('inv_itemadd', 'assets/inv_itemadd.png');

    // Optional (keep only if you will use them later in this scene)
    this.load.image('Char_Cake', 'assets/char_pancake.png');
    this.load.image('Char_Snow', 'assets/Char_Snow.png');
    this.load.image('Char_Cat', 'assets/char_blackCat.png');
    this.load.image('Char_Happy', 'assets/char_happyStar.png');
  }

  create() {
    console.log('Loaded:', this.scene.key);

    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.cameras.main.setBackgroundColor('#ffffff');

    // === UI Components ===
    const uiStartX = cx - 240;
    const uiStartY = 40;

    this.topButtonBar = new TopButtonBar(this, uiStartX, uiStartY);
    this.coinBar = new CoinBar(this, uiStartX - 700, uiStartY + 25);

    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();

    this.storePopup = new StorePopup(this);
    this.themePopup = new ThemePopup(this);
    this.bagPopup = new BagPopup(this);

    // Bottom nav bar y-position you are using
    const bottomNavY = 1390;

    this.bottomNavBar = new BottomNavBar(
      this,
      bottomNavY,
      this.onNavButtonClicked.bind(this)
    );

    // === Inventory Frame ===
    const frameW = 700;
    const frameH = 1160;
    const frameMarginAboveNav = 80;

    const frameY = bottomNavY - frameMarginAboveNav - frameH / 2;

    this.inventoryFrame = this.add.image(cx, frameY, 'inventory_frame')
      .setOrigin(0.5)
      .setDisplaySize(frameW, frameH);

    // === Inventory slots ===
    const frame = this.inventoryFrame;

    const cols = 3;
    const rows = 6;

    // Padding inside the frame (tweak to match your PNG margins)
    const padLeft = 130;
    const padTop = 105;

    // Spacing between slots (tweak)
    const gapX = 220;
    const gapY = 190;

    // Top-left slot position (based on frame size)
    const gridStartX = frame.x - frame.displayWidth / 2 + padLeft;
    const gridStartY = frame.y - frame.displayHeight / 2 + padTop;

    this.invSlots = [];
    this.invSlotIcons = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gridStartX + c * gapX;
        const y = gridStartY + r * gapY;

        const isFirstSlot = (r === 0 && c === 0);
        const slotKey = isFirstSlot ? 'inv_itembg' : 'inv_itemadd';

        const slot = this.add.image(x, y, slotKey)
          .setOrigin(0.5)
          .setScale(2.4);

        this.invSlots.push(slot);

        if (isFirstSlot) {
          const icon = this.add.image(x, y, 'Char_Cake')
            .setOrigin(0.5)
            .setDisplaySize(140, 140);

          this.invSlotIcons.push(icon);
        }
      }
    }
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
