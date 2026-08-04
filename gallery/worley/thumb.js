new p5((p) => {
  const CELL_GRID_SIZE = 5;
  const SAMPLES_PER_CELL = 8;
  const TILE_GROWTH = 8;
  const POSITION_NOISE_SCALE = 75;
  const COLOR_NOISE_SCALE = 30;
  const GRID_HALO = 1;
  const SPAN = CELL_GRID_SIZE + GRID_HALO * 2;

  function randomSeed2D() {
    return { x: p.random(-10000, 10000), y: p.random(-10000, 10000) };
  }

  p.setup = () => {
    const container = document.getElementById("thumb-worley");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    const cellSize = p.width / CELL_GRID_SIZE;
    const sampleSize = cellSize / SAMPLES_PER_CELL;
    const cellHalfGrid = (CELL_GRID_SIZE - 1) / 2;
    const sampleHalfGrid = (SAMPLES_PER_CELL - 1) / 2;

    const xJitterSeed = randomSeed2D();
    const yJitterSeed = randomSeed2D();
    const hueSeed = randomSeed2D();
    const satSeed = randomSeed2D();
    const briSeed = randomSeed2D();

    function jitteredPosition(cellX, cellY) {
      const sx = cellX / POSITION_NOISE_SCALE, sy = cellY / POSITION_NOISE_SCALE;
      const half = cellSize / 2;
      const jx = p.constrain((p.noise(sx + xJitterSeed.x, sy + xJitterSeed.y) * 2 - 1) * cellSize, -half, half);
      const jy = p.constrain((p.noise(sx + yJitterSeed.x, sy + yJitterSeed.y) * 2 - 1) * cellSize, -half, half);
      return { x: cellX + jx, y: cellY + jy };
    }

    function noiseColor(cellX, cellY) {
      const sx = cellX / COLOR_NOISE_SCALE, sy = cellY / COLOR_NOISE_SCALE;
      const hue = p.map(p.noise(sx + hueSeed.x, sy + hueSeed.y), 0, 1, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);
      const sat = p.map(p.noise(sx + satSeed.x, sy + satSeed.y), 0, 1, 70, 100);
      const bri = p.map(p.noise(sx + briSeed.x, sy + briSeed.y), 0, 1, 80, 100);
      return p.color(hue, sat, bri);
    }

    const positions = [];
    const colors = [];
    for (let i = 0; i < SPAN; i++) {
      const positionRow = [];
      const colorRow = [];
      for (let j = 0; j < SPAN; j++) {
        const cellX = (i - GRID_HALO - cellHalfGrid) * cellSize;
        const cellY = (j - GRID_HALO - cellHalfGrid) * cellSize;
        positionRow.push(jitteredPosition(cellX, cellY));
        colorRow.push(noiseColor(cellX, cellY));
      }
      positions.push(positionRow);
      colors.push(colorRow);
    }
    const positionAtIndex = (u, v) => positions[u + GRID_HALO][v + GRID_HALO];
    const colorAtIndex = (u, v) => colors[u + GRID_HALO][v + GRID_HALO];

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.background(p.color(GalleryTheme.BG));
    p.rectMode(p.CENTER);
    p.noStroke();

    const maxSqrDistance = (cellSize * Math.SQRT2) ** 2;
    const maxRadius = Math.min(p.width, p.height) / 2;

    for (let cellI = 0; cellI < CELL_GRID_SIZE; cellI++) {
      for (let cellJ = 0; cellJ < CELL_GRID_SIZE; cellJ++) {
        const cellX = (cellI - cellHalfGrid) * cellSize;
        const cellY = (cellJ - cellHalfGrid) * cellSize;

        for (let si = 0; si < SAMPLES_PER_CELL; si++) {
          for (let sj = 0; sj < SAMPLES_PER_CELL; sj++) {
            const sampleX = cellX + (si - sampleHalfGrid) * sampleSize;
            const sampleY = cellY + (sj - sampleHalfGrid) * sampleSize;

            const initial = (cellSize * 1.5) ** 2;
            let sqrDistance = initial, secondSqrDistance = initial;
            let nearColor, secondColor;

            for (let u = cellI - 1; u <= cellI + 1; u++) {
              for (let v = cellJ - 1; v <= cellJ + 1; v++) {
                const point = positionAtIndex(u, v);
                const dx = point.x - sampleX, dy = point.y - sampleY;
                const d = dx * dx + dy * dy;
                if (d < sqrDistance) {
                  secondSqrDistance = sqrDistance; secondColor = nearColor;
                  sqrDistance = d; nearColor = colorAtIndex(u, v);
                } else if (d < secondSqrDistance) {
                  secondSqrDistance = d; secondColor = colorAtIndex(u, v);
                }
              }
            }

            const value = p.constrain((secondSqrDistance - sqrDistance) / maxSqrDistance, 0, 1);
            if (value < 0.02) continue;

            const vignette = 1 - p.constrain(p.dist(sampleX, sampleY, 0, 0) / maxRadius, 0, 1) ** 2;
            const blended = p.lerpColor(nearColor, secondColor, value);

            p.fill(p.hue(blended), p.saturation(blended), p.brightness(blended) * vignette, value * 100);
            const tileSize = sampleSize * value * TILE_GROWTH;
            p.rect(sampleX, sampleY, tileSize, tileSize);
          }
        }
      }
    }
    p.pop();
  };
});
