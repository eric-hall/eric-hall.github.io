new p5((p) => {
  const TERRAIN_STEPS = 60;

  p.setup = () => {
    const container = document.getElementById("thumb-currents");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    const bgTop = p.color(GalleryTheme.BG);
    const bgBottom = p.color(GalleryTheme.BG_ELEVATED);
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    // Opaque fill first -- adjacent 1px stroked lines alone can leave sub-pixel AA gaps
    // that don't fully cover every pixel.
    p.background(bgTop);
    p.strokeWeight(1);
    for (let s = 0; s <= p.height; s++) {
      p.stroke(p.lerpColor(bgTop, bgBottom, p.map(s, 0, p.height, 0, 1)));
      p.line(0, s, p.width, s);
    }

    const offsetA = p.random(0, 100);
    const offsetB = p.random(0, 100);

    const bandWeight = Math.max(2, p.width / 100);
    let prevX, prevYA, prevYB, prevYC;
    for (let i = 0; i < TERRAIN_STEPS; i++) {
      const x = p.map(i, 0, TERRAIN_STEPS - 1, 0, p.width);

      const a = p.noise(offsetA + i * 0.05);
      const b = p.noise(offsetB + i * 0.05);
      const c = (a + b) / 2;

      const yA = p.map(a, 0, 1, 0, p.height / 2);
      const yB = p.map(b, 0, 1, p.height / 2, p.height);
      const yC = p.map(c, 0, 1, 0, p.height);

      p.strokeWeight(1);
      p.stroke(0, 0, 95, 4);
      p.line(x, yA, x, yB);

      if (i > 0) {
        p.strokeWeight(bandWeight);
        // Each ribbon's hue tracks its own live terrain height, so color visibly shifts
        // with the noise instead of staying a fixed accent.
        p.stroke(GalleryTheme.HUE_MIN + a * bandWidth, 60, 95, 65);
        p.line(prevX, prevYA, x, yA);

        p.stroke(GalleryTheme.HUE_MIN + b * bandWidth, 60, 95, 65);
        p.line(prevX, prevYB, x, yB);

        p.stroke(GalleryTheme.HUE_MIN + c * bandWidth, 55, 90, 35);
        p.line(prevX, prevYC, x, yC);
      }

      prevX = x;
      prevYA = yA;
      prevYB = yB;
      prevYC = yC;
    }
  };
});
