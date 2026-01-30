// ui/CategoryButtonGroup.js
import CategoryButton from './CategoryButton.js';

export default class CategoryButtonGroup {
  constructor(scene, x = 0, y = 0, onCategoryClicked = null) {
    this.scene = scene;
    this.callback = onCategoryClicked;
    this.buttons = [];

    this.container = scene.add.container(x, y);

    const categories = [
      { x: -185, label: 'cat1', off: 'cat1BtnOff', on: 'cat1BtnOn', disabled: false },
      { x: 0,    label: 'cat2', off: 'cat2BtnOff', on: 'cat2BtnOn', disabled: false },
      { x: 185,  label: 'cat3', off: 'cat3BtnOff', on: 'cat3BtnOn', disabled: true }
    ];

    categories.forEach(cfg => {
      const btn = new CategoryButton(scene, 0, 0, cfg.label, {
        off: cfg.off,
        on: cfg.on,
        disabled: cfg.disabled,
        onClick: (b) => this.handleClick(b)
      });

      // CategoryButton exposes the image as `bg`
      btn.bg.setPosition(cfg.x, 0);
      this.container.add(btn.bg); // moves it under the container's transform [web:314]

      this.buttons.push(btn);
    });
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  setScale(s) {
    this.container.setScale(s);
  }

  destroy() {
    this.container.destroy(true);
  }

  handleClick(clickedBtn) {
    if (clickedBtn.disabled) return;

    this.buttons.forEach(btn => (btn === clickedBtn ? btn.activate() : btn.deactivate()));
    if (this.callback) this.callback(clickedBtn.label);
  }

  activateDefault() {
    if (this.buttons[0]) this.buttons[0].activate();
  }
}
