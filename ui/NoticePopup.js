//NoticePopup.js
export default class NoticePopup {
  constructor(scene) {
    this.scene = scene;
    this.popup = null;
    this.detailPopup = null;
  }

  show(noticeList) {
    // Destroy previous popups
    if (this.popup) this.popup.destroy();
    if (this.detailPopup) this.detailPopup.destroy();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;
    this.popup = this.scene.add.container(centerX, centerY);

    // Panel background
    const bg = this.scene.add.image(0, 0, 'popup_bg1')
      .setOrigin(0.5)
      .setDisplaySize(500, 700);
    this.popup.add(bg);

    const width  = bg.displayWidth;
    const height = bg.displayHeight;

    // outline (same as Mail)
    const outline = this.scene.add.image(0, 0, 'popup_outline')
      .setOrigin(0.5)
      .setDisplaySize(450, 650);
    this.popup.add(outline);

    const listWidth  = outline.displayWidth;
    const listHeight = outline.displayHeight;

    // scroll container
    const scrollContainer = this.scene.add.container(0, 0);
    this.popup.add(scrollContainer);

    const itemHeight = 70;
    const gap = 12;
    const fontMd = 20;

    const colorByType = {
  '공지 사항':   'notice_pinkBg',
  '이벤트 공지': 'notice_yellowBg',
  '개발자 노트': 'notice_greenBg',
  '업데이트':   'notice_blueBg'
};

noticeList.forEach((notice, idx) => {
  const boxY = -listHeight / 2 + itemHeight / 2 + 20 + idx * (itemHeight + gap);

  const itemBg = this.scene.add.image(0, boxY, 'notice_bg')
    .setOrigin(0.5)
    .setDisplaySize(listWidth - 40, itemHeight);
  scrollContainer.add(itemBg);

  const itemWidth = itemBg.displayWidth;

  // pick color by type (fallback to pink if missing)
  const colorKey = colorByType[notice.type] || 'notice_pinkBg';

  const colorBg = this.scene.add.image(0, boxY, colorKey)
    .setOrigin(0.5)
    .setDisplaySize(itemWidth - 20, itemHeight - 16);
  scrollContainer.add(colorBg);

  // build text: "타입  [ 날짜 제목 ]"
  const line = `${notice.type}  [ ${notice.date} ${notice.title} ]`;

  const titleText = this.scene.add.text(
    -itemWidth / 2 + 20,
    boxY,
    line,
    { fontFamily: 'DoveMayo', fontSize: fontMd, color: '#222' }
  ).setOrigin(0, 0.5);
  scrollContainer.add(titleText);

  const hit = this.scene.add.rectangle(0, boxY, itemWidth, itemHeight, 0x000000, 0)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  hit.on('pointerdown', () => this.showDetail(notice));
  scrollContainer.add(hit);
});

    // wheel scroll
    const maxContentHeight = noticeList.length * (itemHeight + gap);
    const maxScroll = Math.max(0, maxContentHeight - listHeight);

    this.scene.input.on('wheel', (pointer, over, dx, dy) => {
      if (!this.popup) return;
      const local = this.popup.pointToContainer(pointer.x, pointer.y);
      if (Math.abs(local.x) <= listWidth / 2 && Math.abs(local.y) <= listHeight / 2) {
        scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y - dy, -maxScroll, 0);
      }
    });

    // Close button
    const xBtn = this.scene.add.image(-width/2 + 32, height/2 - 32, "exit_button")
      .setOrigin(0.5)
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });
    xBtn.on("pointerdown", () => {
      this.popup.destroy();
      this.popup = null;
    });
    this.popup.add(xBtn);
  }

  showDetail(notice) {
    // Destroy any previous detail popup
    if (this.detailPopup) this.detailPopup.destroy();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // layer that blocks input behind
    const layer = this.scene.add.container(0, 0);
    this.detailPopup = layer;

    const blocker = this.scene.add.rectangle(
    centerX,
    centerY,
    this.scene.scale.width,
    this.scene.scale.height,
    0x000000,
    0        // alpha 0 = invisible
  ).setOrigin(0.5)
   .setInteractive();        // captures all pointer events
  layer.add(blocker);

  // actual popup container
  const popup = this.scene.add.container(centerX, centerY);
  layer.add(popup);

    const bg = this.scene.add.image(0, 0, 'popup_bg1')
    .setOrigin(0.5)
    .setDisplaySize(500, 700);
    popup.add(bg);

  const width  = bg.displayWidth;
  const height = bg.displayHeight;

  // TOP: related image area (notice_img)
  const imgBg = this.scene.add.image(0, -height / 2 + 100, 'notice_img')
    .setOrigin(0.5);
  this.popup.add(imgBg);
  imgBg.setDisplaySize(width - 100, 110);
   popup.add(imgBg);

  // INNER white outline (smaller, like mockup)
  const inner = this.scene.add.image(0, 55, 'popup_outline') // reuse outline asset
    .setOrigin(0.5)
    .setDisplaySize(450, 480);
   popup.add(inner);

  const innerW = inner.displayWidth;
  const innerH = inner.displayHeight;

  // TYPE bar inside outline (notice_type bg)
  const typeBg = this.scene.add.image(
    0,
    inner.y - innerH / 2 + 40,
    'notice_type'
  ).setOrigin(0.5)
   .setDisplaySize(innerW - 80, 40);
  popup.add(typeBg);

   popup.add(this.scene.add.text(
    typeBg.x,
    typeBg.y,
    notice.type,                        // 공지 사항 / 이벤트 공지 / ...
    { fontFamily: 'DoveMayo', fontSize: 22, color: '#222' }
  ).setOrigin(0.5));
 

  // Date label "게시일" + date on the right
  const dateY = typeBg.y + 40;

  popup.add(this.scene.add.text(
    inner.x - innerW / 2 + 40,
    dateY,
    '게시일',
    { fontFamily: 'DoveMayo', fontSize: 18, color: '#222' }
  ).setOrigin(0, 0.5));

  popup.add(this.scene.add.text(
    inner.x + innerW / 2 - 40,
    dateY,
    notice.date,
    { fontFamily: 'DoveMayo', fontSize: 18, color: '#222' }
  ).setOrigin(1, 0.5));

  // TITLE (big bold line)
  const titleY = dateY + 40;
   popup.add(this.scene.add.text(
    inner.x - innerW / 2 + 40,
    titleY,
    notice.title,
    { fontFamily: 'DoveMayo', fontSize: 22, color: '#000' }
  ).setOrigin(0, 0.5));

  // BODY TEXT under title
  const bodyY = titleY + 40;
  popup.add(this.scene.add.text(
    inner.x - innerW / 2 + 40,
    bodyY,
    notice.text,
    {
      fontFamily: 'DoveMayo',
      fontSize: 18,
      color: '#222',
      wordWrap: { width: innerW - 80, useAdvancedWrap: true }
    }
  ).setOrigin(0, 0));

    // Close button
    const xBtn = this.scene.add.image(-width/2 + 32, height/2 - 32, "exit_button")
      .setOrigin(0.5)
      .setDisplaySize(48, 48)
      .setInteractive({ useHandCursor: true });
    xBtn.on("pointerdown", () => {
      layer.destroy();
       this.detailPopup = null;
     });
    popup.add(xBtn);
  }
}