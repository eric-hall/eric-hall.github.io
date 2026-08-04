new p5((p) => {
  const COLS = 4, ROWS = 4;

  /** Teal-to-violet gradient; tiles get more saturated and brighter as their value climbs toward 2048. */
  function colorForValue(value) {
    const exponent = Math.log2(value); // 2 -> 1, 4 -> 2, ..., 2048 -> 11
    const t = p.constrain(p.map(exponent, 1, 11, 0, 1), 0, 1);
    const hue = p.lerp(GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX, t);
    const sat = p.lerp(45, 75, t);
    const bri = p.lerp(65, 100, t);
    return p.color(hue, sat, bri, 92);
  }

  p.setup = () => {
    const container = document.getElementById("thumb-2048");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.rectMode(p.CENTER);
    p.translate(p.width / 2, p.height / 2);

    const cellSize = (Math.min(p.width, p.height) * 0.85) / COLS;
    const boardOffsetX = ((COLS - 1) * cellSize) / 2;
    const boardOffsetY = ((ROWS - 1) * cellSize) / 2;
    p.translate(-boardOffsetX, -boardOffsetY);

    p.noStroke();
    p.fill(p.color(GalleryTheme.BG_ELEVATED));
    p.rect(boardOffsetX, boardOffsetY, COLS * cellSize, ROWS * cellSize, cellSize * 0.1);

    const sample = [
      [2, 0, 0, 128],
      [0, 32, 256, 0],
      [0, 0, 512, 8],
      [1024, 4, 0, 0],
    ];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const value = sample[row][col];
        if (!value) continue;
        const x = col * cellSize, y = row * cellSize;
        p.fill(colorForValue(value));
        p.rect(x, y, cellSize * 0.92, cellSize * 0.92, cellSize * 0.1);
        p.fill(p.color(GalleryTheme.TEXT));
        p.textSize(cellSize * 0.3);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(value, x, y);
      }
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-2048");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
