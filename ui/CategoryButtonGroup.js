import CategoryButton from "./CategoryButton.js";

export default class CategoryButtonGroup {
  constructor(scene, centerX, onCategoryClicked) {
    this.scene = scene;
    this.callback = onCategoryClicked;
    this.buttons = [];

    const categories = [
      {
        x: centerX - 185, 
        label: "cat1",
        off: "cat1BtnOff",
        on: "cat1BtnOn",
        disabled: false
      },
      {
        x: centerX,
        label: "cat2",
        off: "cat2BtnOff",
        on: "cat2BtnOn",
        disabled: false
      },
      {
        x: centerX + 185,
        label: "cat3",
        off: "cat3BtnOff",
        on: "cat3BtnOn",
        disabled: true   // disabled
      }
    ];

    categories.forEach(cfg => {
      const btn = new CategoryButton(
        scene,
        cfg.x,
        210,
        cfg.label,
        {
          off: cfg.off,
          on: cfg.on,
          disabled: cfg.disabled,
          onClick: (b) => this.handleClick(b)
        }
      );

      this.buttons.push(btn);
    });
  }

  handleClick(clickedBtn) {
    // Ignore clicks on disabled button
    if (clickedBtn.disabled) return;

    this.buttons.forEach(btn => {
      if (btn === clickedBtn) btn.activate();
      else btn.deactivate();
    });
    
    if(this.callback) this.callback(clickedBtn.label);

  }

  activateDefault() {
    this.buttons[0].activate(); // activate first button by default
  }

}
