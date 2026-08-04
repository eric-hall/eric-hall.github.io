new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 320;
  const CELL_SCALE = 10;
  const WALL_THRESHOLD = 4;
  const HUE_CYCLE_SECONDS = 25;

  // Clockwise from up-left; index order must match the addShape() case tables below.
  const DIRECTIONS = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 },
    { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 },
  ];

  // Reflects an offset hue back and forth across the band instead of cutting hard at the ends,
  // so a drifting color phase never produces a visible seam.
  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  let container;
  let mapGenerator;
  let marchingSquares;

  class MapGenerator {
    constructor(mapSizeI, mapSizeJ) {
      this.mapSizeI = mapSizeI;
      this.mapSizeJ = mapSizeJ;
      this.map = Array.from({ length: mapSizeI }, () => new Array(mapSizeJ).fill(0));
      this.reset();
    }

    reset() {
      for (let x = 0; x < this.mapSizeI; x++) {
        for (let y = 0; y < this.mapSizeJ; y++) {
          if (x === 0 || x === this.mapSizeI - 1 || y === 0 || y === this.mapSizeJ - 1) {
            this.map[x][y] = 1;
          } else {
            this.map[x][y] = Math.floor(p.random(0, 2));
          }
        }
      }
    }

    smoothMap() {
      for (let x = 0; x < this.mapSizeI; x++) {
        for (let y = 0; y < this.mapSizeJ; y++) {
          const neighborWallTiles = this.getSurroundingWallCount(x, y);
          if (neighborWallTiles > WALL_THRESHOLD) {
            this.map[x][y] = 1;
          } else if (neighborWallTiles < WALL_THRESHOLD) {
            this.map[x][y] = 0;
          }
        }
      }
    }

    getSurroundingWallCount(gridX, gridY) {
      let wallCount = 0;
      for (let neighborX = gridX - 1; neighborX <= gridX + 1; neighborX++) {
        for (let neighborY = gridY - 1; neighborY <= gridY + 1; neighborY++) {
          if (neighborX >= 0 && neighborX < this.mapSizeI && neighborY >= 0 && neighborY < this.mapSizeJ) {
            if (neighborX !== gridX || neighborY !== gridY) {
              wallCount += this.map[neighborX][neighborY];
            }
          } else {
            wallCount++;
          }
        }
      }
      return wallCount;
    }
  }

  class MarchingSquares {
    constructor(mapInfo, scale) {
      this.mapInfo = mapInfo;
      this.scale = scale;

      this.nodesSizeI = mapInfo.mapSizeI * 2 - 1;
      this.nodesSizeJ = mapInfo.mapSizeJ * 2 - 1;
      this.allNodes = Array.from({ length: this.nodesSizeI }, () => new Array(this.nodesSizeJ).fill(null));

      this.controlNodesSizeI = mapInfo.mapSizeI;
      this.controlNodesSizeJ = mapInfo.mapSizeJ;
      this.controlNodes = Array.from({ length: this.controlNodesSizeI }, () => new Array(this.controlNodesSizeJ).fill(null));

      this.squaresSizeI = mapInfo.mapSizeI - 1;
      this.squaresSizeJ = mapInfo.mapSizeJ - 1;
      this.squares = Array.from({ length: this.squaresSizeI }, () => new Array(this.squaresSizeJ).fill(null));

      const boardCenter = { x: (this.nodesSizeI * (scale / 2)) / 2, y: (this.nodesSizeJ * (scale / 2)) / 2 };
      this.nodeOffset = {
        x: p.width / 2 - boardCenter.x + scale / 2 / 2,
        y: p.height / 2 - boardCenter.y + scale / 2 / 2,
      };

      this.shapes = [];

      for (let i = 0; i < this.nodesSizeI; i++) {
        for (let j = 0; j < this.nodesSizeJ; j++) {
          if (i % 2 === 0 && j % 2 === 0) {
            this.allNodes[i][j] = { position: this.toPosition(i, j), active: false };
          } else if (!(i % 2 > 0 && j % 2 > 0)) {
            this.allNodes[i][j] = { position: this.toPosition(i, j) };
          }
        }
      }

      for (let i = 0; i < this.controlNodesSizeI; i++) {
        for (let j = 0; j < this.controlNodesSizeJ; j++) {
          this.controlNodes[i][j] = this.allNodes[i * 2][j * 2];
        }
      }

      for (let i = 0; i < this.squaresSizeI; i++) {
        for (let j = 0; j < this.squaresSizeJ; j++) {
          this.squares[i][j] = this.buildSquare(i, j);
        }
      }

      this.updateShapes();
    }

    toPosition(i, j) {
      return { x: i * (this.scale / 2) + this.nodeOffset.x, y: j * (this.scale / 2) + this.nodeOffset.y };
    }

    buildSquare(i, j) {
      const squareAsNodeI = i * 2 + 1;
      const squareAsNodeJ = j * 2 + 1;
      const constituents = DIRECTIONS.map((d) => this.allNodes[squareAsNodeI + d.x][squareAsNodeJ + d.y]);
      const corners = [constituents[0], constituents[2], constituents[4], constituents[6]];
      return { i, j, constituents, corners, configuration: 0 };
    }

    updateShapes() {
      this.shapes = [];

      for (let i = 0; i < this.controlNodesSizeI; i++) {
        for (let j = 0; j < this.controlNodesSizeJ; j++) {
          this.controlNodes[i][j].active = this.mapInfo.map[i][j] === 1;
        }
      }

      for (let i = 0; i < this.squaresSizeI; i++) {
        for (let j = 0; j < this.squaresSizeJ; j++) {
          const square = this.squares[i][j];
          square.configuration =
            (square.corners[0].active ? 8 : 0) +
            (square.corners[1].active ? 4 : 0) +
            (square.corners[2].active ? 2 : 0) +
            (square.corners[3].active ? 1 : 0);

          switch (square.configuration) {
            case 0: break;
            case 1: this.addShape(square, 5, 6, 7); break;
            case 2: this.addShape(square, 3, 4, 5); break;
            case 4: this.addShape(square, 1, 2, 3); break;
            case 8: this.addShape(square, 0, 1, 7); break;
            case 3: this.addShape(square, 3, 4, 6, 7); break;
            case 6: this.addShape(square, 1, 2, 4, 5); break;
            case 9: this.addShape(square, 0, 1, 5, 6); break;
            case 12: this.addShape(square, 0, 2, 3, 7); break;
            case 5: this.addShape(square, 1, 2, 3, 5, 6, 7); break;
            case 10: this.addShape(square, 0, 1, 3, 4, 5, 7); break;
            case 7: this.addShape(square, 1, 2, 4, 6, 7); break;
            case 11: this.addShape(square, 0, 1, 3, 4, 6); break;
            case 13: this.addShape(square, 0, 2, 3, 5, 6); break;
            case 14: this.addShape(square, 0, 2, 4, 5, 7); break;
            case 15: this.addShape(square, 0, 2, 4, 6); break;
          }
        }
      }
    }

    addShape(square, ...indices) {
      const nodes = indices.map((idx) => square.constituents[idx]);
      const baseHue = p.map(square.i + square.j, 0, this.squaresSizeI + this.squaresSizeJ, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);
      this.shapes.push({ nodes, baseHue });
    }

    show() {
      const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
      const huePhase = ((p.millis() / 1000 / HUE_CYCLE_SECONDS) % 1) * bandWidth * 2;
      p.noStroke();
      for (const shape of this.shapes) {
        const huePosition = pingPongHue(shape.baseHue - GalleryTheme.HUE_MIN, huePhase, bandWidth);
        const hue = GalleryTheme.HUE_MIN + huePosition;
        p.fill(hue, 70, 90);
        p.beginShape();
        for (const node of shape.nodes) {
          p.vertex(node.position.x, node.position.y);
        }
        p.endShape(p.CLOSE);
      }
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.frameRate(10);
    const sizeI = Math.floor(p.width / CELL_SCALE);
    const sizeJ = Math.floor(p.height / CELL_SCALE);
    mapGenerator = new MapGenerator(sizeI, sizeJ);
    marchingSquares = new MarchingSquares(mapGenerator, CELL_SCALE);
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    mapGenerator.smoothMap();
    marchingSquares.updateShapes();
    marchingSquares.show();
  };

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      mapGenerator.reset();
    }
  };

  p.touchStarted = () => {
    mapGenerator.reset();
    return false;
  };
});
