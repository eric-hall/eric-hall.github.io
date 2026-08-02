new p5((p) => {
  const CANVAS_HEIGHT = 300;
  const MAX_PARTICLES = 300;
  const NOISE_SCALE = 0.006;
  const SPEED = 1.6;
  let container;
  let particles = [];

  function makeParticle(x, y) {
    return { x, y, px: x, py: y };
  }

  function seedParticles(n) {
    for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      particles.push(makeParticle(p.random(p.width), p.random(p.height)));
    }
  }

  function addBurst(x, y) {
    for (let i = 0; i < 20 && particles.length < MAX_PARTICLES; i++) {
      particles.push(makeParticle(x + p.random(-10, 10), y + p.random(-10, 10)));
    }
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(container.offsetWidth, CANVAS_HEIGHT);
    canvas.parent(container);
    p.background(p.color("#12141a"));
    seedParticles(150);
  };

  p.draw = () => {
    p.noStroke();
    p.fill(18, 20, 26, 20);
    p.rect(0, 0, p.width, p.height);

    p.stroke(94, 234, 212, 90);
    particles.forEach((particle) => {
      particle.px = particle.x;
      particle.py = particle.y;
      const angle = p.noise(particle.x * NOISE_SCALE, particle.y * NOISE_SCALE, p.frameCount * 0.002) * p.TWO_PI * 2;
      particle.x += Math.cos(angle) * SPEED;
      particle.y += Math.sin(angle) * SPEED;

      if (particle.x < 0 || particle.x > p.width || particle.y < 0 || particle.y > p.height) {
        particle.x = p.random(p.width);
        particle.y = p.random(p.height);
        particle.px = particle.x;
        particle.py = particle.y;
        return;
      }
      p.line(particle.px, particle.py, particle.x, particle.y);
    });
  };

  function handlePress() {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      addBurst(p.mouseX, p.mouseY);
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
