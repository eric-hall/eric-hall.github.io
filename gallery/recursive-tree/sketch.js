new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 360;

  const BRANCH_SAT = 70;
  const MAX_BRANCH_SIZE = 90;
  const MIN_BRANCH_SIZE = 3;

  let container;
  let needsRedraw = true;

  function generateTree(size, startX, startY, angle) {
    if (size <= MIN_BRANCH_SIZE) return;

    const endX = startX + p.cos(angle) * size;
    const endY = startY - p.sin(angle) * size;

    p.strokeWeight(p.map(size, MIN_BRANCH_SIZE, MAX_BRANCH_SIZE, 1, 8));
    p.stroke(GalleryTheme.ACCENT_HUE, BRANCH_SAT, 100, p.map(size, MIN_BRANCH_SIZE, MAX_BRANCH_SIZE, 45, 90));
    p.line(startX, startY, endX, endY);

    const minSplits = p.ceil(p.random(1, 5));
    const maxSplits = p.ceil(p.random(1, 5));
    for (let i = 0; i < Math.max(minSplits, maxSplits); i++) {
      const childSize = size * p.random(0.3, 0.8);
      const childAngle = angle + p.random(-p.PI / 5, p.PI / 5);
      generateTree(childSize, endX, endY, childAngle);
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.draw = () => {
    if (needsRedraw) {
      p.background(p.color(GalleryTheme.BG));
      generateTree(
        p.random(MAX_BRANCH_SIZE - 35, MAX_BRANCH_SIZE),
        p.random(p.width / 2 - 60, p.width / 2 + 60),
        p.height,
        p.HALF_PI + p.random(-p.QUARTER_PI / 2, p.QUARTER_PI / 2)
      );
      needsRedraw = false;
    }
  };

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      needsRedraw = true;
    }
  };

  p.touchStarted = () => {
    needsRedraw = true;
    return false;
  };
});
