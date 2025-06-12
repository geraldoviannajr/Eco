// === ANIMAÇÃO E DESENHO ===
function drawWalls(offsetX) {
  ctx.fillStyle = WALL_COLOR;

  for (const wall of walls) {
    ctx.beginPath();
    const start = wall[0];
    ctx.moveTo(start.x - offsetX, start.y);
    for (let i = 1; i < wall.length; i++) {
      ctx.lineTo(wall[i].x - offsetX, wall[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawExitDoor(offsetX) {
  if (!exitDoor.visible) return;
  ctx.fillStyle = DOOR_COLOR;
  ctx.fillRect(exitDoor.x - offsetX, exitDoor.y, exitDoor.width, exitDoor.height);
}

function drawLines(ctx, offsetX) {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    line.update();
    line.draw(ctx, offsetX);
    if (line.isDead()) {
      if (line.doorTouched == true && exitDoor.touchingLines > 0)
        exitDoor.touchingLines--;  

      if (line.enemy == null && line.enemiesTouched != undefined && line.enemiesTouched != null && line.enemiesTouched.length > 0) {
        for (const enemy of line.enemiesTouched) {
          if (enemy.touchingLines > 0) enemy.touchingLines--;
          if (enemy.touchingLines <= 0) {
            enemy.touchingLines = 0;
            enemy.lastDetection = Date.now();
          }
        }
      }

      lines.splice(i, 1);
    }
    exitDoor.visible = (exitDoor.touchingLines > 0);
  }
}

function drawEnemies(ctx, offsetX) {
  for (const enemy of enemies) {
      enemy.draw(ctx, offsetX);
  }
}

function updateEnemies() {
  for (const enemy of enemies) {
    enemy.update();
  }
}

function animate() {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawWalls(camera.x);  
  drawExitDoor(camera.x);
  handleMovement();
  updateEnemies();
  drawLines(ctx, camera.x);  
  drawEnemies(ctx, camera.x);
  requestAnimationFrame(animate);
}
