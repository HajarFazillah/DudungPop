// js/scenes/GameScene.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

import TopButtonBar from '../../ui/TopButtonBar.js';
import BottomNavBar from '../../ui/BottomNavBar.js';
import Lever from '../../ui/Lever.js';
import StorePopup from '../../ui/StorePopup.js';
import CollectionPopup from '../../ui/CollectionPopup.js';
import ThemePopup from '../../ui/ThemePopup.js';
import BagPopup from '../../ui/BagPopup.js';
import CategoryButtonGroup from '../../ui/CategoryButtonGroup.js';
import CoinBar from '../../ui/CoinBar.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    console.log('Loaded:', this.scene.key);

    // --- Audio (guarded) ---
    if (!this.sound.get('mainBGM') && this.cache.audio.exists('mainBGM')) {
      this.bgm = this.sound.add('mainBGM', { loop: true, volume: 0.7 });
      this.bgm.play();
    } else {
      this.bgm = this.sound.get('mainBGM');
    }
    this.sfxVolume = 1.0;
    this.musicVolume = 1.0;
    if (this.bgm) this.bgm.setVolume(this.musicVolume);

    // --- Background ---
    const cam = this.cameras.main;
    this.cameras.main.setBackgroundColor('#ffffff');
    this.gachaBg = this.add.image(cam.centerX, cam.centerY, 'game_default').setOrigin(0.5);

    // --- UI components (create once, positioned in layout()) ---
    this.topButtonBar = new TopButtonBar(this, 0, 0);
    this.coinBar = new CoinBar(this, 0, 0);

    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();

    this.categoryGroup = new CategoryButtonGroup(
      this,
      0,
      0,
      (label) => this.onCategoryClicked(label)
    );
    this.categoryGroup.activateDefault();

    this.bottomNavBar = new BottomNavBar(this,cam.centerX, cam.height * 0.90, this.onNavButtonClicked.bind(this));

    this.Lever = new Lever(this, 0, 0);
    this.Lever.createLever();
    this.Lever.setProgressBarUpdateCallback(this.updateProgressBarUI.bind(this));

    this.playerState = { coins: 999999, bagSlots: 20, clickLevel: 1 };
    this.storePopup = new StorePopup(this, this.playerState);
    this.themePopup = new ThemePopup(this);
    this.bagPopup = new BagPopup(this);

    // Progress bar objects
    this.createProgressBar();

    // --- First layout ---
    this.layout();

    // --- Resize handling ---
    // Phaser resize event supplies (gameSize, baseSize, displaySize, previousWidth, previousHeight). [web:270]
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  handleResize(gameSize /*, baseSize, displaySize */) {
    // Ensure camera dimensions match new size before layout. [web:293]
    this.cameras.resize(gameSize.width, gameSize.height);
    this.layout();
  }

  layout() {
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;

    // Background: center + scale relative to height (tune)
    if (this.gachaBg) {
      this.gachaBg.setPosition(cam.centerX, cam.centerY);

      const targetH = h * 0.80;
      const scale = targetH / this.gachaBg.height;
      this.gachaBg.setScale(scale);
    }

    // Top bar
    if (this.topButtonBar) this.topButtonBar.setPosition(cam.centerX, h * 0.06);

    // Coin bar
    if (this.coinBar) this.coinBar.setPosition(cam.centerX - w * 0.45, h * 0.08);

    // Category buttons
    if (this.categoryGroup) this.categoryGroup.setPosition(cam.centerX, h * 0.14);

    // Bottom nav
    if (this.bottomNavBar) this.bottomNavBar.setPosition(cam.centerX, h * 0.90);

    // Lever block
    if (this.Lever) this.Lever.setPosition(cam.centerX, h * 0.70);

    // Progress bar
    const barY = h * 0.82;
    if (this.progressBarBg) this.progressBarBg.setPosition(cam.centerX, barY);
    if (this.progressBarFill) this.progressBarFill.setPosition(cam.centerX - this.progressBarFill_maxWidth / 2, barY);
    if (this.progressLabel) this.progressLabel.setPosition(cam.centerX, barY - h * 0.02);
  }

  createProgressBar() {
    const cam = this.cameras.main;

    this.progressBarFill_maxWidth = 370;

    this.progressBarBg = this.add.rectangle(cam.centerX, 0, 370, 11, 0xffffff)
      .setStrokeStyle(1, 0x1a1a1a);

    this.progressBarFill = this.add.rectangle(cam.centerX - 370 / 2, 0, 0, 11, 0x333333)
      .setOrigin(0, 0.5);

    if (this.progressLabel) this.progressLabel.destroy();

    this.progressLabel = this.add.text(cam.centerX, 0, 'A등급 이상 확정까지 101회', {
      fontSize: '25px',
      fontFamily: 'DoveMayo',
      color: '#222'
    }).setOrigin(0.5);
  }

  updateProgressBarUI(current, max) {
    const cam = this.cameras.main;

    const fillWidth = Math.min(1, current / max) * this.progressBarFill_maxWidth;
    this.progressBarFill.width = fillWidth;

    // Keep aligned to left edge of background
    this.progressBarFill.x = cam.centerX - this.progressBarFill_maxWidth / 2;

    let remain = max - current + 1;
    if (remain < 1) remain = 1;
    this.progressLabel.setText(`A등급 이상 확정까지 ${remain}회`);
  }

  onCategoryClicked(label) {
    if (!this.gachaBg) return;

    if (label === 'cat1') this.gachaBg.setTexture('game_default');
    else if (label === 'cat2') this.gachaBg.setTexture('game_default2');
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
