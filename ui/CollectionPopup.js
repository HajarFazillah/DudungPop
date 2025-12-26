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

    // total stories/ item area (top‑right)
    this.totalBg = scene.add.image(popupRight - 70, popupTop + 40, 'collection_total_bg')
      .setOrigin(0.5)
      .setScale(0.9);

    this.totalIcon = scene.add.image(
      this.totalBg.x - this.totalBg.displayWidth * 0.35,
      this.totalBg.y,
      'collection_book_open'
    ).setOrigin(0.5);

    this.totalText = scene.add.text(
      this.totalBg.x + this.totalBg.displayWidth * 0.01,
      this.totalBg.y,
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
      this.totalBg,
      this.totalIcon,
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

      if (this.totalIcon) this.totalIcon.setTexture('collection_book_open');
      if (this.totalText) this.totalText.setText('4 / 12');

    } else {
      storyBtn.setTexture('collection_story_unclicked');
      itemBtn.setTexture('collection_item_clicked');

      if (this.totalIcon) this.totalIcon.setTexture('collection_gift');
      if (this.totalText) this.totalText.setText('20 / NN');
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

      // upper half background (collection_bg3)
      const upperY = this.listMaskArea.y - this.visibleHeight / 2 + 130;
      const upperBg = scene.add.image(centerX, upperY, 'collection_bg3')
        .setOrigin(0.5);
      upperBg.displayWidth = this.listBgWidth;
      upperBg.displayHeight = 310;

      // 1) top board image (collection_item_board)
      const board = scene.add.image(centerX, upperY - 60, 'collection_item_board')
        .setOrigin(0.5)
        .setScale(0.5);

      // 2) middle: two small panels (price + first gacha date)
      const midY = upperY + 5;
      const gapX = 110;
      const leftMidX = centerX - gapX;
      const rightMidX = centerX + gapX;

      // left: price panel
      const priceBg = scene.add.image(leftMidX, midY + 8, 'collection_item_bg')
        .setOrigin(0.5)
        .setScale(0.4);

      const coinIcon = scene.add.image(priceBg.x - priceBg.displayWidth * 0.35, priceBg.y, 'coin')
        .setOrigin(0.5)
        .setScale(0.2);

      const priceLabel = scene.add.text(
        coinIcon.x + 20,
        priceBg.y,
        '판매 가격',
        { fontSize: '14px', fontFamily: 'DoveMayo', color: '#000000' }
      ).setOrigin(0, 0.5);

      const priceText = scene.add.text(
        priceBg.x + priceBg.displayWidth * 0.3,
        priceBg.y,
        '99999999',
        { fontSize: '14px', fontFamily: 'DoveMayo', color: '#000000' }
      ).setOrigin(0.5, 0.5); // right aligned

      // right: first gacha date panel
      const dateBg = scene.add.image(rightMidX, midY + 8, 'collection_item_bg')
        .setOrigin(0.5)
        .setScale(0.4);

      const capsuleIcon = scene.add.image(dateBg.x - dateBg.displayWidth * 0.35, dateBg.y, 'collection_capsule')
        .setOrigin(0.5)
        .setScale(0.5);

      const dateLabel = scene.add.text(
        capsuleIcon.x + 20,
        dateBg.y,
        '최초 가챠일',
        { fontSize: '14px', fontFamily: 'DoveMayo', color: '#000000' }
      ).setOrigin(0, 0.5);

      const dateText = scene.add.text(
        dateBg.x + dateBg.displayWidth * 0.3,
        dateBg.y,
        '9999.99.99',
        { fontSize: '14px', fontFamily: 'DoveMayo', color: '#000000' }
      ).setOrigin(0.5, 0.5);

      // 3) bottom of upper section: combine items row
      const bottomY = upperY + 90;

      const comboBg = scene.add.image(centerX, bottomY, 'collection_item_bg2')
        .setOrigin(0.5)
        .setScale(0.66);

      const uniteIcon = scene.add.image(
        comboBg.x - comboBg.displayWidth * 0.38,
        comboBg.y,
        'collection_item_unite'
      ).setOrigin(0.5)
       .setScale(0.5);

      const uniteText = scene.add.text(
        uniteIcon.x,
        comboBg.y,
        '합체 가능한 아이템',
        { fontSize: '14px', fontFamily: 'DoveMayo', color: '#000000' }
      ).setOrigin(0.5)
      .setScale(0.6);

      const possibleBg = scene.add.image(
        comboBg.x + comboBg.displayWidth * 0.12,
        comboBg.y,
        'collection_item_bg3'
      ).setOrigin(0.5)
      .setScale(1.25);

      const possibleIcon = scene.add.image(possibleBg.x - 4, possibleBg.y, 'collection_possible_item')
        .setOrigin(0.5)
        .setScale(0.6);

      // add all upper objects to fixed UI (they don't scroll)
      this.fixedUIContainer.add([
        upperBg,
        board,
        priceBg,
        coinIcon,
        priceLabel,
        priceText,
        dateBg,
        capsuleIcon,
        dateLabel,
        dateText,
        comboBg,
        uniteIcon,
        uniteText,
        possibleBg,
        possibleIcon
      ]);

      // ---------- lower scroll grid ----------
      const outlineY = this.listMaskArea.y + this.visibleHeight / 2 - 120;

      const outline = scene.add.image(centerX, outlineY, 'collection_item_outline')
        .setOrigin(0.5);
      outline.displayWidth = this.listBgWidth;
      outline.displayHeight = this.visibleHeight - 260;

      this.scrollContainer.add(outline);

      // simple 4xN grid of collection_items inside outline
      const cols = 4;
      const cardWidth = 80;
      const cardHeight = 90;
      const hGap = 10;
      const vGap = 10;

      const totalWidth = cols * cardWidth + (cols - 1) * hGap;
      const gridStartX = centerX - totalWidth / 2 + cardWidth / 2;
      const gridStartY = outlineY - outline.displayHeight / 2 + cardHeight / 2 + 10;

      for (let i = 0; i < this.itemsData.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = gridStartX + col * (cardWidth + hGap);
        const y = gridStartY + row * (cardHeight + vGap);

        const cardBg = scene.add.image(x, y, 'collection_gacha')
          .setOrigin(0.5)
          .setDisplaySize(cardWidth, cardHeight);

        this.scrollContainer.add(cardBg);
      }

      const totalRows = Math.ceil(this.itemsData.length / cols);
      const gridHeight = totalRows * cardHeight + (totalRows - 1) * vGap;
      const visibleGridArea = outline.displayHeight - 20;
      const maxScroll = Math.max(0, gridHeight - visibleGridArea);

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

      const hasThreeFullStars = item.status[0] && item.status[1] && item.status[2] && !item.locked;

      // existing bg + text:
      this.scrollContainer.add([rowBg, nameText]);

      if (hasThreeFullStars) {
        // make the whole row clickable
        rowBg.setInteractive({ useHandCursor: true });
        nameText.setInteractive({ useHandCursor: true });

        const openDetail = () => this.showStoryDetail(item);
        rowBg.on('pointerdown', openDetail);
        nameText.on('pointerdown', openDetail);
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
  // item: a story object from this.itemsData
  showStoryDetail(item) {
    const scene = this.scene;
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;

    // simple container so we can destroy everything at once
    if (this.detailContainer) {
      this.detailContainer.destroy();
    }
    this.detailContainer = scene.add.container(0, 0).setDepth(1000);

    // dim background
    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.5
    ).setInteractive();

    // main bg (collection_bg3)
    const bg = scene.add.image(centerX, centerY, 'collection_bg3')
      .setOrigin(0.5);
    bg.displayWidth = 500;
    bg.displayHeight = 600;

    const popupLeft = centerX - bg.displayWidth / 2;
    const popupTop = centerY - bg.displayHeight / 2;
    const popupBottom = centerY + bg.displayHeight / 2;

    // title background + text
    const titleBg = scene.add.image(centerX, popupTop + 55, 'collection_title_bg')
      .setOrigin(0.5);

    const titleText = scene.add.text(
      centerX,
      titleBg.y,
      item.name, // "토토의 기다림"
      {
        fontSize: '22px',
        color: '#000000',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // story body bg (collection_bg2)
    const storyBg = scene.add.image(centerX, centerY, 'collection_bg2')
      .setOrigin(0.5);
    storyBg.displayWidth = 460;
    storyBg.displayHeight = 360;

    const storyText = scene.add.text(
      storyBg.x - storyBg.displayWidth / 2 + 20,
      storyBg.y - storyBg.displayHeight / 2 + 20,
      '골든 리트리버, 토토는 오늘도 입구에 앉아 주인을 기다린다.\n' +
      '"토토, 주인이 오려면 한참 기다려야 해.”\n' +
      '"알아요."\n' +
      '"언덕에 가서 친구들이랑 놀고 있어. 심심하지 않아?"\n' +
      '하지만 토토는 고개를 저으며 말했다.\n' +
      '"나는 기다리는 거 잘해요. 그리고 전혀 심심하지 않아요.\n' +
      '왜냐면 주인님은 꼭 올거니까요."\n' +
      '골든 리트리버 토토는 빨간 목도리를 목에 메고 혹시나 주인이 빨리\n' +
      '올까봐 마음을 졸이며 고개를 기웃거린다.\n' +
      '이 목도리를 메고 있다면 주인이 한 눈에 자신을 알아볼까하고 말이',
      {
        fontSize: '16px',
        color: '#000000',
        fontFamily: 'Arial',
        wordWrap: { width: storyBg.displayWidth - 40 }
      }
    ).setOrigin(0, 0);

    // 3 gacha cards along bottom
    const gachaY = popupBottom - 60;
    const spacing = 140;
    const startX = centerX - spacing;

    const gachaCards = [];
    for (let i = 0; i < 3; i++) {
      const card = scene.add.image(startX + i * spacing, gachaY, 'collection_gacha')
        .setOrigin(0.5)
        .setScale(0.8);
      gachaCards.push(card);
    }

    // close button (reuse exit_button style)
    const closeBtn = scene.add.image(popupLeft + 32, popupBottom - 32, 'exit_button')
      .setOrigin(0.5)
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.detailContainer.destroy();
      this.detailContainer = null;
    });

    this.detailContainer.add([
      overlay,
      bg,
      titleBg,
      titleText,
      storyBg,
      storyText,
      ...gachaCards,
      closeBtn
    ]);
  }
}
