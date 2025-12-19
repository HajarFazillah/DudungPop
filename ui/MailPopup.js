//MailPopup.js
export default class MailPopup {
  constructor(scene) {
    this.scene = scene;
    this.popup = null;
    this.innerPopup = null;
  }

  show(mailList) {
    // Destroy previous popups if open
    if (this.popup) this.popup.destroy();
    if (this.innerPopup) this.innerPopup.destroy();

    // Popup background settings
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Main mail popup
    this.popup = this.scene.add.container(centerX, centerY);

    // Background overlay (dim)
    const overlay = this.scene.add.rectangle(
      centerX,
      centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.5
    ).setInteractive();
    // layer that holds overlay + popup
    this.popupLayer = this.scene.add.container(0, 0);
    this.popupLayer.add(overlay);
    this.popupLayer.add(this.popup);


    // 1) Main background (popup_bg1)
    const bg = this.scene.add.image(0, 0, 'popup_bg1').setOrigin(0.5);
    bg.setDisplaySize(500, 700);
    this.popup.add(bg);

    const width = bg.displayWidth;
    const height = bg.displayHeight;

    // 2) Outline area – this defines the visible scroll window
    const outline = this.scene.add.image(0, 0, 'popup_outline').setOrigin(0.5);
    outline.setDisplaySize(450, 650);
    this.popup.add(outline);

    const listWidth = outline.displayWidth;
    const listHeight = outline.displayHeight;

    // 3) Container that will scroll inside the outline
    const scrollContainer = this.scene.add.container(0, 0);
    this.popup.add(scrollContainer);

    const boxHeight = 105;
    const gap = 12;
    const fontMd = 20;

    // 4) Create each mail item (mail_bg2 + title/from text)
    mailList.forEach((mail, idx) => {
      const boxY = -listHeight / 2 + boxHeight / 2 + 10 + idx * (boxHeight + gap);

      const desiredItemWidth = listWidth - 10;
      const desiredItemHeight = 95;
      const itemBg = this.scene.add.image(0, boxY, 'mail_bg2')
        .setOrigin(0.5)
        .setDisplaySize(desiredItemWidth, desiredItemHeight);
      scrollContainer.add(itemBg);

      const itemWidth = itemBg.displayWidth;
      const titleLeftMargin = 10;
      const titleRightMargin = 95;


      // title background: full width of itemBg (with small margin)
      const titleBg = this.scene.add.image(
        -itemWidth / 2 + 10,  // left margin
        boxY - 12,
        'mail_titleBg'
      )
        .setOrigin(0, 0.5)
        .setDisplaySize(itemWidth - (titleLeftMargin + titleRightMargin),  // width
          28                                                 // height
        );
      scrollContainer.add(titleBg);

      const titleText = this.scene.add.text(
        titleBg.x + 5,
        titleBg.y,
        mail.title,
        { fontFamily: 'DoveMayo', fontSize: fontMd, color: '#222' }
      ).setOrigin(0, 0.5);
      scrollContainer.add(titleText);

      // FROM background: same width as titleBg
      const fromBg = this.scene.add.image(
        -itemWidth / 2 + 10,
        boxY + 20,
        'mail_fromBg'
      )
        .setOrigin(0, 0.5)
        .setDisplaySize(itemWidth - (titleLeftMargin + titleRightMargin), 22);
      scrollContainer.add(fromBg);

      const fromText = this.scene.add.text(
        fromBg.x + 10,
        fromBg.y,
        `FROM. ${mail.sender}`,
        { fontFamily: 'DoveMayo', fontSize: fontMd - 3, color: '#555' }
      ).setOrigin(0, 0.5);
      scrollContainer.add(fromText);

      // 확인 button: move to right edge of itemBg, resize to 80x80
      const confirmBtn = this.scene.add.image(
        itemWidth / 2 - 50,  // 10px margin from right
        boxY,
        'mail_confirmButton'
      )
        .setOrigin(0.5)
        .setDisplaySize(80, 80)          // <== resize here
        .setInteractive({ useHandCursor: true });
      confirmBtn.on('pointerdown', () => this.showDetail(mail));
      scrollContainer.add(confirmBtn);
      // click area
      const hit = this.scene.add.rectangle(0, boxY, itemWidth, itemBg.displayHeight, 0x000000, 0)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.showDetail(mail));
      scrollContainer.add(hit);
    });

    // 5) Simple wheel scroll for the list
    const maxContentHeight = mailList.length * (boxHeight + gap);
    const maxScroll = Math.max(0, maxContentHeight - listHeight);

    this.scene.input.on('wheel', (pointer, over, dx, dy) => {
      if (!this.popup) return;

      // only scroll when pointer is inside outline bounds
      const local = this.popup.pointToContainer(pointer.x, pointer.y);
      if (Math.abs(local.x) <= listWidth / 2 && Math.abs(local.y) <= listHeight / 2) {
        scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y - dy, -maxScroll, 0);
      }
    });

    // Close button
    const xBtn = this.scene.add.image(-width / 2 + 32, height / 2 - 32, 'exit_button')
      .setOrigin(0.5)
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });
    xBtn.on('pointerdown', () => { this.popup.destroy(); this.popup = null;this.popupLayer.destroy();this.popupLayer = null;});
    this.popup.add(xBtn);
  }

  showDetail(mail) {
    // Optional: destroy previous detail
    if (this.innerPopup) this.innerPopup.destroy();

    // Popup panel reused
    if (this.innerPopup) this.innerPopup.destroy();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    this.innerPopup = this.scene.add.container(centerX, centerY);

    const bg = this.scene.add.image(0, 0, 'popup_bg1')
      .setOrigin(0.5);
    bg.setDisplaySize(500, 700);
    this.innerPopup.add(bg);

    const width = bg.displayWidth;
    const height = bg.displayHeight;

    // white inner panel from Figma 
    const inner = this.scene.add.image(0, -20, 'mail_detail')
      .setOrigin(0.5);
    inner.setDisplaySize(420, 540);
    this.innerPopup.add(inner);

    // === NEW: sender/date headers ===
    const innerW = inner.displayWidth;
    const innerH = inner.displayHeight;

    // y position near top edge of inner panel
    const headerY = inner.y - innerH / 2 + 35;  // move up/down by changing 35

    // sender background (left)
    const senderBg = this.scene.add.image(
      inner.x - innerW / 2 + 80,  // adjust 80 for left padding
      headerY,
      'mail_sender'
    ).setOrigin(0.5);
    this.innerPopup.add(senderBg);

    this.innerPopup.add(this.scene.add.text(
      senderBg.x,
      senderBg.y,
      mail.sender || '팀이름',
      { fontFamily: 'DoveMayo', fontSize: 18, color: '#222' }
    ).setOrigin(0.5));

    // date background (right)
    const dateBg = this.scene.add.image(
      inner.x + innerW / 2 - 90,  // adjust 90 for right padding
      headerY,
      'mail_date'
    ).setOrigin(0.5);
    this.innerPopup.add(dateBg);

    this.innerPopup.add(this.scene.add.text(
      dateBg.x,
      dateBg.y,
      mail.date || '9999. 99. 99',
      { fontFamily: 'DoveMayo', fontSize: 18, color: '#222' }
    ).setOrigin(0.5));

    // body text
    const bodyText = this.scene.add.text(
      inner.x - innerW / 2 + 30,           // left padding
      headerY + 40,                        // below sender/date row
      mail.content,
      {
        fontFamily: 'DoveMayo',
        fontSize: 20,
        color: '#222',
        wordWrap: { width: innerW - 60 }   // right padding
      }
    ).setOrigin(0, 0);
    this.innerPopup.add(bodyText);

    // Reward button only if mail.hasReward === true
    if (mail.hasReward && !mail.received) {
      const rewardBtn = this.scene.add.image(0, height / 2 - 55, 'mail_rewardBtn')
        .setOrigin(0.5)
        .setDisplaySize(320, 70)
        .setInteractive({ useHandCursor: true });
      rewardBtn.on('pointerdown', () => {
        mail.received = true;
        this.showRewardReceived(mail.reward);
      });
      this.innerPopup.add(rewardBtn);
    } else {
      // Disabled button state
      const rewardBtn = this.scene.add.image(0, height / 2 - 55, 'mail_rewardBtnX')
        .setOrigin(0.5)
        .setDisplaySize(320, 70);
      this.innerPopup.add(rewardBtn);
    }

    // Close button
    const xBtn = this.scene.add.image(-width / 2 + 32, height / 2 - 32, 'exit_button')
      .setOrigin(0.5)
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });
    xBtn.on('pointerdown', () => { this.innerPopup.destroy(); this.innerPopup = null; });
    this.innerPopup.add(xBtn);
  }

  showRewardReceived(reward) {

    const popupLayer = this.scene.add.container(0, 0);
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    const popup = this.scene.add.container(centerX, centerY);
    popupLayer.add(popup);

    // full popup image from Figma
    const bg = this.scene.add.image(0, 0, 'mail_rewardClaimed')  // new key
      .setOrigin(0.5);
    bg.setDisplaySize(400, 200)
    popup.add(bg);

    const w = bg.displayWidth;
    const h = bg.displayHeight;

    // invisible hit area over the tick button at bottom right
    const tickHit = this.scene.add.rectangle(
      w / 2 - 35,  // adjust to match tick position
      h / 2 - 25,
      60, 40,
      0x000000, 0
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    tickHit.on('pointerdown', () => {
      popupLayer.destroy();
    });
    popup.add(tickHit);
  }
}