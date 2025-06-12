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

function drawLines(offsetX) {
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

function drawEnemies(offsetX) {
  /*for (const enemy of enemies) {
    if (enemy.visible || enemy.chasing) {
      ctx.fillStyle = enemy.bodyColor;
      ctx.beginPath();
      ctx.arc(enemy.x - offsetX, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }*/

  for (const enemy of enemies) {
    if (enemy.type == 'radar' && enemy.visible) {
      drawEnemyEchoEffect(enemy, Date.now());
    }
  }
}

function updateEnemies() {
  for (const enemy of enemies) {
    const now = Date.now();
    
    if (enemy.chasing) {      
      const millisecondsDifference = now - enemy.lastEcho;
      const prevX = enemy.x;
      const prevY = enemy.y;      
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.hypot(dx, dy);
      if (dist < enemy.speed) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const nextX = enemy.x + nx * enemy.speed;
      const nextY = enemy.y + ny * enemy.speed;
      if (!isColliding(nextX, enemy.y, enemy.size + 10)) enemy.x = nextX;
      if (!isColliding(enemy.x, nextY, enemy.size + 10)) enemy.y = nextY;

      let moved = player.x !== prevX || player.y !== prevY;

      if (moved) {
        if (enemy.type == 'echo' && millisecondsDifference >= enemy.miliSecBetweenEchos || enemy.forceNextStep) {
          enemy.lastEcho = now;
          enemy.forceNextStep = false;
          emitEnemyEcho(enemy);
          //playStepSound(false);
        }
      }

      if (dist < 10) {
        alert("Você foi alcançado por um inimigo. Fim de jogo.");
        location.reload();
      }
    }

    if (enemy.touchingLines <= 0) {
      if (enemy.type == 'echo' && (now - enemy.lastDetection) >= enemy.detectionCoolDown) {
        enemy.chasing = false;
        enemy.visible = false;
      }
      else if (enemy.type == 'radar' && !player.isRunning && !player.isWalk && (now - enemy.lastDetection) >= enemy.detectionCoolDown) {
        console.log('radar');
        enemy.chasing = false;
        enemy.visible = false;
      }
    }

  }
}

function drawEnemyEchoEffect(enemy, time) {
  const ctxX = enemy.x - camera.x;
  const ctxY = enemy.y;
  const circle1Radius = enemy.size;
  const circle2Radius = enemy.size + 5;

  function drawWavyCircle(radius, speed, color, rotationOffset) {
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 5) {
      const angle = (i * Math.PI / 180);
      const wave = Math.sin(angle * enemy.waveCount + time * speed + rotationOffset) * enemy.waveAmplitude;
      const r = radius + wave;
      const x = ctxX + Math.cos(angle) * r;
      const y = ctxY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawWavyCircle(circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0);
  drawWavyCircle(circle2Radius, -0.0015, "rgba(255, 50, 50, 0.3)", Math.PI / 2);
}

function animate() {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawWalls(camera.x);  
  drawExitDoor(camera.x);
  handleMovement();
  updateEnemies();
  drawLines(camera.x);  
  drawEnemies(camera.x);
  requestAnimationFrame(animate);
}
