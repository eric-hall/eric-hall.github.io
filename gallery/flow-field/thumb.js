new p5((p) => {
  const NOISE_SCALE = 0.01;
  const STEPS = 24;

  p.setup = () => {
    const container = document.getElementById("thumb-flow-field");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    p.noLoop();
  };

  p.draw = () => {
    p.background(p.color("#12141a"));
    p.noFill();
    p.stroke(94, 234, 212, 160);
    p.strokeWeight(1.5);

    for (let i = 0; i < 14; i++) {
      let x = p.random(p.width);
      let y = p.random(p.height);
      p.beginShape();
      for (let s = 0; s < STEPS; s++) {
        p.vertex(x, y);
        const angle = p.noise(x * NOISE_SCALE, y * NOISE_SCALE, i * 0.4) * p.TWO_PI * 2;
        x += Math.cos(angle) * 4;
        y += Math.sin(angle) * 4;
      }
      p.endShape();
    }
  };

  p.windowResized = () => {
    const container = document.getElementById("thumb-flow-field");
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    p.redraw();
  };
});
