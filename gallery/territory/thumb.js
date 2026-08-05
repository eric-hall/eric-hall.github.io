new p5((p) => {
  const SAMPLES_PER_POINT = 30;
  const HUE_STEP_PER_GEN = 6;

  function regionHues() {
    const span = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
    return [
      GalleryTheme.HUE_MIN,
      GalleryTheme.HUE_MIN + span / 3,
      GalleryTheme.HUE_MIN + (span * 2) / 3,
      GalleryTheme.HUE_MAX,
    ];
  }

  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  function findValidSample(pos, grid, cols, rows, cellSize, minSpacing) {
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
    const container = document.getElementById("thumb-territory");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.strokeCap(p.ROUND);
    p.noLoop();
  };

  p.draw = () => {
    const minSpacing = p.random(4, 8);
    // Fine capillary-like lines instead of the previous blocky, hashed look.
    p.strokeWeight(minSpacing * 0.22);
    const cellSize = minSpacing / Math.sqrt(2);

    const cols = Math.floor(p.width / cellSize);
    const rows = Math.floor(p.height / cellSize);
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;

    let active = [];
    for (const hue of regionHues()) {
      const pos = p.createVector(p.random(p.width), p.random(p.height));
      grid[Math.floor(pos.y / cellSize)][Math.floor(pos.x / cellSize)] = pos;
      active.push({ pos, baseHue: hue, generation: 0 });
    }

    p.background(p.color(GalleryTheme.BG));

    while (active.length > 0) {
      const index = Math.floor(p.random(active.length));
      const point = active[index];
      const sample = findValidSample(point.pos, grid, cols, rows, cellSize, minSpacing);

      if (sample) {
        const col = Math.floor(sample.x / cellSize);
        const row = Math.floor(sample.y / cellSize);
        grid[row][col] = sample;
        const childGeneration = point.generation + 1;
        active.push({ pos: sample, baseHue: point.baseHue, generation: childGeneration });

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
});
