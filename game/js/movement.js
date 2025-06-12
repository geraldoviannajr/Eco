// === MOVIMENTO DE PERSEGUIR O CURSOR ===
function moveTowardMouse(stepdistance) {
  if (!mouseTarget) return;

  const dx = mouseTarget.x - player.x;
  const dy = mouseTarget.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < stepdistance) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const nextX = player.x + nx * stepdistance;
  const nextY = player.y + ny * stepdistance;

  if (!isWallColliding(nextX, player.y)) player.x = nextX;
  if (!isWallColliding(player.x, nextY)) player.y = nextY;
}

// === MOVIMENTO DO PLAYER ===
function handleMovement() {
  const now = Date.now();
  const millisecondsDifference = now - player.lastEcho;

  let maxHeld = 0;
  let isRunning = false;
  
  if (isMousePressed) {
    if (!player.wasIdle && (now - mousePressStart > RUN_THRESHOLD))
      isRunning = true;
  }
  else {
    for (const key in keyPressTimes) {
      const held = now - keyPressTimes[key];
      if (held > maxHeld) maxHeld = held;
      if (held > RUN_THRESHOLD && !player.wasIdle) isRunning = true;      
    }
  }

  player.speed = isRunning ? RUN_SPEED : WALK_SPEED;  

  const prevX = player.x;
  const prevY = player.y;

  const stepdistance = isRunning ? RUN_STEP : WALK_STEP;

  let moved = false;

  if (isMousePressed)
    moveTowardMouse(stepdistance);
  else {
    if (keys["d"] || keys["D"]) {
      const tryX = player.x + stepdistance;
      if (!isWallColliding(tryX, player.y)) player.x = tryX;
    }
    if (keys["a"] || keys["A"]) {
      const tryX = player.x - stepdistance;
      if (!isWallColliding(tryX, player.y)) player.x = tryX;
    }
    if (keys["w"] || keys["W"]) {
      const tryY = player.y - stepdistance;
      if (!isWallColliding(player.x, tryY)) player.y = tryY;
    }
    if (keys["s"] || keys["S"]) {
      const tryY = player.y + stepdistance;
      if (!isWallColliding(player.x, tryY)) player.y = tryY;
    }

    const dx = Math.abs(player.x - player.lastStepX);
    const dy = Math.abs(player.y - player.lastStepY);    
  }
  moved = player.x !== prevX || player.y !== prevY;

  if (moved) {
    if ((millisecondsDifference >= player.speed) || (player.forceNextStep)) {
      player.lastEcho = now;
      player.forceNextStep = false;
      emitEcho(player.x, player.y, (isRunning ? 'run' : 'walk'));
      playStepSound(isRunning);        
    }
    player.lastStepX = player.x;
    player.lastStepY = player.y;
  }
  
  player.wasIdle = !moved && Object.keys(keys).length === 0 && !isMousePressed;    
  player.isRunning = !player.wasIdle && isRunning;
  player.isWalk = !player.wasIdle; 

  const centerStart = canvas.width / 2;
  const centerEnd = corridorWidth - canvas.width / 2;
  if (player.x < centerStart) {
    camera.x = 0;
  } else if (player.x > centerEnd) {
    camera.x = corridorWidth - canvas.width;
  } else {
    camera.x = player.x - canvas.width / 2;
  }

  if (
    player.x >= exitDoor.x &&
    player.x <= exitDoor.x + exitDoor.width &&
    player.y >= exitDoor.y &&
    player.y <= exitDoor.y + exitDoor.height
  ) {
    alert("Fase concluída!");
    location.reload();
  }
}
