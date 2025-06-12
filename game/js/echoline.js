// === LINHAS DE ECO ===
const lines = [];

function emitEcho(x = player.x, y = player.y, type = 'walk') {
  var lineCount = (type == 'clap' ? CLAP_LINE_COUNT : ECHO_LINE_COUNT);
  for (let i = 0; i < lineCount; i++) {
    const angle = (Math.PI * 2 / lineCount) * i;
    lines.push(new EchoLine(x, y, angle, type, null, (type == 'clap' ? CLAP_ECHO_BOUNCES : 3)));
  }
}

function emitEnemyEcho(enemy) {
  for (let i = 0; i < enemy.lineCount; i++) {
    const angle = (Math.PI * 2 / enemy.lineCount) * i;
    lines.push(new EchoLine(enemy.x + Math.cos(angle) * (enemy.size + 10), 
                            enemy.y + Math.sin(angle) * (enemy.size + 10), 
                            angle, 'enemy', enemy, 3));
  }
}

class EchoLine {
  // Tipo de eco: 'walk', 'run', 'clap', 'enemy'
  constructor(x, y, angle, type, _enemy = null, bounces = 3) {
    this.type = type;
    this.isRunning = (type == 'run');
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.bounces = bounces;
    this.createdAt = Date.now();
    this.doorTouched = false;
    this.enemy = _enemy;
    this.enemiesTouched = [];

    if (this.type == 'enemy' && this.enemy != null) {
      this.duration = this.enemy.duration;
      this.color = this.enemy.echoColor;
      this.expansionSpeed = this.enemy.expansionSpeed;
    } else if (this.type == 'clap') {
      this.duration = CLAP_ECHO_DURATION;
      this.color = CLAP_COLOR;
      this.expansionSpeed = CLAP_EXPANSION_SPEED;
    } else {
      this.duration = (this.isRunning ? ECHO_DURATION_2 : ECHO_DURATION_1);
      this.color = (this.isRunning ? ECHO_COLOR_2 : ECHO_COLOR_1);
      this.expansionSpeed = ECHO_EXPANSION_SPEED;
    }
    this.path = [{ x, y }];
  }

  // Atualiza a linha de eco
  // Move a linha de eco, verifica colisões e atualiza o estado
  update() {
    if (this.bounces < 0) return;

    const age = Date.now() - this.createdAt;
    const progress = Math.min(1, age / this.duration);
    const dynamicSpeed = this.expansionSpeed * (1 - progress * 0.5);

    const dx = Math.cos(this.angle) * dynamicSpeed;
    const dy = Math.sin(this.angle) * dynamicSpeed;

    const nextX = this.x + dx;
    const nextY = this.y + dy;

    let collided = false;

    for (const poly of walls) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];

        if (segmentsIntersect({ x: this.x, y: this.y }, { x: nextX, y: nextY }, a, b)) {
          collided = true;

          // --- Calcular ponto de colisão exato (interpolado)
          // Refletir corretamente com base na normal
          const isHorizontal = Math.abs(a.y - b.y) < Math.abs(a.x - b.x);
          if (isHorizontal) {
            this.angle = -this.angle;
          } else {
            this.angle = Math.PI - this.angle;
          }

          this.bounces--;

          return; // interrompe o movimento neste frame
        }
      }
    }

    // Se não colidiu, então move
    this.x = nextX;
    this.y = nextY;

    // Checa se passou pela porta para revelá-la
    if (!this.doorTouched) {
      if (
        this.x >= exitDoor.x &&
        this.x <= exitDoor.x + exitDoor.width &&
        this.y >= exitDoor.y &&
        this.y <= exitDoor.y + exitDoor.height
      ) {
        this.doorTouched = true;
        exitDoor.touchingLines++;
      }
    }
    exitDoor.visible = exitDoor.touchingLines > 0;

    // Checa se tocou algum inimigo
    if (this.type != 'enemy') {
      for (const enemy of enemies) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        const buffer = 5;
        if (
          dist >= (enemy.size - buffer) && // fora do centro
          dist <= (enemy.size + buffer) && // dentro da borda/perímetro
          !this.enemiesTouched.includes(enemy)
        ) {
          this.enemiesTouched.push(enemy);
          enemy.visible = true;
          enemy.chasing = true;
          enemy.touchingLines++;
        }
      }      
    }

    this.path.push({ x: this.x, y: this.y });
  }

  // Desenha a linha de eco
  // Se for um inimigo, usa a cor do inimigo
  draw(ctx, offsetX) {
    const age = Date.now() - this.createdAt;
    const alpha = Math.max(0, 1 - age / this.duration);
    if (alpha <= 0) return;

    if (this.type != 'enemy' && this.enemiesTouched.length > 0) {
      ctx.fillStyle = this.enemiesTouched[0].bodyColor;
    } else {
      ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;
    }

    ctx.lineWidth = ECHO_LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(this.path[0].x - offsetX, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].x - offsetX, this.path[i].y);
    }
    ctx.stroke();
  }

  // Verifica se a linha de eco está morta
  isDead() {
    return Date.now() - this.createdAt > this.duration;
  }
}

