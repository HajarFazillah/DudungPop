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
    const bg = scene.add.image(centerX, centerY, 'popup_bg1')
      .setDisplaySize(this.popupWidth, this.popupHeight);


    // tabs images
    const tabX = centerX- 120;
    const tabY = centerY - this.popupHeight / 2 + 40;
    const tabGap = 115;

    const enhanceTab = scene.add.image(tabX - tabGap / 2, tabY, 'store_enhance')
      .setDisplaySize(110, 45)
      .setInteractive({ useHandCursor: true });
    const interiorTab = scene.add.image(tabX + tabGap / 2, tabY, 'store_interior')
      .setDisplaySize(110, 45)
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
          price: 9999,
          comingSoon: false
        },
        {
          id: 'default_store_1',
          text: '기본 장식장',
          price: 0,
          comingSoon: true
        },
        {
          id: 'default_store_2',
          text: '기본 장식장',
          price: 0,
          comingSoon: true
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

    // ----- normal content (title + price) -----
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

    const priceImg = scene.add.image(
      bg.x + bg.displayWidth / 2 - 80,
      y,
      priceTextureKey
    );

    const coinIcon = scene.add.image(
      priceImg.x - priceImg.displayWidth / 4,
      priceImg.y,
      'coin'
    ).setScale(0.5);

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

    // clickable area (will be disabled for comingSoon)
    const hitRect = scene.add.rectangle(
      bg.x,
      y,
      bg.displayWidth,
      bg.displayHeight,
      0x000000,
      0
    );
    const children = [bg, text, priceImg, coinIcon, priceText, hitRect];

    const onPriceClick = () => {
      if (item.comingSoon) return;
      this.pendingItem = item;
      this.showConfirm();
    };

    priceImg.setInteractive({ useHandCursor: true }).on('pointerdown', onPriceClick);
    coinIcon.setInteractive({ useHandCursor: true }).on('pointerdown', onPriceClick);
    priceText.setInteractive({ useHandCursor: true }).on('pointerdown', onPriceClick);

    // ----- overlay for comingSoon items -----
    if (item.comingSoon) {
      // dark translucent box covering the whole card
      const overlay = scene.add.rectangle(
        bg.x,
        y,
        bg.displayWidth,
        bg.displayHeight,
        0x000000,
        0.6
      );

      const title = scene.add.text(
        bg.x - bg.displayWidth / 2 + 40,
        y - 30,
        '기본 장식장',
        {
          fontSize: '22px',
          color: '#ffffff',
          fontFamily: 'DoveMayo'
        }
      ).setOrigin(0, 0.5);

      const openSoon = scene.add.text(
        bg.x - bg.displayWidth / 2 + 40,
        y + 10,
        '플레이타임 240시간 이후 오픈',
        {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Arial'
        }
      ).setOrigin(0, 0.5);

      // change button inside the price box area
      const changeText = scene.add.text(
        priceImg.x,
        priceImg.y,
        '변경하기',
        {
          fontSize: '18px',
          color: '#000000',
          fontFamily: 'Arial'
        }
      ).setOrigin(0.5);

      // overlay should be above hitRect so clicks don't pass
      children.push(overlay, title, openSoon, changeText);
    }

    this.itemsContainer.add(children);
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
    img.setDisplaySize(400, 200);


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
    img.setDisplaySize(400, 200);

    // exit button at right-left of PNG
    const exitHit = scene.add.rectangle(
      img.x + img.displayWidth / 2 - 60,
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
