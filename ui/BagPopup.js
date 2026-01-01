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
            if (this.sortMode === 'order') {
                this.sortMode = 'rank';
                this.sortBtn.setTexture('bag_rank');
            } else {
                this.sortMode = 'order';
                this.sortBtn.setTexture('bag_order');
            }
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

        this.container.add([
            overlay,
            bg,
            this.scrollContainer,
            this.sortBtn,
            this.favBtn,
            this.starBtn,
            exitBtn,
            this.subPopupContainer
        ]);
    }

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
            // TODO: sell logic
        });

        this.subPopupContainer.add([img, showSell, rankLabel, exitBtn, sellBtn]);
    }

    showSubPopup() {
        if (!this.subPopupContainer) return;
        this.subPopupContainer.setVisible(true);
    }

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

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (itemW + itemGap);
                const y = startY + row * (itemH + itemGap);

                let textureKey = 'collection_gacha';

                if (row === 0 && (col === 1 || col === 2)) {
                    textureKey = 'bag_item_unite';
                }

                const item = scene.add.image(x, y, textureKey)
                    .setScale(itemScale);

                if (row === 0 && col === 0) {
                    item.setInteractive({ useHandCursor: true });
                    item.on('pointerdown', () => this.showSubPopup());
                }

                this.itemsContainer.add(item);
            }
        }

        const hiddenRowY = startY + rows * (itemH + itemGap);

        for (let col = 0; col < cols; col++) {
            const x = startX + col * (itemW + itemGap);
            const item = scene.add.image(x, hiddenRowY, 'collection_hidden')
                .setScale(itemScale);

            this.itemsContainer.add(item);
        }

        const totalRows = rows + 1;

        const contentHeight =
            totalRows * (itemH + itemGap) - itemGap;

        const maxScroll = Math.max(0, contentHeight - viewportHeight);

        this.scrollTopY = 0;
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
            const dy = pointer.y - this.dragStartY;
            this.setScrollY(this.dragStartContainerY + dy);
        });

        if (!this.wheelHandler) {
            this.wheelHandler = (pointer, gameObjects, dx, dy) => {
                if (!this.isOpen) return;

                const inViewport =
                    pointer.x >= viewportLeft &&
                    pointer.x <= viewportLeft + viewportWidth &&
                    pointer.y >= viewportTop &&
                    pointer.y <= viewportTop + viewportHeight;

                if (!inViewport) return;

                this.setScrollY(this.itemsContainer.y - dy * 0.5);
            };

            scene.input.on('wheel', this.wheelHandler);
        }
    }

    setScrollY(y) {
        this.itemsContainer.y = Phaser.Math.Clamp(
            y,
            this.scrollMinY,
            this.scrollMaxY
        );
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
        if (this.subPopupContainer) this.subPopupContainer.setVisible(false);
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
        }
    }
}
