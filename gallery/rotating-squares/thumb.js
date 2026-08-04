new p5((p) => {
  const SQUARE_COUNT = 20;

  p.setup = () => {
    const container = document.getElementById("thumb-rotating-squares");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.rectMode(p.CENTER);
    p.strokeWeight(1.5);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.translate(p.width / 2, p.height / 2);

    const maxSize = Math.min(p.width, p.height) * 0.85;
    const minSize = maxSize * 0.12;

    for (let i = 0; i < SQUARE_COUNT; i++) {
      const t = i / SQUARE_COUNT;
      const phase = t * p.TWO_PI;

      p.push();
      p.rotate((t * p.TWO_PI) / 4);
      const size = p.lerp(maxSize, minSize, t);
      const hue = p.lerp(GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX, (p.sin(phase) + 1) / 2);
      p.stroke(hue, 70, 100);
      p.noFill();
      p.rect(0, 0, size, size);
      p.pop();
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-rotating-squares");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
