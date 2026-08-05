new p5((p) => {
  const CANVAS_SIZE = 480;
  const ARM_COUNT = 8;
  const RECURSION_DEPTH = 4;
  const ARM_LENGTHS = [110, 80, 60, 30, 10];
  const TRAIL_ALPHA = 3;
  const BRANCH_ALPHA = 18;
  const HUE_CYCLE_SECONDS = 40;
  const MEANDER_RANGE = 50;

  let container;
  let trailFill;

  // Reflects an offset hue back and forth across the band instead of cutting hard at the ends,
  // so a drifting color phase never produces a visible seam.
  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  function swayBranch(depth, x, y, heading, length, armBandPos, timeOffset, bandWidth, swayAngle) {
    if (depth <= 0) return;

    const wobbleAmount = 20 - depth;
    const n = p.noise((x + p.frameCount) / CANVAS_SIZE, (y - p.frameCount) / CANVAS_SIZE) * wobbleAmount;

    const newX = x + Math.cos(heading) * length + Math.cos(n) * wobbleAmount;
    const newY = y + Math.sin(heading) * length + Math.sin(n) * wobbleAmount;

    // Each branch's own noise sample nudges its hue, so color meanders along with the wobble.
    const meander = (n / wobbleAmount - 0.5) * MEANDER_RANGE;
    const hue = GalleryTheme.HUE_MIN + pingPongHue(armBandPos + meander, timeOffset, bandWidth);

    p.stroke(hue, 70, 100, BRANCH_ALPHA);
    p.line(x, y, newX, newY);

    swayBranch(depth - 1, newX, newY, heading + swayAngle, length * 0.9, armBandPos, timeOffset, bandWidth, swayAngle);
    swayBranch(depth - 1, newX, newY, heading - swayAngle, length * 0.9, armBandPos, timeOffset, bandWidth, swayAngle);
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(p.color(GalleryTheme.BG));
    p.strokeWeight(1);

    // p.fill(colorObj, alpha) ignores the alpha arg when colorObj is already a p5.Color
    // (unlike Processing's fill(rgb, alpha)), so build the translucent trail color explicitly.
    trailFill = p.color(GalleryTheme.BG);
    trailFill.setAlpha(TRAIL_ALPHA);
  };

  p.draw = () => {
    p.noStroke();
    p.fill(trailFill);
    p.rect(0, 0, p.width, p.height);

    const swayAngle = (Math.PI + Math.sin(p.frameCount * 0.02)) / 7;
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
    const timeOffset = ((p.millis() / 1000 / HUE_CYCLE_SECONDS) % 1) * bandWidth * 2;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const heading = (2 * Math.PI * arm) / ARM_COUNT;
      // Fold the arm's position in the circle back and forth across the band (rather than a
      // straight 0..1 sweep) so the last arm meets arm 0 with a smooth transition, not a seam.
      const armPhase = (360 * arm) / ARM_COUNT;
      const armBandPos = (pingPongHue(armPhase, 0, 180) / 180) * bandWidth;
      for (const armLength of ARM_LENGTHS) {
        swayBranch(RECURSION_DEPTH, 0, 0, heading, armLength, armBandPos, timeOffset, bandWidth, swayAngle);
      }
    }
    p.pop();
  };
});
