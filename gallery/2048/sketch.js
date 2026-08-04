new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 380;
  const SWIPE_THRESHOLD = 30;

  let container;
  let game;
  let touchStartX = null;
  let touchStartY = null;

  class Tile {
    constructor(game, value, col, row) {
      this.game = game;
      this.value = value;
      this.merged = false;
      this.currentX = col * game.cellSizeX;
      this.currentY = row * game.cellSizeY;
      this.currentPop = 0;
      this.targetX = this.currentX;
      this.targetY = this.currentY;
      this.targetPop = 9; // grows in from nothing when spawned -- see show()
    }

    moveTo(col, row) {
      this.targetX = col * this.game.cellSizeX;
      this.targetY = row * this.game.cellSizeY;
    }

    show() {
      const cellMax = Math.max(this.game.cellSizeX, this.game.cellSizeY);
      p.noStroke();
      p.fill(this.game.colorForValue(this.value));
      p.rect(
        this.currentX, this.currentY,
        this.game.cellSizeX - this.game.cellSizeX / this.currentPop,
        this.game.cellSizeY - this.game.cellSizeY / this.currentPop,
        cellMax * 0.1
      );

      if (this.value > 0) {
        p.fill(p.color(GalleryTheme.TEXT));
        p.textSize(cellMax * 0.25);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(this.value, this.currentX, this.currentY);
      }
    }

    /** Eases current position/pop toward target; returns true while still animating. */
    tryAdvanceAnimation() {
      let changed = false;
      const snapThreshold = Math.max(this.game.cellSizeX, this.game.cellSizeY) * 0.1;

      if (Math.abs(this.currentX - this.targetX) > snapThreshold) {
        this.currentX = p.lerp(this.currentX, this.targetX, 0.5);
        changed = true;
      } else {
        this.currentX = this.targetX;
      }

      if (Math.abs(this.currentY - this.targetY) > snapThreshold) {
        this.currentY = p.lerp(this.currentY, this.targetY, 0.5);
        changed = true;
      } else {
        this.currentY = this.targetY;
      }

      if (Math.abs(this.currentPop - this.targetPop) > 5) {
        this.currentPop = p.lerp(this.currentPop, this.targetPop, 0.25);
        changed = true;
      } else {
        this.currentPop = this.targetPop;
      }

      return changed;
    }

    /** If `other` has the same value and neither has merged yet this move, merges it into this tile. */
    tryMergeInto(other) {
      if (other && !this.merged && !other.merged && this.value === other.value) {
        this.currentPop *= 100;
        this.value *= 2;
        this.merged = true;
        return true;
      }
      return false;
    }
  }

  class Game2048 {
    constructor(cols, rows) {
      this.cols = cols;
      this.rows = rows;
      this.tiles = Array.from({ length: cols }, () => new Array(rows).fill(null));

      this.cellSizeX = (p.height * 0.9) / cols;
      this.cellSizeY = (p.height * 0.9) / rows;
      this.boardOffsetX = ((cols - 1) * this.cellSizeX) / 2;
      this.boardOffsetY = ((rows - 1) * this.cellSizeY) / 2;

      this.dyingTiles = [];
      this.spawnTile();
      this.spawnTile();
    }

    show() {
      p.translate(-this.boardOffsetX, -this.boardOffsetY);

      p.fill(p.color(GalleryTheme.BG_ELEVATED));
      p.rect(
        this.boardOffsetX, this.boardOffsetY,
        this.cols * this.cellSizeX, this.rows * this.cellSizeY,
        Math.max(this.cellSizeX, this.cellSizeY) * 0.1
      );

      // Dying tiles (just merged into a neighbor) still need to finish animating out.
      for (let i = this.dyingTiles.length - 1; i >= 0; i--) {
        const dyingTile = this.dyingTiles[i];
        if (!dyingTile.tryAdvanceAnimation()) this.dyingTiles.splice(i, 1);
        dyingTile.show();
      }

      for (let col = 0; col < this.cols; col++) {
        for (let row = 0; row < this.rows; row++) {
          const tile = this.tiles[col][row];
          if (tile) {
            tile.tryAdvanceAnimation();
            tile.show();
          }
        }
      }
    }

    /** Slides every tile as far as it can go in the given direction, merging equal tiles. */
    push(dirCol, dirRow) {
      if (dirCol !== 0 && dirRow !== 0) return;

      this.dyingTiles = []; // previous move's merge animations are done by now

      // Walk from the far edge in the push direction so tiles closest to it move first.
      const scanDirCol = -dirCol;
      const scanDirRow = -dirRow;
      const scanDir = scanDirCol !== 0 ? scanDirCol : scanDirRow;

      const fromCol = scanDir < 0 ? 0 : this.cols - 1;
      const fromRow = scanDir < 0 ? 0 : this.rows - 1;
      const toCol = scanDir < 0 ? this.cols - 1 : 0;
      const toRow = scanDir < 0 ? this.rows - 1 : 0;

      let moved = false;

      for (let col = fromCol; col !== toCol - scanDir; col -= scanDir) {
        for (let row = fromRow; row !== toRow - scanDir; row -= scanDir) {
          if (!this.tiles[col][row]) continue;

          let currCol = col, currRow = row;
          let nextCol = col + scanDirCol, nextRow = row + scanDirRow;

          while (this.inBounds(nextCol, nextRow)) {
            const curr = this.tiles[currCol][currRow];
            const next = this.tiles[nextCol][nextRow];

            if (!next) {
              // Slide through the empty cell.
              this.tiles[nextCol][nextRow] = curr;
              this.tiles[currCol][currRow] = null;
              curr.moveTo(nextCol, nextRow);

              currCol = nextCol;
              currRow = nextRow;
              nextCol += scanDirCol;
              nextRow += scanDirRow;
              moved = true;
            } else if (next.tryMergeInto(curr)) {
              // `curr` merges into `next` (already-merged tiles can't merge again this move).
              this.tiles[currCol][currRow] = null;
              curr.moveTo(nextCol, nextRow);
              curr.targetPop /= 5;
              this.dyingTiles.push(curr);
              moved = true;
              break;
            } else {
              break; // blocked: different value, or already merged this move
            }
          }
        }
      }

      if (moved) {
        for (let col = 0; col < this.cols; col++) {
          for (let row = 0; row < this.rows; row++) {
            if (this.tiles[col][row]) this.tiles[col][row].merged = false;
          }
        }
        this.spawnTile();
      }
    }

    /** Places a new tile (90% chance 2, 10% chance 4) in a random empty cell. */
    spawnTile() {
      const startCol = Math.floor(p.random(this.cols));
      const startRow = Math.floor(p.random(this.rows));

      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const col = (i + startCol) % this.cols;
          const row = (j + startRow) % this.rows;

          if (!this.tiles[col][row]) {
            this.tiles[col][row] = new Tile(this, p.random(10) > 1 ? 2 : 4, col, row);
            return;
          }
        }
      }
    }

    inBounds(col, row) {
      return col >= 0 && row >= 0 && col < this.cols && row < this.rows;
    }

    /** Teal-to-violet gradient; tiles get more saturated and brighter as their value climbs toward 2048. */
    colorForValue(value) {
      const exponent = Math.log2(value); // 2 -> 1, 4 -> 2, ..., 2048 -> 11
      const t = p.constrain(p.map(exponent, 1, 11, 0, 1), 0, 1);
      const hue = p.lerp(GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX, t);
      const sat = p.lerp(45, 75, t);
      const bri = p.lerp(65, 100, t);
      return p.color(hue, sat, bri, 92);
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    game = new Game2048(4, 4);
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CENTER);
    game.show();
  };

  p.keyPressed = () => {
    switch (p.keyCode) {
      case p.UP_ARROW: game.push(0, 1); return false;
      case p.DOWN_ARROW: game.push(0, -1); return false;
      case p.LEFT_ARROW: game.push(1, 0); return false;
      case p.RIGHT_ARROW: game.push(-1, 0); return false;
    }
  };

  // Swipe controls for touch devices, since there's no keyboard to arrow-key with.
  p.touchStarted = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      touchStartX = p.mouseX;
      touchStartY = p.mouseY;
    }
    return false;
  };

  p.touchEnded = () => {
    if (touchStartX === null) return false;
    const dx = p.mouseX - touchStartX;
    const dy = p.mouseY - touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) > SWIPE_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        game.push(dx > 0 ? -1 : 1, 0);
      } else {
        game.push(0, dy > 0 ? -1 : 1);
      }
    }
    touchStartX = null;
    touchStartY = null;
    return false;
  };
});
