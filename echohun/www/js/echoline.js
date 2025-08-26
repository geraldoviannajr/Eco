// === LINHAS DE ECO ===


class EchoLine {
  // Tipo de eco: 'walk', 'run', 'clap', 'enemy'
  constructor(x, y, angle, type, _enemy = null, bounces = 3) {
    this.type = type;
    this.isRunning = (type == "run");
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.angle = angle;
    this.bounces = bounces;
    this.createdAt = window.game.gameTime;
    this.doorTouched = false;
    this.enemy = _enemy;
    this.enemiesTouched = [];

    if (type == "initclap") {
      this.type = "clap";
      this.duration = config.CLAP_ECHO_DURATION * 2;
      this.color = config.CLAP_COLOR;
      this.expansionSpeed = config.CLAP_EXPANSION_SPEED * 1.5;
    } else if (this.type == "enemy" && this.enemy != null) {
      this.duration = this.enemy.duration;
      this.color = this.enemy.echoColor;
      this.expansionSpeed = this.enemy.expansionSpeed;
    } else if (this.type == "clap") {
      this.duration = config.CLAP_ECHO_DURATION * (window.game.player.stamina / 20);
      this.color = config.CLAP_COLOR;
      this.expansionSpeed = config.CLAP_EXPANSION_SPEED;
    } else {
      this.duration = this.isRunning
        ? config.ECHO_DURATION_2
        : config.ECHO_DURATION_1;
      this.color = this.isRunning ? config.ECHO_COLOR_2 : config.ECHO_COLOR_1;
      this.expansionSpeed = config.ECHO_EXPANSION_SPEED;
    }
    this.path = [{ x, y }];
  }

  // Atualiza a linha de eco
  // Move a linha de eco, verifica colisões e atualiza o estado
  update() {
    if (this.bounces < 0) return;
    
    const age = window.game.gameTime - this.createdAt;
    var dynamicDuration = this.duration;
    
    
    // Se o inimigo estiver em modo de busca no perímetro, emite um eco mais lento e mais curto
    if (this.type == "enemy" &&       
        this.enemy != null && 
        this.enemy._hasEcho &&
        this.enemy.seeking) 
    {
      dynamicDuration = (dynamicDuration * 0.1); // 10% da duração original
    }
      
    var dynamicSpeed = this.expansionSpeed * (1 - (Math.min(1, age / dynamicDuration)) * 0.5);              

    const dx = Math.cos(this.angle) * dynamicSpeed;
    const dy = Math.sin(this.angle) * dynamicSpeed;

    const nextX = this.x + dx;
    const nextY = this.y + dy;

    var collided = false;

    for (const poly of game.map.walls) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];

        if (
          segmentsIntersect(
            { x: this.x, y: this.y },
            { x: nextX, y: nextY },
            a,
            b
          )
        ) {
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

    // Checa se passou pela porta para revelá-la, offset de 20px    
    if (!this.doorTouched) {
      const doorOffSet = 20;
      if (
        this.x >= (game.map.exitDoor.x - doorOffSet) &&
        this.x <= (game.map.exitDoor.x + game.map.exitDoor.width + doorOffSet) &&
        this.y >= (game.map.exitDoor.y - doorOffSet) &&
        this.y <= (game.map.exitDoor.y + game.map.exitDoor.height + doorOffSet)
      ) {
        this.doorTouched = true;
        game.map.exitDoor.touchingLines++;
      }
    }
    game.map.exitDoor.visible = game.map.exitDoor.touchingLines > 0;

    // Checa se tocou algum inimigo
    if (this.type != "enemy") {
      for (const enemy of game.map.enemies) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        const buffer = 5;
        if (!this.enemiesTouched.includes(enemy)
          && dist >= enemy.radius - buffer // fora do centro
          && dist <= enemy.radius + buffer // dentro da borda/perímetro
        ) {
          this.enemiesTouched.push(enemy);
          enemy.chasingPoint = {x: this.startX, y: this.startY};
          enemy.touchingLines++;
        }        
      }
    }

    this.path.push({ x: this.x, y: this.y });
  }

  // Desenha a linha de eco
  // Se for um inimigo, usa a cor do inimigo
  draw() {
    const age = window.game.gameTime - this.createdAt;
    var alpha = Math.max(0, 1 - age / this.duration);
    if (alpha <= 0) return;

    game.ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;

    game.ctx.lineWidth = (typeof this.lineWidth !== 'undefined') ? this.lineWidth : config.ECHO_LINE_WIDTH;
    game.ctx.beginPath();
    game.ctx.moveTo(
      this.path[0].x - game.camera.x,
      this.path[0].y - game.camera.y
    );
    for (let i = 1; i < this.path.length; i++) {
      game.ctx.lineTo(
        this.path[i].x - game.camera.x,
        this.path[i].y - game.camera.y
      );
    }
    game.ctx.stroke();
  }

  // Verifica se a linha de eco está morta
  isDead() {
    return window.game.gameTime - this.createdAt > this.duration;
  }
}
