/**
 * Converts between logical grid coordinates (col, row) and world/screen space,
 * for any rectangular or parallelogram (skewed) grid.
 *
 * A grid is an origin plus two basis vectors -- `right` (the displacement of moving
 * one column) and `down` (the displacement of moving one row). World position is
 * world = origin + col*right + row*down. An axis-aligned grid is the case where
 * right/down are orthogonal (GridLayout.axisAligned); toGrid is the matrix inverse.
 *
 * JS counterpart of ProcessingSketchbook's util.GridLayout.
 */
class GridLayout {
  constructor(originX, originY, rightX, rightY, downX, downY) {
    this.originX = originX;
    this.originY = originY;
    this.rightX = rightX;
    this.rightY = rightY;
    this.downX = downX;
    this.downY = downY;

    const det = rightX * downY - downX * rightY;
    const invDet = 1 / det;
    this.invA = downY * invDet;
    this.invB = -downX * invDet;
    this.invC = -rightY * invDet;
    this.invD = rightX * invDet;
  }

  /** The common case: an axis-aligned rectangular grid with uniform cell size. */
  static axisAligned(originX, originY, cellWidth, cellHeight) {
    return new GridLayout(originX, originY, cellWidth, 0, 0, cellHeight);
  }

  /** Logical grid coordinates (may be fractional) -> world/screen position. */
  toWorld(col, row) {
    return {
      x: this.originX + col * this.rightX + row * this.downX,
      y: this.originY + col * this.rightY + row * this.downY,
    };
  }

  /** World/screen position -> logical grid coordinates (fractional -- floor/round as needed). */
  toGrid(worldX, worldY) {
    const dx = worldX - this.originX;
    const dy = worldY - this.originY;
    return { x: this.invA * dx + this.invB * dy, y: this.invC * dx + this.invD * dy };
  }

  /** Length of the `right` basis vector -- the cell size along the column axis. */
  cellWidth() {
    return Math.hypot(this.rightX, this.rightY);
  }

  /** Length of the `down` basis vector -- the cell size along the row axis. */
  cellHeight() {
    return Math.hypot(this.downX, this.downY);
  }
}
