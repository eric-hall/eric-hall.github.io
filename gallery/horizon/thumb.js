new p5((p) => {
  let scale, cellSize, horizonY;

  function drawGrid(buffer, strokeColor, horizonWeight, gridWeight) {
    const vpX = buffer.width / 2;

    buffer.stroke(strokeColor);
    buffer.strokeWeight(horizonWeight);
    buffer.line(0, horizonY, buffer.width, horizonY);

    buffer.strokeWeight(gridWeight);
    const numLines = Math.ceil(buffer.width / cellSize) + 4;
    const halfLines = Math.floor(numLines / 2);
    for (let i = -halfLines; i <= halfLines; i++) {
      const xBottom = vpX + i * cellSize * 2.2;
      buffer.line(vpX, horizonY, xBottom, buffer.height);
    }

    let y = horizonY;
    let gap = cellSize * 0.12;
    while (y < buffer.height) {
      buffer.line(0, y, buffer.width, y);
      y += gap;
      gap *= 1.35;
    }
  }

  p.setup = () => {
    const container = document.getElementById("thumb-horizon");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    scale = p.width / 900;
    cellSize = 50 * scale;
    horizonY = Math.floor(p.height * 0.75);

    const skyGrid = p.createGraphics(p.width, p.height);
    skyGrid.colorMode(p.HSB, 360, 100, 100, 100);
    const skyTop = p.color(GalleryTheme.BG);
    const skyHorizonGlow = skyGrid.color(GalleryTheme.ACCENT_HUE, 55, 14);
    skyGrid.strokeWeight(1);
    for (let s = 0; s <= skyGrid.height; s++) {
      const inter = p.map(s, 0, skyGrid.height, 0, 1);
      skyGrid.stroke(skyGrid.lerpColor(skyTop, skyHorizonGlow, inter));
      skyGrid.line(0, s, skyGrid.width, s);
    }
    const accentA = skyGrid.color(GalleryTheme.HUE_MAX, 75, 95);
    drawGrid(skyGrid, accentA, 5 * scale, 2 * scale);
    skyGrid.filter(p.BLUR, 5 * scale, false);

    const sun = p.createGraphics(p.width, p.height);
    sun.colorMode(p.HSB, 360, 100, 100, 100);
    const accentB = sun.color(GalleryTheme.ACCENT_HUE, 65, 85);
    const accentBCore = sun.color(GalleryTheme.ACCENT_HUE, 30, 98);
    const triangleBaseY = horizonY - horizonY / 4;
    const triangleHeight = horizonY / 2;
    const triangleSideLength = triangleHeight / (Math.sqrt(3) / 2);
    const cx = sun.width / 2;
    const c1 = { x: cx - triangleSideLength / 2, y: triangleBaseY };
    const c2 = { x: cx + triangleSideLength / 2, y: triangleBaseY };
    const c3 = { x: cx, y: triangleBaseY - triangleHeight };
    const circleCenter = { x: cx, y: triangleBaseY - triangleHeight / 3 };
    const circleSize = triangleHeight;
    const drawShapes = () => {
      sun.noFill();
      sun.ellipse(circleCenter.x, circleCenter.y, circleSize, circleSize);
      sun.triangle(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
    };
    sun.stroke(accentB);
    sun.strokeWeight(10 * scale);
    drawShapes();
    sun.filter(p.BLUR, 3 * scale, false);
    sun.stroke(accentB);
    sun.strokeWeight(5 * scale);
    drawShapes();
    sun.stroke(accentBCore);
    sun.strokeWeight(1 * scale);
    drawShapes();

    const crispGrid = p.createGraphics(p.width, p.height);
    crispGrid.colorMode(p.HSB, 360, 100, 100, 100);
    const crispAccentA = crispGrid.color(GalleryTheme.HUE_MAX, 75, 95);
    drawGrid(crispGrid, crispAccentA, 3 * scale, 1 * scale);

    p.background(p.color(GalleryTheme.BG));
    p.image(skyGrid, 0, 0);
    p.image(sun, 0, 0);
    p.image(crispGrid, 0, 0);

    const vignetteWeight = 250 * scale;
    p.noFill();
    p.stroke(p.color(GalleryTheme.BG));
    p.strokeWeight(vignetteWeight);
    p.circle(p.width * 0.5, p.height * 0.5, p.width * 1.25);
  };
});
