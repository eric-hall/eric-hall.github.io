new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 320;
  const TERRAIN_STEPS = 100;
  const TERRAIN_INCREMENT = 0.01;
  const RIPPLE_HUE_CYCLE_SECONDS = 20;

  let container;
  let ripple, terrainA, terrainB, bgTop, bgBottom;

  // Reflects an offset hue back and forth across the band instead of cutting hard at the ends,
  // so a drifting color phase never produces a visible seam.
  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  class Ripple {
    constructor(steps, spacing, increment) {
      this.steps = steps;
      this.spacing = spacing;
      this.increment = increment;
      this.centerX = p.width / 2;
      this.centerY = p.height / 2;
      this.start = 0;
    }

    show() {
      p.noFill();
      p.strokeWeight(10);
      const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
      const hueOffset = ((p.millis() / 1000 / RIPPLE_HUE_CYCLE_SECONDS) % 1) * bandWidth * 2;
      p.stroke(GalleryTheme.HUE_MIN + pingPongHue(0, hueOffset, bandWidth), 25, 85, 6);
      p.ellipseMode(p.CENTER);

      for (let i = this.start; i < this.start + this.spacing * this.steps; i += this.spacing) {
        p.ellipse(this.centerX, this.centerY, i, i);
      }

      this.start += this.increment;
      if (this.start > this.spacing) this.start = 0;
    }
  }

  class Terrain {
    constructor(steps, increment, start) {
      this.steps = steps;
      this.increment = increment;
      this.noiseMap = new Array(steps);
      this.start = start;
    }

    getNoiseMap() {
      let offset = this.start;
      for (let i = 0; i < this.steps; i++) {
        this.noiseMap[i] = p.noise(offset);
        offset += this.increment;
      }
      return this.noiseMap;
    }

    step(times) {
      this.start += this.increment * times;
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    bgTop = p.color(GalleryTheme.BG);
    bgBottom = p.color(GalleryTheme.BG_ELEVATED);
    ripple = new Ripple(Math.floor(p.width / 100) + 2, 110, 1.1);
    terrainA = new Terrain(TERRAIN_STEPS, TERRAIN_INCREMENT, p.random(0, 100));
    terrainB = new Terrain(TERRAIN_STEPS, TERRAIN_INCREMENT, p.random(0, 100));
  };

  p.draw = () => {
    // Opaque fill first -- adjacent 1px stroked lines alone can leave sub-pixel AA gaps
    // that don't fully cover every pixel.
    p.background(bgTop);
    p.strokeWeight(1);
    for (let s = 0; s <= p.height; s++) {
      p.stroke(p.lerpColor(bgTop, bgBottom, p.map(s, 0, p.height, 0, 1)));
      p.line(0, s, p.width, s);
    }

    ripple.show();

    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
    const noiseA = terrainA.getNoiseMap();
    const noiseB = terrainB.getNoiseMap();

    let prevX, prevYA, prevYB, prevYC;
    for (let i = 0; i < TERRAIN_STEPS; i++) {
      const x = p.map(i, 0, TERRAIN_STEPS - 1, 0, p.width);

      const a = noiseA[i];
      const b = noiseB[i];
      const c = (a + b) / 2;

      const yA = p.map(a, 0, 1, 0, p.height / 2);
      const yB = p.map(b, 0, 1, p.height / 2, p.height);
      const yC = p.map(c, 0, 1, 0, p.height);

      p.strokeWeight(1);
      p.stroke(0, 0, 95, 4);
      p.line(x, yA, x, yB);

      if (i > 0) {
        p.strokeWeight(3);
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

    terrainA.step(1);
    terrainB.step(-1);
  };
});
