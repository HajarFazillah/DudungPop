//SettingPopup.js
export default class SettingPopup {
  constructor(scene) {
    this.scene = scene;
    this.popup = null;
    // Default: sound/music enabled (status: 0=ON, 1=HALF, 2=OFF)
    this.soundStatus = 0;
    this.musicStatus = 0;
    this.iconKeys = [
      ["sound1", "sound2", "sound3", "sound0"],
      ["music1", "music2", "music3", "music0"]
    ];
  }

  show() {
    // Destroy old popup
    if (this.popup) {
      this.popup.destroy();
      this.popup = null;
    }

    const cam = this.scene.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    // layer that holds overlay + popup
    this.popupLayer = this.scene.add.container(0, 0);

    // full-screen dim overlay
    const overlay = this.scene.add.rectangle(
      cam.centerX,
      cam.centerY,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      0.5
    ).setOrigin(0.5).setInteractive();
    this.popupLayer.add(overlay);

    // popup container on top of overlay
    this.popup = this.scene.add.container(centerX, centerY);
    this.popupLayer.add(this.popup);
    // Background
    const bg = this.scene.add.image(0, 0, "setting_bg")
      .setOrigin(0.5)
    bg.setDisplaySize(500, 250);
    bg.setInteractive();
    this.popup.add(bg);


    // SOUND Control
    this.soundBtn = this.scene.add.image(-60, 0,
      this.iconKeys[0][this.soundStatus])
      .setOrigin(0.5)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true });
    this.popup.add(this.soundBtn);

    // Toggle sound state on click
    this.soundBtn.on("pointerdown", () => {
      this.soundStatus = (this.soundStatus + 1) % 4;
      this.soundBtn.setTexture(this.iconKeys[0][this.soundStatus]);
      // TODO: Optionally call your game sound function here
    });

    // MUSIC Control
    this.musicBtn = this.scene.add.image(-170, 0,
      this.iconKeys[1][this.musicStatus])
      .setOrigin(0.5)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true });
    this.popup.add(this.musicBtn);

    // Toggle music state on click
    this.musicBtn.on("pointerdown", () => {
      this.musicStatus = (this.musicStatus + 1) % 4;
      this.musicBtn.setTexture(this.iconKeys[1][this.musicStatus]);
      // TODO: Optionally call your game music function here
    });

    // ---------- Invisible Insta hit area ----------
    // adjust x, y, width, height so it covers the Insta box in setting_bg
    const instaHit = this.scene.add.rectangle(80, 0, 180, 60, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.popup.add(instaHit);

    const openInsta = () => {
      const url = "https://instagram.com/your_team_here";
      const win = window.open(url, "_blank");
      if (!win) window.location.href = url;
    };

    instaHit.on("pointerup", openInsta);



    // Close button
    // ---------- Invisible Exit (X) hit area ----------
    // position near bottom-left corner of the background image
    const bgW = bg.displayWidth;
    const bgH = bg.displayHeight;

    const exitHit = this.scene.add.rectangle(
      -bgW / 2 + 20,   // x
      bgH / 2 - 20,    // y
      40, 40,          // width, height
      0x000000, 0      // black, alpha 0 (invisible)
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.popup.add(exitHit);

    exitHit.on("pointerup", () => {
      if (this.popupLayer) {
        this.popupLayer.destroy();
        this.popupLayer = null;
      }
    });
  }
}