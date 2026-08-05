new p5((p) => {
  const CANVAS_SIZE = 480;
  const SAMPLES_PER_POINT = 30;
  const GROWTH_STEPS_PER_FRAME = 25;
  const HUE_STEP_PER_GEN = 6;

  let container;
  let active, grid, minSpacing, cellSize, cols, rows;

  // Four hues spread evenly across the shared theme's band, one per region.
  function regionHues() {
    const span = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
    return [
      GalleryTheme.HUE_MIN,
      GalleryTheme.HUE_MIN + span / 3,
      GalleryTheme.HUE_MIN + (span * 2) / 3,
      GalleryTheme.HUE_MAX,
    ];
  }

  // Reflects an offset hue back and forth across the band instead of cutting hard at the ends,
  // so a drifting color phase never produces a visible seam.
  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  function reset() {
    p.background(p.color(GalleryTheme.BG));

    minSpacing = p.random(3, 10);
    // Fine capillary-like lines instead of the previous blocky, hashed look.
    p.strokeWeight(minSpacing * 0.22);
    cellSize = minSpacing / Math.sqrt(2);

    cols = Math.floor(p.width / cellSize);
    rows = Math.floor(p.height / cellSize);
    grid = Array.from({ length: rows }, () => new Array(cols).fill(null));

    active = [];
    for (const hue of regionHues()) {
      const pos = p.createVector(p.random(p.width), p.random(p.height));
      grid[Math.floor(pos.y / cellSize)][Math.floor(pos.x / cellSize)] = pos;
      active.push({ pos, baseHue: hue, generation: 0 });
    }
  }

  // A random point in the annulus around pos that stays clear of every existing point, or null.
  function findValidSample(pos) {
    for (let n = 0; n < SAMPLES_PER_POINT; n++) {
      const sample = p5.Vector.random2D();
      sample.setMag(p.random(minSpacing, 2 * minSpacing));
      sample.add(pos);

      const col = Math.floor(sample.x / cellSize);
      const row = Math.floor(sample.y / cellSize);
      if (col < 0 || row < 0 || col >= cols || row >= rows || grid[row][col] !== null) continue;

      let clear = true;
      for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, rows - 1) && clear; i++) {
        for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, cols - 1) && clear; j++) {
          const neighbor = grid[i][j];
          if (neighbor !== null && p5.Vector.dist(sample, neighbor) < minSpacing) clear = false;
        }
      }
      if (clear) return sample;
    }
    return null;
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.strokeCap(p.ROUND);
    reset();
  };

  p.draw = () => {
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    for (let step = 0; step < GROWTH_STEPS_PER_FRAME && active.length > 0; step++) {
      const index = Math.floor(p.random(active.length));
      const point = active[index];
      const sample = findValidSample(point.pos);

      if (sample) {
        const col = Math.floor(sample.x / cellSize);
        const row = Math.floor(sample.y / cellSize);
        grid[row][col] = sample;
        const childGeneration = point.generation + 1;
        active.push({ pos: sample, baseHue: point.baseHue, generation: childGeneration });

        // The more a region has branched, the further its hue has cycled through the band.
        const hue =
          GalleryTheme.HUE_MIN +
          pingPongHue(point.baseHue - GalleryTheme.HUE_MIN + point.generation * HUE_STEP_PER_GEN, 0, bandWidth);
        p.stroke(hue, 75, 95, 85);
        p.line(point.pos.x, point.pos.y, sample.x, sample.y);
      } else {
        active.splice(index, 1);
      }
    }
  };

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) reset();
  };

  p.touchStarted = () => {
    reset();
    return false;
  };

  p.keyPressed = () => {
    reset();
  };
});
