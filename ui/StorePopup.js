// StorePopup.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class StorePopup {
  constructor(scene, playerState) {
    this.scene = scene;

    // playerState should hold coins, bagSize, etc.
    // e.g. { coins: 0, bagSlots: 20, clickLevel: 1 }
    this.playerState = playerState;

    this.container = null;
    this.currentTab = 'enhance'; // 'enhance' or 'interior'

    // sub popups
    this.confirmContainer = null;
    this.completeContainer = null;
    this.pendingItem = null; // which item is being bought

    // layout
    this.popupWidth = 500;
    this.popupHeight = 700;
  }

  // call once before first use, or from show()
  createPopup() {
    const scene = this.scene;
    const cam = scene.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(900);
    this.container.setVisible(false);

    // dark overlay
    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      cam.width,
      cam.height,
      0x000000,
      0.6
    ).setInteractive();

    // main popup background (use your popup_bg1)
     // main popup background (centered, same size as other popups)
     const bg = scene.add.image(centerX, centerY, 'popup_bg1')
     .setDisplaySize(this.popupWidth, this.popupHeight);


    // tabs images
    const tabY = centerY - this.popupHeight / 2 + 40;
    const tabGap = 120;

    const enhanceTab = scene.add.image(centerX - tabGap / 2, tabY, 'store_enhance')
      .setDisplaySize(90,30)
      .setInteractive({ useHandCursor: true });
    const interiorTab = scene.add.image(centerX + tabGap / 2, tabY, 'store_interior')
    .setDisplaySize(90,30)
      .setInteractive({ useHandCursor: true });

    enhanceTab.on('pointerdown', () => {
      this.currentTab = 'enhance';
      this.refreshTabVisual(enhanceTab, interiorTab);
      this.refreshItems();
    });

    interiorTab.on('pointerdown', () => {
      this.currentTab = 'interior';
      this.refreshTabVisual(enhanceTab, interiorTab);
      this.refreshItems();
    });

    // close button (pink X) bottom-left, using simple text/rect
    const exitBtn = scene.add.image(
  centerX - this.popupWidth / 2 + 32,   
  centerY + this.popupHeight / 2 - 32,  
  'exit_button'
 )
 .setDisplaySize(48, 48)
 .setInteractive({ useHandCursor: true });
 exitBtn.on('pointerdown', () => this.hide());

    // container for item rows
    this.itemsContainer = scene.add.container(0, 0);

    this.container.add([
      overlay,
      bg,
      enhanceTab,
      interiorTab,
      this.itemsContainer,
      exitBtn
    ]);

    // create confirm + complete popups
    this.createConfirmPopup();
    this.createCompletePopup();

    this.refreshTabVisual(enhanceTab, interiorTab);
    this.refreshItems();
  }

  refreshTabVisual(enhanceTab, interiorTab) {
    // simple tint swap, adjust if your PNG already has states
    if (this.currentTab === 'enhance') {
      enhanceTab.clearTint();
      interiorTab.setTint(0xaaaaaa);
    } else {
      enhanceTab.setTint(0xaaaaaa);
      interiorTab.clearTint();
    }
  }

  // create list of items for current tab
  refreshItems() {
    const scene = this.scene;
    const cam = scene.cameras.main;
    const centerX = cam.centerX;

    this.itemsContainer.removeAll(true);

    const startY = cam.centerY - 160;
    const gapY = 170;

    if (this.currentTab === 'enhance') {
      const items = [
        {
          id: 'bag_up',
          text: '가방 크기 키우기\n4칸 확장',
          price: 9999 // change as you like
        },
        {
          id: 'click_up',
          text: '클릭 시 금액 2배',
          price: 9999
        }
      ];

      items.forEach((item, index) => {
        const y = startY + index * gapY;
        this.createStoreItemRow(item, centerX, y, 'store_price'); //need to add coin pic and price here
      });
    } else {
      // interior tab – example items
      const items = [
        {
          id: 'winter_store',
          text: '겨울 장식장',
          price: 9999
        }
        // you can add more interiors
      ];

      items.forEach((item, index) => {
        const y = startY + index * gapY;
        this.createStoreItemRow(item, centerX, y, 'store_price');
      });
    }
  }

  createStoreItemRow(item, centerX, y, priceTextureKey) {
    const scene = this.scene;

    // gray background block
    const bg = scene.add.image(centerX, y, 'store_bg');
    bg.setDisplaySize(430, 150);

    // description text on left inside gray
    const text = scene.add.text(
      bg.x - bg.displayWidth / 2 + 40,
      y,
      item.text,
      {
        fontSize: '20px',
        color: '#000000',
        fontFamily: 'Arial',
        align: 'left',
        wordWrap: { width: bg.displayWidth * 0.55 }
      }
    ).setOrigin(0, 0.5);

    // price image on right
    const priceImg = scene.add.image(
      bg.x + bg.displayWidth / 2 - 80,
      y,
      priceTextureKey
    );

    // COIN ICON inside price box (left)
  const coinIcon = scene.add.image(
    priceImg.x - priceImg.displayWidth / 4,
    priceImg.y,
    'coin'      // your coin.png key
  ).setScale(0.5); // adjust

  // PRICE TEXT inside price box (right side)
  const priceText = scene.add.text(
    priceImg.x + priceImg.displayWidth / 6,
    priceImg.y,
    item.price.toString(),
    {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial'
    }
  ).setOrigin(0.5);

    // clickable area – use entire row
    const hitRect = scene.add.rectangle(
      bg.x,
      y,
      bg.displayWidth,
      bg.displayHeight,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    hitRect.on('pointerdown', () => {
      this.pendingItem = item;
      this.showConfirm();
    });

    this.itemsContainer.add([bg, text, priceImg, coinIcon, priceText, hitRect]);
  }

  // confirm popup using store_buy png
  createConfirmPopup() {
    const scene = this.scene;
    const cam = scene.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    this.confirmContainer = scene.add.container(0, 0);
    this.confirmContainer.setDepth(950);
    this.confirmContainer.setVisible(false);

    const img = scene.add.image(centerX, centerY, 'store_buy');
    img.setDisplaySize(400,200);


    // clickable cancel (bottom-left area of the PNG)
    const cancelHit = scene.add.rectangle(
      img.x - img.displayWidth / 2 + 60,
      img.y + img.displayHeight / 2 - 40,
      80,
      40,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    cancelHit.on('pointerdown', () => {
      this.confirmContainer.setVisible(false);
      this.pendingItem = null;
    });

    // clickable confirm (bottom-right area of the PNG)
    const okHit = scene.add.rectangle(
      img.x + img.displayWidth / 2 - 60,
      img.y + img.displayHeight / 2 - 40,
      80,
      40,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    okHit.on('pointerdown', () => {
      this.handlePurchase();
    });

    this.confirmContainer.add([img, cancelHit, okHit]);
  }

  // purchase-complete popup using store_buyComplete
  createCompletePopup() {
    const scene = this.scene;
    const cam = scene.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    this.completeContainer = scene.add.container(0, 0);
    this.completeContainer.setDepth(960);
    this.completeContainer.setVisible(false);

    const img = scene.add.image(centerX, centerY, 'store_buyComplete');

    // exit button at bottom-left of PNG
    const exitHit = scene.add.rectangle(
      img.x - img.displayWidth / 2 + 60,
      img.y + img.displayHeight / 2 - 40,
      80,
      40,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    exitHit.on('pointerdown', () => {
      this.completeContainer.setVisible(false);
    });

    this.completeContainer.add([img, exitHit]);
  }

  showConfirm() {
  if (!this.confirmContainer) return;
  this.confirmContainer.setVisible(true);
}

  // logic when user presses "Yes" on confirm popup
  handlePurchase() {
    if (!this.pendingItem) return;

    const item = this.pendingItem;
    const cost = item.price;
    const state = this.playerState;

    if (state.coins < cost) {
      // TODO: show "not enough money" popup
      this.confirmContainer.setVisible(false);
      this.pendingItem = null;
      return;
    }

    // subtract coins
    state.coins -= cost;

    // apply effect by item id
    switch (item.id) {
      case 'bag_up':
        state.bagSlots = (state.bagSlots || 20) + 4;
        break;
      case 'click_up':
        state.clickLevel = (state.clickLevel || 1) + 1;
        break;
      case 'winter_store':
        state.currentInterior = 'winter';
        break;
      default:
        break;
    }

    // TODO: notify CoinBar to refresh text if needed

    this.confirmContainer.setVisible(false);
    this.pendingItem = null;
    this.completeContainer.setVisible(true);
  }

  show() {
    if (!this.container) {
      this.createPopup();
    }
    this.container.setVisible(true);
  }

  hide() {
    if (!this.container) return;
    this.container.setVisible(false);
    this.confirmContainer.setVisible(false);
    this.completeContainer.setVisible(false);
    this.pendingItem = null;
  }
}
