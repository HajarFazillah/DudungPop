import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    this.load.image('start_logo', 'assets/start_logo.png');
    this.load.image('start_button', 'assets/start_button.png');
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.cameras.main.setBackgroundColor('#ffffff');

    const logo = this.add.sprite(centerX, centerY - 120, 'start_logo').setOrigin(0.5);

    const startButton = this.add.sprite(centerX, centerY + 160, 'start_button').setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1.0);
    });
  }

}