// BagPopup.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class BagPopup {
    constructor(scene) {
        this.scene = scene;

        this.container = null;

        this.popupWidth = 500;
        this.popupHeight = 700;

        this.scrollContainer = null;
        this.itemsContainer = null;

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
        this.isOpen = false;

        this.sortMode = 'order';
        this.sortBtn = null;
        this.favBtn = null;
        this.starBtn = null;

        this.subPopupContainer = null;
        this.confirmSellContainer = null;
        this.getCoinContainer = null;

        this.cancelChooseBtn = null;
        this.chooseSellBtn = null;
        this.isChooseSellActive = false;

        this.itemCheckboxes = [];
    }

    hasSelectedItems() {
        return this.itemCheckboxes.some(d => d.selected);
    }

    createPopup() {
        const scene = this.scene;
        const cam = scene.cameras.main;

        const centerX = cam.centerX;
        const centerY = cam.centerY;

        this.container = scene.add.container(0, 0);
        this.container.setDepth(2000);
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

        // CHOOSE SELL BUTTON (DUAL MODE)
        this.chooseSellBtn = scene.add.image(
            centerX - this.popupWidth / 2 + 380,
            centerY + this.popupHeight / 2 - 40,
            'bag_choose_sell'
        )
            .setScale(1.25)
            .setInteractive({ useHandCursor: true });

        this.chooseSellBtn.on('pointerdown', () => {

            // already in choose mode → confirm sell
            if (this.isChooseSellActive) {
                if (!this.hasSelectedItems()) return;
                this.confirmSellContainer.setVisible(true);
                return;
            }

            // enter choose mode
            this.isChooseSellActive = true;
            this.cancelChooseBtn.setVisible(true);
            this.container.bringToTop(this.cancelChooseBtn);

            this.itemCheckboxes.forEach(({ checkbox }) => {
                checkbox.setVisible(true);
            });
        });

        // CANCEL CHOOSE BUTTON
        this.cancelChooseBtn = scene.add.image(
            centerX - this.popupWidth / 2 + 235,
            centerY + this.popupHeight / 2 - 40,
            'bag_choose_cancel'
        )
            .setScale(1.25)
            .setInteractive({ useHandCursor: true });

        this.cancelChooseBtn.setVisible(false);

        this.cancelChooseBtn.on('pointerdown', () => {
            this.isChooseSellActive = false;
            this.cancelChooseBtn.setVisible(false);

            this.itemCheckboxes.forEach(data => {
                data.selected = false;
                data.checkbox.setVisible(false);
                data.checkbox.drawCheckbox();
            });
        });

        // EXIT BUTTON
        const exitBtn = scene.add.image(
            centerX - this.popupWidth / 2 + 32,
            centerY + this.popupHeight / 2 - 32,
            'exit_button'
        )
            .setDisplaySize(48, 48)
            .setInteractive({ useHandCursor: true });

        exitBtn.on('pointerdown', () => this.hide());

        const topY = centerY - this.popupHeight / 2 + 50;
        const sortBtnX = centerX - this.popupWidth / 2 + 100;

        this.sortBtn = scene.add.image(sortBtnX, topY, 'bag_order')
            .setScale(2.0)
            .setInteractive({ useHandCursor: true });

        this.sortBtn.on('pointerdown', () => {
            this.sortMode = this.sortMode === 'order' ? 'rank' : 'order';
            this.sortBtn.setTexture(this.sortMode === 'order' ? 'bag_order' : 'bag_rank');
        });

        const rightBaseX = centerX + this.popupWidth / 2 - 120;

        this.favBtn = scene.add.image(rightBaseX - 100, topY, 'bag_fav')
            .setScale(2.0)
            .setInteractive({ useHandCursor: true });

        this.starBtn = scene.add.image(rightBaseX + 28, topY, 'bag_star')
            .setScale(2.0)
            .setInteractive({ useHandCursor: true });

        this.createScrollableGrid(centerX, centerY);
        this.createSubPopup(centerX, centerY);
        this.createConfirmSellPopup(centerX, centerY);
        this.createGetCoinPopup(centerX, centerY);

        this.container.add([
            overlay,
            bg,
            this.scrollContainer,
            this.sortBtn,
            this.favBtn,
            this.starBtn,
            exitBtn,
            this.cancelChooseBtn,
            this.chooseSellBtn,
            this.subPopupContainer,
            this.confirmSellContainer,
            this.getCoinContainer
        ]);
    }

    // ---------- SUB POPUP ----------
    createSubPopup(centerX, centerY) {
        const scene = this.scene;

        this.subPopupContainer = scene.add.container(0, 0);
        this.subPopupContainer.setVisible(false);
        this.subPopupContainer.setDepth(3000);

        const img = scene.add.image(centerX, centerY, 'bag_sub_popup').setScale(1.8);

        const showSell = scene.add.image(
            img.x,
            img.y + img.displayHeight / 2 - 160,
            'bag_show_sell'
        ).setScale(1.25);

        const rankLabel = scene.add.image(
            showSell.x - showSell.displayWidth / 2 + 20,
            showSell.y - showSell.displayHeight / 2 + 20,
            'item_rank_a'
        );

        const exitBtn = scene.add.image(
            img.x - img.displayWidth / 2 + 30,
            img.y + img.displayHeight / 2 - 30,
            'exit_button'
        )
            .setDisplaySize(48, 48)
            .setInteractive({ useHandCursor: true });

        exitBtn.on('pointerdown', () => {
            this.subPopupContainer.setVisible(false);
        });

        const sellBtn = scene.add.image(
            img.x + img.displayWidth / 2 - 100,
            img.y + img.displayHeight / 2 - 40,
            'bag_item_sell'
        ).setScale(2.2).setInteractive({ useHandCursor: true });

        sellBtn.on('pointerdown', () => {

            if (this.isChooseSellActive) {
                if (!this.hasSelectedItems()) return;
                this.confirmSellContainer.setVisible(true);
                return;
            }

            this.subPopupContainer.setVisible(false);
            this.confirmSellContainer.setVisible(true);
        });

        this.subPopupContainer.add([img, showSell, rankLabel, exitBtn, sellBtn]);
    }

    // ---------- CONFIRM SELL ----------
    createConfirmSellPopup(centerX, centerY) {
        const scene = this.scene;

        this.confirmSellContainer = scene.add.container(0, 0);
        this.confirmSellContainer.setVisible(false);
        this.confirmSellContainer.setDepth(4000);

        const bg = scene.add.image(centerX, centerY, 'bag_confirm_sell').setScale(1.8);

        const closeBtn = scene.add.image(
            bg.x - bg.displayWidth / 2 + 30,
            bg.y + bg.displayHeight / 2 - 30,
            'exit_button'
        )
            .setDisplaySize(48, 48)
            .setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.confirmSellContainer.setVisible(false);
            this.subPopupContainer.setVisible(false);
        });

        const okBtn = scene.add.image(
            bg.x + bg.displayWidth / 2 - 30,
            bg.y + bg.displayHeight / 2 - 30,
            'yes_button'
        )
            .setScale(2.0)
            .setInteractive({ useHandCursor: true });

        okBtn.on('pointerdown', () => {
            this.itemCheckboxes.forEach(data => {
                data.selected = false;
                data.checkbox.setVisible(false);
                data.checkbox.drawCheckbox();
            });

            this.isChooseSellActive = false;
            this.cancelChooseBtn.setVisible(false);

            this.confirmSellContainer.setVisible(false);
            this.getCoinContainer.setVisible(true);
        });

        this.confirmSellContainer.add([bg, closeBtn, okBtn]);
    }

    // ---------- GET COIN ----------
    createGetCoinPopup(centerX, centerY) {
        const scene = this.scene;

        this.getCoinContainer = scene.add.container(0, 0);
        this.getCoinContainer.setVisible(false);
        this.getCoinContainer.setDepth(5000);

        const bg = scene.add.image(centerX, centerY, 'bag_getcoin').setScale(1.8);

        const okBtn = scene.add.image(
            bg.x + bg.displayWidth / 2 - 30,
            bg.y + bg.displayHeight / 2 - 30,
            'yes_button'
        )
            .setScale(2.0)
            .setInteractive({ useHandCursor: true });

        okBtn.on('pointerdown', () => {
            this.getCoinContainer.setVisible(false);
        });

        this.getCoinContainer.add([bg, okBtn]);
    }

    // ---------- GRID / SCROLL ----------
    createScrollableGrid(centerX, centerY) {
        const scene = this.scene;

        const viewportWidth = 440;
        const viewportHeight = 480;

        const viewportX = centerX;
        const viewportY = centerY + 10;

        const viewportLeft = viewportX - viewportWidth / 2;
        const viewportTop = viewportY - viewportHeight / 2;

        this.scrollContainer = scene.add.container(0, 0);
        this.itemsContainer = scene.add.container(0, 0);

        this.scrollMaskGraphics = scene.add.graphics();
        this.scrollMaskGraphics.fillStyle(0xffffff, 1);
        this.scrollMaskGraphics.fillRect(
            viewportLeft,
            viewportTop,
            viewportWidth,
            viewportHeight
        );

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
        this.scrollContainer.add(this.itemsContainer);

        const cols = 4;
        const rows = 4;
        const itemGap = 15;
        const itemScale = 0.85;

        const sampleItem = scene.add.image(0, 0, 'collection_gacha');
        const itemW = sampleItem.width * itemScale;
        const itemH = sampleItem.height * itemScale;
        sampleItem.destroy();

        const startX = centerX - ((cols - 1) * (itemW + itemGap)) / 2;
        const startY = viewportTop + itemH / 2 + 8;

        this.itemCheckboxes = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (itemW + itemGap);
                const y = startY + row * (itemH + itemGap);

                let textureKey = 'collection_gacha';
                if (row === 0 && (col === 1 || col === 2)) {
                    textureKey = 'bag_item_unite';
                }

                const item = scene.add.image(x, y, textureKey).setScale(itemScale);
                item.setInteractive({ useHandCursor: true });
                item.on('pointerdown', () => {
                    if (!this.isChooseSellActive) {
                        this.showSubPopup();
                    }
                });

                const checkboxSize = 18;
                const checkboxX = item.x + item.displayWidth / 2 - checkboxSize - 4;
                const checkboxY = item.y - item.displayHeight / 2 + 4;

                const checkbox = scene.add.graphics();
                checkbox.setVisible(false);

                const checkboxData = { item, checkbox, selected: false };

                checkbox.drawCheckbox = () => {
                    checkbox.clear();
                    checkbox.fillStyle(0xffffff, 1);
                    checkbox.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);

                    if (checkboxData.selected) {
                        checkbox.lineStyle(3, 0x000000, 1);
                        checkbox.beginPath();
                        checkbox.moveTo(checkboxX + 3, checkboxY + checkboxSize / 2);
                        checkbox.lineTo(checkboxX + checkboxSize / 2 - 1, checkboxY + checkboxSize - 4);
                        checkbox.lineTo(checkboxX + checkboxSize - 3, checkboxY + 4);
                        checkbox.strokePath();
                    }
                };

                checkbox.drawCheckbox();

                checkbox.setInteractive(
                    new Phaser.Geom.Rectangle(checkboxX, checkboxY, checkboxSize, checkboxSize),
                    Phaser.Geom.Rectangle.Contains
                );

                checkbox.on('pointerdown', () => {
                    checkboxData.selected = !checkboxData.selected;
                    checkbox.drawCheckbox();
                });

                this.itemCheckboxes.push(checkboxData);
                this.itemsContainer.add(item);
                this.itemsContainer.add(checkbox);
            }
        }

        const hiddenRowY = startY + rows * (itemH + itemGap);
        for (let col = 0; col < cols; col++) {
            const x = startX + col * (itemW + itemGap);
            this.itemsContainer.add(
                scene.add.image(x, hiddenRowY, 'collection_hidden').setScale(itemScale)
            );
        }

        const contentHeight = (rows + 1) * (itemH + itemGap) - itemGap;
        const maxScroll = Math.max(0, contentHeight - viewportHeight);

        this.scrollMaxY = 0;
        this.scrollMinY = -maxScroll;
        this.setScrollY(0);

        this.scrollHit.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.dragStartContainerY = this.itemsContainer.y;
        });

        scene.input.on('pointerup', () => {
            this.isDragging = false;
        });

        scene.input.on('pointermove', (pointer) => {
            if (!this.isDragging || !this.isOpen) return;
            this.setScrollY(this.dragStartContainerY + (pointer.y - this.dragStartY));
        });

        if (!this.wheelHandler) {
            this.wheelHandler = (pointer, gameObjects, dx, dy) => {
                if (!this.isOpen) return;
                if (
                    pointer.x < viewportLeft ||
                    pointer.x > viewportLeft + viewportWidth ||
                    pointer.y < viewportTop ||
                    pointer.y > viewportTop + viewportHeight
                ) return;

                this.setScrollY(this.itemsContainer.y - dy * 0.5);
            };
            scene.input.on('wheel', this.wheelHandler);
        }
    }

    setScrollY(y) {
        this.itemsContainer.y = Phaser.Math.Clamp(y, this.scrollMinY, this.scrollMaxY);
    }

    showSubPopup() {
        if (!this.subPopupContainer) return;
        this.subPopupContainer.setVisible(true);
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
        this.isChooseSellActive = false;

        this.cancelChooseBtn.setVisible(false);
        this.subPopupContainer.setVisible(false);
        this.confirmSellContainer.setVisible(false);
        this.getCoinContainer.setVisible(false);

        this.itemCheckboxes.forEach(data => {
            data.selected = false;
            data.checkbox.setVisible(false);
            data.checkbox.drawCheckbox();
        });
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
            this.itemsContainer = null;
            this.scrollMaskGraphics = null;
            this.scrollMask = null;
            this.scrollHit = null;
            this.subPopupContainer = null;
            this.confirmSellContainer = null;
            this.getCoinContainer = null;
            this.chooseSellBtn = null;
            this.cancelChooseBtn = null;
        }
    }
}
