new p5((p) => {
  const CANVAS_SIZE = 480;
  const SCALE = CANVAS_SIZE / 900;
  const CELL_SIZE = 50 * SCALE;

  let container;
  let skyGridBuffer, sunBuffer, starsBuffer, crispGridBuffer;
  let horizonY, vignetteWeight;

  // Draws a horizon line plus a 2D vanishing-point grid: vertical lines fan out from a
  // point on the horizon, horizontal lines space out with a growing gap toward the viewer.
  function drawGrid(buffer, strokeColor, horizonWeight, gridWeight) {
    const vpX = buffer.width / 2;

    buffer.stroke(strokeColor);
    buffer.strokeWeight(horizonWeight);
    buffer.line(0, horizonY, buffer.width, horizonY);

    buffer.strokeWeight(gridWeight);
    const numLines = Math.ceil(buffer.width / CELL_SIZE) + 4;
    const halfLines = Math.floor(numLines / 2);
    for (let i = -halfLines; i <= halfLines; i++) {
      const xBottom = vpX + i * CELL_SIZE * 2.2;
      buffer.line(vpX, horizonY, xBottom, buffer.height);
    }

    let y = horizonY;
    let gap = CELL_SIZE * 0.12;
    while (y < buffer.height) {
      buffer.line(0, y, buffer.width, y);
      y += gap;
      gap *= 1.35;
    }
  }

  function buildSkyGridBuffer() {
    const buffer = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
    buffer.colorMode(p.HSB, 360, 100, 100, 100);
    const skyTop = p.color(GalleryTheme.BG);
    const skyHorizonGlow = buffer.color(GalleryTheme.ACCENT_HUE, 55, 14);

    buffer.strokeWeight(1);
    for (let s = 0; s <= buffer.height; s++) {
      const inter = p.map(s, 0, buffer.height, 0, 1);
      buffer.stroke(buffer.lerpColor(skyTop, skyHorizonGlow, inter));
      buffer.line(0, s, buffer.width, s);
    }

    const accentA = buffer.color(GalleryTheme.HUE_MAX, 75, 95);
    drawGrid(buffer, accentA, 5 * SCALE, 2 * SCALE);
    buffer.filter(p.BLUR, 5 * SCALE, false);
    return buffer;
  }

  function buildCrispGridBuffer() {
    const buffer = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
    buffer.colorMode(p.HSB, 360, 100, 100, 100);
    const accentA = buffer.color(GalleryTheme.HUE_MAX, 75, 95);
    drawGrid(buffer, accentA, 3 * SCALE, 1 * SCALE);
    return buffer;
  }

  function buildSunBuffer() {
    const buffer = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
    buffer.colorMode(p.HSB, 360, 100, 100, 100);
    const accentB = buffer.color(GalleryTheme.ACCENT_HUE, 65, 85);
    const accentBCore = buffer.color(GalleryTheme.ACCENT_HUE, 30, 98);

    const triangleBaseY = horizonY - horizonY / 4;
    const triangleHeight = horizonY / 2;
    const triangleSideLength = triangleHeight / (Math.sqrt(3) / 2);
    const cx = buffer.width / 2;
    const c1 = { x: cx - triangleSideLength / 2, y: triangleBaseY };
    const c2 = { x: cx + triangleSideLength / 2, y: triangleBaseY };
    const c3 = { x: cx, y: triangleBaseY - triangleHeight };
    const circleCenter = { x: cx, y: triangleBaseY - triangleHeight / 3 };
    const circleSize = triangleHeight;

    const drawShapes = () => {
      buffer.noFill();
      buffer.ellipse(circleCenter.x, circleCenter.y, circleSize, circleSize);
      buffer.triangle(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
    };

    buffer.stroke(accentB);
    buffer.strokeWeight(10 * SCALE);
    drawShapes();
    buffer.filter(p.BLUR, 3 * SCALE, false);
    buffer.stroke(accentB);
    buffer.strokeWeight(5 * SCALE);
    drawShapes();
    buffer.stroke(accentBCore);
    buffer.strokeWeight(1 * SCALE);
    drawShapes();

    return buffer;
  }

  function buildStarsBuffer() {
    const buffer = p.createGraphics(CANVAS_SIZE, horizonY);
    buffer.colorMode(p.HSB, 360, 100, 100, 100);
    const starCount = Math.floor((buffer.width * CANVAS_SIZE) / 2500);
    const smallStarsCount = starCount * 3;
    const starPositions = [];
    const starSizes = [];

    for (let c = 0; c < starCount; c++) {
      starPositions.push({ x: p.random(0, buffer.width), y: p.random(0, buffer.height) });
      starSizes.push(p.random(2.5, p.random(4, 6)) * SCALE);
    }

    buffer.noStroke();
    buffer.fill(0, 0, 78);
    buffer.ellipseMode(p.CENTER);
    for (let c = 0; c < starCount; c++) {
      buffer.ellipse(starPositions[c].x, starPositions[c].y, starSizes[c], starSizes[c]);
    }
    buffer.filter(p.BLUR, 1.5 * SCALE, false);
    for (let c = 0; c < starCount; c++) {
      buffer.ellipse(starPositions[c].x, starPositions[c].y, starSizes[c] * 0.3, starSizes[c] * 0.3);
    }
    buffer.stroke(0, 0, 59);
    for (let i = 0; i < smallStarsCount; i++) {
      buffer.strokeWeight(p.random(0.5, 1));
      buffer.point(p.random(0, buffer.width), p.random(0, buffer.height));
    }

    return buffer;
  }

  // Draws a buffer offset by a small amount proportional to pointer distance from center --
  // layers with a smaller depth factor read as farther away and move less.
  function drawParallax(buffer, depthFactor) {
    const offsetX = (p.mouseX - p.width / 2) * depthFactor;
    const offsetY = (p.mouseY - p.height / 2) * depthFactor;
    p.image(buffer, offsetX, offsetY);
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    horizonY = Math.floor(CANVAS_SIZE * 0.75);
    vignetteWeight = 250 * SCALE;

    skyGridBuffer = buildSkyGridBuffer();
    sunBuffer = buildSunBuffer();
    starsBuffer = buildStarsBuffer();
    crispGridBuffer = buildCrispGridBuffer();
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));

    drawParallax(skyGridBuffer, 0.02);
    drawParallax(sunBuffer, 0.05);

    p.push();
    p.tint(0, 0, 100, 50);
    drawParallax(starsBuffer, 0.008);
    p.pop();

    drawParallax(crispGridBuffer, 0.02);

    p.noFill();
    p.stroke(p.color(GalleryTheme.BG));
    p.strokeWeight(vignetteWeight);
    p.circle(p.width * 0.5, p.height * 0.5, p.width * 1.25);
  };
});
