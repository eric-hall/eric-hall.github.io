new p5((p) => {
  const NUM_START_DOTS = 4;
  const CANVAS_HEIGHT = 300;
  let container;
  let dots = [];

  function addDot(x, y) {
    dots.push({
      x,
      y,
      vx: p.random(-1.5, 1.5),
      vy: p.random(-1.5, 1.5),
      size: p.random(20, 40),
      hue: p.random(360),
    });
  }

  function handlePress() {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      addDot(p.mouseX, p.mouseY);
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(container.offsetWidth, CANVAS_HEIGHT);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100);
    for (let i = 0; i < NUM_START_DOTS; i++) {
      addDot(p.random(p.width), p.random(p.height));
    }
  };

  p.draw = () => {
    p.background(p.color("#12141a"));
    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > p.width) d.vx *= -1;
      if (d.y < 0 || d.y > p.height) d.vy *= -1;
      p.noStroke();
      p.fill(d.hue, 70, 90);
      p.circle(d.x, d.y, d.size);
    });
  };

  p.mousePressed = handlePress;

  p.touchStarted = () => {
    handlePress();
    return false;
  };

  p.windowResized = () => {
    p.resizeCanvas(container.offsetWidth, CANVAS_HEIGHT);
  };
});
