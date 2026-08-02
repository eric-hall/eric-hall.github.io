new p5((p) => {
  const CANVAS_HEIGHT = 300;
  const MAX_ORBITERS = 40;
  const PALETTE = [
    [94, 234, 212],
    [139, 140, 248],
    [231, 230, 227],
  ];
  let container;
  let center;
  let orbiters = [];

  function addOrbiter(radius, angle) {
    if (orbiters.length >= MAX_ORBITERS) orbiters.shift();
    const color = PALETTE[Math.floor(p.random(PALETTE.length))];
    orbiters.push({
      radius,
      angle,
      speed: p.random(0.01, 0.03) * (p.random() < 0.5 ? -1 : 1),
      size: p.random(6, 16),
      color,
    });
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(container.offsetWidth, CANVAS_HEIGHT);
    canvas.parent(container);
    center = { x: p.width / 2, y: p.height / 2 };
    p.background(p.color("#12141a"));
    for (let i = 0; i < 8; i++) {
      addOrbiter(p.random(30, Math.min(p.width, p.height) / 2 - 10), p.random(p.TWO_PI));
    }
  };

  p.draw = () => {
    p.noStroke();
    p.fill(18, 20, 26, 20);
    p.rect(0, 0, p.width, p.height);

    center.x = p.width / 2;
    center.y = p.height / 2;

    orbiters.forEach((o) => {
      o.angle += o.speed;
      const x = center.x + Math.cos(o.angle) * o.radius;
      const y = center.y + Math.sin(o.angle) * o.radius;
      p.fill(o.color[0], o.color[1], o.color[2], 220);
      p.circle(x, y, o.size);
    });
  };

  function handlePress() {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      const dx = p.mouseX - center.x;
      const dy = p.mouseY - center.y;
      const radius = Math.max(20, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      addOrbiter(radius, angle);
    }
  }

  p.mousePressed = handlePress;

  p.touchStarted = () => {
    handlePress();
    return false;
  };

  p.windowResized = () => {
    p.resizeCanvas(container.offsetWidth, CANVAS_HEIGHT);
    p.background(p.color("#12141a"));
  };
});
