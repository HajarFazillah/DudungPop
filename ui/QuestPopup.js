// QuestPopup.js
export default class QuestPopup {
    constructor(scene) {
        this.scene = scene;
        this.popup = null;
        this.timerEvent = null;
    }

    show(questData) {
        // Clean up previous popup
        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }
         if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }

        // Calculate center for popup
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
         this.popup = this.scene.add.container(centerX, centerY);

        // Sizing constants
        const bgWidth = 500;
        const bgHeight = 700;
        const questBoxWidth = 450;
        const questBoxHeight = 85;
        const weeklyBoxHeight = 110;
        const fontLg = 23;
        const fontMd = 20;
        const progressBarWidth = 260;
        const progressBarHeight = 13;
        const iconSize = 70;
        const gap = 18;  // spacing between boxes

       // Blocker (cover full screen, not just bg size)
const blocker = this.scene.add.rectangle(
  0,
  0,
  this.scene.scale.width,
  this.scene.scale.height,
  0x000000,
  0
).setOrigin(0.5).setInteractive();
this.popup.add(blocker);

// Popup background image (same as Mail / Notice)
const bg = this.scene.add.image(0, 0, 'popup_bg1')
  .setOrigin(0.5)
  .setDisplaySize(500, 700);  // same size you use in Mail/Notice
this.popup.add(bg);


       // Timer (top right)
        const timerText = this.scene.add.text(bgWidth / 2 - 95, -bgHeight / 2 + 25, '', { fontSize: 18, color: '#444' });
        this.popup.add(timerText);
        const timerIcon = this.scene.add.circle(bgWidth / 2 - 115, -bgHeight / 2 + 32, 12, 0xffffff)
            .setStrokeStyle(1, 0x444444);
        this.popup.add(timerIcon);
         // Timer update (KST)
        function getKSTTime() {
            const now = new Date();
            const utc = now.getTime() + now.getTimezoneOffset() * 60000;
            const kstTime = new Date(utc + 9 * 3600000);
            return kstTime;
        }

        const updateTimer = () => {
        const now = getKSTTime();
        let midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diff = Math.max(0, midnight - now);
        const seconds = Math.floor(diff / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

  timerText.setText(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
};

updateTimer()
this.timerEvent = this.scene.time.addEvent({
  delay: 1000,
  callback: updateTimer,
  loop: true
});

         // --- Unified Quest List ---
        const allQuests = [
            {
                // Weekly quest at top, flagged
                title: questData.weekly.title,
                curValue: questData.weekly.curValue,
                goalValue: questData.weekly.goalValue,
                status: questData.weekly.status,
                isWeekly: true
            },
            ...questData.quests.map(q => ({
                title: q.title,
                curValue: q.curValue,
                goalValue: q.goalValue,
                status: q.status,
                isWeekly: false
            }))
        ];

// --- Center all quest boxes within the background ---
        const n = allQuests.length;
        const totalBoxesHeight = weeklyBoxHeight + (n - 1) * questBoxHeight;
        const firstBoxStartY = -totalBoxesHeight / 2 + weeklyBoxHeight / 2 + gap;

        allQuests.forEach((quest, idx) => {
            let baseY;
            if (idx === 0) {
                // Weekly quest 
                 baseY = firstBoxStartY
                 + weeklyBoxHeight / 4
                 + (idx - 1) * (questBoxHeight + gap)
                 + questBoxHeight / 3;

         const questBg = this.scene.add.image(0, baseY, 'quest_bg1')
         .setOrigin(0.5)
         .setDisplaySize(questBoxWidth, weeklyBoxHeight);
         this.popup.add(questBg);

         // "월요일 보상"
         this.popup.add(this.scene.add.text(
         0,
         baseY - weeklyBoxHeight / 2 + 20,
         '월요일 보상',
         { fontSize: fontMd, color: '#222222' }
         ).setOrigin(0.5));

                // Title (centered below)
                this.popup.add(this.scene.add.text(0, baseY - weeklyBoxHeight / 2 + 42, quest.title, {
                    fontSize: fontLg,
                    color: "#222"
                }).setOrigin(0.5, 0));

                // Progress bar (full width, same as rest)
                const pbBg = this.scene.add.rectangle(-questBoxWidth/2 + 40, baseY + 25, progressBarWidth, progressBarHeight, 0xffffff)
                    .setOrigin(0, 0.5).setStrokeStyle(1, 0x666);
                this.popup.add(pbBg);
                const progress = Math.max(0, Math.min(1, quest.curValue / quest.goalValue));
                const pbFill = this.scene.add.rectangle(-questBoxWidth/2 + 40, baseY + 25, progress * progressBarWidth, progressBarHeight, 0x000000)
                    .setOrigin(0, 0.5);
                this.popup.add(pbFill);

                // Reward button
                let buttonImgKey;
                let bgColor;
                // Logic for selecting image and bg color
                if (quest.status === "진행중") {
                    buttonImgKey = "quest_coin";
                    bgColor = 0xdadbdb; // Light gray
                } else if (quest.status === "완료") {
                   buttonImgKey = "quest_claim";
                   bgColor = 0xdadbdb; // Light gray
                } else if (quest.status === "수령") {
                   buttonImgKey = "quest_claimed";
                   bgColor = 0x222222; // Dark gray
                }

                 // Draw background first
                const btnBg = this.scene.add.rectangle(questBoxWidth/2 - 40, baseY + 5, iconSize, iconSize, bgColor).setOrigin(0.5);
                this.popup.add(btnBg);

                // Draw image on top
                const btnImg = this.scene.add.image(questBoxWidth/2 - 40, baseY + 5, buttonImgKey).setDisplaySize(iconSize * 0.8, iconSize * 0.8);
                 this.popup.add(btnImg);
            }    else {
                // Regular quests
                  baseY = firstBoxStartY
                 + weeklyBoxHeight / 4
                 + (idx - 1) * (questBoxHeight + gap)
                 + questBoxHeight / 2;

                 const questBg = this.scene.add.image(0, baseY, 'quest_bg2')
                 .setOrigin(0.5)
                 .setDisplaySize(questBoxWidth, questBoxHeight);
                  this.popup.add(questBg);

                // Title (left)
                this.popup.add(this.scene.add.text(-questBoxWidth/2 + 40, baseY, quest.title, {
                    fontSize: fontLg,
                    color: "#222"
                }).setOrigin(0, 0.5));

                // Progress bar
                const pbBg = this.scene.add.rectangle(-questBoxWidth/2 + 40, baseY + 18, progressBarWidth, progressBarHeight, 0xffffff)
                    .setOrigin(0, 0.5).setStrokeStyle(1, 0x666666);
                this.popup.add(pbBg);
                const progress = Math.max(0, Math.min(1, quest.curValue / quest.goalValue));
                const pbFill = this.scene.add.rectangle(-questBoxWidth/2 + 40, baseY + 18, progress*progressBarWidth, progressBarHeight, 0x000000)
                    .setOrigin(0, 0.5);
                this.popup.add(pbFill);

                // Reward button
             let buttonImgKey;
             let bgColor;
             // Logic for selecting image and bg color
             if (quest.status === "진행중") {
                 buttonImgKey = "quest_coin";
                 bgColor = 0xdadbdb; // Light gray
           } else if (quest.status === "완료") {
               buttonImgKey = "quest_claim";
               bgColor = 0xdadbdb; // Light gray
           } else if (quest.status === "수령") {
               buttonImgKey = "quest_claimed";
             bgColor = 0x222222; // Dark gray
            }

              // Draw background first
              const btnBg = this.scene.add.rectangle(questBoxWidth/2 - 40, baseY + 2, iconSize, iconSize, bgColor).setOrigin(0.5);
              this.popup.add(btnBg);

             // Draw image on top
             const btnImg = this.scene.add.image(questBoxWidth/2 - 40, baseY + 2, buttonImgKey).setDisplaySize(iconSize * 0.8, iconSize * 0.8);
             this.popup.add(btnImg);
            }
        });

    // --- X Button Bottom Left Using Image ---
const xBtnSize = 38; 
const closeBtn = this.scene.add.image(
    -bgWidth  / 1.9 + xBtnSize,
    bgHeight  / 1.9 - xBtnSize,
    "exit_button"
).setOrigin(0.5).setDisplaySize(xBtnSize, xBtnSize).setInteractive({ useHandCursor: true });

closeBtn.on('pointerdown', () => {
    this.popup.destroy();
    this.popup = null;
    if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
    }
});
this.popup.add(closeBtn);
    }
}