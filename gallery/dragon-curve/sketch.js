new p5((p) => {
  const CANVAS_SIZE = 480;
  const LEVEL = 11;
  const HUE_CYCLE_SECONDS = 20;

  let container;
  let segments;

  // Builds the dragon curve's turn sequence via repeated reflect-and-complement.
  function buildSequence(level) {
    let seq = "";
    for (let l = 0; l < level; l++) {
      const reversed = [...seq].reverse().join("");
      seq += "R";
      for (const char of reversed) {
        seq += char === "R" ? "L" : "R";
      }
    }
    return seq;
  }

  // Walks the turtle path the sequence describes, returning absolute line segments.
  function buildSegments(sequence, segmentSize) {
    let heading = Math.PI / 4;
    let x = 0, y = 0;
    const forward = (theta) => ({ x: Math.sin(theta), y: -Math.cos(theta) });
    const result = [];

    for (let i = 0; i < sequence.length; i++) {
      const fBefore = forward(heading);
      result.push({ x1: x, y1: y, x2: x + fBefore.x * segmentSize, y2: y + fBefore.y * segmentSize, t: i });

      heading += sequence[i] === "R" ? Math.PI / 2 : -Math.PI / 2;
      const fAfter = forward(heading);
      x -= fAfter.x * segmentSize;
      y -= fAfter.y * segmentSize;

      result.push({ x1: x, y1: y, x2: x + fAfter.x * segmentSize, y2: y + fAfter.y * segmentSize, t: i });
    }
    return result;
  }

  function boundingBox(segs) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of segs) {
      minX = Math.min(minX, s.x1, s.x2);
      maxX = Math.max(maxX, s.x1, s.x2);
      minY = Math.min(minY, s.y1, s.y2);
      maxY = Math.max(maxY, s.y1, s.y2);
    }
    return { width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  }

  // Shifts every point so the curve's bounding-box center sits at the origin -- using the
  // average of all points instead would skew off-center, since point density isn't uniform.
  function centerOn(segs, bbox) {
    for (const s of segs) {
      s.x1 -= bbox.centerX; s.y1 -= bbox.centerY;
      s.x2 -= bbox.centerX; s.y2 -= bbox.centerY;
    }
  }

  // Reflects an offset hue back and forth across the band instead of cutting hard at the ends,
  // so a drifting color phase never produces a visible seam.
  function pingPongHue(base, offset, bandWidth) {
    let raw = (base + offset) % (2 * bandWidth);
    if (raw < 0) raw += 2 * bandWidth;
    return raw <= bandWidth ? raw : 2 * bandWidth - raw;
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    const sequence = buildSequence(LEVEL);
    const unitSegments = buildSegments(sequence, 1);
    const bbox = boundingBox(unitSegments);
    const scale = (CANVAS_SIZE * 0.8) / Math.max(bbox.width, bbox.height);

    segments = buildSegments(sequence, scale);
    centerOn(segments, boundingBox(segments));
  };

  p.draw = () => {
    p.background(p.color(GalleryTheme.BG));
    p.push();
    p.translate(p.width / 2, p.height / 2);

    const bandWidth = GalleryTheme.HUE_MAX - GalleryTheme.HUE_MIN;
    const hueOffset = ((p.millis() / 1000 / HUE_CYCLE_SECONDS) % 1) * bandWidth * 2;
    const pathLength = segments.length / 2;

    for (const seg of segments) {
      const basePosition = p.map(seg.t, 0, pathLength, 0, bandWidth);
      const huePosition = pingPongHue(basePosition, hueOffset, bandWidth);
      p.stroke(GalleryTheme.HUE_MIN + huePosition, 75, 95);
      p.line(seg.x1, seg.y1, seg.x2, seg.y2);
    }

    p.pop();
  };
});
