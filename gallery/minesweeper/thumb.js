new p5((p) => {
  const DIRECTIONS = [
    { i: 0, j: 1 }, { i: 0, j: -1 }, { i: 1, j: 0 }, { i: -1, j: 0 },
    { i: 1, j: 1 }, { i: -1, j: 1 }, { i: -1, j: -1 }, { i: 1, j: -1 },
  ];

  p.setup = () => {
    const container = document.getElementById("thumb-minesweeper");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    p.noLoop();
  };

  p.draw = () => {
    const cellSize = 12;
    const gridX = Math.floor(p.width / cellSize) - 1;
    const gridY = Math.floor(p.height / cellSize) - 1;
    const halfCell = cellSize / 2;
    const cellDisplaySize = cellSize * 0.9;
    const cellBevel = cellSize * 0.1;
    const bombSize = cellDisplaySize * 0.7;
    const flagSize = bombSize * 0.8;
    const fontSize = cellSize * 0.8;

    const gridCenter = { x: (gridX - 1) * halfCell, y: (gridY - 1) * halfCell };
    const windowCenter = { x: p.width / 2, y: p.height / 2 };
    const offset = { x: windowCenter.x - gridCenter.x, y: windowCenter.y - gridCenter.y };

    p.colorMode(p.HSB, 360, 100, 100, 100);
    const flagColor = p.color(GalleryTheme.ACCENT_HUE, 70, 60);
    p.colorMode(p.RGB, 255);

    const cells = Array.from({ length: gridX }, (_, i) =>
      Array.from({ length: gridY }, (_, j) => ({
        i, j,
        position: { x: i * cellSize + offset.x, y: j * cellSize + offset.y },
        isBomb: p.noise(i * 0.4, j * 0.4) > 0.55,
        isVisible: false,
        isFlag: false,
        neighborBombCount: 0,
      }))
    );

    const cellAt = (i, j) => (i >= 0 && j >= 0 && i < gridX && j < gridY ? cells[i][j] : null);
    for (const row of cells) {
      for (const cell of row) {
        const bombNeighbors = DIRECTIONS.map((d) => cellAt(cell.i + d.i, cell.j + d.j)).filter((n) => n && n.isBomb);
        cell.neighborBombCount = bombNeighbors.length;
      }
    }

    // A representative mid-game snapshot: reveal a majority of the board, flag a few bombs, leave the rest hidden.
    for (const row of cells) {
      for (const cell of row) {
        const roll = p.random();
        if (!cell.isBomb && roll < 0.65) cell.isVisible = true;
        else if (cell.isBomb && roll < 0.2) cell.isFlag = true;
      }
    }

    p.background(p.color(GalleryTheme.BG));
    p.strokeWeight(cellSize * 0.05);
    p.textAlign(p.CENTER, p.CENTER);

    for (const row of cells) {
      for (const cell of row) {
        if (cell.isVisible) {
          if (cell.neighborBombCount > 0) {
            p.stroke(150);
            p.fill(p.map(cell.neighborBombCount, 0, 8, 0, 255), 0, 0, 100);
            p.rect(cell.position.x, cell.position.y, cellDisplaySize, cellDisplaySize, cellBevel);
            p.fill(200);
            p.textSize(fontSize);
            p.text(cell.neighborBombCount, cell.position.x, cell.position.y);
          } else {
            p.stroke(150);
            p.fill(200, 200, 200, 50);
            p.rect(cell.position.x, cell.position.y, cellDisplaySize, cellDisplaySize);
          }
        } else if (cell.isFlag) {
          p.stroke(150);
          p.fill(150, 150, 150, 90);
          p.rect(cell.position.x, cell.position.y, cellDisplaySize, cellDisplaySize);
          p.fill(flagColor, 200);
          p.rect(cell.position.x, cell.position.y, flagSize, flagSize);
        } else {
          p.stroke(150);
          p.fill(150, 150, 150, 90);
          p.rect(cell.position.x, cell.position.y, cellDisplaySize, cellDisplaySize);
        }
      }
    }
  };
});
