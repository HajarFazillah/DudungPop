import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TopButtonBar from '/ui/TopButtonBar.js';
import BottomNavBar from '/ui/BottomNavBar.js';
import Lever from '/ui/Lever.js';
import StorePopup from '/ui/StorePopup.js';
import CollectionPopup from '/ui/CollectionPopup.js';
import ThemePopup from '/ui/ThemePopup.js';
import BagPopup from '/ui/BagPopup.js';
import CategoryButton from '/ui/CategoryButton.js';
import CategoryButtonGroup from '/ui/CategoryButtonGroup.js';
import CoinBar from '/ui/CoinBar.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY
    const startX = centerX - 240;
    const startY = 40;

    this.gachaBg = this.add.image(centerX, centerY + 20, 'game_default')
      .setOrigin(0.5, 0.5)
      .setScale(1.9);

    // Create UI components (in order from  top to bottom of the page)
    this.topButtonBar = new TopButtonBar(this, startX, startY);
    this.coinBar = new CoinBar(this, startX - 700, startY + 25);
    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();
    this.categoryGroup = new CategoryButtonGroup(this, centerX, (label) => this.onCategoryClicked(label));
    this.categoryGroup.activateDefault();
    this.bottomNavBar = new BottomNavBar(this, 1390, this.onNavButtonClicked.bind(this));
    this.Lever = new Lever(this, 120, 750);
    this.Lever.createLever();
    this.createProgressBar();
    this.Lever.setProgressBarUpdateCallback(this.updateProgressBarUI.bind(this));
    this.playerState = { coins: 999999, bagSlots: 20, clickLevel: 1 };
    this.storePopup = new StorePopup(this, this.playerState);
    this.themePopup = new ThemePopup(this);
    this.bagPopup = new BagPopup(this);
  }

  createProgressBar() {
    const centerX = this.cameras.main.centerX;
    this.progressBarBg = this.add.rectangle(centerX, 1250, 370, 11, 0xffffff).setStrokeStyle(1, 0x1a1a1a);
    this.progressBarFill_maxWidth = 370;
    const fillLeft = centerX - 370 / 2;  // Fill: x := left edge
    this.progressBarFill = this.add.rectangle(fillLeft, 1200, 0, 11, 0x333333).setOrigin(0, 0.5);
    if (this.progressLabel) this.progressLabel.destroy(); // prevent duplicate
    this.progressLabel = this.add.text(centerX, 1230, 'A등급 이상 확정까지 101회', { fontSize: '17px', color: '#222' }).setOrigin(0.5);
  }

  updateProgressBarUI(current, max) {
    const centerX = this.cameras.main.centerX;
    const fillMaxWidth = this.progressBarFill_maxWidth;
    const fillLeft = centerX - 370 / 2;
    let fillWidth = Math.min(1, current / max) * fillMaxWidth; // Fill progress calculation
    this.progressBarFill.width = fillWidth;
    this.progressBarFill.x = fillLeft; // Always align to left of background

    let remain = max - current + 1;
    if (remain < 1) remain = 1;
    this.progressLabel.setText(`A등급 이상 확정까지 ${remain}회`);
  }

  onCategoryClicked(label) {
    console.log("Selected:", label);
    if (!this.gachaBg) return;

    if (label === 'cat1') {
      this.gachaBg.setTexture('game_default');   // 기본
    } else if (label === 'cat2') {
      this.gachaBg.setTexture('game_default2');  // 11월 한정 (빨간색)
    } else if (label === 'cat3') {
      // 나중에 다른 배경 추가 가능
    }
  }

  onNavButtonClicked(label) {
    console.log(this.scene.key, '- button clicked:', label);

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