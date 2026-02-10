// ui/Lever.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class Lever {
  constructor(scene, x = 0, y = 0) {
    this.scene = scene;

    // Root container for all lever UI (so we can move it responsively)
    this.container = scene.add.container(x, y);

    this.leverState = 0;
    this.popup = null;

    this.gachaResults = [];
    this.gachaCapsules = [];
    this.currentCapsuleIndex = 0;
    this.skipAnimation = false;

    this.pityCounter = 0;
    this.maxPity = 100;
    this.onProgressUpdate = null;

    this.characters = [
      'char_snow', 'char_angryStar', 'char_angryStar2', 'char_doughnut', 'char_egg',
      'char_frustStar', 'char_ghost', 'char_happyStar', 'char_icecream',
      'char_laughStar', 'char_mugChoco', 'char_pen', 'char_ruler',
      'char_skeleton', 'char_starCandy', 'char_sushi', 'char_worryStar',
      'char_blackCat', 'char_christmasOrnament', 'char_depressedStar',
      'char_noMannersStar', 'char_pancake', 'char_sadStar',
      'char_scaredStar', 'char_scarf', 'char_shockStar'
    ];

    // References to UI elements (optional, useful later)
    this.leftLeverImg = null;
    this.rightLeverImg = null;
    this.leftLabel = null;
    this.rightLabel = null;
    this.checkboxRect = null;
    this.checkmark = null;
    this.checkboxLabel = null;
  }

  // Allow GameScene.layout() to reposition
  setPosition(x, y) {
    this.container.setPosition(x, y); // container can be moved as a group [web:264]
  }

  setScale(s) {
    this.container.setScale(s);
  }

  setProgressBarUpdateCallback(callback) {
    this.onProgressUpdate = callback;
  }

  updateProgressBar() {
    if (this.onProgressUpdate) this.onProgressUpdate(this.pityCounter, this.maxPity);
  }

  getGachaResult(isPity) {
    if (isPity) return 'A';
    const r = Math.random() * 100;
    if (r < 0.8) return 'S';
    if (r < 5) return 'A';
    if (r < 19) return 'B';
    if (r < 50) return 'C';
    return 'D';
  }

  // ---------- Lever UI Creation ----------
  createLever() {
    // Clear old UI if called twice
    this.container.removeAll(true);

    const leverScale = 2;

    // Local layout constants (relative to container origin)
    const leverOffsetX = 190;
    const leverImgY = 0;
    const labelY = 100;

    // Left Lever (1 pull) - local coordinates
    this.leftLeverImg = this.scene.add.image(-leverOffsetX, leverImgY, 'game_lever_default')
      .setOrigin(0.5)
      .setScale(leverScale)
      .setInteractive({ useHandCursor: true });

    this.leftLabel = this.scene.add.text(-leverOffsetX, labelY, '1회 뽑기', {
      fontSize: '30px',
      fontFamily: 'DoveMayo',
      color: '#222'
    }).setOrigin(0.5);

    this.leftLeverImg.on('pointerdown', () => this.handleLeftLeverClick());

    // Right Lever (10 pull)
    this.rightLeverImg = this.scene.add.image(leverOffsetX, leverImgY, 'game_lever_default')
      .setOrigin(0.5)
      .setScale(leverScale)
      .setInteractive({ useHandCursor: true });

    this.rightLabel = this.scene.add.text(leverOffsetX, labelY, '10회 뽑기', {
      fontSize: '30px',
      fontFamily: 'DoveMayo',
      color: '#222'
    }).setOrigin(0.5);

    this.rightLeverImg.on('pointerdown', () => this.handleRightLeverClick());

    // Skip Animation Checkbox (local)
    const checkboxY = -80;

    this.checkboxRect = this.scene.add.rectangle(-45, checkboxY, 24, 24, 0xffffff)
      .setStrokeStyle(1, 0x222222)
      .setInteractive({ useHandCursor: true });

    this.checkmark = this.scene.add.text(-45, checkboxY, '✓', {
      fontSize: '20px',
      color: '#000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    this.checkboxLabel = this.scene.add.text(-25, checkboxY, '연출 건너뛰기', {
      fontSize: '25px',
      fontFamily: 'DoveMayo',
      color: '#222'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    this.checkboxRect.on('pointerdown', () => this.toggleSkipCheckbox());
    this.checkboxLabel.on('pointerdown', () => this.toggleSkipCheckbox());

    // Add to container
    this.container.add([
      this.leftLeverImg, this.rightLeverImg,
      this.leftLabel, this.rightLabel,
      this.checkboxRect, this.checkmark, this.checkboxLabel
    ]);
  }

  toggleSkipCheckbox() {
    this.skipAnimation = !this.skipAnimation;
    this.checkmark.setVisible(this.skipAnimation);
    this.checkboxRect.setFillStyle(this.skipAnimation ? 0xe0e0e0 : 0xffffff);
  }

  // ------------------- Left Lever -------------------
  handleLeftLeverClick() {
    if (this.popup) return;

    if (this.leverState === 0) {
      this.showLeftLeverPopup('Lever Turn');
      this.leverState = 1;
    } else if (this.leverState === 1) {
      this.showLeftLeverPopup('Capsule_Red');
      this.leverState = 2;
    } else if (this.leverState === 2) {
      const isPity = this.pityCounter >= this.maxPity;
      this.pityCounter = isPity ? 0 : Math.min(this.pityCounter + 1, this.maxPity);
      this.updateProgressBar();

      const randomChar = this.characters[Math.floor(Math.random() * this.characters.length)];
      this.gachaResults = [randomChar];

      this.showLeftLeverPopup('Gacha Result');
      this.leverState = 3;
    }
  }

  showLeftLeverPopup(imageName) {
    this.createPopupWithOverlay();

    const imgKey =
      imageName === 'Lever Turn' ? 'LeftLever' :
      imageName === 'Capsule_Yellow' ? 'Capsule_Yellow' :
      imageName === 'Capsule_Red' ? 'Capsule_Red' :
      imageName === 'Gacha Result' ? this.gachaResults[0] : imageName;

    if (imageName === 'Gacha Result') {
      const bg = this.scene.add.image(0, 0, 'result_bg')
        .setOrigin(0.5)
        .setDisplaySize(600, 700);
      this.popup.add(bg);
    }

    let width = 300;
    let height = 300;

    if (imageName === 'Capsule_Red' || imageName === 'Capsule_Yellow') {
      width = 400;
      height = 400;
      this.scene.sound.play('CapsuleOpen', { volume: this.scene.sfxVolume || 1.0 });
    } else if (imageName === 'Gacha Result') {
      width = 400;
      height = 400;
    }

    const mainImg = this.scene.add.image(0, 0, imgKey).setDisplaySize(width, height);
    this.popup.add(mainImg);

    if (imageName === 'Gacha Result') {
      const confirmBtn = this.scene.add.image(0, 300, 'lever_confirm_button')
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.popup.add(confirmBtn);

      confirmBtn.on('pointerdown', () => {
        this.popup.destroy(true);
        this.popup = null;
        this.leverState = 0;
      });
    } else {
      mainImg.setInteractive({ useHandCursor: true });
      mainImg.on('pointerdown', () => {
        this.popup.destroy(true);
        this.popup = null;
        this.handleLeftLeverClick();
      });
    }
  }

  // ------------------- Right Lever -------------------
  handleRightLeverClick() {
    if (this.popup) return;

    const capsuleColors = ['Capsule_Yellow', 'Capsule_Green', 'Capsule_Red'];
    this.gachaResults = [];
    this.gachaCapsules = [];

    let guaranteeUsed = false;
    let indexOfPity = -1;

    for (let i = 0; i < 10; i++) {
      const isPity = (!guaranteeUsed && (this.pityCounter + i) >= this.maxPity);
      let grade = this.getGachaResult(isPity);

      if (isPity) {
        grade = 'A';
        guaranteeUsed = true;
        indexOfPity = i;
      }

      this.gachaResults.push(this.characters[Math.floor(Math.random() * this.characters.length)]);
      this.gachaCapsules.push(capsuleColors[Math.floor(Math.random() * capsuleColors.length)]);
    }

    this.pityCounter = indexOfPity >= 0 ? 0 : Math.min(this.pityCounter + 10, this.maxPity);
    this.updateProgressBar();
    this.currentCapsuleIndex = 0;

    this.popup = this.createPopupWithOverlay();

    const leverImg = this.scene.add.image(0, 0, 'LeftLever')
      .setDisplaySize(300, 300)
      .setInteractive({ useHandCursor: true });

    this.popup.add(leverImg);

    leverImg.once('pointerdown', () => {
      this.popup.destroy(true);
      this.popup = null;

      if (this.skipAnimation) this.showRightLeverPopup();
      else this.revealCapsulesOneByOne();
    });
  }

  revealCapsulesOneByOne() {
    if (this.popup) {
      this.popup.destroy(true);
      this.popup = null;
    }

    this.popup = this.createPopupWithOverlay();

    const idx = this.currentCapsuleIndex;
    const capsuleKey = this.gachaCapsules[idx];
    const charKey = this.gachaResults[idx];

    const capsuleImg = this.scene.add.image(0, -200, capsuleKey).setDisplaySize(400, 400);
    this.popup.add(capsuleImg);

    this.scene.tweens.add({
      targets: capsuleImg,
      y: 0,
      duration: 250,
      onComplete: () => {
        capsuleImg.setInteractive({ useHandCursor: true });
        capsuleImg.once('pointerdown', () => {
          capsuleImg.setVisible(false);

          this.scene.sound.play('CapsuleOpen', { volume: this.scene.sfxVolume || 1.0 });

          const charImg = this.scene.add.image(0, 0, charKey).setDisplaySize(400, 400);
          this.popup.add(charImg);

          charImg.setInteractive({ useHandCursor: true });
          charImg.once('pointerdown', () => {
            this.popup.destroy(true);
            this.popup = null;

            this.currentCapsuleIndex++;
            if (this.currentCapsuleIndex < 10) this.revealCapsulesOneByOne();
            else this.showRightLeverPopup();
          });
        });
      }
    });
  }

  showRightLeverPopup() {
    this.createPopupWithOverlay();

    const bg = this.scene.add.image(0, 0, 'result_bg')
      .setOrigin(0.5)
      .setDisplaySize(600, 700);
    this.popup.add(bg);

    const rowSizes = [4, 4, 2];
    let itemIndex = 0;
    const itemSpacingX = 140;
    const itemSpacingY = 150;
    const startY = -150;

    for (let row = 0; row < rowSizes.length; row++) {
      const itemsInRow = rowSizes[row];
      const rowWidth = (itemsInRow - 1) * itemSpacingX;
      const startX = -rowWidth / 2;
      const y = startY + row * itemSpacingY;

      for (let col = 0; col < itemsInRow; col++) {
        if (itemIndex >= this.gachaResults.length) break;

        const x = startX + col * itemSpacingX;
        const char = this.scene.add.image(x, y, this.gachaResults[itemIndex]).setDisplaySize(200, 200);
        this.popup.add(char);
        itemIndex++;
      }
    }

    const confirmBtn = this.scene.add.image(0, 260, 'lever_confirm_button')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.popup.add(confirmBtn);
    confirmBtn.on('pointerdown', () => {
      this.popup.destroy(true);
      this.popup = null;
    });
  }

  // ------------------- Helper -------------------
  createPopupWithOverlay(centerX = null, centerY = null) {
    const cam = this.scene.cameras.main;

    centerX ??= cam.centerX;
    centerY ??= cam.centerY;

    if (this.popup) {
      this.popup.destroy(true);
      this.popup = null;
    }

    this.popup = this.scene.add.container(centerX, centerY);

    // Dimmed background overlay (size to camera)
    const overlay = this.scene.add.rectangle(0, 0, cam.width, cam.height, 0x000000, 0.5)
      .setOrigin(0.5);
    overlay.setInteractive();
    this.popup.add(overlay);

    return this.popup;
  }
}
