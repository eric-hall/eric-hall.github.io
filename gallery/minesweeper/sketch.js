new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 360;
  const CELL_SIZE = 26;

  const DIRECTIONS = [
    { i: 0, j: 1 }, { i: 0, j: -1 }, { i: 1, j: 0 }, { i: -1, j: 0 },
    { i: 1, j: 1 }, { i: -1, j: 1 }, { i: -1, j: -1 }, { i: 1, j: -1 },
  ];

  let container;
  let board;
  let font;

  class Cell {
    constructor(i, j, position) {
      this.i = i;
      this.j = j;
      this.position = position;
      this.neighbors = [];
      this.isVisible = false;
      this.isBomb = false;
      this.isFlag = false;
      this.neighborBombCount = 0;
      this.opacity = 50;
    }

    checkNeighbors() {
      this.neighborBombCount = this.neighbors.filter((n) => n.isBomb).length;
    }
  }

  class Board {
    constructor(cellSize) {
      this.cellSize = cellSize;
      this.halfCell = cellSize / 2;
      this.fontSize = cellSize * 0.8;
      this.cellBevel = cellSize * 0.1;
      this.cellDisplaySize = cellSize * 0.9;
      this.bombSize = this.cellDisplaySize * 0.7;
      this.flagSize = this.bombSize * 0.8;

      this.gridX = Math.floor(p.width / cellSize) - 1;
      this.gridY = Math.floor(p.height / cellSize) - 1;
      const gridCenter = { x: (this.gridX - 1) * this.halfCell, y: (this.gridY - 1) * this.halfCell };
      const windowCenter = { x: p.width / 2, y: p.height / 2 };
      this.cellPositionOffset = { x: windowCenter.x - gridCenter.x, y: windowCenter.y - gridCenter.y };

      p.colorMode(p.HSB, 360, 100, 100, 100);
      this.flagColor = p.color(GalleryTheme.ACCENT_HUE, 70, 60);
      p.colorMode(p.RGB, 255);

      this.cells = Array.from({ length: this.gridX }, () => new Array(this.gridY).fill(null));
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          const position = {
            x: i * cellSize + this.cellPositionOffset.x,
            y: j * cellSize + this.cellPositionOffset.y,
          };
          this.cells[i][j] = new Cell(i, j, position);
        }
      }
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          const cell = this.cells[i][j];
          for (const d of DIRECTIONS) {
            const neighbor = this.cellAt(i + d.i, j + d.j);
            if (neighbor) cell.neighbors.push(neighbor);
          }
        }
      }

      this.xOff = 0;
      this.yOff = 0;
      this.selectionCooldown = 0;
      this.selectedFirst = false;
      this.gameOver = false;
      this.solved = false;
      this.totalSafeCells = 0;
      this.revealedSafeCount = 0;

      this.reset();
    }

    cellAt(i, j) {
      if (i < 0 || j < 0 || i >= this.gridX || j >= this.gridY) return null;
      return this.cells[i][j];
    }

    reset() {
      this.selectedFirst = false;
      this.gameOver = false;
      this.solved = false;
      this.revealedSafeCount = 0;
      this.xOff += Math.floor(p.random(0, 1000));
      this.yOff += Math.floor(p.random(0, 1000));

      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          const cell = this.cells[i][j];
          cell.isVisible = false;
          cell.isBomb = p.noise(this.xOff, this.yOff) > 0.61;
          cell.isFlag = false;
          this.yOff++;
        }
        this.xOff++;
      }

      this.totalSafeCells = 0;
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          const cell = this.cells[i][j];
          cell.checkNeighbors();
          cell.opacity = 50;
          if (!cell.isBomb) this.totalSafeCells++;
        }
      }
    }

    // Marks a cell visible and counts it toward the score, the first time it's revealed.
    revealCell(cell) {
      if (!cell.isVisible) {
        cell.isVisible = true;
        cell.opacity = 50;
        if (!cell.isBomb) this.revealedSafeCount++;
      }
    }

    show() {
      this.selectionCooldown = Math.max(this.selectionCooldown - 1, 0);
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          this.showCell(this.cells[i][j]);
        }
      }
    }

    showCell(cell) {
      p.textFont(font);
      p.textAlign(p.CENTER, p.CENTER);
      if (cell.isVisible) {
        if (cell.isBomb) {
          p.stroke(150);
          p.fill(200, 200, 200, 100);
          p.rect(cell.position.x, cell.position.y, this.cellDisplaySize, this.cellDisplaySize);
          p.stroke(50);
          p.fill(200, 0, 0, 150);
          p.ellipse(cell.position.x, cell.position.y, this.bombSize, this.bombSize);
        } else if (cell.neighborBombCount > 0) {
          p.stroke(150);
          p.fill(p.map(cell.neighborBombCount, 0, 8, 0, 255), 0, 0, 100);
          p.rect(cell.position.x, cell.position.y, this.cellDisplaySize, this.cellDisplaySize, this.cellBevel);
          p.fill(200);
          p.text(cell.neighborBombCount, cell.position.x, cell.position.y);
        } else {
          p.stroke(150);
          p.fill(200, 200, 200, 50);
          p.rect(cell.position.x, cell.position.y, this.cellDisplaySize, this.cellDisplaySize);
        }
      } else if (cell.isFlag) {
        p.stroke(150);
        p.fill(150, 150, 150, cell.opacity);
        p.rect(cell.position.x, cell.position.y, this.cellDisplaySize, this.cellDisplaySize);
        p.fill(this.flagColor, 200);
        p.rect(cell.position.x, cell.position.y, this.flagSize, this.flagSize);
      } else {
        p.stroke(150);
        p.fill(150, 150, 150, cell.opacity);
        p.rect(cell.position.x, cell.position.y, this.cellDisplaySize, this.cellDisplaySize);
      }
      cell.opacity = Math.min(cell.opacity + 15, 255);
    }

    highlightCellAt(position) {
      const cell = this.cellAtPosition(position);
      if (cell) cell.opacity = 100;
    }

    setFlagAt(position) {
      if (this.gameOver || this.solved) return;
      const cell = this.cellAtPosition(position);
      if (cell) cell.isFlag = !cell.isFlag;
    }

    selectCellAt(position) {
      if (this.gameOver || this.solved) return;
      if (this.selectionCooldown !== 0) return;
      this.selectionCooldown = 15;
      const cell = this.cellAtPosition(position);
      if (!cell) return;

      if (!this.selectedFirst) {
        this.selectedFirst = true;
        cell.isBomb = false;
        cell.checkNeighbors();
        for (const neighbor1 of cell.neighbors) {
          neighbor1.isBomb = false;
          neighbor1.checkNeighbors();
          for (const neighbor2 of neighbor1.neighbors) {
            neighbor2.checkNeighbors();
          }
        }
        this.totalSafeCells = 0;
        for (let i = 0; i < this.gridX; i++) {
          for (let j = 0; j < this.gridY; j++) {
            if (!this.cells[i][j].isBomb) this.totalSafeCells++;
          }
        }
      }

      if (!cell.isFlag) {
        this.revealCell(cell);
        if (cell.isBomb) {
          this.gameOver = true;
          for (let i = 0; i < this.gridX; i++) {
            for (let j = 0; j < this.gridY; j++) {
              this.cells[i][j].isVisible = true;
            }
          }
        }
      }

      if (cell.neighborBombCount === 0 && !cell.isFlag) {
        const stack = [cell];
        while (stack.length > 0) {
          const next = stack.pop();
          for (const neighbor of next.neighbors) {
            if (!neighbor.isVisible && neighbor.neighborBombCount === 0 && !neighbor.isBomb) {
              this.revealCell(neighbor);
              stack.push(neighbor);
            } else if (neighbor.neighborBombCount >= 0) {
              this.revealCell(neighbor);
            }
          }
        }
      }

      if (!this.gameOver && this.revealedSafeCount >= this.totalSafeCells) {
        this.solved = true;
        for (let i = 0; i < this.gridX; i++) {
          for (let j = 0; j < this.gridY; j++) {
            const c = this.cells[i][j];
            if (c.isBomb) c.isFlag = true;
          }
        }
      }
    }

    cellAtPosition(position) {
      const i = Math.floor((position.x + this.halfCell - this.cellPositionOffset.x) / this.cellSize);
      const j = Math.floor((position.y + this.halfCell - this.cellPositionOffset.y) / this.cellSize);
      return this.cellAt(i, j);
    }

    showHud() {
      let status = "";
      if (this.solved) status = "   Solved! Press space to play again.";
      else if (this.gameOver) status = "   Boom! Press space to try again.";
      const hudText = `Score: ${this.revealedSafeCount} / ${this.totalSafeCells}${status}`;

      p.textFont(font);
      p.textSize(this.fontSize * 0.55);
      p.textAlign(p.LEFT, p.TOP);
      const pad = 6;
      const textW = p.textWidth(hudText);

      p.rectMode(p.CORNER);
      p.noStroke();
      p.fill(0, 170);
      p.rect(pad, pad, textW + pad * 2, this.fontSize * 0.55 + pad * 2, 4);
      p.rectMode(p.CENTER);

      p.fill(255);
      p.text(hudText, pad * 2, pad * 1.5);
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    font = "Georgia";
    board = new Board(CELL_SIZE);
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.strokeWeight(CELL_SIZE * 0.05);
    board.show();
    board.highlightCellAt({ x: p.mouseX, y: p.mouseY });
    board.showHud();
  };

  p.mousePressed = () => {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
    const position = { x: p.mouseX, y: p.mouseY };
    if (p.mouseButton === p.LEFT) {
      board.selectCellAt(position);
    } else if (p.mouseButton === p.RIGHT) {
      board.setFlagAt(position);
    }
  };

  p.keyPressed = () => {
    if (p.key === " ") {
      board.reset();
    }
  };

  p.touchStarted = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      board.selectCellAt({ x: p.mouseX, y: p.mouseY });
    }
    return false;
  };
});
