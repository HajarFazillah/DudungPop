import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class BootScene extends Phaser.Scene {
    create() {
        this.scene.start('StartScene');   // or 'GameScene'
    }
    constructor() { super('BootScene'); }

    preload() {
        // Preload ALL GameScene assets here (images, audio, atlases)
        //Lever
        this.load.image('game_default', 'assets/game_default.png');
        this.load.image('game_default2', 'assets/game_default2.png');
        this.load.image('game_lever_default', 'assets/game_lever_default.png');
        this.load.image('LeftLever', 'assets/LeftLever.png');
        this.load.image('RightLever', 'assets/RightLever.png');
        this.load.image("LeverDefault", "assets/game_lever_default.png");
        this.load.image('Capsule_Red', 'assets/Capsule_Red.png');
        this.load.image('Capsule_Green', 'assets/Capsule_Green.png');
        this.load.image('Capsule_Yellow', 'assets/Capsule_Yellow.png');
        this.load.image('CapsuleOpen_Blue', 'assets/CapsuleOpen_Blue.png');
        this.load.image('GachaResult', 'assets/GachaResult.png');
        this.load.image('lever_confirm_button', 'assets/lever_confirm_button.png');
        this.load.image('result_bg', 'assets/result_bg.png');
        //Characters

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
        // bottom nav bar
        this.load.image("navbar_left", "assets/navbar_left.png");
        this.load.image("navbar_theme", "assets/navbar_theme.png");
        this.load.image("navbar_bag", "assets/navbar_bag.png");
        this.load.image("navbar_store", "assets/navbar_store.png");
        this.load.image("navbar_collection", "assets/navbar_collection.png");
        this.load.image("navbar_right", "assets/navbar_right.png");
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
        this.load.image("coin_bar", "assets/coin_bar.png");
        //Store
        this.load.image("store_bg", "assets/store_bg.png");
        this.load.image("store_enhance", "assets/store_enhance.png");
        this.load.image("store_interior", "assets/store_interior.png");
        this.load.image("store_price", "assets/store_price.png");
        this.load.image("store_buy", "assets/store_buy.png");
        this.load.image("store_buyComplete", "assets/store_buyComplete.png");
        //collection
        this.load.image('collection_bg', 'assets/collection_bg.png');
        this.load.image('collection_story_clicked', 'assets/collection_story_clicked.png');
        this.load.image('collection_story_unclicked', 'assets/collection_story_unclicked.png');
        this.load.image('collection_item_clicked', 'assets/collection_item_clicked.png');
        this.load.image('collection_item_unclicked', 'assets/collection_item_unclicked.png');
        this.load.image('collection_total_bg', 'assets/collection_total_bg.png');
        this.load.image('collection_book_open', 'assets/collection_book_open.png');
        this.load.image('collection_bg2', 'assets/collection_bg2.png');
        this.load.image('collection_frame', 'assets/collection_frame.png');
        this.load.image('collection_star', 'assets/collection_star.png');
        this.load.image('collection_star_black', 'assets/collection_star_black.png');
        this.load.image('collection_bg3', 'assets/collection_bg3.png');
        this.load.image('collection_title_bg', 'assets/collection_title_bg.png');
        this.load.image('collection_gacha', 'assets/collection_gacha.png');
        this.load.image('collection_gift', 'assets/collection_gift.png');
        this.load.image('collection_capsule', 'assets/collection_capsule.png');
        this.load.image('collection_item_bg', 'assets/collection_item_bg.png');
        this.load.image('collection_item_bg2', 'assets/collection_item_bg2.png');
        this.load.image('collection_item_bg3', 'assets/collection_item_bg3.png');
        this.load.image('collection_item_board', 'assets/collection_item_board.png');
        this.load.image('collection_item_outline', 'assets/collection_item_outline.png');
        this.load.image('collection_item_unite', 'assets/collection_item_unite.png');
        this.load.image('collection_possible_item', 'assets/collection_possible_item.png');
        this.load.image('collection_items', 'assets/collection_items.png');
        // ThemePopup
        this.load.image('theme_rect', 'assets/theme_rect.png');
        this.load.image('theme_rect_btn', 'assets/theme_rect_btn.png');
        this.load.image('theme_hidden', 'assets/theme_hidden.png');
        this.load.image('theme_selected', 'assets/theme_selected.png');
        this.load.image('theme_basic', 'assets/theme_basic.png');
        this.load.image('theme_summer', 'assets/theme_summer.png');
        // BagPopup
        this.load.image('bag_order', 'assets/bag_order.png');
        this.load.image('bag_rank', 'assets/bag_rank.png');
        this.load.image('bag_fav', 'assets/bag_fav.png');
        this.load.image('bag_star', 'assets/bag_star.png');
        this.load.image('collection_hidden', 'assets/collection_hidden.png');
        this.load.image('bag_item_unite', 'assets/bag_item_unite.png');
        this.load.image('bag_sub_popup', 'assets/bag_sub_popup.png');
        this.load.image('bag_item_sell', 'assets/bag_item_sell.png');
        this.load.image('bag_show_sell', 'assets/bag_show_sell.png');
        this.load.image('item_rank_a', 'assets/item_rank_a.png');
        this.load.image('bag_confirm_sell', 'assets/bag_confirm_sell.png');
        this.load.image('bag_getcoin', 'assets/bag_getcoin.png');
        this.load.image('bag_choose_sell', 'assets/bag_choose_sell.png');
        this.load.image('bag_choose_cancel', 'assets/bag_choose_cancel.png');
        // BGM
        this.load.audio('mainBGM', 'assets/audio/mainBGM.mp3');
        //Sound
         this.load.audio('CapsuleOpen', 'assets/audio/CapsuleOpen.mp3');
    }

    create() {
        this.scene.start('StartScene');
    }
}
