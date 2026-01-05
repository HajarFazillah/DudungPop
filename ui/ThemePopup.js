// ThemePopup.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class ThemePopup {
  constructor(scene) {
    this.scene = scene;

    this.container = null;

    this.popupWidth = 500;
    this.popupHeight = 700;

    this.scrollContainer = null;
    this.themeListContainer = null;

    this.scrollMaskGraphics = null;
    this.scrollMask = null;
    this.scrollHit = null;

    this.scrollTopY = 0;
    this.scrollMinY = 0;
    this.scrollMaxY = 0;

    this.isDragging = false;
    this.dragStartY = 0;
    this.dragStartContainerY = 0;

    this.wheelHandler = null;

    this.selectedContainer = null;
    this.pendingThemeId = null;

    this.isOpen = false;
  }

  createPopup() {
    const scene = this.scene;
    const cam = scene.cameras.main;

    const centerX = cam.centerX;
    const centerY = cam.centerY;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(900);
    this.container.setVisible(false);

    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      cam.width,
      cam.height,
      0x000000,
      0.6
    ).setInteractive();

    const bg = scene.add.image(centerX, centerY, 'popup_bg1')
      .setDisplaySize(this.popupWidth, this.popupHeight);

    const exitBtn = scene.add.image(
      centerX - this.popupWidth / 2 + 32,
      centerY + this.popupHeight / 2 - 32,
      'exit_button'
    )
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });

    exitBtn.on('pointerdown', () => this.hide());

    this.createScrollableThemeList(centerX, centerY);
    this.createSelectedPopup(centerX, centerY);

    this.container.add([
      overlay,
      bg,
      this.scrollContainer,
      exitBtn,
      this.selectedContainer
    ]);
  }

  createScrollableThemeList(centerX, centerY) {
    const scene = this.scene;

    const viewportWidth = 450;
    const viewportHeight = 600;

    const viewportX = centerX;
    const viewportY = centerY - 20;

    const viewportLeft = viewportX - viewportWidth / 2;
    const viewportTop = viewportY - viewportHeight / 2;

    this.scrollContainer = scene.add.container(0, 0);
    this.themeListContainer = scene.add.container(0, 0);

    this.scrollMaskGraphics = scene.add.graphics();
    this.scrollMaskGraphics.fillStyle(0xffffff, 1);
    this.scrollMaskGraphics.fillRect(viewportLeft, viewportTop, viewportWidth, viewportHeight);

    this.scrollMask = this.scrollMaskGraphics.createGeometryMask();
    this.scrollContainer.setMask(this.scrollMask);

    this.scrollHit = scene.add.rectangle(
      viewportX,
      viewportY,
      viewportWidth,
      viewportHeight,
      0x000000,
      0
    ).setInteractive();

    this.container.add(this.scrollMaskGraphics);

    this.scrollContainer.add(this.scrollHit);
    this.scrollContainer.add(this.themeListContainer);

    const rowHeight = 150;
    const gapY = 170;

    const startY = viewportTop + rowHeight / 2 + 10;

    const createThemeRect = (y, themeId) => {
      const rect = scene.add.image(centerX, y, 'theme_rect')
        .setDisplaySize(430, 150);

      const btnX = rect.x + rect.displayWidth / 2 - 85;

      const btn = scene.add.image(btnX, y, 'theme_rect_btn')
        .setScale(1.5)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.pendingThemeId = themeId;
        this.showSelectedPopup();
      });

      const btnLabel = scene.add.text(
        btn.x,
        btn.y,
        '변경하기',
        {
          fontSize: '18px',
          color: '#000000',
          fontFamily: 'DoveMayo',   // or 'DoveMayoBold' if you want bold
          align: 'center'
        }
      ).setOrigin(0.5);

      // Optional: make clicking the text also trigger the button
      btnLabel.setInteractive({ useHandCursor: true });
      btnLabel.on('pointerdown', () => btn.emit('pointerdown'));

      this.themeListContainer.add(rect);

      // --- rect1: REPLACE theme_basic.png with text blocks ---
      if (themeId === 'rect1') {
        const textLeftX = rect.x - rect.displayWidth / 2 + 30;

        const titleText = scene.add.text(
          textLeftX,
          y - 40,
          '기본 장식장',
          {
            fontSize: '22px',
            color: '#000000',
            fontFamily: 'DoveMayoBold',
            align: 'left'
          }
        ).setOrigin(0, 0.5);

        const descText = scene.add.text(
          textLeftX,
          y + 20,
          '설명설명설명 설명설명설명 설명설명설명 설명설명설명\n설명설명설명 설명설명설명',
          {
            fontSize: '18px',
            color: '#000000',
            fontFamily: 'DoveMayo',
            align: 'left',
            wordWrap: { width: rect.displayWidth * 0.55 }
          }
        ).setOrigin(0, 0.5);

        this.themeListContainer.add([titleText, descText]);
      }

      // --- rect2: REMOVE theme_summer.png, REPLACE with text blocks ---
      if (themeId === 'rect2') {
        const textLeftX = rect.x - rect.displayWidth / 2 + 30;

        const titleText = scene.add.text(
          textLeftX,
          y - 40,
          '여름 장식장',
          {
            fontSize: '22px',
            color: '#000000',
            fontFamily: 'DoveMayoBold', // dovemayo_bold.otf (from index.html)
            align: 'left'
          }
        ).setOrigin(0, 0.5);

        const descText = scene.add.text(
          textLeftX,
          y + 20,
          '설명설명설명 설명설명설명 설명설명설명 설명설명설명\n설명설명설명 설명설명설명',
          {
            fontSize: '18px',
            color: '#000000',
            fontFamily: 'DoveMayo', // dovemayo.otf (from index.html)
            align: 'left',
            wordWrap: { width: rect.displayWidth * 0.55 } // similar idea to StorePopup
          }
        ).setOrigin(0, 0.5);

        this.themeListContainer.add([titleText, descText]);
      }

      this.themeListContainer.add(btn);
      this.themeListContainer.add(btnLabel);
    };

    const createHiddenRect = (y) => {
      const scene = this.scene;

      // 1. Normal base card (same as available ones)
      const base = scene.add.image(centerX, y, 'theme_rect')
        .setDisplaySize(430, 150);

      // 제목 / 내용 기본 위치
      const textLeftX = base.x - base.displayWidth / 2 + 30;

      const titleText = scene.add.text(
        textLeftX,
        y - 40,
        '기본 장식장',          // 잠긴 테마 이름 (원하면 파라미터로 받기)
        {
          fontSize: '22px',
          color: '#000000',
          fontFamily: 'DoveMayoBold',
          align: 'left'
        }
      ).setOrigin(0, 0.5);

      const descText = scene.add.text(
        textLeftX,
        y + 20,
        '설명설명설명 설명설명설명 설명설명설명 설명설명설명\n설명설명설명 설명설명설명',
        {
          fontSize: '18px',
          color: '#000000',
          fontFamily: 'DoveMayo',
          align: 'left',
          wordWrap: { width: base.displayWidth * 0.55 }
        }
      ).setOrigin(0, 0.5);

      // 2. Dark translucent overlay (covers the card)
      const overlay = scene.add.rectangle(
        base.x,
        y,
        base.displayWidth,
        base.displayHeight,
        0x000000,
        0.6          // 반투명
      );

      // 3. “플레이타임 240시간 이후 오픈” 텍스트
      const lockText = scene.add.text(
        base.x - base.displayWidth / 2 + 40,
        y,
        '플레이타임 240시간 이후 오픈',
        {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'DoveMayo',
          align: 'left'
        }
      ).setOrigin(0, 0.5);

      const btnX = base.x + base.displayWidth / 2 - 85;

      const btn = scene.add.image(btnX, y, 'theme_rect_btn')
        .setScale(1.5);

      const btnLabel = scene.add.text(
        btn.x,
        btn.y,
        '변경하기',
        {
          fontSize: '18px',
          color: '#000000',
          fontFamily: 'DoveMayo',
          align: 'center'
        }
      ).setOrigin(0.5);

      btn.disableInteractive();
      btnLabel.disableInteractive();

      // 5. Add everything in the right order (base + texts, then overlay + lock text)
      this.themeListContainer.add([
        base,
        titleText,
        descText,
        btn,
        btnLabel,
        overlay,
        lockText
      ]);
    };

    createHiddenRect(startY);
    createThemeRect(startY + gapY, 'rect1');
    createThemeRect(startY + gapY * 2, 'rect2');
    createHiddenRect(startY + gapY * 3);

    const contentHeight = (gapY * 3) + rowHeight;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);

    this.scrollTopY = 0;
    this.scrollMaxY = this.scrollTopY;
    this.scrollMinY = this.scrollTopY - maxScroll;

    this.setScrollY(this.scrollTopY);

    this.scrollHit.on('pointerdown', (pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.dragStartContainerY = this.themeListContainer.y;
    });

    scene.input.on('pointerup', () => {
      this.isDragging = false;
    });

    scene.input.on('pointermove', (pointer) => {
      if (!this.isDragging || !this.isOpen) return;
      const dy = pointer.y - this.dragStartY;
      this.setScrollY(this.dragStartContainerY + dy);
    });

    if (!this.wheelHandler) {
      this.wheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
        if (!this.isOpen) return;

        const inViewport =
          pointer.x >= viewportLeft &&
          pointer.x <= viewportLeft + viewportWidth &&
          pointer.y >= viewportTop &&
          pointer.y <= viewportTop + viewportHeight;

        if (!inViewport) return;

        this.setScrollY(this.themeListContainer.y - deltaY * 0.5);
      };

      scene.input.on('wheel', this.wheelHandler);
    }
  }

  createSelectedPopup(centerX, centerY) {
    const scene = this.scene;

    this.selectedContainer = scene.add.container(0, 0);
    this.selectedContainer.setDepth(960);
    this.selectedContainer.setVisible(false);

    const img = scene.add.image(centerX, centerY, 'theme_selected').setScale(2);

    const yesBtn = scene.add.image(
      img.x + img.displayWidth / 2 - 30,
      img.y + img.displayHeight / 2 - 30,
      'yes_button'
    ).setInteractive({ useHandCursor: true });

    yesBtn.setDisplaySize(48, 48);

    yesBtn.on('pointerdown', () => {
      this.selectedContainer.setVisible(false);
      this.pendingThemeId = null;
    });

    this.selectedContainer.add([img, yesBtn]);
  }

  showSelectedPopup() {
    if (!this.selectedContainer) return;
    this.selectedContainer.setVisible(true);
  }

  setScrollY(y) {
    const clamped = Phaser.Math.Clamp(y, this.scrollMinY, this.scrollMaxY);
    this.themeListContainer.y = clamped;
  }

  show() {
    if (!this.container) this.createPopup();
    this.container.setVisible(true);
    this.isOpen = true;
  }

  hide() {
    if (!this.container) return;
    this.container.setVisible(false);
    this.isOpen = false;
    this.isDragging = false;
    if (this.selectedContainer) this.selectedContainer.setVisible(false);
    this.pendingThemeId = null;
  }

  destroy() {
    if (this.wheelHandler) {
      this.scene.input.off('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }

    if (this.container) {
      this.container.destroy(true);
      this.container = null;
      this.scrollContainer = null;
      this.themeListContainer = null;
      this.scrollMaskGraphics = null;
      this.scrollMask = null;
      this.scrollHit = null;
      this.selectedContainer = null;
      this.pendingThemeId = null;
    }
  }
}