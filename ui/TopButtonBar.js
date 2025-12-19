import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import QuestPopup from '/ui/QuestPopup.js';
import MailPopup from '/ui/MailPopup.js';
import SettingPopup from '/ui/SettingPopup.js';
import NoticePopup from '/ui/NoticePopup.js';

// TopButtonBar.js

export default class TopButtonBar {

    constructor(scene, startX, startY) {
        this.scene = scene;
        this.container = scene.add.container(startX, startY);
        this.buttonGap = 34;
        this.buttonWidth = 60;
        this.buttonLabels = ['퀘스트', '메일', '설정', '공지'];
          this.buttonImageKeys = {
            '퀘스트': 'questBtn',   
            '메일':   'mailBtn',     
            '설정':   'settingBtn',  
            '공지':   'noticeBtn'    
        };
        this.popup = null;
        this.questPopup = new QuestPopup(scene);
        this.mailPopup = new MailPopup(scene);
        this.settingPopup = new SettingPopup(scene);
        this.noticePopup = new NoticePopup(scene);
        this.createButtonBar();
    }

    createButtonBar() {
        this.scene.cameras.main.setBackgroundColor('#ffffff');

        this.buttonsGroup = this.scene.add.container(0, 30);
         this.buttonLabels.forEach((label, i) => {
            const x = i * (this.buttonWidth + this.buttonGap);
            const imgKey = this.buttonImageKeys[label];

            const btn = this.scene.add.image(x, 0, imgKey)
                .setOrigin(0.5)
                .setScale(2.5)   // adjust to match your png size
                .setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setTint(0xdddddd));
            btn.on('pointerout', () => btn.clearTint());

            btn.on('pointerdown', () => {
        if (label === '퀘스트') {
            // Example quest data, fill with your real data later!
        let questData = {
            weekly: {   
                title: '일일 퀘스트 모두 달성',
                curValue: 4,
                goalValue: 5,                             
                status: "진행중", // or "완료", "수령"
            },
            quests: [
                { title: "일일 출석 체크", curValue: 1, goalValue: 1, status: "수령" },
                { title: "키링 뽑기 20회", curValue: 18, goalValue: 20, status: "진행중" },
                { title: "아르바이트 클릭 100회", curValue: 100, goalValue: 100, status: "완료" },
                { title: "광고 시청 3회", curValue: 1, goalValue: 3, status: "진행중" }
            ]
        };
        this.questPopup.show(questData);
         } else if (label === '메일') {
                    const sampleMailList = [
                        { sender: "팀이름", title: "환영합니다!", content: "게임에 참여해 주셔서 감사합니다.", hasReward: true, reward: 9999, received: false },
                        { sender: "GM", title: "업데이트 소식", content: "새 이벤트가 시작됩니다.", hasReward: false, reward: 0, received: false },
                        { sender: "팀이름", title: "새 친구가 추가되었습니다.", content: "내용내용내용내용내용내용내용내용.", hasReward: false, reward: 0, received: false }
                    ];
                    this.mailPopup.show(sampleMailList);
         } else if (label === '설정') {
                   this.settingPopup.show();
         } else if (label === '공지') {
            // Example notice data
              const noticeList = [
    {
      type: '공지 사항',                 // pink
      date: '9999. 99. 99',
      title: '공지 안내',
      text: '공지공지공지공지공지공지업데이트안내\n공지공지공지공지공지공지업데이트안내\n공지공지공지공지공지공지업데이트안내'
    },
    {
      type: '이벤트 공지',               // yellow
      date: '9999. 99. 99',
      title: '새 이벤트 공지',
      text: '새로운 이벤트가 추가되었습니다!'
    },
    {
      type: '개발자 노트',               // green
      date: '9999. 99. 99',
      title: '개발자 노트 예시',
      text: '개발 노트 내용...'
    },
    {
      type: '업데이트',                 // blue
      date: '9999. 99. 99',
      title: '업데이트 안내',
      text: '업데이트 내용...'
    }
  ];
  this.noticePopup.show(noticeList);
    } else {
        this.showSimplePopup(label + ' 팝업입니다');
    }
});

            this.buttonsGroup.add(btn);
        });

        const totalButtonsWidth = this.buttonLabels.length * this.buttonRadius * 2 +
            (this.buttonLabels.length - 1) * this.buttonGap;
        const centerX = this.scene.cameras.main.centerX;
        this.buttonsGroup.x = centerX - totalButtonsWidth / 2;
        
        this.updateBarPosition();
        this.container.add(this.buttonsGroup);
        this.scene.scale.on('resize', () => this.updateBarPosition());
    }

    updateBarPosition() {
        const totalButtonsWidth = this.buttonLabels.length * this.buttonWidth +
            (this.buttonLabels.length - 1) * this.buttonGap;
        const centerX = this.scene.cameras.main.centerX;
        this.buttonsGroup.x = centerX - totalButtonsWidth / 2;  
    }   


    showSimplePopup(message) {
    
        if (this.popup) {
            this.popup.destroy();
            this.popup = null;
        }
    
        const centerX = this.scene.cameras.main.centerX;
        const centerY = 450;

        this.popup = this.scene.add.container(centerX, centerY);
        const bg = this.scene.add.rectangle(0, 0, 360, 200, 0xe0e0e0)
        .setStrokeStyle(2, 0x000000)
        .setOrigin(0.5);
        this.popup.add(bg);

        const msgText = this.scene.add.text(0, 0, message, {
            fontSize: '22px', color: '#000', fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.popup.add(msgText);

        const xBtnSize = 30;
        const xBtn = this.scene.add.text(bg.width / 2 - xBtnSize, -bg.height / 2 + xBtnSize, 'X', {
            fontSize: '28px', fontStyle: 'bold', color: '#91131a', fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.popup.add(xBtn);

        xBtn.on('pointerover', () => xBtn.setColor('#fa5555'));
        xBtn.on('pointerout', () => xBtn.setColor('#91131a'));
        xBtn.on('pointerdown', () => {
            this.popup.destroy();
            this.popup = null;
        });
    }
}