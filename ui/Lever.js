//Lever.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class Lever {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.leverState = 0;      // Left lever: Tracks what stage of animation we're in (0, 1, 2, 3)
        this.popup = null;        // Stores the currently displayed popup container
        // Right Lever: Arrays to store the 10 random results for multi-pull
        this.gachaResults = [];       // Character names
        this.gachaCapsules = [];
        this.currentCapsuleIndex = 0; // Which capsule currently being showed
        this.skipAnimation = false;   // Track checkbox state
        this.pityCounter = 0;         // Counts pulls since last A or higher
        this.maxPity = 100;           // At 101st, guarantee A or higher
        this.onProgressUpdate = null; // Callback for updating progress UI
        this.characters = [
            'Char_Snow', 'char_angryStar', 'char_angryStar2', 'char_doughnut', 'char_egg',
            'char_frustStar', 'char_ghost', 'char_happyStar', 'char_icecream',
            'char_laughStar', 'char_mugChoco', 'char_pen', 'char_ruler',
            'char_skeleton', 'char_starCandy', 'char_sushi', 'char_worryStar',
            'char_blackCat', 'char_christmasOrnament', 'char_depressedStar',
            'char_noMannersStar', 'char_pancake', 'char_sadStar',
            'char_scaredStar', 'char_scarf', 'char_shockStar'
        ];
    }

    setProgressBarUpdateCallback(callback) {
        this.onProgressUpdate = callback;
    }

    updateProgressBar() {
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.pityCounter, this.maxPity);
        }
    }

    getGachaResult(isPity) {
        if (isPity) return "A";
        const r = Math.random() * 100;
        if (r < 0.8) return "S";
        if (r < 5) return "A";
        if (r < 19) return "B";
        if (r < 50) return "C";
        return "D";
    }

    //////////// Lever UI Creation ////////////

    createLever() {
        const centerX = this.scene.cameras.main.centerX;

        const leverConfig = {
            scale: 2,
        };

        // Left Lever (1회 뽑기)
        const leftLeverImg = this.scene.add
            .image(centerX - 190, 1080, 'game_lever_default')
            .setOrigin(0.5, 0.5)
            .setScale(leverConfig.scale)
            .setInteractive({ useHandCursor: true });   // 클릭 가능[web:27]

        this.scene.add.text(centerX - 190, 1180, '1회 뽑기',
            { fontSize: '30px', fontFamily: 'DoveMayo', color: '#222' }).setOrigin(0.5);

        leftLeverImg.on('pointerdown', () => this.handleLeftLeverClick());

        // Right Lever (10회 뽑기)
        const rightLeverImg = this.scene.add
            .image(centerX + 190, 1080, 'game_lever_default')
            .setOrigin(0.5, 0.5)
            .setScale(leverConfig.scale)
            .setInteractive({ useHandCursor: true });

        this.scene.add.text(centerX + 190, 1180, '10회 뽑기',
            { fontSize: '30px',fontFamily: 'DoveMayo', color: '#222' }).setOrigin(0.5);

        rightLeverImg.on('pointerdown', () => this.handleRightLeverClick());


        // Skip Animation Checkbox
        this.checkboxRect = this.scene.add.rectangle(centerX - 65, 1310, 24, 24, 0xffffff)
            .setStrokeStyle(1, 0x222222)
            .setInteractive({ useHandCursor: true });
        this.checkmark = this.scene.add.text(centerX - 65, 950, '✓', { fontSize: '20px', color: '#000', fontStyle: 'bold' })
            .setOrigin(0.5)
            .setVisible(false);
        const checkboxLabel = this.scene.add.text(centerX - 40, 1310, '연출 건너뛰기', { fontSize: '25px', fontFamily: 'DoveMayo', color: '#222' })
            .setOrigin(0, 0.5)
            .setInteractive({ useHandCursor: true });

        this.checkboxRect.on('pointerdown', () => this.toggleSkipCheckbox());
        checkboxLabel.on('pointerdown', () => this.toggleSkipCheckbox());
    }

    toggleSkipCheckbox() {
        this.skipAnimation = !this.skipAnimation;
        this.checkmark.setVisible(this.skipAnimation);
        this.checkboxRect.setFillStyle(this.skipAnimation ? 0xe0e0e0 : 0xffffff);
    }

    // ------------------- Left Lever -------------------
    handleLeftLeverClick() {
        if (this.popup) return;

        if (this.leverState === 0) {
            this.showLeftLeverPopup("Lever Turn", "레버를 돌리는 중...");
            this.leverState = 1;
        } else if (this.leverState === 1) {
            this.showLeftLeverPopup("Capsule Open", "캡슐이 열리는 중...");
            this.leverState = 2;
        } else if (this.leverState === 2) {
            const isPity = this.pityCounter >= this.maxPity;
            this.pityCounter = isPity ? 0 : Math.min(this.pityCounter + 1, this.maxPity);
            this.updateProgressBar();
            const randomChar = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.gachaResults = [randomChar];
            this.showLeftLeverPopup("Gacha Result");   // will use stored character
            this.leverState = 3;
        }
    }

    showLeftLeverPopup(imageName) {
        this.createPopupWithOverlay();

        // Map image key
        const imgKey = imageName === "Lever Turn" ? "LeftLever" :
            imageName === "Capsule Open" ? "CapsuleOpen" :
                imageName === "Gacha Result" ? this.gachaResults[0] : imageName;

        // Optional background for result
        if (imageName === "Gacha Result") {
            const bg = this.scene.add.rectangle(0, 0, 320, 320, 0xffcce2)
                .setStrokeStyle(2, 0x000000);
            this.popup.add(bg);
        }

        const img = this.scene.add.image(0, 0, imgKey).setDisplaySize(160, 160);
        this.popup.add(img);

        if (imageName === "Gacha Result") {
            const confirmBtn = this.scene.add.rectangle(0, 120, 120, 40, 0xdddddd)
                .setInteractive({ useHandCursor: true });
            const confirmBtnText = this.scene.add.text(0, 120, '확인', { fontSize: '20px', color: '#111' }).setOrigin(0.5);
            this.popup.add(confirmBtn);
            this.popup.add(confirmBtnText);
            confirmBtn.on('pointerdown', () => {
                this.popup.destroy();
                this.popup = null;
                this.leverState = 0;
            });
        } else {
            img.setInteractive({ useHandCursor: true });
            img.on('pointerdown', () => {
                this.popup.destroy();
                this.popup = null;
                this.handleLeftLeverClick();
            });
        }
    }

    // ------------------- Right Lever -------------------
    handleRightLeverClick() {
        if (this.popup) return;

        const characters = this.characters;
        const capsuleColors = ['CapsuleOpen_Yellow', 'CapsuleOpen_Blue'];
        this.gachaResults = [];
        this.gachaCapsules = [];
        let guaranteeUsed = false;
        let indexOfPity = -1;

        for (let i = 0; i < 10; i++) {
            const isPity = (!guaranteeUsed && (this.pityCounter + i) >= this.maxPity);
            let grade = this.getGachaResult(isPity);
            if (isPity) {
                grade = "A";
                guaranteeUsed = true;
                indexOfPity = i;
            }
            this.gachaResults.push(characters[Math.floor(Math.random() * characters.length)]);
            this.gachaCapsules.push(capsuleColors[Math.floor(Math.random() * capsuleColors.length)]);
        }

        this.pityCounter = indexOfPity >= 0 ? 0 : Math.min(this.pityCounter + 10, this.maxPity);
        this.updateProgressBar();
        this.currentCapsuleIndex = 0;

        // Show initial lever animation
        const centerX = this.scene.cameras.main.centerX;
        const centerY = 600;
        this.popup = this.scene.add.container(centerX, centerY);
        const leverImg = this.scene.add.image(0, 0, 'RightLever').setDisplaySize(160, 160).setInteractive({ useHandCursor: true });
        this.popup.add(leverImg);

        leverImg.once('pointerdown', () => {
            this.popup.destroy();
            this.popup = null;
            if (this.skipAnimation) {
                this.showRightLeverPopup();
            } else {
                this.revealCapsulesOneByOne();
            }
        });
    }

    revealCapsulesOneByOne() {
        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }

        const centerX = this.scene.cameras.main.centerX;
        const centerY = 600;
        this.popup = this.createPopupWithOverlay(centerX, centerY);

        const idx = this.currentCapsuleIndex;
        const capsuleKey = this.gachaCapsules[idx];
        const charKey = this.gachaResults[idx];

        const capsuleImg = this.scene.add.image(0, -200, capsuleKey).setDisplaySize(180, 180);
        this.popup.add(capsuleImg);

        this.scene.tweens.add({
            targets: capsuleImg,
            y: 0,
            duration: 250,
            onComplete: () => {
                capsuleImg.setInteractive({ useHandCursor: true });
                capsuleImg.once('pointerdown', () => {
                    capsuleImg.setVisible(false);
                    const charImg = this.scene.add.image(0, 0, charKey).setDisplaySize(180, 180);
                    this.popup.add(charImg);
                    charImg.setInteractive({ useHandCursor: true });

                    charImg.once('pointerdown', () => {
                        this.popup.destroy();
                        this.popup = null;
                        this.currentCapsuleIndex++;
                        if (this.currentCapsuleIndex < 10) {
                            this.revealCapsulesOneByOne();
                        } else {
                            this.showRightLeverPopup();
                        }
                    });
                });
            }
        });
    }

    showRightLeverPopup() {
        this.createPopupWithOverlay();

        const bg = this.scene.add.rectangle(0, 0, 340, 370, 0xffcce2)
            .setStrokeStyle(2, 0x000000);
        this.popup.add(bg);

        // Display characters grid
        const rowSizes = [4, 4, 2];
        let itemIndex = 0;
        for (let row = 0; row < rowSizes.length; row++) {
            const itemsInRow = rowSizes[row];
            const rowWidth = (itemsInRow - 1) * 60;
            const startX = -rowWidth / 2;

            for (let col = 0; col < itemsInRow; col++) {
                if (itemIndex >= this.gachaResults.length) break;
                const x = startX + col * 60;
                const y = -100 + row * 90;
                const char = this.scene.add.image(x, y, this.gachaResults[itemIndex]);
                char.setDisplaySize(80, 80);
                this.popup.add(char);
                itemIndex++;
            }
        }

        // Confirm button
        const confirmBtn = this.scene.add.rectangle(0, 155, 120, 44, 0xdddddd)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x000000);
        const confirmBtnText = this.scene.add.text(0, 155, '확인', { fontSize: '20px', color: '#111' }).setOrigin(0.5);
        this.popup.add(confirmBtn);
        this.popup.add(confirmBtnText);

        confirmBtn.on('pointerdown', () => {
            this.popup.destroy();
            this.popup = null;
        });
    }

    // ------------------- Helper -------------------
    createPopupWithOverlay(centerX = null, centerY = null) {
        centerX ??= this.scene.cameras.main.centerX;
        centerY ??= this.scene.cameras.main.centerY;

        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }

        this.popup = this.scene.add.container(centerX, centerY);

        // Dimmed background overlay
        const overlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        ).setOrigin(0.5);
        overlay.setInteractive();
        this.popup.add(overlay);

        return this.popup;
    }
}