import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CollectionPopup {
  constructor(scene) {
    this.scene = scene;
    this.popupContainer = null;

    this.detailContainer = null;   // fixed yellow card
    this.scrollContainer = null;   // scrollable list / grid

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
    const scene   = this.scene;
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;

    // Main popup container
    this.popupContainer = scene.add.container(0, 0);
    this.popupContainer.setVisible(false);
    this.popupContainer.setDepth(999);

    // Overlay
    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.5
    ).setInteractive();

    // Popup box
    const box = scene.add.rectangle(
      centerX,
      centerY,
      this.popupWidth,
      this.popupHeight,
      0xf5f5f5
    ).setStrokeStyle(2, 0x000000);

    // Close button
    const xBtnSize = 48;
    const xBtn = scene.add.text(
      centerX + this.popupWidth / 2 - xBtnSize,
      centerY - this.popupHeight / 2 + xBtnSize,
      'X',
      { fontSize: '28px', fontStyle: 'bold', color: '#91131a', fontFamily: 'Arial' }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });
    xBtn.on('pointerover', () => xBtn.setColor('#fa5555'));
    xBtn.on('pointerout',  () => xBtn.setColor('#91131a'));
    xBtn.on('pointerdown', () => this.hidePopup());

    // Tabs
    const tabLeft    = centerX - (this.popupWidth / 2) + 80;
    const tabSpacing = 110;
    const tabY       = centerY - (this.popupHeight / 2) + this.tabHeight / 2 + 25;

    const tabs = [
      { key: 'story', label: '스토리', x: tabLeft },
      { key: 'item',  label: '아이템', x: tabLeft + tabSpacing }
    ];

    this.tabButtons = [];
    this.tabTexts   = [];

    tabs.forEach(tab => {
      const isSelected = tab.key === this.selectedTab;

      const btn = scene.add.rectangle(tab.x, tabY, 100, this.tabHeight,
        isSelected ? 0x999999 : 0xcccccc
      ).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.selectedTab = tab.key;
        this.refreshTabs();
        this.refreshList();
      });

      this.tabButtons.push(btn);

      const txt = scene.add.text(tab.x, tabY, tab.label, {
        fontSize: '18px',
        color: isSelected ? '#fff' : '#000'
      }).setOrigin(0.5);

      this.tabTexts.push(txt);
    });

    // List / mask area (below tabs)
    const maskTopY = tabY + (this.tabHeight / 2) + this.extraTopSpace;

    this.listMaskArea = scene.add.rectangle(
      centerX,
      maskTopY + this.visibleHeight / 2,
      this.listWidth,
      this.visibleHeight,
      0xdddddd
    ).setStrokeStyle(1, 0x000000);

    // Containers for partition
    this.detailContainer = scene.add.container(0, 0);   // fixed yellow card
    this.scrollContainer = scene.add.container(0, 0);   // scrollable items

    // Mask only for scrollContainer
    const maskGfx = scene.make.graphics({});
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(centerX - this.listWidth / 2, maskTopY, this.listWidth, this.visibleHeight);
    const mask = maskGfx.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // Scroll bounds and starting Y (for story list & grid area)
    this.itemsStartY = maskTopY + this.itemHeight / 2;
    this.scrollBounds = { min: 0, max: 0 };
    this.scrollY = 0;

    // Mouse wheel scrolling
    scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (!this.popupContainer.visible) return;
      this.scrollY += deltaY * 0.5;
      this.updateScroll();
    });

    this.popupContainer.add([
      overlay,
      box,
      xBtn,
      ...this.tabButtons,
      ...this.tabTexts,
      this.listMaskArea,
      this.detailContainer,
      this.scrollContainer
    ]);

    scene.add.existing(this.popupContainer);
    this.refreshList();
  }

  refreshTabs() {
    for (let i = 0; i < this.tabButtons.length; i++) {
      const key = (i === 0) ? 'story' : 'item';
      const isSelected = this.selectedTab === key;
      this.tabButtons[i].fillColor = isSelected ? 0x999999 : 0xcccccc;
      this.tabTexts[i].setColor(isSelected ? '#fff' : '#000');
    }
  }

  refreshList() {
    this.scrollContainer.removeAll(true);
    if (this.detailContainer) {
      this.detailContainer.removeAll(true);
    }

    const scene   = this.scene;
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;
    const startY  = this.itemsStartY;

    // ---------- ITEM TAB: fixed yellow card + scrollable grid ----------
    if (this.selectedTab === 'item') {

      this.scrollContainer.removeAll(true);
      this.detailContainer.removeAll(true);

      const scene = this.scene;
      const centerX = scene.cameras.main.centerX;
      
      // place yellow card nearer top of list frame
      const cardY = this.listMaskArea.y - this.visibleHeight / 2 + 130;  // within grey box

      const detailOuter = scene.add.rectangle(centerX, cardY, this.listBgWidth, 220, 0xffffff)
        .setStrokeStyle(4, 0xf4b400);
      const thumb = scene.add.rectangle(centerX - 140, cardY - 40, 90, 90, 0xeeeeee);

      const titleText = scene.add.text(centerX - 70, cardY - 70, '이름이름이름', {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#000'
      }).setOrigin(0, 0);

      const descText = scene.add.text(centerX - 70, cardY - 40,
        '아이템 설명이 들어가는 영역.\n여러 줄의 텍스트가 표시됩니다.', {
          fontSize: '12px',
          color: '#333',
          wordWrap: { width: 220 }
        }).setOrigin(0, 0);

      const infoBarY = cardY + 40;
      const infoBar = scene.add.rectangle(centerX, infoBarY, this.listBgWidth - 10, 26, 0xffffff)
        .setStrokeStyle(2, 0xf4b400);

      this.detailContainer.add([detailOuter, thumb, titleText, descText, infoBar]);

      // scrollable grid (lower partition)
      const cols       = 4;
      const cardWidth  = 80;
      const cardHeight = 90;
      const hGap       = 10;
      const vGap       = 10;

      const totalWidth = cols * cardWidth + (cols - 1) * hGap;
      const gridStartX = centerX - totalWidth / 2 + cardWidth / 2;

      const gridStartY = cardY + 140; // inside mask, independent of card

      for (let i = 0; i < this.itemsData.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = gridStartX + col * (cardWidth + hGap);
        const y = gridStartY + row * (cardHeight + vGap);

        const item   = this.itemsData[i];
        const locked = item.locked;

        const cardBg = scene.add.rectangle(
          x, y, cardWidth, cardHeight,
          locked ? 0xaaaaaa : 0xffffff,
          locked ? 0.6 : 1
        ).setStrokeStyle(1, 0x666666);

        const miniThumb = scene.add.rectangle(x, y - 8, 50, 40, 0xeeeeee);

        const nameText = scene.add.text(x, y + 22, item.name, {
          fontSize: '10px',
          color: locked ? '#777777' : '#000000'
        }).setOrigin(0.5);

        this.scrollContainer.add([cardBg, miniThumb, nameText]);
      }

      const totalRows  = Math.ceil(this.itemsData.length / cols);
      const gridHeight = totalRows * cardHeight + (totalRows - 1) * vGap;

      const visible = this.listMaskArea.height;

      // how much we can scroll before the last row reaches bottom of mask
      const maxScroll = Math.max(0, gridHeight - visible);

      // bounds: 0 (top) down to -maxScroll (bottom)
      this.scrollBounds.max = maxScroll;
      this.scrollBounds.min = 0;

      // reset scroll to top each time you open / switch tab
      this.scrollY = 0;
      this.updateScroll();
      return;
    }

    // ---------- STORY TAB: original vertical list ----------
    for (let i = 0; i < this.itemsData.length; i++) {
      const y    = startY + i * this.itemHeight;
      const item = this.itemsData[i];

      const bg = scene.add.rectangle(centerX, y, this.listBgWidth, 70,
        item.locked ? 0x888888 : 0xffffff,
        item.locked ? 0.5 : 1
      ).setStrokeStyle(1, 0x444);

      const nameText = scene.add.text(centerX - 150, y, item.name, {
        fontSize: '16px',
        color: item.locked ? '#666' : '#000'
      }).setOrigin(0, 0.5);

      for (let j = 0; j < 3; j++) {
        const iconX = centerX + 80 + j * 38;
        const iconY = y;
        const width = 28;
        const height = 22;
        const fillColor   = item.locked ? 0x444444 : (item.status[j] ? 0xc2c2c2 : 0xefefef);
        const strokeColor = item.locked ? 0x222222 : 0x888888;
        const rect = scene.add.rectangle(iconX, iconY, width, height, fillColor)
          .setStrokeStyle(2, strokeColor);
        this.scrollContainer.add(rect);
      }

      this.scrollContainer.add([bg, nameText]);
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
