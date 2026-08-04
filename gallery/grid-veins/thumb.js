new p5((p) => {
  const CELL_SCALE = 10;
  const WALL_THRESHOLD = 4;
  const SMOOTHING_PASSES = 6;

  // Clockwise from up-left; index order must match the addShape() case tables below.
  const DIRECTIONS = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 },
    { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 },
  ];

  function buildMap(sizeI, sizeJ) {
    const map = Array.from({ length: sizeI }, () => new Array(sizeJ).fill(0));
    for (let x = 0; x < sizeI; x++) {
      for (let y = 0; y < sizeJ; y++) {
        map[x][y] = x === 0 || x === sizeI - 1 || y === 0 || y === sizeJ - 1 ? 1 : Math.floor(p.random(0, 2));
      }
    }
    return map;
  }

  function surroundingWallCount(map, sizeI, sizeJ, gridX, gridY) {
    let wallCount = 0;
    for (let neighborX = gridX - 1; neighborX <= gridX + 1; neighborX++) {
      for (let neighborY = gridY - 1; neighborY <= gridY + 1; neighborY++) {
        if (neighborX >= 0 && neighborX < sizeI && neighborY >= 0 && neighborY < sizeJ) {
          if (neighborX !== gridX || neighborY !== gridY) wallCount += map[neighborX][neighborY];
        } else {
          wallCount++;
        }
      }
    }
    return wallCount;
  }

  function smoothMap(map, sizeI, sizeJ) {
    const next = map.map((col) => col.slice());
    for (let x = 0; x < sizeI; x++) {
      for (let y = 0; y < sizeJ; y++) {
        const neighborWallTiles = surroundingWallCount(map, sizeI, sizeJ, x, y);
        if (neighborWallTiles > WALL_THRESHOLD) next[x][y] = 1;
        else if (neighborWallTiles < WALL_THRESHOLD) next[x][y] = 0;
      }
    }
    return next;
  }

  function shapesForMap(map, sizeI, sizeJ) {
    const scale = CELL_SCALE;
    const nodesSizeI = sizeI * 2 - 1;
    const nodesSizeJ = sizeJ * 2 - 1;
    const boardCenter = { x: (nodesSizeI * (scale / 2)) / 2, y: (nodesSizeJ * (scale / 2)) / 2 };
    const nodeOffset = {
      x: p.width / 2 - boardCenter.x + scale / 2 / 2,
      y: p.height / 2 - boardCenter.y + scale / 2 / 2,
    };
    const toPosition = (i, j) => ({ x: i * (scale / 2) + nodeOffset.x, y: j * (scale / 2) + nodeOffset.y });

    const allNodes = Array.from({ length: nodesSizeI }, () => new Array(nodesSizeJ).fill(null));
    for (let i = 0; i < nodesSizeI; i++) {
      for (let j = 0; j < nodesSizeJ; j++) {
        if (i % 2 === 0 && j % 2 === 0) allNodes[i][j] = { position: toPosition(i, j), active: map[i / 2][j / 2] === 1 };
        else if (!(i % 2 > 0 && j % 2 > 0)) allNodes[i][j] = { position: toPosition(i, j) };
      }
    }

    const squaresSizeI = sizeI - 1;
    const squaresSizeJ = sizeJ - 1;
    const shapes = [];

    for (let i = 0; i < squaresSizeI; i++) {
      for (let j = 0; j < squaresSizeJ; j++) {
        const squareAsNodeI = i * 2 + 1;
        const squareAsNodeJ = j * 2 + 1;
        const constituents = DIRECTIONS.map((d) => allNodes[squareAsNodeI + d.x][squareAsNodeJ + d.y]);
        const corners = [constituents[0], constituents[2], constituents[4], constituents[6]];
        const configuration =
          (corners[0].active ? 8 : 0) + (corners[1].active ? 4 : 0) + (corners[2].active ? 2 : 0) + (corners[3].active ? 1 : 0);

        const addShape = (...indices) => {
          const nodes = indices.map((idx) => constituents[idx]);
          const baseHue = p.map(i + j, 0, squaresSizeI + squaresSizeJ, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);
          shapes.push({ nodes, baseHue });
        };

        switch (configuration) {
          case 0: break;
          case 1: addShape(5, 6, 7); break;
          case 2: addShape(3, 4, 5); break;
          case 4: addShape(1, 2, 3); break;
          case 8: addShape(0, 1, 7); break;
          case 3: addShape(3, 4, 6, 7); break;
          case 6: addShape(1, 2, 4, 5); break;
          case 9: addShape(0, 1, 5, 6); break;
          case 12: addShape(0, 2, 3, 7); break;
          case 5: addShape(1, 2, 3, 5, 6, 7); break;
          case 10: addShape(0, 1, 3, 4, 5, 7); break;
          case 7: addShape(1, 2, 4, 6, 7); break;
          case 11: addShape(0, 1, 3, 4, 6); break;
          case 13: addShape(0, 2, 3, 5, 6); break;
          case 14: addShape(0, 2, 4, 5, 7); break;
          case 15: addShape(0, 2, 4, 6); break;
        }
      }
    }
    return shapes;
  }

  p.setup = () => {
    const container = document.getElementById("thumb-grid-veins");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    const sizeI = Math.floor(p.width / CELL_SCALE);
    const sizeJ = Math.floor(p.height / CELL_SCALE);
    let map = buildMap(sizeI, sizeJ);
    for (let i = 0; i < SMOOTHING_PASSES; i++) map = smoothMap(map, sizeI, sizeJ);

    const shapes = shapesForMap(map, sizeI, sizeJ);

    p.background(p.color(GalleryTheme.BG));
    p.noStroke();
    for (const shape of shapes) {
      p.fill(shape.baseHue, 70, 90);
      p.beginShape();
      for (const node of shape.nodes) {
        p.vertex(node.position.x, node.position.y);
      }
      p.endShape(p.CLOSE);
    }
  };
});
