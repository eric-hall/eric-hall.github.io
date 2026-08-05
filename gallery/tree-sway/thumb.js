new p5((p) => {
  const ARM_COUNT = 8;
  const RECURSION_DEPTH = 4;
  const BRANCH_ALPHA = 30;
  const MEANDER_RANGE = 50;

  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  function swayBranch(depth, x, y, heading, length, armBandPos, bandWidth, swayAngle, canvasSize) {
    if (depth <= 0) return;

    const wobbleAmount = 20 - depth;
    const n = p.noise(x / canvasSize, y / canvasSize) * wobbleAmount;

    const newX = x + Math.cos(heading) * length + Math.cos(n) * wobbleAmount;
    const newY = y + Math.sin(heading) * length + Math.sin(n) * wobbleAmount;

    const meander = (n / wobbleAmount - 0.5) * MEANDER_RANGE;
    const hue = GalleryTheme.HUE_MIN + pingPongHue(armBandPos + meander, 0, bandWidth);

    p.stroke(hue, 70, 100, BRANCH_ALPHA);
    p.line(x, y, newX, newY);

    swayBranch(depth - 1, newX, newY, heading + swayAngle, length * 0.9, armBandPos, bandWidth, swayAngle, canvasSize);
    swayBranch(depth - 1, newX, newY, heading - swayAngle, length * 0.9, armBandPos, bandWidth, swayAngle, canvasSize);
  }

  p.setup = () => {
    const container = document.getElementById("thumb-tree-sway");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.strokeWeight(1);
    p.noLoop();
  };

  p.draw = () => {
    const canvasSize = Math.min(p.width, p.height);
    const armLengths = [canvasSize * 0.23, canvasSize * 0.17, canvasSize * 0.125, canvasSize * 0.0625, canvasSize * 0.02];
    const swayAngle = Math.PI / 7;
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    p.background(p.color(GalleryTheme.BG));
    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const heading = (2 * Math.PI * arm) / ARM_COUNT;
      const armPhase = (360 * arm) / ARM_COUNT;
      const armBandPos = (pingPongHue(armPhase, 0, 180) / 180) * bandWidth;
      for (const armLength of armLengths) {
        swayBranch(RECURSION_DEPTH, 0, 0, heading, armLength, armBandPos, bandWidth, swayAngle, canvasSize);
      }
    }
    p.pop();
  };
});
