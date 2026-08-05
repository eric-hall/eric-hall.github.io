new p5((p) => {
  const CANVAS_SIZE = 480;
  const ARM_COUNT = 32;
  const ARM_STEP_DEGREES = 360 / ARM_COUNT;
  const STEPS_PER_ARM = 80;
  const STEP_SCALE = 0.95;
  const ELLIPSE_DIAMETER = 75;
  const SPIN_SPEED = 0.01;
  const FILL_ALPHA = 12;
  const ARM_HUE_SCALE = 0.02;
  const STEP_HUE_SCALE = 0.04;
  const TIME_HUE_SCALE = 1;

  let container;
  let spinAngle = 0;

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));

    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let a = 0; a < 360; a += ARM_STEP_DEGREES) {
      // Each arm resets from the shared origin -- without this, per-arm rotations would
      // keep compounding across iterations instead of radiating evenly around the circle.
      p.push();
      p.rotate(p.radians(a));
      const x = p.width;
      // Arm angle and the shared spin phase both feed one continuous sine wave, so hue
      // swirls between arms and drifts over time instead of just sweeping back and forth.
      const baseHue = a * ARM_HUE_SCALE + spinAngle * TIME_HUE_SCALE;
      for (let i = 0; i < STEPS_PER_ARM; i++) {
        p.scale(STEP_SCALE);
        p.rotate(p.radians(spinAngle));
        // A sine wave is inherently periodic, so this never needs an explicit fold/wrap
        // to stay seamless the way a linear ramp would.
        const hueFraction = 0.5 + 0.5 * Math.sin(baseHue + i * STEP_HUE_SCALE);
        p.fill(GalleryTheme.HUE_MIN + hueFraction * bandWidth, 70, 100, FILL_ALPHA);
        p.ellipse(x, 0, ELLIPSE_DIAMETER, ELLIPSE_DIAMETER);
      }
      p.pop();
    }
    p.pop();

    spinAngle += SPIN_SPEED;
  };
});
