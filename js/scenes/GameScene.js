import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TopButtonBar from '/ui/TopButtonBar.js';
import BottomNavBar from '/ui/BottomNavBar.js';
import Lever from '/ui/Lever.js';
import StorePopup from '/ui/StorePopup.js';
import CollectionPopup from '/ui/CollectionPopup.js';
import CategoryButton from '/ui/CategoryButton.js';
import CategoryButtonGroup from '/ui/CategoryButtonGroup.js';
import CoinBar from '/ui/CoinBar.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Lever and capsule assets
    this.load.image('LeftLever', 'assets/LeftLever.png');
    this.load.image('RightLever', 'assets/RightLever.png');
    this.load.image('CapsuleDrop', 'assets/CapsuleDrop.png');
    this.load.image('CapsuleOpen', 'assets/CapsuleOpen.png');
    this.load.image('CapsuleOpen_Yellow', 'assets/CapsuleOpen_Yellow.png');
    this.load.image('CapsuleOpen_Blue', 'assets/CapsuleOpen_Blue.png');
    this.load.image('GachaResult', 'assets/GachaResult.png');
    this.load.image('Char_Snow', 'assets/Char_Snow.png');
    this.load.image('char_angryStar', 'assets/char_angryStar.png');
    this.load.image('char_angryStar2', 'assets/char_angryStar2.png');
    this.load.image('char_doughnut', 'assets/char_doughnut.png');
    this.load.image('char_egg', 'assets/char_egg.png');
    this.load.image('char_frustStar', 'assets/char_frustStar.png');
    this.load.image('char_ghost', 'assets/char_ghost.png');
    this.load.image('char_happyStar', 'assets/char_happyStar.png');
    this.load.image('char_icecream', 'assets/char_icecream.png');
    this.load.image('char_laughStar', 'assets/char_laughStar.png');
    this.load.image('char_mugChoco', 'assets/char_mugChoco.png');
    this.load.image('char_pen', 'assets/char_pen.png');
    this.load.image('char_ruler', 'assets/char_ruler.png');
    this.load.image('char_skeleton', 'assets/char_skeleton.png');
    this.load.image('char_starCandy', 'assets/char_starCandy.png');
    this.load.image('char_sushi', 'assets/char_sushi.png');
    this.load.image('char_worryStar', 'assets/char_worryStar.png');
    this.load.image('char_blackCat', 'assets/char_blackCat.png');
    this.load.image('char_christmasOrnament', 'assets/char_christmasOrnament.png');
    this.load.image('char_depressedStar', 'assets/char_depressedStar.png');
    this.load.image('char_noMannersStar', 'assets/char_noMannersStar.png');
    this.load.image('char_pancake', 'assets/char_pancake.png');
    this.load.image('char_sadStar', 'assets/char_sadStar.png');
    this.load.image('char_scaredStar', 'assets/char_scaredStar.png');
    this.load.image('char_scarf', 'assets/char_scarf.png');
    this.load.image('char_shockStar', 'assets/char_shockStar.png');
    // Category button assets
    this.load.image("cat1BtnOff", "assets/ButtonCat1_Off.png");
    this.load.image("cat1BtnOn", "assets/ButtonCat1_On.png");
    this.load.image("cat2BtnOff", "assets/ButtonCat2_Off.png");
    this.load.image("cat2BtnOn", "assets/ButtonCat2_On.png");
    this.load.image("cat3BtnOff", "assets/ButtonCat3_Off.png");
    //Popup Background
     this.load.image("popup_bg1", "assets/popup_bg1.png");
     this.load.image("popup_outline", "assets/popup_outline.png");

    //Quest Button
    this.load.image("questBtn", "assets/questBtn.png");
    this.load.image("quest_coin", "assets/quest_coin.png");
    this.load.image("quest_claim", "assets/quest_claim.png");
    this.load.image("quest_claimed", "assets/quest_claimed.png");
    this.load.image("exit_button", "assets/exit_button.png");
    this.load.image("yes_button", "assets/yes_button.png");
    this.load.image("quest_bg1", "assets/quest_bg1.png");
    this.load.image("quest_bg2", "assets/quest_bg2.png");
    //Mail Button
    this.load.image("mailBtn", "assets/mailBtn.png");
    this.load.image("mail_icon", "assets/mail_icon.png");
    this.load.image("mail_rewardBtn", "assets/mail_rewardBtn.png");
    this.load.image("mail_rewardBtnX", "assets/mail_rewardBtnX.png");
    this.load.image("mail_bg2", "assets/mail_bg2.png");
    this.load.image("mail_confirmButton", "assets/mail_confirmButton.png");
    this.load.image("mail_fromBg", "assets/mail_fromBg.png");
    this.load.image("mail_rewardClaimed", "assets/mail_rewardClaimed.png");
    this.load.image("mail_titleBg", "assets/mail_titleBg.png");
    this.load.image("mail_detail", "assets/mail_detail.png");
    this.load.image("mail_sender", "assets/mail_sender.png");
     this.load.image("mail_date", "assets/mail_date.png");
    //Setting Button
    this.load.image("settingBtn", "assets/settingBtn.png");
    this.load.image("setting_bg", "assets/setting_bg.png");
    this.load.image("sound0", "assets/sound0.png");
    this.load.image("sound1", "assets/sound1.png");
    this.load.image("sound2", "assets/sound2.png");
    this.load.image("sound3", "assets/sound3.png");
    this.load.image("music0", "assets/music0.png");
    this.load.image("music1", "assets/music1.png");
    this.load.image("music2", "assets/music2.png");
    this.load.image("music3", "assets/music3.png");
    //Notice Button
    this.load.image("noticeBtn", "assets/noticeBtn.png");
    this.load.image("notice_bg", "assets/notice_bg.png");
    this.load.image("notice_pinkBg", "assets/notice_pinkBg.png");
    this.load.image("notice_yellowBg", "assets/notice_yellowBg.png");
    this.load.image("notice_greenBg", "assets/notice_greenBg.png");
    this.load.image("notice_blueBg", "assets/notice_blueBg.png");
    this.load.image("notice_img", "assets/notice_img.png");
    this.load.image("notice_type", "assets/notice_type.png");
    //coin
    this.load.image("coin", "assets/coin.png");
    //Store
    this.load.image("store_bg", "assets/store_bg.png");
    this.load.image("store_enhance", "assets/store_enhance.png");
    this.load.image("store_interior", "assets/store_interior.png");
    this.load.image("store_price", "assets/store_price.png");
    this.load.image("store_buy", "assets/store_buy.png");
    this.load.image("store_buyComplete", "assets/store_buyComplete.png");
    // Other images can be add here too
  }

  create() {
    console.log("Loaded:", this.scene.key);

    const centerX = this.cameras.main.centerX;
    const startX = centerX - 240;
    const startY = 40;

    // Create UI components (in order from  top to bottom of the page)
    this.topButtonBar = new TopButtonBar(this, startX, startY);
    this.coinBar = new CoinBar(this, startX - 700, startY + 25);
    this.collectionPopup = new CollectionPopup(this);
    this.collectionPopup.createPopup();
    this.categoryGroup = new CategoryButtonGroup(this, centerX, (label) => this.onCategoryClicked(label));
    this.categoryGroup.activateDefault();
    this.add.rectangle(centerX, 470, 370, 400).setStrokeStyle(2, 0x000000);
    this.bottomNavBar = new BottomNavBar(this, 1100, this.onNavButtonClicked.bind(this));
    this.Lever = new Lever(this, 120, 750);
    this.Lever.createLever();
    this.createProgressBar();
    this.Lever.setProgressBarUpdateCallback(this.updateProgressBarUI.bind(this));
    this.playerState = { coins: 999999, bagSlots: 20, clickLevel: 1 };
    this.storePopup = new StorePopup(this, this.playerState)
  }

  createProgressBar() {
    const centerX = this.cameras.main.centerX;
    this.progressBarBg = this.add.rectangle(centerX, 880, 370, 11, 0xffffff).setStrokeStyle(1, 0x1a1a1a);
    this.progressBarFill_maxWidth = 370;
    const fillLeft = centerX - 370 / 2;  // Fill: x := left edge
    this.progressBarFill = this.add.rectangle(fillLeft, 880, 0, 11, 0x333333).setOrigin(0, 0.5);
    if (this.progressLabel) this.progressLabel.destroy(); // prevent duplicate
    this.progressLabel = this.add.text(centerX, 900, 'A등급 이상 확정까지 101회', { fontSize: '17px', color: '#222' }).setOrigin(0.5);
  }

  updateProgressBarUI(current, max) {
    const centerX = this.cameras.main.centerX;
    const fillMaxWidth = this.progressBarFill_maxWidth;
    const fillLeft = centerX - 370 / 2;
    let fillWidth = Math.min(1, current / max) * fillMaxWidth; // Fill progress calculation
    this.progressBarFill.width = fillWidth;
    this.progressBarFill.x = fillLeft; // Always align to left of background

    let remain = max - current + 1;
    if (remain < 1) remain = 1;
    this.progressLabel.setText(`A등급 이상 확정까지 ${remain}회`);
  }

  onCategoryClicked(label) { console.log("Selected:", label); }

  onNavButtonClicked(label) {
    console.log(this.scene.key, '- button clicked:', label);

    if (this.collectionPopup) this.collectionPopup.hidePopup();
    if (this.storePopup) this.storePopup.hide();

    switch (label) {
      case '도감':
        if (this.collectionPopup) this.collectionPopup.showPopup();
        break;

      case '상점':
        if (this.storePopup) this.storePopup.show();
        break;

      // other buttons (optional for now)
      case '가방':
      case '장식장':
        break;
    }
  }
}