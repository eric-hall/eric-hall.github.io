new p5((p) => {
  const HEX_RADIUS = 12;
  const TIME = 2.2;

  p.setup = () => {
    const container = document.getElementById("thumb-hex-flow");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noFill();
    p.noLoop();
  };

  function drawHexagonOutline(radius) {
    for (let i = 0; i < 6; i++) {
      const angle1 = (p.TWO_PI / 6) * i;
      const angle2 = (p.TWO_PI / 6) * (i + 1);
      p.line(p.cos(angle1) * radius, p.sin(angle1) * radius, p.cos(angle2) * radius, p.sin(angle2) * radius);
    }
  }

  p.draw = () => {
    p.background(0, 0, 10);

    const hexWidth = p.sqrt(3) * HEX_RADIUS;
    const hexHeight = 2 * HEX_RADIUS;
    const gridCols = Math.floor(p.width / hexWidth) + 2;
    const gridRows = Math.floor(p.height / (hexHeight * 0.75)) + 2;
    const swirlX = p.width / 2, swirlY = p.height / 2;

    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        const baseX = col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0);
        const baseY = row * hexHeight * 0.75;
        const x = baseX, y = baseY;

        const swirl = p.atan2(y - swirlY, x - swirlX) * 0.3;
        const angleOffset = p.noise(col * 0.1, row * 0.1, TIME) * p.TWO_PI * 2;
        const rawHue = (angleOffset * 60 + TIME * 50) % 360;
        const hue = p.map(rawHue, 0, 360, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);

        p.push();
        p.translate(x, y);
        p.rotate(angleOffset + swirl);
        p.strokeWeight(1.5);
        p.stroke(hue, 80, 100);
        drawHexagonOutline(HEX_RADIUS);
        p.pop();
      }
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-hex-flow");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
