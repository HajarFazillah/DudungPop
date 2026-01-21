import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import BootScene from './scenes/BootScene.js';
import StartScene from './scenes/StartScene.js';
import GameScene from './scenes/GameScene.js';
import PartTimeScene from './scenes/PartTimeScene.js';
import CollectionPopup from '../ui/CollectionPopup.js';
import InventoryScene from './scenes/InventoryScene.js';

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 720,    // example value
    height: 1820  // matches your coordinate system               
  },
  scene: [BootScene, StartScene, GameScene, PartTimeScene, CollectionPopup, InventoryScene]
};

const game = new Phaser.Game(config);