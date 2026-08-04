new p5((p) => {
  const CANVAS_SIZE = 480;
  const CELL_GRID_SIZE = 5;
  const CELL_SIZE = CANVAS_SIZE / CELL_GRID_SIZE;
  const SAMPLES_PER_CELL = 16;
  const SAMPLE_SIZE = CELL_SIZE / SAMPLES_PER_CELL;
  const TILE_GROWTH = 8;

  const POSITION_NOISE_SCALE = 75; // for feature-point jitter -- kept gradual for a smooth Worley look
  const COLOR_NOISE_SCALE = 30; // smaller than the position scale, so neighboring chunks contrast more

  // The 3x3 neighbor search around an edge chunk reaches one chunk beyond the visible
  // grid (indices -1..CELL_GRID_SIZE), so the position/color tables are padded with a halo.
  const GRID_HALO = 1;
  const SPAN = CELL_GRID_SIZE + GRID_HALO * 2;

  let container;
  let featurePoints;
  let debugToggle;

  class FeaturePoints {
    constructor(cellSize) {
      this.cellSize = cellSize;
      this.positions = [];
      this.colors = [];
      this.reshuffle();
    }

    reshuffle() {
      this.xJitterSeed = this.randomSeed2D();
      this.yJitterSeed = this.randomSeed2D();
      this.hueSeed = this.randomSeed2D();
      this.satSeed = this.randomSeed2D();
      this.briSeed = this.randomSeed2D();
      this.update();
    }

    drift(amount) {
      this.xJitterSeed = { x: this.xJitterSeed.x + amount, y: this.xJitterSeed.y - amount };
      this.yJitterSeed = { x: this.yJitterSeed.x + amount, y: this.yJitterSeed.y - amount };
      this.hueSeed = { x: this.hueSeed.x + amount, y: this.hueSeed.y - amount };
      this.satSeed = { x: this.satSeed.x + amount, y: this.satSeed.y - amount };
      this.briSeed = { x: this.briSeed.x + amount, y: this.briSeed.y - amount };
    }

    // Recomputes every feature point's jittered position and color for the current seeds.
    update() {
      const cellHalfGrid = (CELL_GRID_SIZE - 1) / 2;
      const positions = [];
      const colors = [];
      for (let i = 0; i < SPAN; i++) {
        const positionRow = [];
        const colorRow = [];
        for (let j = 0; j < SPAN; j++) {
          const cellX = (i - GRID_HALO - cellHalfGrid) * this.cellSize;
          const cellY = (j - GRID_HALO - cellHalfGrid) * this.cellSize;
          positionRow.push(this.jitteredPosition(cellX, cellY));
          colorRow.push(this.noiseColor(cellX, cellY));
        }
        positions.push(positionRow);
        colors.push(colorRow);
      }
      this.positions = positions;
      this.colors = colors;
    }

    jitteredPosition(cellX, cellY) {
      const sampleX = cellX / POSITION_NOISE_SCALE;
      const sampleY = cellY / POSITION_NOISE_SCALE;
      const halfCell = this.cellSize / 2;
      const jitterX = p.constrain(
        (p.noise(sampleX + this.xJitterSeed.x, sampleY + this.xJitterSeed.y) * 2 - 1) * this.cellSize,
        -halfCell, halfCell
      );
      const jitterY = p.constrain(
        (p.noise(sampleX + this.yJitterSeed.x, sampleY + this.yJitterSeed.y) * 2 - 1) * this.cellSize,
        -halfCell, halfCell
      );
      return { x: cellX + jitterX, y: cellY + jitterY };
    }

    noiseColor(cellX, cellY) {
      const sampleX = cellX / COLOR_NOISE_SCALE;
      const sampleY = cellY / COLOR_NOISE_SCALE;
      const hue = p.map(p.noise(sampleX + this.hueSeed.x, sampleY + this.hueSeed.y), 0, 1, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);
      const sat = p.map(p.noise(sampleX + this.satSeed.x, sampleY + this.satSeed.y), 0, 1, 70, 100);
      const bri = p.map(p.noise(sampleX + this.briSeed.x, sampleY + this.briSeed.y), 0, 1, 80, 100);
      return p.color(hue, sat, bri);
    }

    randomSeed2D() {
      return { x: p.random(-10000, 10000), y: p.random(-10000, 10000) };
    }

    // The jittered feature-point position at index (u, v) -- may be one chunk into the halo.
    positionAtIndex(u, v) {
      return this.positions[u + GRID_HALO][v + GRID_HALO];
    }

    // The animated color assigned to feature point (u, v) -- may be one chunk into the halo.
    colorAtIndex(u, v) {
      return this.colors[u + GRID_HALO][v + GRID_HALO];
    }
  }

  // Nearest and second-nearest feature points (F1/F2) among the 3x3 neighboring chunks.
  function findNearestFeaturePoints(cellI, cellJ, sampleX, sampleY) {
    const initial = (CELL_SIZE * 1.5) ** 2;
    let sqrDistance = initial;
    let secondSqrDistance = initial;
    let color, secondColor;

    for (let u = cellI - 1; u <= cellI + 1; u++) {
      for (let v = cellJ - 1; v <= cellJ + 1; v++) {
        const point = featurePoints.positionAtIndex(u, v);
        const dx = point.x - sampleX;
        const dy = point.y - sampleY;
        const d = dx * dx + dy * dy;

        if (d < sqrDistance) {
          secondSqrDistance = sqrDistance;
          secondColor = color;
          sqrDistance = d;
          color = featurePoints.colorAtIndex(u, v);
        } else if (d < secondSqrDistance) {
          secondSqrDistance = d;
          secondColor = featurePoints.colorAtIndex(u, v);
        }
      }
    }
    return { sqrDistance, secondSqrDistance, color, secondColor };
  }

  function drawWorleyNoise() {
    const maxSqrDistance = (CELL_SIZE * Math.SQRT2) ** 2;
    const cellHalfGrid = (CELL_GRID_SIZE - 1) / 2;
    const sampleHalfGrid = (SAMPLES_PER_CELL - 1) / 2;
    const maxRadius = CANVAS_SIZE / 2;

    p.rectMode(p.CENTER);
    p.noStroke();

    for (let cellI = 0; cellI < CELL_GRID_SIZE; cellI++) {
      for (let cellJ = 0; cellJ < CELL_GRID_SIZE; cellJ++) {
        const cellX = (cellI - cellHalfGrid) * CELL_SIZE;
        const cellY = (cellJ - cellHalfGrid) * CELL_SIZE;

        for (let si = 0; si < SAMPLES_PER_CELL; si++) {
          for (let sj = 0; sj < SAMPLES_PER_CELL; sj++) {
            const sampleX = cellX + (si - sampleHalfGrid) * SAMPLE_SIZE;
            const sampleY = cellY + (sj - sampleHalfGrid) * SAMPLE_SIZE;

            const nearest = findNearestFeaturePoints(cellI, cellJ, sampleX, sampleY);

            // 0 at a chunk border, 1 deep inside a chunk's territory.
            const value = p.constrain((nearest.secondSqrDistance - nearest.sqrDistance) / maxSqrDistance, 0, 1);
            if (value < 0.02) continue; // negligibly small and transparent -- skip for performance

            const vignette = 1 - p.constrain(p.dist(sampleX, sampleY, 0, 0) / maxRadius, 0, 1) ** 2;
            const blended = p.lerpColor(nearest.color, nearest.secondColor, value);

            p.fill(p.hue(blended), p.saturation(blended), p.brightness(blended) * vignette, value * 100);
            const tileSize = SAMPLE_SIZE * value * TILE_GROWTH;
            p.rect(sampleX, sampleY, tileSize, tileSize);
          }
        }
      }
    }
  }

  function drawFeaturePoints() {
    const cellHalfGrid = (CELL_GRID_SIZE - 1) / 2;

    for (let i = 0; i < CELL_GRID_SIZE; i++) {
      for (let j = 0; j < CELL_GRID_SIZE; j++) {
        const x = (i - cellHalfGrid) * CELL_SIZE;
        const y = (j - cellHalfGrid) * CELL_SIZE;
        const point = featurePoints.positionAtIndex(i, j);

        p.strokeWeight(1);
        p.stroke(p.color('#ffff00'));
        p.line(x, y, point.x, point.y);

        p.strokeWeight(3);
        p.stroke(p.color('#ff3b30'));
        p.point(x, y);

        p.strokeWeight(5);
        p.stroke(GalleryTheme.ACCENT_HUE, 70, 100);
        p.point(point.x, point.y);
      }
    }
  }

  function drawCellGrid() {
    const cellHalfGrid = (CELL_GRID_SIZE - 1) / 2;

    p.rectMode(p.CENTER);
    p.strokeWeight(1.5);
    p.stroke(p.color('#ffffffaa'));
    p.noFill();

    for (let i = 0; i < CELL_GRID_SIZE; i++) {
      for (let j = 0; j < CELL_GRID_SIZE; j++) {
        const x = (i - cellHalfGrid) * CELL_SIZE;
        const y = (j - cellHalfGrid) * CELL_SIZE;
        p.rect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  function drawScene() {
    p.translate(p.width / 2, p.height / 2);
    p.background(p.color(GalleryTheme.BG));
    drawWorleyNoise();
    if (debugToggle && debugToggle.checked) {
      drawCellGrid();
      drawFeaturePoints();
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    featurePoints = new FeaturePoints(CELL_SIZE);
    debugToggle = document.getElementById("worley-debug-toggle");
  };

  p.draw = () => {
    featurePoints.drift(0.01);
    featurePoints.update();
    drawScene();
  };

  p.keyPressed = () => {
    featurePoints.reshuffle();
  };

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      featurePoints.reshuffle();
    }
  };

  p.touchStarted = () => {
    featurePoints.reshuffle();
    return false;
  };
});
