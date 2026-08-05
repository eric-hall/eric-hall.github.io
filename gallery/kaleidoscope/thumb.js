new p5((p) => {
  const ARM_COUNT = 32;
  const ARM_STEP_DEGREES = 360 / ARM_COUNT;
  const STEPS_PER_ARM = 80;
  const STEP_SCALE = 0.95;
  const FILL_ALPHA = 12;
  const ARM_HUE_SCALE = 0.02;
  const STEP_HUE_SCALE = 0.04;
  const TIME_HUE_SCALE = 1;
  const NOMINAL_SPIN_PHASE = 40;

  p.setup = () => {
    const container = document.getElementById("thumb-kaleidoscope");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
    p.noLoop();
  };

  p.draw = () => {
    const diameter = Math.min(p.width, p.height) * 0.156;
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    p.background(p.color(GalleryTheme.BG));

    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let a = 0; a < 360; a += ARM_STEP_DEGREES) {
      p.push();
      p.rotate(p.radians(a));
      const x = p.width;
      const baseHue = a * ARM_HUE_SCALE + NOMINAL_SPIN_PHASE * TIME_HUE_SCALE;
      for (let i = 0; i < STEPS_PER_ARM; i++) {
        p.scale(STEP_SCALE);
        const hueFraction = 0.5 + 0.5 * Math.sin(baseHue + i * STEP_HUE_SCALE);
        p.fill(GalleryTheme.HUE_MIN + hueFraction * bandWidth, 70, 100, FILL_ALPHA);
        p.ellipse(x, 0, diameter, diameter);
      }
      p.pop();
    }
    p.pop();
  };
});
