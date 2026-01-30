// ui/BottomNavBar.js
// Container-based nav bar so you can reposition it responsively from GameScene.
// Children positions are local to the container (0,0 is the container origin). [web:264][web:266]

import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class BottomNavBar {
  constructor(scene, x = 0, y = 0, onButtonClicked = null) {
    this.scene = scene;
    this.onButtonClicked = onButtonClicked;

    // Layout config (tune)
    this.circleRadius = 55;
    this.circleGap = 30;
    this.arrowOffset = 60;
    this.arrowSize = 60;

    this.labels = ['장식장', '가방', '상점', '도감'];
    this.buttonImages = ['navbar_theme', 'navbar_bag', 'navbar_store', 'navbar_collection'];

    // Scene cycle
    this.mainScenes = ['GameScene', 'PartTimeScene', 'InventoryScene'];

    // Root container (move this on resize)
    this.container = scene.add.container(x, y);

    // Hold references so we can destroy safely
    this.leftArrow = null;
    this.rightArrow = null;
    this.buttons = [];

    this.create();
  }

  // Public API for GameScene
  setPosition(x, y) {
    this.container.setPosition(x, y); // setPosition is standard Transform component [web:269]
  }

  setScale(s) {
    this.container.setScale(s);
  }

  destroy() {
    this.container.destroy(true);
  }

  create() {
    // Clear if recreate
    this.container.removeAll(true);
    this.buttons.length = 0;

    const n = this.labels.length;
    const totalButtonsWidth = n * (this.circleRadius * 2) + (n - 1) * this.circleGap;

    // Local-space layout: center buttons around x=0
    const startX = -totalButtonsWidth / 2 + this.circleRadius;

    // Left arrow (local)
    this.leftArrow = this.scene.add.image(
      startX - this.circleRadius - this.arrowOffset,
      0,
      'navbar_left'
    )
      .setDisplaySize(this.arrowSize, this.arrowSize)
      .setInteractive({ useHandCursor: true });

    this.container.add(this.leftArrow);

    // Buttons (local)
    this.labels.forEach((label, i) => {
      const x = startX + i * (this.circleRadius * 2 + this.circleGap);

      const btn = this.scene.add.image(x, 0, this.buttonImages[i])
        .setDisplaySize(this.circleRadius * 2, this.circleRadius * 2)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        if (this.onButtonClicked) this.onButtonClicked(label);
      });

      this.buttons.push(btn);
      this.container.add(btn);
    });

    // Right arrow (local)
    const lastX = startX + (n - 1) * (this.circleRadius * 2 + this.circleGap);

    this.rightArrow = this.scene.add.image(
      lastX + this.circleRadius + this.arrowOffset,
      0,
      'navbar_right'
    )
      .setDisplaySize(this.arrowSize, this.arrowSize)
      .setInteractive({ useHandCursor: true });

    this.container.add(this.rightArrow);

    // Page navigation logic (same as your original)
    const currentSceneKey = this.scene.scene.key;
    const currentIndex = this.mainScenes.indexOf(currentSceneKey);

    this.leftArrow.on('pointerdown', () => {
      const prevIndex = (currentIndex - 1 + this.mainScenes.length) % this.mainScenes.length;
      this.scene.scene.start(this.mainScenes[prevIndex]);
    });

    this.rightArrow.on('pointerdown', () => {
      const nextIndex = (currentIndex + 1) % this.mainScenes.length;
      this.scene.scene.start(this.mainScenes[nextIndex]);
    });
  }
}