import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class CollectionPopup {
  constructor(scene) {
    this.scene = scene;
    this.popupContainer = null;

    this.detailContainer = null;   // fixed yellow card (item tab)
    this.scrollContainer = null;   // scrollable list / grid

    this.scrollY = 0;
    this.scrollBounds = { min: 0, max: 0 };

    this.selectedTab = 'story'; // Default tab
    this.tabButtons = [];
    this.tabTexts = [];

    this.itemsData = this.generateTestData();

    this.visibleHeight   = 550;
    this.itemHeight      = 80;
    this.tabHeight       = 40;
    this.extraTopSpace   = 30;
    this.listWidth       = 440;
    this.listBgWidth     = 400;
    this.popupWidth      = 500;
    this.popupHeight     = 700;
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
      { name: '토토의 기다림', status: [true, true, true, true],  locked: false },
      { name: '토토의 기다림', status: [true, true, true, false], locked: false },
      { name: '토토의 기다림', status: [true, true, true, true],  locked: false },
      { name: '이름이름이름이름', status: [true, true, false, false], locked: false },
      { name: '이름이름이름이름', status: [true, false, false, false], locked: false },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true  },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true  },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true  },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true  },
      { name: '이름이름이름이름', status: [false, false, false, false], locked: true  },
      { name: '이름이름이름이름', status: [true, true, false, false],  locked: false },
      { name: '이름이름이름이름', status: [true, false, false, false], locked: false }
    ];
    // plenty of items to scroll through
    return base.concat(base).concat(base);
  }

  createPopup() {
    const scene   = this.scene;
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;

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

    // Main popup box (grey, like your mock)
    const box = scene.add.rectangle(
      centerX,
      centerY,
      this.popupWidth,
      this.popupHeight,
      0x7f7f7f
    ).setStrokeStyle(2, 0x000000);

    const popupLeft   = centerX - this.popupWidth  / 2;
    const popupTop    = centerY - this.popupHeight / 2;
    const popupRight  = centerX + this.popupWidth  / 2;
    const popupBottom = centerY + this.popupHeight / 2;

    // Top-right "4 / 12" bubble (roughly matching mock)
    const counterBg = scene.add.rectangle(
      popupRight - 60,
      popupTop + 30,
      90,
      32,
      0xf5f5f5
    ).setStrokeStyle(2, 0x000000);

    const counterText = scene.add.text(
      counterBg.x -5,
      counterBg.y,
      '4 / 12',
      { fontSize: '16px', color: '#000', fontFamily: 'Arial' }
    ).setOrigin(0, 0.5);

    // Optional chat icon on left side of that bubble
    let chatIcon;
    if (scene.textures.exists('chat_icon')) {
      chatIcon = scene.add.image(counterBg.x - 20, counterBg.y, 'chat_icon')
        .setOrigin(0.5)
        .setDisplaySize(20, 20);
    } else {
      // fallback: simple box icon
      chatIcon = scene.add.rectangle(counterBg.x - 30, counterBg.y, 16, 14, 0xffffff)
        .setStrokeStyle(2, 0x000000);
    }

    // Tabs (스토리 / 아이템)
    const tabLeft    = popupLeft + 80;
    const tabSpacing = 120;
    const tabY       = popupTop + this.tabHeight / 2 + 25;

    const tabs = [
      { key: 'story', label: '스토리', x: tabLeft },
      { key: 'item',  label: '아이템', x: tabLeft + tabSpacing }
    ];

    this.tabButtons = [];
    this.tabTexts   = [];

    tabs.forEach(tab => {
      const isSelected = tab.key === this.selectedTab;

      const btn = scene.add.rectangle(
        tab.x,
        tabY,
        110,
        this.tabHeight,
        isSelected ? 0x444444 : 0xcccccc
      ).setStrokeStyle(0.5, 0x000000)
       .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.selectedTab = tab.key;
        this.refreshTabs();
        this.refreshList();
      });

      this.tabButtons.push(btn);

      const txt = scene.add.text(tab.x, tabY, tab.label, {
        fontSize: '20px',
        color: isSelected ? '#ffffff' : '#000000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.tabTexts.push(txt);
    });

    // Scrollable grey list area (below tabs)
    const maskTopY = tabY + (this.tabHeight / 2) + this.extraTopSpace;

    this.listMaskArea = scene.add.rectangle(
      centerX,
      maskTopY + this.visibleHeight / 2,
      this.listWidth,
      this.visibleHeight,
      0xb0b0b0
    ).setStrokeStyle(0.5, 0x000000);

    // Containers
    this.detailContainer = scene.add.container(0, 0);   // fixed card (item tab)
    this.scrollContainer = scene.add.container(0, 0);   // scrollable content

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

    // --- Bottom-left rounded-square red "X" button ---
    const exitContainer = scene.add.container(
      popupLeft + 45,            // padding from left
      popupBottom - 35           // padding from bottom
    );

    // draw a rounded square with Graphics so we can have radius
    const exitGfx = scene.add.graphics();
    exitGfx.fillStyle(0xff0000, 1);
    exitGfx.fillRoundedRect(-18, -18, 30, 30, 10);  // centered around (0,0)

    const exitText = scene.add.text(-2, -2, 'X', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    exitContainer.add([exitGfx, exitText]);

    // make the whole container interactive
    exitContainer.setSize(30, 30);
    exitContainer.setInteractive(
      new Phaser.Geom.Rectangle(-18, -18, 30, 30),
      Phaser.Geom.Rectangle.Contains
    ).on('pointerdown', () => this.hidePopup())
     .on('pointerover', () => exitGfx.clear()
       .fillStyle(0xff4444, 1)
       .fillRoundedRect(-18, -18, 30, 30, 10))
     .on('pointerout', () => exitGfx.clear()
       .fillStyle(0xff0000, 1)
       .fillRoundedRect(-18, -18, 30, 30, 10));

    this.popupContainer.add([
      overlay,
      box,
      counterBg,
      chatIcon,
      counterText,
      ...this.tabButtons,
      ...this.tabTexts,
      this.listMaskArea,
      this.detailContainer,
      this.scrollContainer,
      exitContainer
    ]);

    this.scene.add.existing(this.popupContainer);
    this.refreshList();
  }

  refreshTabs() {
    for (let i = 0; i < this.tabButtons.length; i++) {
      const key = (i === 0) ? 'story' : 'item';
      const isSelected = this.selectedTab === key;
      this.tabButtons[i].fillColor = isSelected ? 0x444444 : 0xcccccc;
      this.tabButtons[i].setStrokeStyle(0.5, 0x000000);
      this.tabTexts[i].setColor(isSelected ? '#ffffff' : '#000000');
    }
  }

  refreshList() {
    this.scrollContainer.removeAll(true);
    if (this.detailContainer) {
      this.detailContainer.removeAll(true);
    }

    const scene   = this.scene;
    const centerX = scene.cameras.main.centerX;
    const startY  = this.itemsStartY;

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

      this.detailContainer.add([detailOuter, thumb, titleText, descText, infoBar]);

      // scrollable grid area under the card
      const cols       = 4;
      const cardWidth  = 80;
      const cardHeight = 90;
      const hGap       = 10;
      const vGap       = 10;

      const totalWidth = cols * cardWidth + (cols - 1) * hGap;
      const gridStartX = centerX - totalWidth / 2 + cardWidth / 2;
      const gridStartY = cardY + 140; // inside mask

      for (let i = 0; i < this.itemsData.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = gridStartX + col * (cardWidth + hGap);
        const y = gridStartY + row * (cardHeight + vGap);

        const item   = this.itemsData[i];
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

      const totalRows  = Math.ceil(this.itemsData.length / cols);
      const gridHeight = totalRows * cardHeight + (totalRows - 1) * vGap;
      const visible    = this.listMaskArea.height;
      const maxScroll  = Math.max(0, gridHeight - visible);

      this.scrollBounds.max = maxScroll;
      this.scrollBounds.min = 0;
      this.scrollY = 0;
      this.updateScroll();
      return;
    }

    // ------------------- STORY TAB -------------------
    for (let i = 0; i < this.itemsData.length; i++) {
      const y    = startY + i * this.itemHeight;
      const item = this.itemsData[i];

      // row background to match mock (light vs dark)
      const rowBgColor   = item.locked ? 0x555555 : 0xf5f5f5;
      const rowBgAlpha   = item.locked ? 0.8 : 1;
      const strokeColor  = 0x333333;

      const bg = scene.add.rectangle(
        centerX,
        y,
        this.listBgWidth,
        70,
        rowBgColor,
        rowBgAlpha
      ).setStrokeStyle(0.5, strokeColor);

      const nameText = scene.add.text(centerX - 170, y, item.name, {
        fontSize: '16px',
        color: item.locked ? '#aaaaaa' : '#000000',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5);

      // 3 pentagon sprites on the right
      for (let j = 0; j < 3; j++) {
        const iconX = centerX + 80 + j * 46;
        const iconY = y;

        let iconKey;

        if (item.locked) {
          iconKey = 'pentagon_lock';
        } else {
          iconKey = item.status[j] ? 'pentagon_on' : 'pentagon_off';
        }

        let icon;
        if (scene.textures.exists(iconKey)) {
          icon = scene.add.image(iconX, iconY, iconKey);
          icon.setDisplaySize(40, 40);
        } else {
          // fallback: simple placeholder polygon if texture is missing
          const g = scene.add.graphics({ x: iconX, y: iconY });
          g.lineStyle(2, item.locked ? 0x111111 : 0x888888, 1);
          g.fillStyle(item.locked ? 0x222222 : (item.status[j] ? 0xc2c2c2 : 0xefefef), 1);

          const size  = 18;
          const angle = -90 * (Math.PI / 180);
          const pts   = [];
          for (let k = 0; k < 5; k++) {
            const a = angle + (k * 72 * Math.PI / 180);
            pts.push({
              x: Math.cos(a) * size,
              y: Math.sin(a) * size
            });
          }
          g.beginPath();
          g.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k < 5; k++) {
            g.lineTo(pts[k].x, pts[k].y);
          }
          g.closePath();
          g.fillPath();
          g.strokePath();
          icon = g;
        }

        this.scrollContainer.add(icon);
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
