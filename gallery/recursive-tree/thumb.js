new p5((p) => {
  const BRANCH_SAT = 70;
  const MIN_BRANCH_SIZE = 3;
  let maxBranchSize;

  function generateTree(size, startX, startY, angle) {
    if (size <= MIN_BRANCH_SIZE) return;

    const endX = startX + p.cos(angle) * size;
    const endY = startY - p.sin(angle) * size;

    p.strokeWeight(p.map(size, MIN_BRANCH_SIZE, maxBranchSize, 0.6, 4));
    p.stroke(GalleryTheme.ACCENT_HUE, BRANCH_SAT, 100, p.map(size, MIN_BRANCH_SIZE, maxBranchSize, 45, 90));
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
    const container = document.getElementById("thumb-recursive-tree");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    maxBranchSize = p.height * 0.55;
    generateTree(
      maxBranchSize,
      p.width / 2 + p.random(-p.width * 0.1, p.width * 0.1),
      p.height,
      p.HALF_PI + p.random(-p.QUARTER_PI / 2, p.QUARTER_PI / 2)
    );
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-recursive-tree");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
