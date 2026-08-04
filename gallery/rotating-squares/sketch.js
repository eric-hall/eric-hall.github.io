new p5((p) => {
  const CANVAS_SIZE = 480;
  const SQUARE_COUNT = 20;
  const MIN_SIZE = 24, MAX_SIZE = 230;

  let container;
  let baseAngle = 0;

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.rectMode(p.CENTER);
    p.strokeWeight(2);
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.translate(p.width / 2, p.height / 2);

    const time = p.millis() * 0.001;

    // Rotation speed and direction follow the pointer's horizontal position.
    let speed = 1;
    if (p.mouseX >= 0 && p.mouseX <= p.width) {
      speed = p.map(p.mouseX, 0, p.width, -1.5, 1.5);
    }
    baseAngle += 0.01 * speed;

    for (let i = 0; i < SQUARE_COUNT; i++) {
      const t = i / SQUARE_COUNT;
      const phase = t * p.TWO_PI;

      p.push();

      const wobble = p.sin(time * 2 + phase) * 0.2;
      p.rotate(baseAngle + (t * p.TWO_PI) / 4 + wobble);

      const baseSize = p.lerp(MAX_SIZE, MIN_SIZE, t);
      const sizePulse = 1 + 0.08 * p.sin(time * 3 + phase * 2);
      const size = baseSize * sizePulse;

      const drift = 5 * p.sin(time * 1.5 + phase);
      p.translate(drift, drift);

      const hue = p.lerp(GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX, (p.sin(time + phase) + 1) / 2);
      p.stroke(hue, 70, 100);
      p.noFill();
      p.rect(0, 0, size, size);

      p.pop();
    }
  };
});
