new p5((p) => {
  p.setup = () => {
    const container = document.getElementById("thumb-bouncing-dots");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color("#12141a"));
    p.noStroke();
    const dots = [
      { x: 0.2, y: 0.3, size: 0.22, hue: 178 },
      { x: 0.55, y: 0.6, size: 0.3, hue: 250 },
      { x: 0.8, y: 0.25, size: 0.16, hue: 40 },
      { x: 0.35, y: 0.75, size: 0.14, hue: 10 },
      { x: 0.7, y: 0.7, size: 0.2, hue: 178 },
    ];
    const unit = Math.min(p.width, p.height);
    dots.forEach((d) => {
      p.fill(d.hue, 70, 90);
      p.circle(d.x * p.width, d.y * p.height, d.size * unit);
    });
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-bouncing-dots");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
