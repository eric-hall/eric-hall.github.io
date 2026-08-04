new p5((p) => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 320;
  const CELL_SIZE = 32;
  const MARKER_SCALE = 0.3;

  // Amber; highlights the active generation cursor.
  const CURRENT_HUE = 43;

  let container;
  let maze;

  // Built in setup() once colorMode(HSB, ...) is active -- see GalleryTheme for the hues.
  let liveFill, liveStroke, deadEndFill, deadEndStroke, currentStroke;

  class Node {
    constructor(layout, col, row) {
      this.col = col;
      this.row = row;
      this.position = layout.toWorld(col, row);
      this.connections = [];
      this.neighbors = [];
      this.visited = false;
      this.deadEnd = false;
    }

    show() {
      p.fill(this.deadEnd ? deadEndFill : liveFill);
      p.stroke(this.deadEnd ? deadEndStroke : liveStroke);
      p.ellipse(this.position.x, this.position.y, CELL_SIZE * MARKER_SCALE, CELL_SIZE * MARKER_SCALE);
    }

    showConnections() {
      for (const connection of this.connections) {
        p.stroke(!this.deadEnd && !connection.deadEnd ? liveStroke : deadEndStroke);
        p.line(this.position.x, this.position.y, connection.position.x, connection.position.y);
      }
    }

    findNeighbors(grid, cols, rows) {
      for (let c = this.col - 1; c <= this.col + 1; c++) {
        for (let r = this.row - 1; r <= this.row + 1; r++) {
          const inBounds = c >= 0 && r >= 0 && c < cols && r < rows;
          const isSelf = c === this.col && r === this.row;
          const isDiagonal = c !== this.col && r !== this.row;
          if (inBounds && !isSelf && !isDiagonal) {
            this.neighbors.push(grid[c][r]);
          }
        }
      }
    }

    randomUnvisitedNeighbor() {
      const unvisited = this.neighbors.filter((n) => !n.visited);
      return unvisited.length === 0 ? this : p.random(unvisited);
    }

    deadEndConnectionCount() {
      return this.connections.filter((c) => c.deadEnd).length;
    }
  }

  // Generates a perfect maze with a randomized depth-first backtracker, then repeatedly
  // prunes degree-1 dead-end nodes (other than start/end) until only the through-paths
  // between start and end remain.
  class Maze {
    constructor() {
      this.cols = Math.floor(CANVAS_WIDTH / CELL_SIZE) - 1;
      this.rows = Math.floor(CANVAS_HEIGHT / CELL_SIZE) - 1;

      const originX = CANVAS_WIDTH / 2 - ((this.cols - 1) * CELL_SIZE) / 2;
      const originY = CANVAS_HEIGHT / 2 - ((this.rows - 1) * CELL_SIZE) / 2;
      this.layout = GridLayout.axisAligned(originX, originY, CELL_SIZE, CELL_SIZE);

      this.grid = [];
      this.allNodes = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid.push([]);
        for (let row = 0; row < this.rows; row++) {
          const node = new Node(this.layout, col, row);
          this.grid[col].push(node);
          this.allNodes.push(node);
        }
      }
      for (const node of this.allNodes) node.findNeighbors(this.grid, this.cols, this.rows);

      this.reset();
    }

    reset() {
      for (const node of this.allNodes) {
        node.connections = [];
        node.visited = false;
        node.deadEnd = false;
      }

      this.backtrackStack = [];
      this.current = this.randomNode();
      this.current.visited = true;
      this.doneGenerating = false;

      this.deadEnds = [];
      this.start = this.randomNode();
      this.end = this.randomNode();
      this.doneSolving = false;
    }

    randomNode() {
      return this.grid[Math.floor(p.random(this.cols))][Math.floor(p.random(this.rows))];
    }

    update() {
      if (!this.doneGenerating) {
        const next = this.current.randomUnvisitedNeighbor();
        next.visited = true;
        if (next !== this.current) {
          this.backtrackStack.push(this.current);
          this.connect(this.current, next);
          this.current = next;
        } else if (this.backtrackStack.length > 0) {
          this.current = this.backtrackStack.pop();
        } else {
          this.doneGenerating = true;
        }
      } else if (!this.doneSolving) {
        this.pruneOneRoundOfDeadEnds();
        if (this.deadEnds.length === 0) this.doneSolving = true;
      }
    }

    connect(a, b) {
      a.connections.push(b);
      b.connections.push(a);
    }

    pruneOneRoundOfDeadEnds() {
      this.deadEnds = [];
      for (const node of this.allNodes) {
        if (node.deadEnd || node === this.start || node === this.end) continue;
        if (node.connections.length - node.deadEndConnectionCount() === 1) {
          node.deadEnd = true;
          this.deadEnds.push(node);
        }
      }
    }

    show() {
      for (const node of this.allNodes) node.showConnections();
      for (const node of this.allNodes) node.show();

      p.fill(liveFill);
      p.stroke(liveStroke);
      p.ellipse(this.start.position.x, this.start.position.y, CELL_SIZE, CELL_SIZE);
      p.ellipse(this.end.position.x, this.end.position.y, CELL_SIZE, CELL_SIZE);

      p.noFill();
      p.stroke(currentStroke);
      p.ellipse(this.current.position.x, this.current.position.y, CELL_SIZE, CELL_SIZE);
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    liveFill = p.color(GalleryTheme.ACCENT_HUE, 60, 92, 35);
    liveStroke = p.color(GalleryTheme.ACCENT_HUE, 60, 92, 67);
    deadEndFill = p.color(GalleryTheme.ACCENT_SOFT_HUE, 44, 97, 25);
    deadEndStroke = p.color(GalleryTheme.ACCENT_SOFT_HUE, 44, 97, 44);
    currentStroke = p.color(CURRENT_HUE, 86, 98);
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    p.strokeWeight(CELL_SIZE * 0.1);
    p.frameRate(20);
    maze = new Maze();
  };

  p.draw = () => {
    p.background(GalleryTheme.BG);
    maze.update();
    maze.show();
  };

  p.keyPressed = () => {
    maze.reset();
  };

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      maze.reset();
    }
  };

  p.touchStarted = () => {
    maze.reset();
    return false;
  };
});
