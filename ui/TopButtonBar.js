// ui/TopButtonBar.js
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

import QuestPopup from './QuestPopup.js';
import MailPopup from './MailPopup.js';
import SettingPopup from './SettingPopup.js';
import NoticePopup from './NoticePopup.js';

export default class TopButtonBar {
  constructor(scene, x = 0, y = 0) {
    this.scene = scene;

    // Layout config (tune as needed)
    this.buttonGap = 34;
    this.buttonWidth = 60;
    this.iconScale = 0.7;

    this.buttonLabels = ['퀘스트', '메일', '설정', '공지'];
    this.buttonImageKeys = {
      '퀘스트': 'questBtn',
      '메일': 'mailBtn',
      '설정': 'settingBtn',
      '공지': 'noticeBtn'
    };

    // Root container (position this from GameScene)
    this.container = scene.add.container(x, y);

    // Child container that holds the row (local coordinates)
    this.buttonsGroup = scene.add.container(0, 0);
    this.container.add(this.buttonsGroup);

    // Popups
    this.popup = null;
    this.questPopup = new QuestPopup(scene);
    this.mailPopup = new MailPopup(scene);
    this.settingPopup = new SettingPopup(scene);
    this.noticePopup = new NoticePopup(scene);

    // Create UI
    this.createButtons();

    // If the canvas resizes, keep the bar where GameScene last placed it
    // (The bar itself is centered locally, so no extra math needed here.)
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this); // resize event exists in Scale Manager [web:270]
  }

  // Public API: let GameScene anchor it (cam.centerX, cam.height * 0.06, etc.)
  setPosition(x, y) {
    this.container.setPosition(x, y); // Containers use setPosition like any game object [web:269]
  }

  // Optional: scale whole bar (if you want smaller icons on small screens)
  setScale(s) {
    this.container.setScale(s);
  }

  destroy() {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.container.destroy(true);
    if (this.popup) this.popup.destroy(true);
  }

  onResize() {
    // No-op by default.
    // Keep this hook in case you later want to adjust iconScale by screen size.
  }

  createButtons() {
    // Clear any existing children
    this.buttonsGroup.removeAll(true);

    // Center the row around x=0 in local space (Container local origin is 0,0) [web:264]
    const n = this.buttonLabels.length;
    const totalW = n * this.buttonWidth + (n - 1) * this.buttonGap;
    const startX = -totalW / 2 + this.buttonWidth / 2;

    this.buttonLabels.forEach((label, i) => {
      const x = startX + i * (this.buttonWidth + this.buttonGap);
      const imgKey = this.buttonImageKeys[label];

      const btn = this.scene.add.image(x, 0, imgKey)
        .setOrigin(0.5)
        .setScale(this.iconScale)
        .setInteractive({ useHandCursor: true });

      // Hover tint is mostly desktop; harmless on mobile
      btn.on('pointerover', () => btn.setTint(0xdddddd));
      btn.on('pointerout', () => btn.clearTint());

      btn.on('pointerdown', () => this.onButtonPressed(label));

      this.buttonsGroup.add(btn);
    });
  }

  onButtonPressed(label) {
    if (label === '퀘스트') {
      const questData = {
        weekly: {
          title: '일일 퀘스트 모두 달성',
          curValue: 4,
          goalValue: 5,
          status: '진행중'
        },
        quests: [
          { title: '일일 출석 체크', curValue: 1, goalValue: 1, status: '수령' },
          { title: '키링 뽑기 20회', curValue: 18, goalValue: 20, status: '진행중' },
          { title: '아르바이트 클릭 100회', curValue: 100, goalValue: 100, status: '완료' },
          { title: '광고 시청 3회', curValue: 1, goalValue: 3, status: '진행중' }
        ]
      };
      this.questPopup.show(questData);
      return;
    }

    if (label === '메일') {
      const sampleMailList = [
        { sender: '팀이름', title: '환영합니다!', content: '게임에 참여해 주셔서 감사합니다.', hasReward: true, reward: 9999, received: false },
        { sender: 'GM', title: '업데이트 소식', content: '새 이벤트가 시작됩니다.', hasReward: false, reward: 0, received: false },
        { sender: '팀이름', title: '새 친구가 추가되었습니다.', content: '내용내용내용내용내용내용내용내용.', hasReward: false, reward: 0, received: false }
      ];
      this.mailPopup.show(sampleMailList);
      return;
    }

    if (label === '설정') {
      this.settingPopup.show();
      return;
    }

    if (label === '공지') {
      const noticeList = [
        { type: '공지 사항', date: '9999. 99. 99', title: '공지 안내', text: '공지 안내 텍스트' },
        { type: '이벤트 공지', date: '9999. 99. 99', title: '새 이벤트 공지', text: '새로운 이벤트가 추가되었습니다!' },
        { type: '개발자 노트', date: '9999. 99. 99', title: '개발자 노트 예시', text: '개발 노트 내용...' },
        { type: '업데이트', date: '9999. 99. 99', title: '업데이트 안내', text: '업데이트 내용...' }
      ];
      this.noticePopup.show(noticeList);
      return;
    }

    this.showSimplePopup(`${label} 팝업입니다`);
  }

  showSimplePopup(message) {
    if (this.popup) {
      this.popup.destroy(true);
      this.popup = null;
    }

    // Put it near top-middle of the camera
    const cam = this.scene.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.height * 0.28;

    this.popup = this.scene.add.container(centerX, centerY);

    const bg = this.scene.add.rectangle(0, 0, 360, 200, 0xe0e0e0)
      .setStrokeStyle(2, 0x000000)
      .setOrigin(0.5);

    const msgText = this.scene.add.text(0, 0, message, {
      fontSize: '22px',
      color: '#000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const xBtn = this.scene.add.text(bg.width / 2 - 20, -bg.height / 2 + 20, 'X', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#91131a',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    xBtn.on('pointerover', () => xBtn.setColor('#fa5555'));
    xBtn.on('pointerout', () => xBtn.setColor('#91131a'));
    xBtn.on('pointerdown', () => {
      this.popup.destroy(true);
      this.popup = null;
    });

    this.popup.add([bg, msgText, xBtn]);
  }
}