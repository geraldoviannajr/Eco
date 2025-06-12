
// === EVENTOS ===
window.addEventListener("keydown", (e) => {
  if (!(e.key in keys)) {
    keyPressTimes[e.key] = Date.now();
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  delete keys[e.key];
  delete keyPressTimes[e.key];

  // Se todas as teclas de movimento foram soltas
  if (!keys["w"] && !keys["a"] && !keys["s"] && !keys["d"] &&
      !keys["W"] && !keys["A"] && !keys["S"] && !keys["D"]) {
    player.wasIdle = true;
    player.forceNextStep = true;
  }

  //Se apertou "space"
  if (e.code === 'Space') {
    const now = Date.now();
    if (now - lastClapTime >= CLAP_COOLDOWN) {
      lastClapTime = now;
      emitEcho(player.x, player.y, 'clap');
      playClapSound();
    }
  }
});

window.addEventListener("mousedown", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX + camera.x - rect.left;
  const mouseY = e.clientY - rect.top;

  mouseTarget = { x: mouseX, y: mouseY };
  isMousePressed = true;
  mousePressStart = Date.now();
});

canvas.addEventListener("mouseup", () => {
  isMousePressed = false;
  mouseTarget = null;
  player.wasIdle = true;
  player.forceNextStep = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isMousePressed) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX + camera.x - rect.left;
    const mouseY = e.clientY - rect.top;
    mouseTarget = { x: mouseX, y: mouseY };
  }
});
