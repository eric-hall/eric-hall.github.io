new p5((p) => {
  const CELL_SIZE = 18;
  const MARKER_SCALE = 0.3;

  let liveFill, liveStroke, deadEndFill, deadEndStroke;

  p.setup = () => {
    const container = document.getElementById("thumb-maze-solver");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    liveFill = p.color(GalleryTheme.ACCENT_HUE, 60, 92, 35);
    liveStroke = p.color(GalleryTheme.ACCENT_HUE, 60, 92, 67);
    deadEndFill = p.color(GalleryTheme.ACCENT_SOFT_HUE, 44, 97, 25);
    deadEndStroke = p.color(GalleryTheme.ACCENT_SOFT_HUE, 44, 97, 44);
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    p.noLoop();
  };

  p.draw = () => {
    const cols = Math.floor(p.width / CELL_SIZE) - 1;
    const rows = Math.floor(p.height / CELL_SIZE) - 1;
    const originX = p.width / 2 - ((cols - 1) * CELL_SIZE) / 2;
    const originY = p.height / 2 - ((rows - 1) * CELL_SIZE) / 2;
    const layout = GridLayout.axisAligned(originX, originY, CELL_SIZE, CELL_SIZE);

    const grid = [];
    const allNodes = [];
    for (let col = 0; col < cols; col++) {
      grid.push([]);
      for (let row = 0; row < rows; row++) {
        const node = { col, row, position: layout.toWorld(col, row), connections: [], neighbors: [], visited: false, deadEnd: false };
        grid[col].push(node);
        allNodes.push(node);
      }
    }
    for (const node of allNodes) {
      for (let c = node.col - 1; c <= node.col + 1; c++) {
        for (let r = node.row - 1; r <= node.row + 1; r++) {
          const inBounds = c >= 0 && r >= 0 && c < cols && r < rows;
          const isSelf = c === node.col && r === node.row;
          const isDiagonal = c !== node.col && r !== node.row;
          if (inBounds && !isSelf && !isDiagonal) node.neighbors.push(grid[c][r]);
        }
      }
    }

    const randomNode = () => grid[Math.floor(p.random(cols))][Math.floor(p.random(rows))];
    let current = randomNode();
    current.visited = true;
    const start = randomNode();
    const end = randomNode();
    const stack = [];

    // Run the full backtracker generation synchronously (this is a static preview).
    while (true) {
      const unvisited = current.neighbors.filter((n) => !n.visited);
      const next = unvisited.length === 0 ? current : p.random(unvisited);
      next.visited = true;
      if (next !== current) {
        stack.push(current);
        current.connections.push(next);
        next.connections.push(current);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }

    // Run a few rounds of dead-end pruning for visual interest, not to completion.
    for (let round = 0; round < 3; round++) {
      for (const node of allNodes) {
        if (node.deadEnd || node === start || node === end) continue;
        const deadEndConnections = node.connections.filter((c) => c.deadEnd).length;
        if (node.connections.length - deadEndConnections === 1) node.deadEnd = true;
      }
    }

    p.background(GalleryTheme.BG);
    p.strokeWeight(CELL_SIZE * 0.12);
    for (const node of allNodes) {
      for (const connection of node.connections) {
        p.stroke(!node.deadEnd && !connection.deadEnd ? liveStroke : deadEndStroke);
        p.line(node.position.x, node.position.y, connection.position.x, connection.position.y);
      }
    }
    for (const node of allNodes) {
      p.fill(node.deadEnd ? deadEndFill : liveFill);
      p.stroke(node.deadEnd ? deadEndStroke : liveStroke);
      p.ellipse(node.position.x, node.position.y, CELL_SIZE * MARKER_SCALE, CELL_SIZE * MARKER_SCALE);
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-maze-solver");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
