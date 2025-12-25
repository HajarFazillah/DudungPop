import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CollectionPopup {
  constructor(scene) {
    this.scene = scene;
    this.popupContainer = null;

    this.fixedUIContainer = null;
    this.scrollContainer = null;

    this.scrollY = 0;
    this.scrollBounds = { min: 0, max: 0 };

    this.selectedTab = 'story'; // Default tab
    this.tabButtons = [];
    this.tabTexts = [];

    this.itemsData = this.generateTestData();

    this.visibleHeight = 550;
    this.itemHeight = 80;
    this.tabHeight = 40;
    this.extraTopSpace = 30;
    this.listWidth = 440;
    this.listBgWidth = 400;
    this.popupWidth = 500;
    this.popupHeight = 700;
  }

  // IMPORTANT:
  // Make sure your Scene.preload has something like:
  //
  // this.load.image('pentagon_on',    'assets/pentagon_on.png');
  // this.load.image('pentagon_off',   'assets/pentagon_off.png');
  // this.load.image('pentagon_lock',  'assets/pentagon_lock.png');
  // this.load.image('chat_icon',      'assets/chat_icon.png'); // optional
  //
  // You can change the keys below if your art uses different names.

  generateTestData() {
    const base = [
      { name: '토토의 기다림', status: [true, true, true, true], locked: false },
      { name: '토토의 기다림', status: [true, true, true, false], locked: false },
      { name: '토토의 기다림', status: [true, true, true, true], locked: false },
      { name: '이름이름이름이름', status: [true, true, false, false], locked: false },
      { name: '이름이름이름이름', status: [true, false, false, false], locked: false },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true },
      { name: '이름이름이름이름', status: [true, true, false, false], locked: false },
      { name: '이름이름이름이름', status: [true, false, false, false], locked: false }
    ];
    // plenty of items to scroll through
    return base.concat(base).concat(base);
  }

  createPopup() {
    const scene = this.scene;
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;

    // createPopup
    this.fixedUIContainer = scene.add.container(0, 0);
    this.scrollContainer = scene.add.container(0, 0);

    this.popupContainer = scene.add.container(0, 0);
    this.popupContainer.setVisible(false);
    this.popupContainer.setDepth(999);

    // Background overlay (dim)
    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.5
    ).setInteractive();

    // background image instead of grey box
    const bgImage = scene.add.image(centerX, centerY, 'collection_bg');
    bgImage.setDisplaySize(this.popupWidth, this.popupHeight);


    const popupLeft = centerX - this.popupWidth / 2;
    const popupTop = centerY - this.popupHeight / 2;
    const popupRight = centerX + this.popupWidth / 2;
    const popupBottom = centerY + this.popupHeight / 2;

    // total stories area (top‑right)
    const totalBg = scene.add.image(popupRight - 70, popupTop + 40, 'collection_total_bg')
      .setOrigin(0.5)
      .setScale(0.9);
    // optional scaling if needed:
    // totalBg.setDisplaySize(110, 36);

    const bookIcon = scene.add.image(totalBg.x - totalBg.displayWidth * 0.35, totalBg.y, 'collection_book_open')
      .setOrigin(0.5);

    this.totalText = scene.add.text(
      totalBg.x + totalBg.displayWidth * 0.02,
      totalBg.y,
      '4 / 12',
      { fontSize: '16px', color: '#000000', fontFamily: 'Arial' }
    ).setOrigin(0, 0.5);



    // Tabs (스토리 / 아이템)
    const tabY = popupTop + 40;
    const storyTabX = popupLeft + 100;
    const itemTabX = popupLeft + 220;

    const makeTab = (key, x, clickedKey, unclickedKey) => {
      const isSelected = this.selectedTab === key;
      const textureKey = isSelected ? clickedKey : unclickedKey;

      const img = scene.add.image(x, tabY, textureKey)
        .setOrigin(0.5)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });

      img.on('pointerdown', () => {
        if (this.selectedTab === key) return;
        this.selectedTab = key;
        this.refreshTabs();
        this.refreshList();
      });

      return img;
    };

    this.tabButtons = [
      makeTab('story', storyTabX, 'collection_story_clicked', 'collection_story_unclicked'),
      makeTab('item', itemTabX, 'collection_item_clicked', 'collection_item_unclicked')
    ];

    // Scrollable grey list area (below tabs)
    const maskTopY = tabY + (this.tabHeight / 2) + this.extraTopSpace;

    this.listMaskArea = scene.add.rectangle(
      centerX,
      maskTopY + this.visibleHeight / 2,
      this.listWidth,
      this.visibleHeight,
      0xffffff,
      0 // invisible, just helper
    );
    this.listMaskArea.setVisible(false);

    // Mask only for scrollContainer
    const maskGfx = scene.make.graphics({});
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(centerX - this.listWidth / 2, maskTopY, this.listWidth, this.visibleHeight);
    const mask = maskGfx.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // Scroll bounds
    this.itemsStartY = maskTopY + this.itemHeight / 2;
    this.scrollBounds = { min: 0, max: 0 };
    this.scrollY = 0;

    // Mouse wheel scrolling
    scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (!this.popupContainer.visible) return;
      this.scrollY += deltaY * 0.5;
      this.updateScroll();
    });


    // --- Bottom-left exit button ---
    let exitButton;
    if (scene.textures.exists('exit_button')) {
      exitButton = scene.add.image(popupLeft + 32, popupBottom - 32, 'exit_button')
        .setOrigin(0.5)
        .setDisplaySize(48, 48)
        .setInteractive({ useHandCursor: true });

      exitButton.on('pointerdown', () => this.hidePopup());
    } else {
      const exitContainer = scene.add.container(popupLeft + 45, popupBottom - 35);
      const exitGfx = scene.add.graphics();
      exitGfx.fillStyle(0xff0000, 1);
      exitGfx.fillRoundedRect(-18, -18, 30, 30, 10);
      const exitText = scene.add.text(-2, -2, 'X', {
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#000000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      exitContainer.add([exitGfx, exitText]);
      exitContainer.setSize(30, 30);
      exitContainer.setInteractive(
        new Phaser.Geom.Rectangle(-18, -18, 30, 30),
        Phaser.Geom.Rectangle.Contains
      ).on('pointerdown', () => this.hidePopup());
      exitButton = exitContainer;
    }

    this.fixedUIContainer.add([
      ...this.tabButtons,
      this.listMaskArea
    ]);

    this.popupContainer.add([
      overlay,
      bgImage,
      totalBg,
      bookIcon,
      this.totalText,
      this.fixedUIContainer,
      this.scrollContainer,
      exitButton
    ]);

    this.scene.add.existing(this.popupContainer);
    this.refreshList();
  }

  refreshTabs() {
    const [storyBtn, itemBtn] = this.tabButtons;
    if (!storyBtn || !itemBtn) return;

    if (this.selectedTab === 'story') {
      storyBtn.setTexture('collection_story_clicked');
      itemBtn.setTexture('collection_item_unclicked');
    } else {
      storyBtn.setTexture('collection_story_unclicked');
      itemBtn.setTexture('collection_item_clicked');
    }
  }

  refreshList() {
    this.scrollContainer.removeAll(true);

    // remove ONLY detail card elements, keep tabs
    this.fixedUIContainer.list
      .filter(obj => obj.__isDetailCard)
      .forEach(obj => {
        this.fixedUIContainer.remove(obj, true);
      });


    const scene = this.scene;
    const centerX = scene.cameras.main.centerX;
    const startY = this.itemsStartY;

    // ------------------- ITEM TAB -------------------
    if (this.selectedTab === 'item') {
      const centerX = scene.cameras.main.centerX;

      // yellow-bordered detail card, placed near top of list area
      const cardY = this.listMaskArea.y - this.visibleHeight / 2 + 130;

      const detailOuter = scene.add.rectangle(
        centerX,
        cardY,
        this.listBgWidth,
        220,
        0xffffff
      ).setStrokeStyle(2, 0xf4b400);

      const thumb = scene.add.rectangle(
        centerX - 140,
        cardY - 40,
        90,
        90,
        0xeeeeee
      );

      const titleText = scene.add.text(centerX - 70, cardY - 70, '이름이름이름', {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#000000'
      }).setOrigin(0, 0);

      const descText = scene.add.text(
        centerX - 70,
        cardY - 40,
        '아이템 설명이 들어가는 영역.\n여러 줄의 텍스트가 표시됩니다.',
        {
          fontSize: '12px',
          color: '#333333',
          wordWrap: { width: 220 }
        }
      ).setOrigin(0, 0);

      const infoBarY = cardY + 40;
      const infoBar = scene.add.rectangle(
        centerX,
        infoBarY,
        this.listBgWidth - 10,
        26,
        0xffffff
      ).setStrokeStyle(1, 0xf4b400);

      this.fixedUIContainer.add([detailOuter, thumb, titleText, descText, infoBar]);

      // scrollable grid area under the card
      const cols = 4;
      const cardWidth = 80;
      const cardHeight = 90;
      const hGap = 10;
      const vGap = 10;

      const totalWidth = cols * cardWidth + (cols - 1) * hGap;
      const gridStartX = centerX - totalWidth / 2 + cardWidth / 2;
      const gridStartY = this.listMaskArea.y - this.visibleHeight / 2 + 260;



      for (let i = 0; i < this.itemsData.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = gridStartX + col * (cardWidth + hGap);
        const y = gridStartY + row * (cardHeight + vGap);

        const item = this.itemsData[i];
        const locked = item.locked;

        const cardBg = scene.add.rectangle(
          x, y, cardWidth, cardHeight,
          locked ? 0x555555 : 0xffffff,
          locked ? 0.8 : 1
        ).setStrokeStyle(0.5, 0x333333);

        const miniThumb = scene.add.rectangle(x, y - 8, 50, 40, 0xeeeeee);

        const nameText = scene.add.text(x, y + 22, item.name, {
          fontSize: '10px',
          color: locked ? '#777777' : '#000000',
          wordWrap: { width: cardWidth - 8 },
          align: 'center'
        }).setOrigin(0.5);

        this.scrollContainer.add([cardBg, miniThumb, nameText]);
      }

      const totalRows = Math.ceil(this.itemsData.length / cols);
      const gridHeight = totalRows * cardHeight + (totalRows - 1) * vGap;
      const visibleGridHeight = this.visibleHeight - 260;
      const maxScroll = Math.max(0, gridHeight - visibleGridHeight);

      this.scrollBounds.max = maxScroll;
      this.scrollBounds.min = 0;
      this.scrollY = 0;
      this.updateScroll();
      return;
    }

    // ------------------- STORY TAB -------------------
    for (let i = 0; i < this.itemsData.length; i++) {
      const y = startY + i * this.itemHeight;
      const item = this.itemsData[i];

      // background image for each story row
      const rowBg = scene.add.image(centerX, y, 'collection_bg2')
        .setOrigin(0.5);
      rowBg.displayWidth = this.listBgWidth;
      rowBg.displayHeight = 70;

      const nameText = scene.add.text(centerX - this.listBgWidth / 2 + 20, y, item.name, {
        fontSize: '16px',
        color: item.locked ? '#aaaaaa' : '#000000',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5);

      // add bg + text first so they are behind
      this.scrollContainer.add([rowBg, nameText]);

      // 3 frames + stars on the right
      const baseX = centerX + 70;
      const gap = 46;

      let allBlack = true;

      for (let j = 0; j < 3; j++) {
        const iconX = baseX + j * gap;
        const iconY = y;

        // frame under star
        const frameImg = scene.add.image(iconX, iconY, 'collection_frame')
          .setOrigin(0.5);
        frameImg.setDisplaySize(40, 40);

        // decide star texture
        let starKey;
        if (item.locked || !item.status[j]) {
          starKey = 'collection_star_black';
        } else {
          starKey = 'collection_star';
        }
        if (starKey === 'collection_star') {
          allBlack = false;
        }

        const starImg = scene.add.image(iconX, iconY, starKey)
          .setOrigin(0.5);
        starImg.setDisplaySize(34, 34);

          // add AFTER bg so they appear on top
        this.scrollContainer.add([frameImg, starImg]);
      }

      // overlay if all 3 are black (unavailable story)
      if (allBlack) {
        const overlay = scene.add.rectangle(
          centerX,
          y,
          this.listBgWidth,
          70,
          0x000000,
          0.5
        );
         // overlay should be above everything for locked rows
        this.scrollContainer.add(overlay);
      }
    }

    this.scrollBounds.max = Math.max(0, this.itemsData.length * this.itemHeight - this.visibleHeight);
    this.scrollY = Phaser.Math.Clamp(this.scrollY, -this.scrollBounds.max, 0);
    this.updateScroll();
  }

  updateScroll() {
    this.scrollY = Phaser.Math.Clamp(this.scrollY, -this.scrollBounds.max, this.scrollBounds.min);
    this.scrollContainer.y = this.scrollY;
  }

  showPopup() {
    if (!this.popupContainer) {
      this.createPopup();
    }
    this.popupContainer.setVisible(true);
    this.popupContainer.setDepth(999);
    this.refreshTabs();
    this.refreshList();
  }

  hidePopup() {
    if (this.popupContainer) {
      this.popupContainer.setVisible(false);
    }
  }
}
