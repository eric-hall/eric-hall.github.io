new p5((p) => {
  const PALETTE = [
    [94, 234, 212],
    [139, 140, 248],
    [231, 230, 227],
  ];

  p.setup = () => {
    const container = document.getElementById("thumb-orbiters");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color("#12141a"));
    const cx = p.width / 2;
    const cy = p.height / 2;
    const maxRadius = Math.min(p.width, p.height) / 2 - 8;

    p.noFill();
    p.stroke(255, 255, 255, 25);
    for (let r = maxRadius * 0.35; r <= maxRadius; r += maxRadius * 0.32) {
      p.circle(cx, cy, r * 2);
    }

    p.noStroke();
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * p.TWO_PI + 0.4;
      const radius = maxRadius * (0.35 + 0.6 * ((i * 37) % 10) / 10);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const color = PALETTE[i % PALETTE.length];
      p.fill(color[0], color[1], color[2], 230);
      p.circle(x, y, 6 + (i % 3) * 3);
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-orbiters");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
