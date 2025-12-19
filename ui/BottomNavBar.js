export default class BottomNavBar {
  constructor(scene, navY = 1100, onButtonClicked = null) {
    this.scene = scene;
    this.navY = navY;
    this.circleRadius = 55;
    this.circleGap = 30;
    this.labels = ['장식장', '가방', '상점', '도감'];
    this.n = this.labels.length;
    this.onButtonClicked = onButtonClicked;
    this.mainScenes = ['GameScene', 'PartTimeScene', 'InventoryScene'];
    this.createBottomNavBar();
  }

  createBottomNavBar() {

    const buttonImages = [
      'navbar_theme',
      'navbar_bag',
      'navbar_store',
      'navbar_collection'
    ];

    const totalWidth = this.n * (this.circleRadius * 2) + (this.n - 1) * this.circleGap;
    const centerXNav = this.scene.cameras.main.centerX;
    const startXNav = centerXNav - totalWidth / 2 + this.circleRadius;
    const navY = this.navY;
    const arrowOffset = 60;
    const arrowSize = 60;

    // Left Arrow
    const leftArrow = this.scene.add.triangle(
      startXNav - this.circleRadius + 2 - arrowOffset, navY,
      arrowSize, 0, 0, arrowSize / 2, arrowSize, arrowSize, 0x222222
    ).setInteractive({ useHandCursor: true });

    this.labels.forEach((label, i) => {
      const x = startXNav + i * (this.circleRadius * 2 + this.circleGap);

      const btn = this.scene.add.image(
        x,
        navY,
        buttonImages[i]
      )
        .setDisplaySize(this.circleRadius * 2, this.circleRadius * 2)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        console.log(label + ' 버튼이 클릭되었습니다.');
        if (this.onButtonClicked) {
          this.onButtonClicked(label);
        }
      });
    });




    // Right Arrow
    const rightArrow = this.scene.add.triangle(
      startXNav + (this.n - 1) * (this.circleRadius * 2 + this.circleGap) + this.circleRadius + arrowOffset, navY,
      0, 0, arrowSize, arrowSize / 2, 0, arrowSize, 0x222222
    ).setInteractive({ useHandCursor: true });

    // === PAGE NAVIGATION LOGIC ===
    const currentSceneKey = this.scene.scene.key;
    const currentIndex = this.mainScenes.indexOf(currentSceneKey);

    // Left arrow → previous scene
    leftArrow.on('pointerdown', () => {
      const prevIndex = (currentIndex - 1 + this.mainScenes.length) % this.mainScenes.length;
      const targetScene = this.mainScenes[prevIndex];
      console.log(`Left arrow → going to ${targetScene}`);
      this.scene.scene.start(targetScene);
    });

    // Right arrow → next scene
    rightArrow.on('pointerdown', () => {
      const nextIndex = (currentIndex + 1) % this.mainScenes.length;
      const targetScene = this.mainScenes[nextIndex];
      console.log(`Right arrow → going to ${targetScene}`);
      this.scene.scene.start(targetScene);
    });

  }
}