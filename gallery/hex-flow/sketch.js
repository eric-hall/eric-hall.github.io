new p5((p) => {
  const CANVAS_SIZE = 480;
  const HEX_RADIUS = 18;
  const FLOW_STRENGTH = 9;
  const TRAIL_FADE_ALPHA = 15;
  const RIPPLE_DURATION = 1.2; // seconds
  const RIPPLE_SPEED = 260; // px/sec, how fast the ring expands
  const RIPPLE_BAND = 46; // px, width of the active ring

  let container;
  let hexWidth, hexHeight, gridCols, gridRows;
  let time = 0;
  // Smoothed swirl center; follows the pointer.
  let swirlX, swirlY;
  // Active ripples; each briefly pops nearby hexagons as it expands outward.
  let ripples = [];

  function drawHexagonOutline(radius) {
    for (let i = 0; i < 6; i++) {
      const angle1 = (p.TWO_PI / 6) * i;
      const angle2 = (p.TWO_PI / 6) * (i + 1);
      p.line(p.cos(angle1) * radius, p.sin(angle1) * radius, p.cos(angle2) * radius, p.sin(angle2) * radius);
    }
  }

  // How strongly an active ripple affects the hexagon at (x, y) right now: 0 if no
  // ripple's expanding ring is nearby, up to 1 at the ring's leading edge just after
  // it's triggered, fading to 0 as the ripple ages out.
  function rippleInfluenceAt(x, y) {
    let influence = 0;
    for (const ripple of ripples) {
      const age = (p.millis() - ripple.start) / 1000;
      const ringRadius = age * RIPPLE_SPEED;
      const distanceFromRing = Math.abs(p.dist(x, y, ripple.x, ripple.y) - ringRadius);
      if (distanceFromRing < RIPPLE_BAND) {
        const strength = (1 - distanceFromRing / RIPPLE_BAND) * (1 - age / RIPPLE_DURATION);
        influence = Math.max(influence, strength);
      }
    }
    return influence;
  }

  function drawFlowingHexagon(col, row) {
    const baseX = col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0);
    const baseY = row * hexHeight * 0.75;

    const waveX = p.sin(time + row * 0.3 + col * 0.1) * FLOW_STRENGTH;
    const waveY = p.cos(time * 0.7 + col * 0.2 - row * 0.1) * FLOW_STRENGTH;
    const x = baseX + waveX;
    const y = baseY + waveY;

    const ripple = rippleInfluenceAt(x, y);

    const swirl = p.atan2(y - swirlY, x - swirlX) * 0.3;
    const angleOffset = p.noise(col * 0.1, row * 0.1, time) * p.TWO_PI * 2;
    const scaleFactor = 1 + 0.2 * p.sin(time * 2 + col * 0.5 + row * 0.3) + ripple * 0.9;
    const strokeW = 1 + p.sin(time + col * 0.2 + row * 0.3) + ripple * 3;

    const rawHue = (angleOffset * 60 + time * 50) % 360;
    const hue = p.map(rawHue, 0, 360, GalleryTheme.HUE_MIN, GalleryTheme.HUE_MAX);
    const brightness = 100 - ripple * 20; // ripple crest flashes slightly brighter/whiter

    p.push();
    p.translate(x, y);
    p.rotate(angleOffset + swirl);
    p.scale(scaleFactor);
    p.strokeWeight(strokeW);
    p.stroke(hue, 80 - ripple * 80, brightness);
    drawHexagonOutline(HEX_RADIUS);
    p.pop();
  }

  p.setup = () => {
    container = document.getElementById("sketch-container");
    const canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent(container);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noFill();

    hexWidth = p.sqrt(3) * HEX_RADIUS;
    hexHeight = 2 * HEX_RADIUS;
    gridCols = Math.floor(p.width / hexWidth) + 4;
    gridRows = Math.floor(p.height / (hexHeight * 0.75)) + 4;
    swirlX = p.width / 2;
    swirlY = p.height / 2;
  };

  p.draw = () => {
    p.noStroke();
    p.fill(0, 0, 10, TRAIL_FADE_ALPHA);
    p.rect(0, 0, p.width, p.height);
    time += 0.01;

    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      swirlX = p.lerp(swirlX, p.mouseX, 0.06);
      swirlY = p.lerp(swirlY, p.mouseY, 0.06);
    }

    ripples = ripples.filter((r) => (p.millis() - r.start) / 1000 < RIPPLE_DURATION);

    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        drawFlowingHexagon(col, row);
      }
    }
  };

  function addRipple(x, y) {
    ripples.push({ x, y, start: p.millis() });
  }

  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      addRipple(p.mouseX, p.mouseY);
    }
  };

  p.touchStarted = () => {
    addRipple(p.mouseX, p.mouseY);
    return false;
  };

  p.touchMoved = () => {
    return false;
  };
});
